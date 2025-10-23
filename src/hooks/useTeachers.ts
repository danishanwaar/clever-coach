import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

export interface Teacher {
  fld_id: number;
  fld_first_name: string;
  fld_last_name: string;
  fld_email: string;
  fld_phone: string;
  fld_city: string;
  fld_zip: string;
  fld_street: string;
  fld_gender: string;
  fld_dob: string;
  fld_education: string;
  fld_t_mode: string;
  fld_l_mode: string;
  fld_short_bio: string;
  fld_self: string;
  fld_source: string;
  fld_evaluation: string;
  fld_status: string;
  fld_edate: string;
  fld_onboard_date: string;
  fld_per_l_rate: number | string;
  fld_latitude: string;
  fld_longitude: string;
  fld_uid: number;
}

export interface TeacherSubject {
  fld_id: number;
  fld_tid: number;
  fld_sid: number;
  fld_level: number;
  fld_experience: number;
  fld_edate: string;
  fld_uname: number;
  tbl_subjects: {
    fld_id: number;
    fld_subject: string;
    fld_image: string;
  };
  tbl_levels: {
    fld_id: number;
    fld_level: string;
  };
}

export interface TeacherActivity {
  fld_id: number;
  fld_tid: number;
  fld_title: string;
  fld_content: string;
  fld_erdat: string;
  fld_uid: number;
  tbl_users: {
    fld_id: number;
    fld_name: string;
  };
}

export interface ActivityType {
  fld_id: number;
  fld_activity_name: string;
  fld_status: string;
}

export const useTeachers = (status?: string) => {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  // Fetch teachers based on status
  const teachersQuery = useQuery({
    queryKey: ['teachers', status],
    queryFn: async () => {
      let query = supabase
        .from('tbl_teachers')
        .select(`
          fld_id,
          fld_first_name,
          fld_last_name,
          fld_email,
          fld_phone,
          fld_city,
          fld_zip,
          fld_street,
          fld_gender,
          fld_dob,
          fld_education,
          fld_t_mode,
          fld_l_mode,
          fld_short_bio,
          fld_self,
          fld_source,
          fld_evaluation,
          fld_status,
          fld_edate,
          fld_onboard_date,
          fld_per_l_rate,
          fld_latitude,
          fld_longitude,
          fld_uid
        `)
        .order('fld_id', { ascending: false });

      if (status && status !== 'All') {
        query = query.eq('fld_status', status as any);
      } else {
        // Default to showing hired teachers
        query = query.eq('fld_status', 'Hired');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Teacher[];
    },
  });

  // Fetch teacher subjects
  const teacherSubjectsQuery = useQuery({
    queryKey: ['teacher-subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_teachers_subjects_expertise')
        .select(`
          fld_id,
          fld_tid,
          fld_sid,
          fld_level,
          fld_experience,
          fld_edate,
          fld_uname,
          tbl_subjects:fld_sid (
            fld_id,
            fld_subject,
            fld_image
          ),
          tbl_levels:fld_level (
            fld_id,
            fld_level
          )
        `);

      if (error) throw error;
      return data as TeacherSubject[];
    },
  });

  // Fetch activity types
  const activityTypesQuery = useQuery({
    queryKey: ['activity-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_activities_types')
        .select('fld_id, fld_activity_name, fld_status')
        .eq('fld_status', 'Active');

      if (error) throw error;
      return data as ActivityType[];
    },
  });

  // Fetch teacher activities
  const teacherActivitiesQuery = useQuery({
    queryKey: ['teacher-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_activity_teacher')
        .select(`
          fld_id,
          fld_tid,
          fld_title,
          fld_content,
          fld_erdat,
          fld_uid,
          tbl_users:fld_uid (
            fld_id,
            fld_name
          )
        `)
        .order('fld_id', { ascending: false });

      if (error) throw error;
      return data as TeacherActivity[];
    },
  });

  // Update teacher status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      teacherId, 
      status 
    }: { 
      teacherId: number; 
      status: string; 
    }) => {
      const updates: any = {
        fld_status: status,
        fld_onboard_date: new Date().toISOString(),
        fld_onboard_uid: user?.fld_id || 1,
      };

      const { error } = await supabase
        .from('tbl_teachers')
        .update(updates)
        .eq('fld_id', teacherId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update teacher status');
      console.error('Update status error:', error);
    },
  });

  // Update teacher rate mutation
  const updateRateMutation = useMutation({
    mutationFn: async ({ 
      teacherId, 
      rate 
    }: { 
      teacherId: number; 
      rate: number; 
    }) => {
      const { error } = await supabase
        .from('tbl_teachers')
        .update({ fld_per_l_rate: rate.toString() })
        .eq('fld_id', teacherId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher rate updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update teacher rate');
      console.error('Update rate error:', error);
    },
  });

  // Record activity mutation
  const recordActivityMutation = useMutation({
    mutationFn: async ({ 
      teacherId, 
      title, 
      content 
    }: { 
      teacherId: number; 
      title: string; 
      content: string; 
    }) => {
      const { error } = await supabase
        .from('tbl_activity_teacher')
        .insert({
          fld_tid: teacherId,
          fld_title: title,
          fld_content: content,
          fld_erdat: new Date().toISOString(),
          fld_uid: user?.fld_id || 1,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-activities'] });
      toast.success('Activity recorded successfully');
    },
    onError: (error) => {
      toast.error('Failed to record activity');
      console.error('Record activity error:', error);
    },
  });

  return {
    teachers: teachersQuery.data || [],
    teacherSubjects: teacherSubjectsQuery.data || [],
    teacherActivities: teacherActivitiesQuery.data || [],
    activityTypes: activityTypesQuery.data || [],
    isLoading: teachersQuery.isLoading,
    isLoadingSubjects: teacherSubjectsQuery.isLoading,
    isLoadingActivities: teacherActivitiesQuery.isLoading,
    updateStatus: updateStatusMutation.mutate,
    updateRate: updateRateMutation.mutate,
    recordActivity: recordActivityMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
    isUpdatingRate: updateRateMutation.isPending,
    isRecordingActivity: recordActivityMutation.isPending,
    refetch: () => teachersQuery.refetch(),
  };
};
