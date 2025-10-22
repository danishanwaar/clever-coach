import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface StudentActivity {
  fld_id: number;
  fld_tid: number;
  fld_sid: number;
  fld_activity_type_id: number;
  fld_description: string | null;
  fld_notes: string | null;
  fld_edate: string;
  created_at: string | null;
  updated_at: string | null;
  // Joined data
  tbl_students?: {
    fld_id: number;
    fld_first_name: string;
    fld_last_name: string;
  };
  tbl_activities_types?: {
    fld_id: number;
    fld_activity_name: string;
  };
}

export interface CreateActivityData {
  fld_sid: number;
  fld_activity_type_id: number;
  fld_description: string;
  fld_notes?: string;
  fld_tid?: number;
}

export interface ActivityType {
  fld_id: number;
  fld_activity_name: string;
  fld_status: string;
}

// Hook for managing student activities
export function useStudentActivity(studentId: number) {
  const queryClient = useQueryClient();

  // Fetch activities for the student
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['student-activities', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_teachers_students_activity')
        .select('*')
        .eq('fld_sid', studentId)
        .order('fld_id', { ascending: false });

      if (error) throw error;

      // Fetch related data separately to avoid join issues
      const activitiesWithData = await Promise.all(
        (data || []).map(async (activity) => {
          // Get student data
          const { data: studentData } = await supabase
            .from('tbl_students')
            .select('fld_id, fld_first_name, fld_last_name')
            .eq('fld_id', activity.fld_sid)
            .single();

          // Get activity type data
          const { data: activityTypeData } = await supabase
            .from('tbl_activities_types')
            .select('fld_id, fld_activity_name')
            .eq('fld_id', activity.fld_activity_type_id)
            .single();

          return {
            ...activity,
            tbl_students: studentData,
            tbl_activities_types: activityTypeData,
          };
        })
      );

      return activitiesWithData as StudentActivity[];
    },
  });

  // Fetch activity types for dropdown
  const { data: activityTypes = [] } = useQuery({
    queryKey: ['activity-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_activities_types')
        .select('*')
        .eq('fld_status', 'Active')
        .order('fld_activity_name');

      if (error) throw error;
      return data as ActivityType[];
    },
  });

  // Create new activity mutation
  const createActivityMutation = useMutation({
    mutationFn: async (activityData: CreateActivityData) => {
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
        .from('tbl_teachers_students_activity')
        .insert({
          fld_sid: activityData.fld_sid,
          fld_activity_type_id: activityData.fld_activity_type_id,
          fld_description: activityData.fld_description,
          fld_notes: activityData.fld_notes || null,
          fld_edate: new Date().toISOString(),
          fld_tid: activityData.fld_tid || 0, // Default to 0 if not provided
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-activities', studentId] });
      toast.success('Activity recorded successfully');
    },
    onError: (error) => {
      toast.error('Failed to record activity: ' + error.message);
    },
  });

  // Delete activity mutation
  const deleteActivityMutation = useMutation({
    mutationFn: async (activityId: number) => {
      const { error } = await supabase
        .from('tbl_teachers_students_activity')
        .delete()
        .eq('fld_id', activityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-activities', studentId] });
      toast.success('Activity deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete activity: ' + error.message);
    },
  });

  return {
    activities,
    activityTypes,
    isLoading,
    createActivity: createActivityMutation.mutate,
    deleteActivity: deleteActivityMutation.mutate,
    isCreating: createActivityMutation.isPending,
    isDeleting: deleteActivityMutation.isPending,
  };
}
