import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TeacherData {
  fld_id: number;
  fld_first_name: string;
  fld_last_name: string;
  fld_status: string;
  fld_per_l_rate: string;
}

interface TeacherStats {
  totalStudents: number;
  totalContracts: number;
}

interface StudentMediation {
  fld_id: number;
  fld_sid: number;
  fld_ssid: number;
  fld_m_type: number;
  fld_m_flag: string;
  fld_sal: string;
  fld_first_name: string;
  fld_last_name: string;
  fld_mobile: string;
  fld_subject: string;
  fld_stage_name: string;
}

interface IntroductoryMeeting {
  fld_id: number;
  fld_first_name: string;
  fld_last_name: string;
  fld_mobile: string;
  fld_subject: string;
  fld_im_status: number;
}

export function useTeacherDashboard(userId?: number) {
  // Fetch teacher data
  const teacherQuery = useQuery<TeacherData>({
    queryKey: ['teacher', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('tbl_teachers')
        .select('fld_id, fld_first_name, fld_last_name, fld_status, fld_per_l_rate')
        .eq('fld_uid', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  // Fetch teacher statistics
  const statsQuery = useQuery<TeacherStats>({
    queryKey: ['teacherStats', teacherQuery.data?.fld_id],
    queryFn: async () => {
      if (!teacherQuery.data?.fld_id) throw new Error('Teacher not found');

      // Get active students count (distinct students, not subject-student combinations)
      const { data: students, error: studentsError } = await supabase
        .from('tbl_students_mediation_stages')
        .select('fld_sid')
        .eq('fld_tid', teacherQuery.data.fld_id)
        .eq('fld_m_flag', 'X');

      if (studentsError) throw studentsError;

      // Count distinct students (in case a teacher has multiple subjects with the same student)
      const uniqueStudentIds = new Set((students || []).map(s => s.fld_sid));
      const distinctStudentCount = uniqueStudentIds.size;

      // Get active contracts count
      const { data: contracts, error: contractsError } = await supabase
        .from('tbl_contracts_engagement')
        .select('fld_id')
        .eq('fld_tid', teacherQuery.data.fld_id)
        .eq('fld_status', 'Active');

      if (contractsError) throw contractsError;

      return {
        totalStudents: distinctStudentCount,
        totalContracts: contracts?.length || 0
      };
    },
    enabled: !!teacherQuery.data?.fld_id
  });

  // Fetch pending student meetings
  const meetingsQuery = useQuery<StudentMediation[]>({
    queryKey: ['pendingMeetings', teacherQuery.data?.fld_id],
    queryFn: async () => {
      if (!teacherQuery.data?.fld_id) throw new Error('Teacher not found');

      const { data, error } = await supabase
        .from('tbl_students_mediation_stages')
        .select(`
          fld_id,
          fld_sid,
          fld_ssid,
          fld_m_type,
          fld_m_flag,
          tbl_students!inner(
            fld_sal,
            fld_first_name,
            fld_last_name,
            fld_mobile
          ),
          tbl_students_subjects!inner(
            fld_suid,
            tbl_subjects!inner(
              fld_subject
            )
          )
        `)
        .eq('fld_tid', teacherQuery.data.fld_id)
        .eq('fld_m_flag', 'Y');

      if (error) throw error;

      // Get the latest status for each student-subject combination
      const processedMeetings = await Promise.all(
        (data || []).map(async (meeting) => {
          const { data: latestStatus, error: statusError } = await supabase
            .from('tbl_students_mediation_stages')
            .select(`
              fld_m_type,
              tbl_mediation_types!inner(
                fld_stage_name
              )
            `)
            .eq('fld_tid', teacherQuery.data.fld_id)
            .eq('fld_sid', meeting.fld_sid)
            .eq('fld_ssid', meeting.fld_ssid)
            .order('fld_id', { ascending: false })
            .limit(1)
            .single();

          if (statusError) throw statusError;

          return {
            fld_id: meeting.fld_id,
            fld_sid: meeting.fld_sid,
            fld_ssid: meeting.fld_ssid,
            fld_m_type: meeting.fld_m_type,
            fld_m_flag: meeting.fld_m_flag,
            fld_sal: meeting.tbl_students.fld_sal,
            fld_first_name: meeting.tbl_students.fld_first_name,
            fld_last_name: meeting.tbl_students.fld_last_name,
            fld_mobile: meeting.tbl_students.fld_mobile,
            fld_subject: meeting.tbl_students_subjects.tbl_subjects.fld_subject,
            fld_stage_name: latestStatus?.tbl_mediation_types?.fld_stage_name === 'Mediated' ? 'Ausstehend' : latestStatus?.tbl_mediation_types?.fld_stage_name || 'Unknown'
          };
        })
      );

      return processedMeetings;
    },
    enabled: !!teacherQuery.data?.fld_id && teacherQuery.data?.fld_status === 'Hired'
  });

  // Fetch students with introductory meeting status
  const introductoryMeetingsQuery = useQuery<IntroductoryMeeting[]>({
    queryKey: ['introductoryMeetings', teacherQuery.data?.fld_id],
    queryFn: async () => {
      if (!teacherQuery.data?.fld_id) throw new Error('Teacher not found');

      const { data, error } = await supabase
        .from('tbl_students')
        .select(`
          fld_id,
          fld_first_name,
          fld_last_name,
          fld_mobile,
          fld_im_status,
          tbl_students_subjects!inner(
            fld_suid,
            tbl_subjects!inner(
              fld_subject
            )
          )
        `)
        .eq('fld_im_status', teacherQuery.data.fld_id)
        .eq('fld_status', 'Specialist Consulting');

      if (error) throw error;

      // Process the data to get subjects for each student
      const processedMeetings = (data || []).map(student => ({
        fld_id: student.fld_id,
        fld_first_name: student.fld_first_name,
        fld_last_name: student.fld_last_name,
        fld_mobile: student.fld_mobile,
        fld_subject: student.tbl_students_subjects?.tbl_subjects?.fld_subject || 'Unknown',
        fld_im_status: student.fld_im_status
      }));

      return processedMeetings;
    },
    enabled: !!teacherQuery.data?.fld_id && teacherQuery.data?.fld_status === 'Hired'
  });

  return {
    teacher: teacherQuery,
    stats: statsQuery,
    meetings: meetingsQuery,
    introductoryMeetings: introductoryMeetingsQuery,
    isLoading: teacherQuery.isLoading || statsQuery.isLoading || meetingsQuery.isLoading || introductoryMeetingsQuery.isLoading,
    error: teacherQuery.error || statsQuery.error || meetingsQuery.error || introductoryMeetingsQuery.error
  };
}
