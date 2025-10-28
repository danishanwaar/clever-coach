import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

export function useProfile() {
  const queryClient = useQueryClient();
  const authUser = useAuthStore((state) => state.user);

  // Fetch profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', authUser?.fld_id],
    queryFn: async () => {
      if (!authUser?.fld_id) return null;

      const { data, error } = await supabase
        .from('tbl_users')
        .select('*')
        .eq('fld_id', authUser.fld_id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!authUser?.fld_id,
  });

  // Fetch last login from auth.users
  const { data: authUserData } = useQuery({
    queryKey: ['auth-user-data', authUser?.auth_user_id],
    queryFn: async () => {
      if (!authUser?.auth_user_id) return null;

      // Get auth user data
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      return user;
    },
    enabled: !!authUser?.auth_user_id,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { fld_name?: string }) => {
      if (!authUser?.fld_id) throw new Error('No user logged in');

      const { error } = await supabase
        .from('tbl_users')
        .update(updates)
        .eq('fld_id', authUser.fld_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', authUser?.fld_id] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update profile: ' + error.message);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      if (!authUser?.auth_user_id) throw new Error('No user logged in');

      // Call edge function to update password
      const { data, error } = await supabase.functions.invoke('update-password', {
        body: {
          userId: authUser.auth_user_id,
          currentPassword: currentPassword,
          newPassword: newPassword,
        },
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update password');
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to change password: ' + error.message);
    },
  });

  return {
    profile,
    authUserData,
    isLoading,
    updateProfile: updateProfileMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    changePasswordMutation,
    isUpdating: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
  };
}

