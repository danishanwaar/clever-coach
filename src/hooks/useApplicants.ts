import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

export interface Applicant {
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
  fld_per_l_rate: string;
  fld_latitude: string;
  fld_longitude: string;
  fld_uid: number;
}

export interface ApplicantSubject {
  fld_id: number;
  fld_tid: number;
  fld_sid: number; // Subject ID (not fld_suid)
  fld_level: number; // Level ID (not fld_expertise_level)
  fld_experience: number; // Experience (not fld_years_experience)
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

export interface ActivityType {
  fld_id: number;
  fld_activity_name: string;
  fld_status: string;
}

export interface ApplicantActivity {
  fld_id: number;
  fld_aid: number;
  fld_title: string;
  fld_content: string;
  fld_erdat: string;
  fld_uid: number;
  tbl_users: {
    fld_id: number;
    fld_name: string;
  };
}

export const useApplicants = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  // Fetch all applicants (filtering is done client-side for better real-time performance)
  const applicantsQuery = useQuery({
    queryKey: ['applicants'],
    queryFn: async () => {
      const { data, error } = await supabase
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
        .neq('fld_status', 'Hired')
        .order('fld_id', { ascending: false });

      if (error) throw error;
      return data as Applicant[];
    },
  });

  // Fetch applicant subjects
  const applicantSubjectsQuery = useQuery({
    queryKey: ['applicant-subjects'],
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
      return data as ApplicantSubject[];
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

  // Fetch applicant activities
  const applicantActivitiesQuery = useQuery({
    queryKey: ['applicant-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_activity_applicants')
        .select(`
          fld_id,
          fld_aid,
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
      return data as ApplicantActivity[];
    },
  });

  // Update applicant status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      applicantId, 
      status, 
      rate 
    }: { 
      applicantId: number; 
      status: string; 
      rate?: number; 
    }) => {
      const updates: any = {
        fld_status: status,
        fld_onboard_date: new Date().toISOString(),
        fld_onboard_uid: user?.fld_id || 1,
      };

      if (rate) {
        updates.fld_per_l_rate = rate;
      }

      // If status is "Offer", update to "Pending For Signature"
      if (status === 'Offer') {
        updates.fld_status = 'Pending For Signature';
      }

      const { error } = await supabase
        .from('tbl_teachers')
        .update(updates)
        .eq('fld_id', applicantId);

      if (error) throw error;

      // If status is Offer, also update user status and send email
      if (status === 'Offer') {
        // Get teacher info
        const { data: teacher } = await supabase
          .from('tbl_teachers')
          .select('fld_uid, fld_email, fld_first_name, fld_last_name')
          .eq('fld_id', applicantId)
          .single();

        if (teacher) {
          // Update user status
          const { error: userError } = await supabase
            .from('tbl_users')
            .update({
              fld_is_verify: 'Y',
              fld_f_time_login: 'N',
              fld_status: 'Active'
            })
            .eq('fld_id', teacher.fld_uid);

          if (userError) throw userError;

          // Send contract email notification
          try {
            const { data: functionData, error: functionError } = await supabase.functions.invoke('send-contract-email', {
              body: {
                contract_type: 'teacher',
                contract_id: applicantId,
                teacher_id: applicantId,
                base_url: window.location.origin,
                admin_user_id: user?.fld_id?.toString()
              }
            });

            if (functionError) {
              console.error('Failed to send contract email:', functionError);
              toast.error('Failed to send contract email: ' + functionError.message);
              // Don't fail the entire operation, just log the error
            } else {
              console.log('Contract email sent successfully:', functionData);
              toast.success('Contract email sent successfully');
            }
          } catch (emailError) {
            console.error('Error calling send-contract-email function:', emailError);
            // Don't fail the entire operation, just log the error
          }
        }
      }

      // Handle rejected/deleted status
      if (status === 'Rejected' || status === 'Deleted') {
        const { data: teacher } = await supabase
          .from('tbl_teachers')
          .select('fld_uid')
          .eq('fld_id', applicantId)
          .single();

        if (teacher) {
          const { error: userError } = await supabase
            .from('tbl_users')
            .update({ fld_status: 'Inactive' })
            .eq('fld_id', teacher.fld_uid);

          if (userError) throw userError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants'] });
      toast.success('Applicant status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update applicant status');
      console.error('Update status error:', error);
    },
  });

  // Record activity mutation
  const recordActivityMutation = useMutation({
    mutationFn: async ({ 
      applicantId, 
      title, 
      content 
    }: { 
      applicantId: number; 
      title: string; 
      content: string; 
    }) => {
      const { error } = await supabase
        .from('tbl_activity_applicants')
        .insert({
          fld_aid: applicantId,
          fld_title: title,
          fld_content: content,
          fld_erdat: new Date().toISOString(),
          fld_uid: user?.fld_id || 1,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicant-activities'] });
      toast.success('Activity recorded successfully');
    },
    onError: (error) => {
      toast.error('Failed to record activity');
      console.error('Record activity error:', error);
    },
  });

  return {
    applicants: applicantsQuery.data || [],
    applicantSubjects: applicantSubjectsQuery.data || [],
    activityTypes: activityTypesQuery.data || [],
    applicantActivities: applicantActivitiesQuery.data || [],
    isLoading: applicantsQuery.isLoading,
    isLoadingSubjects: applicantSubjectsQuery.isLoading,
    isLoadingActivities: applicantActivitiesQuery.isLoading,
    updateStatus: updateStatusMutation.mutate,
    recordActivity: recordActivityMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
    isRecordingActivity: recordActivityMutation.isPending,
    refetch: () => applicantsQuery.refetch(),
  };
};
