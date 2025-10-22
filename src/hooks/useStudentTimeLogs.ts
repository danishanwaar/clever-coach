import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface TimeLog {
  fld_id: number;
  fld_tid: number;
  fld_sid: number;
  fld_ssid: number;
  fld_lesson: number;
  fld_s_rate: number;
  fld_t_rate: number;
  fld_notes: string | null;
  fld_edate: string;
  fld_uname: number;
  fld_mon: string | null;
  fld_year: string | null;
  fld_status: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Joined data
  tbl_students?: {
    fld_id: number;
    fld_first_name: string;
    fld_last_name: string;
  };
  tbl_students_subjects?: {
    fld_id: number;
    fld_sid: number;
    fld_suid: number;
    tbl_subjects?: {
      fld_id: number;
      fld_subject: string;
    };
  };
  tbl_users?: {
    fld_id: number;
    fld_name: string;
  };
}

export interface CreateTimeLogData {
  fld_sid: number;
  fld_ssid: number;
  fld_lesson: number;
  fld_notes?: string;
  fld_tid?: number;
}

export interface StudentSubject {
  fld_id: number;
  fld_sid: number;
  fld_suid: number;
  tbl_subjects: {
    fld_id: number;
    fld_subject: string;
  };
}

// Hook for managing student time logs
export function useStudentTimeLogs(studentId: number) {
  const queryClient = useQueryClient();

  // Fetch time logs for the student
  const { data: timeLogs = [], isLoading } = useQuery({
    queryKey: ['student-time-logs', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_teachers_lessons_history')
        .select('*')
        .eq('fld_sid', studentId)
        .order('fld_id', { ascending: false });

      if (error) throw error;

      // Fetch related data separately to avoid join issues
      const timeLogsWithData = await Promise.all(
        (data || []).map(async (log) => {
          // Get student data
          const { data: studentData } = await supabase
            .from('tbl_students')
            .select('fld_id, fld_first_name, fld_last_name')
            .eq('fld_id', log.fld_sid)
            .single();

          // Get student subject data
          const { data: studentSubjectData } = await supabase
            .from('tbl_students_subjects')
            .select(`
              fld_id,
              fld_sid,
              fld_suid,
              tbl_subjects!fld_suid (
                fld_id,
                fld_subject
              )
            `)
            .eq('fld_id', log.fld_ssid)
            .single();

          // Get user data
          const { data: userData } = await supabase
            .from('tbl_users')
            .select('fld_id, fld_name')
            .eq('fld_id', log.fld_uname)
            .single();

          return {
            ...log,
            tbl_students: studentData,
            tbl_students_subjects: studentSubjectData,
            tbl_users: userData,
          };
        })
      );

      return timeLogsWithData as TimeLog[];
    },
  });

  // Fetch student subjects for dropdown
  const { data: studentSubjects = [] } = useQuery({
    queryKey: ['student-subjects', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_students_subjects')
        .select(`
          fld_id,
          fld_sid,
          fld_suid,
          tbl_subjects!fld_suid (
            fld_id,
            fld_subject
          )
        `)
        .eq('fld_sid', studentId);

      if (error) throw error;
      return data as StudentSubject[];
    },
  });

  // Create new time log mutation
  const createTimeLogMutation = useMutation({
    mutationFn: async (timeLogData: CreateTimeLogData) => {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) throw new Error('User not authenticated');

      // Get user ID from auth context
      const { data: userData, error: userError } = await supabase
        .from('tbl_users')
        .select('fld_id')
        .eq('auth_user_id', authUser.user.id)
        .single();

      if (userError || !userData) throw new Error('User not found');

      const { error } = await supabase
        .from('tbl_teachers_lessons_history')
        .insert({
          fld_sid: timeLogData.fld_sid,
          fld_ssid: timeLogData.fld_ssid,
          fld_lesson: timeLogData.fld_lesson,
          fld_notes: timeLogData.fld_notes || null,
          fld_edate: new Date().toISOString(),
          fld_uname: userData.fld_id,
          fld_tid: timeLogData.fld_tid || 0, // Default to 0 if not provided
          fld_s_rate: 0, // Default values
          fld_t_rate: 0, // Default values
          fld_status: 'Pending', // Default status
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-time-logs', studentId] });
      toast.success('Time log recorded successfully');
    },
    onError: (error) => {
      toast.error('Failed to record time log: ' + error.message);
    },
  });

  return {
    timeLogs,
    studentSubjects,
    isLoading,
    createTimeLog: createTimeLogMutation.mutate,
    isCreating: createTimeLogMutation.isPending,
  };
}
