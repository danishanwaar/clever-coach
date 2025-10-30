import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ==================== Teacher Progress Notes ====================

export interface TeacherProgressNote {
  fld_id: number;
  fld_sid: number;
  fld_note_subject: string;
  fld_note_body: string;
  fld_edate: string;
  fld_uname: number;
  student_name: string;
  user_name: string;
}

export interface TeacherProgressNoteStudent {
  fld_id: number;
  fld_first_name: string;
  fld_last_name: string;
}

export const useTeacherProgressNotes = (teacherId: number | undefined) => {
  return useQuery<TeacherProgressNote[]>({
    queryKey: ['teacherProgressNotes', teacherId],
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

      // Get notes for these students
      const { data: notes, error: notesError } = await supabase
        .from('tbl_teachers_students_notes')
        .select(`
          fld_id,
          fld_sid,
          fld_note_subject,
          fld_note_body,
          fld_edate,
          fld_uname
        `)
        .in('fld_sid', studentIds)
        .order('fld_id', { ascending: false });

      if (notesError) throw notesError;

      // Get student and user names
      const notesWithDetails = await Promise.all(
        (notes || []).map(async (note) => {
          const { data: student } = await supabase
            .from('tbl_students')
            .select('fld_first_name, fld_last_name')
            .eq('fld_id', note.fld_sid)
            .single();

          const { data: user } = await supabase
            .from('tbl_users')
            .select('fld_name')
            .eq('fld_id', note.fld_uname)
            .single();

          return {
            ...note,
            student_name: student ? `${student.fld_first_name} ${student.fld_last_name}` : 'Unknown',
            user_name: user?.fld_name || 'Unknown'
          };
        })
      );

      return notesWithDetails;
    },
    enabled: !!teacherId
  });
};

export const useTeacherProgressNoteStudents = (teacherId: number | undefined) => {
  return useQuery<TeacherProgressNoteStudent[]>({
    queryKey: ['teacherProgressNoteStudents', teacherId],
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

export const useTeacherProgressNoteMutations = () => {
  const queryClient = useQueryClient();

  const addNoteMutation = useMutation({
    mutationFn: async (data: { 
      teacherId: number; 
      studentId: number; 
      subject: string; 
      body: string;
      userId: number;
    }) => {
      const { error } = await supabase
        .from('tbl_teachers_students_notes')
        .insert({
          fld_tid: data.teacherId,
          fld_sid: data.studentId,
          fld_note_subject: data.subject,
          fld_note_body: data.body,
          fld_edate: new Date().toISOString().split('T')[0],
          fld_uname: data.userId
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherProgressNotes'] });
      toast.success('Note added successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to add note: ' + error.message);
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      const { error } = await supabase
        .from('tbl_teachers_students_notes')
        .delete()
        .eq('fld_id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherProgressNotes'] });
      toast.success('Note deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete note: ' + error.message);
    }
  });

  return {
    addNoteMutation,
    deleteNoteMutation
  };
};

