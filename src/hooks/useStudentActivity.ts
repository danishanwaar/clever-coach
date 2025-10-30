import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

  // Types
export interface StudentActivity {
  fld_id: number;
  fld_title?: string; // For admin activities
  fld_content?: string; // For admin activities
  fld_activity_type_id?: number; // For teacher activities
  fld_description?: string | null; // For teacher activities
  fld_notes?: string | null; // For teacher activities
  fld_edate: string; // For teacher activities
  fld_erdat?: string; // For admin activities
  // Joined data
  tbl_activities_types?: {
    fld_id: number;
    fld_activity_name: string;
  };
  tbl_users?: {
    fld_id: number;
    fld_name: string;
  };
}

export interface CreateActivityData {
  fld_sid: number;
  fld_activity_type_id?: number; // Optional for admin (uses title/content instead)
  fld_description?: string; // Optional for admin (uses content instead)
  fld_notes?: string;
  fld_tid?: number;
  title?: string; // For admin - uses tbl_activity_students
  content?: string; // For admin - uses tbl_activity_students
}

export interface ActivityType {
  fld_id: number;
  fld_activity_name: string;
  fld_status: string;
}

// Hook for managing student activities
export function useStudentActivity(studentId: number) {
  const queryClient = useQueryClient();
  const { user, isAdmin, isTeacher } = useAuthStore();

  // Determine which table to use based on user role
  const isAdminUser = isAdmin();
  const isTeacherUser = isTeacher();

  // Fetch activities for the student - from appropriate table based on role
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['student-activities', studentId, user?.fld_rid],
    queryFn: async () => {
      // Admin users fetch from tbl_activity_students
      if (isAdminUser) {
        const { data, error } = await supabase
          .from('tbl_activity_students')
          .select(`
            fld_id,
            fld_title,
            fld_content,
            fld_erdat,
            fld_uid,
            tbl_users:fld_uid(
              fld_id,
              fld_name
            )
          `)
          .eq('fld_sid', studentId)
          .order('fld_erdat', { ascending: false });

        if (error) throw error;

        // Transform data (user is already preloaded via nested select)
        return (data || []).map((activity: any) => ({
          fld_id: activity.fld_id,
          fld_title: activity.fld_title,
          fld_content: activity.fld_content,
          fld_erdat: activity.fld_erdat,
          tbl_users: activity.tbl_users || null,
        })) as StudentActivity[];
      } else {
        // Teacher users fetch from tbl_teachers_students_activity
        const { data, error } = await supabase
          .from('tbl_teachers_students_activity')
          .select(`
            fld_id,
            fld_activity_type_id,
            fld_description,
            fld_notes,
            fld_edate,
            fld_uname,
            tbl_users:fld_uname(
              fld_id,
              fld_name
            ),
            tbl_activities_types:fld_activity_type_id(
              fld_id,
              fld_activity_name
            )
          `)
          .eq('fld_sid', studentId)
          .order('fld_id', { ascending: false });

        if (error) throw error;

        // Transform data (user and activity types are already preloaded via nested selects)
        return (data || []).map((activity: any) => ({
          fld_id: activity.fld_id,
          fld_activity_type_id: activity.fld_activity_type_id,
          fld_description: activity.fld_description,
          fld_notes: activity.fld_notes,
          fld_edate: activity.fld_edate,
          tbl_activities_types: activity.tbl_activities_types || null,
          tbl_users: activity.tbl_users || null,
        })) as StudentActivity[];
      }
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
        .select('fld_id, fld_rid')
        .eq('auth_user_id', authUser.user.id)
        .single();

      if (userError || !userData) throw new Error('User not found');

      const userRoleId = userData.fld_rid;

      // Admin users insert into tbl_activity_students
      if (userRoleId === 1) {
        // Admin uses tbl_activity_students with fld_title and fld_content
        if (!activityData.title || !activityData.content) {
          throw new Error('Title and content are required for admin activities');
        }
        
        const { error } = await supabase
          .from('tbl_activity_students')
          .insert({
            fld_sid: activityData.fld_sid,
            fld_title: activityData.title,
            fld_content: activityData.content,
            fld_erdat: new Date().toISOString(),
            fld_uid: userData.fld_id,
          });

        if (error) throw error;
      } else {
        // Teacher users insert into tbl_teachers_students_activity
        if (!activityData.fld_activity_type_id || !activityData.fld_description) {
          throw new Error('Activity type ID and description are required for teacher activities');
        }
        
        const { error } = await supabase
          .from('tbl_teachers_students_activity')
          .insert({
            fld_sid: activityData.fld_sid,
            fld_activity_type_id: activityData.fld_activity_type_id,
            fld_description: activityData.fld_description,
            fld_notes: activityData.fld_notes || null,
            fld_edate: new Date().toISOString(),
            fld_tid: activityData.fld_tid || null,
            fld_uname: userData.fld_id,
          });

        if (error) throw error;
      }
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
      // Delete from appropriate table based on user role
      if (isAdminUser) {
        const { error } = await supabase
          .from('tbl_activity_students')
          .delete()
          .eq('fld_id', activityId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tbl_teachers_students_activity')
          .delete()
          .eq('fld_id', activityId);

        if (error) throw error;
      }
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
