import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ==================== Teacher Time Logs ====================

export interface TeacherTimeLog {
  fld_id: number;
  fld_sid: number;
  fld_ssid: number;
  fld_lesson: number;
  fld_notes: string;
  fld_edate: string;
  fld_uname: number;
  fld_status: string;
  student_name: string;
  subject_name: string;
  user_name: string;
}

export interface TeacherTimeLogStudent {
  fld_id: number;
  fld_first_name: string;
  fld_last_name: string;
}

export interface TeacherTimeLogStudentSubject {
  fld_id: number;
  fld_subject: string;
}

export const useTeacherTimeLogs = (teacherId: number | undefined) => {
  return useQuery<TeacherTimeLog[]>({
    queryKey: ['teacherTimeLogs', teacherId],
    queryFn: async () => {
      if (!teacherId) throw new Error('Teacher ID required');

      // Get students from mediation stages where FLD_M_FLAG='X'
      const { data: mediationStages, error: mediationError } = await supabase
        .from('tbl_students_mediation_stages')
        .select('fld_sid')
        .eq('fld_tid', teacherId)
        .eq('fld_m_flag', 'X');

      if (mediationError) throw mediationError;

      const studentIds = [...new Set(mediationStages?.map(s => s.fld_sid) || [])];
      
      if (studentIds.length === 0) return [];

      // Get time logs for these students
      const { data: logs, error: logsError } = await supabase
        .from('tbl_teachers_lessons_history')
        .select(`
          fld_id,
          fld_sid,
          fld_ssid,
          fld_lesson,
          fld_notes,
          fld_edate,
          fld_uname,
          fld_status
        `)
        .eq('fld_tid', teacherId)
        .in('fld_sid', studentIds)
        .order('fld_edate', { ascending: false });

      if (logsError) throw logsError;

      // Get student, subject, and user names
      const logsWithDetails = await Promise.all(
        (logs || []).map(async (log) => {
          const { data: student } = await supabase
            .from('tbl_students')
            .select('fld_first_name, fld_last_name')
            .eq('fld_id', log.fld_sid)
            .single();

          const { data: subjectData } = await supabase
            .from('tbl_students_subjects')
            .select(`
              fld_id,
              tbl_subjects!inner(fld_subject)
            `)
            .eq('fld_id', log.fld_ssid)
            .single();

          const { data: user } = await supabase
            .from('tbl_users')
            .select('fld_name')
            .eq('fld_id', log.fld_uname)
            .single();

          return {
            ...log,
            student_name: student ? `${student.fld_first_name} ${student.fld_last_name}` : 'Unknown',
            subject_name: subjectData?.tbl_subjects?.fld_subject || 'Unknown',
            user_name: user?.fld_name || 'Unknown'
          };
        })
      );

      return logsWithDetails;
    },
    enabled: !!teacherId
  });
};

export const useTeacherTimeLogStudents = (teacherId: number | undefined) => {
  return useQuery<TeacherTimeLogStudent[]>({
    queryKey: ['teacherTimeLogStudents', teacherId],
    queryFn: async () => {
      if (!teacherId) throw new Error('Teacher ID required');

      // Get students from mediation stages where FLD_M_FLAG='X'
      const { data: mediationStages, error: mediationError } = await supabase
        .from('tbl_students_mediation_stages')
        .select('fld_sid')
        .eq('fld_tid', teacherId)
        .eq('fld_m_flag', 'X');

      if (mediationError) throw mediationError;

      const studentIds = [...new Set(mediationStages?.map(s => s.fld_sid) || [])];
      
      if (studentIds.length === 0) return [];

      // Get students that have contracts (FLD_CID!='0' and FLD_C_EID!='0')
      const { data: studentsWithContracts, error: contractsError } = await supabase
        .from('tbl_students_subjects')
        .select('fld_sid')
        .in('fld_sid', studentIds)
        .neq('fld_cid', 0)
        .neq('fld_c_eid', 0);

      if (contractsError) throw contractsError;

      const contractStudentIds = [...new Set(studentsWithContracts?.map(s => s.fld_sid) || [])];
      
      if (contractStudentIds.length === 0) return [];

      // Get student details
      const { data: students, error: studentsError } = await supabase
        .from('tbl_students')
        .select('fld_id, fld_first_name, fld_last_name')
        .in('fld_id', contractStudentIds);

      if (studentsError) throw studentsError;

      return students || [];
    },
    enabled: !!teacherId
  });
};

export const useTeacherTimeLogStudentSubjects = (teacherId: number | undefined, studentId: number | undefined) => {
  return useQuery<TeacherTimeLogStudentSubject[]>({
    queryKey: ['teacherTimeLogStudentSubjects', teacherId, studentId],
    queryFn: async () => {
      if (!teacherId || !studentId) throw new Error('Teacher ID and Student ID required');

      // Get student subjects for this teacher
      const { data: subjects, error } = await supabase
        .from('tbl_students_subjects')
        .select(`
          fld_id,
          tbl_subjects!inner(fld_subject)
        `)
        .eq('fld_sid', studentId);

      if (error) throw error;

      return (subjects || []).map(s => ({
        fld_id: s.fld_id,
        fld_subject: s.tbl_subjects?.fld_subject || 'Unknown'
      }));
    },
    enabled: !!teacherId && !!studentId
  });
};

export const useTeacherTimeLogMutations = () => {
  const queryClient = useQueryClient();

  const addTimeLogMutation = useMutation({
    mutationFn: async (data: {
      teacherId: number;
      studentId: number;
      studentSubjectId: number;
      lesson: number;
      notes: string;
      date: string;
      userId: number;
    }) => {
      // Check if more than 5 lessons per day (following PHP logic)
      const { data: existingLogs, error: checkError } = await supabase
        .from('tbl_teachers_lessons_history')
        .select('fld_id')
        .eq('fld_tid', data.teacherId)
        .eq('fld_edate', data.date);

      if (checkError) throw checkError;

      if ((existingLogs?.length || 0) >= 5) {
        throw new Error('You are not allowed to enter more than 5 lessons per day.');
      }

      const { error } = await supabase
        .from('tbl_teachers_lessons_history')
        .insert({
          fld_tid: data.teacherId,
          fld_sid: data.studentId,
          fld_ssid: data.studentSubjectId,
          fld_lesson: data.lesson,
          fld_notes: data.notes,
          fld_edate: data.date,
          fld_mon: (new Date(data.date).getMonth() + 1).toString(),
          fld_year: new Date(data.date).getFullYear().toString(),
          fld_uname: data.userId,
          fld_status: 'Pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherTimeLogs'] });
      toast.success('Time log added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add time log');
    }
  });

  const deleteTimeLogMutation = useMutation({
    mutationFn: async (logId: number) => {
      const { error } = await supabase
        .from('tbl_teachers_lessons_history')
        .delete()
        .eq('fld_id', logId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherTimeLogs'] });
      toast.success('Time log deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete time log: ' + error.message);
    }
  });

  return {
    addTimeLogMutation,
    deleteTimeLogMutation
  };
};

