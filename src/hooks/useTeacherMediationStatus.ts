import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';

export interface TeacherMediationType {
  fld_id: number;
  fld_stage_name: string;
  fld_rid: number;
  fld_status: string;
}

// Hook for fetching teacher mediation types (FLD_RID=2)
export const useTeacherMediationTypes = () => {
  return useQuery<TeacherMediationType[]>({
    queryKey: ['teacher-mediation-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_mediation_types')
        .select('fld_id, fld_stage_name, fld_rid, fld_status')
        .eq('fld_rid', 2)
        .eq('fld_status', 'Active')
        .order('fld_id');

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour - mediation types don't change often
  });
};

// Hook for updating mediation status
export const useUpdateMediationStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      teacherId,
      studentId,
      studentSubjectId,
      mediationTypeId,
    }: {
      teacherId: number;
      studentId: number;
      studentSubjectId: number;
      mediationTypeId: number;
    }) => {
      // Following PHP logic: insert new mediation stage record
      const { data, error } = await supabase
        .from('tbl_students_mediation_stages')
        .insert({
          fld_tid: teacherId,
          fld_sid: studentId,
          fld_ssid: studentSubjectId,
          fld_m_type: mediationTypeId,
          fld_edate: new Date().toISOString().split('T')[0],
          fld_etime: new Date().toTimeString().slice(0, 5), // HH:mm format
          fld_uname: user?.fld_id || 1,
        })
        .select()
        .single();

      if (error) throw error;

      // Following PHP logic: If mediation type is 6 (Probestunde hat stattgefunden / Trial lesson completed)
      if (mediationTypeId === 6) {
        // Update FLD_M_FLAG to 'X' on the original mediation stage (where FLD_M_TYPE='1')
        const { error: updateError } = await supabase
          .from('tbl_students_mediation_stages')
          .update({ fld_m_flag: 'X' })
          .eq('fld_tid', teacherId)
          .eq('fld_sid', studentId)
          .eq('fld_ssid', studentSubjectId)
          .eq('fld_m_type', 1);

        if (updateError) throw updateError;

        // Check if all student subjects have status 6
        const { data: studentSubjects, error: subjectsError } = await supabase
          .from('tbl_students_subjects')
          .select('fld_id')
          .eq('fld_sid', studentId);

        if (subjectsError) throw subjectsError;

        const { data: completedSubjects, error: completedError } = await supabase
          .from('tbl_students_mediation_stages')
          .select('fld_ssid')
          .eq('fld_sid', studentId)
          .eq('fld_m_type', 6);

        if (completedError) throw completedError;

        // If all subjects have status 6, update student status to 'Specialist Consulting'
        if (studentSubjects.length === (completedSubjects?.length || 0)) {
          const { error: studentUpdateError } = await supabase
            .from('tbl_students')
            .update({ fld_status: 'Specialist Consulting' })
            .eq('fld_id', studentId);

          if (studentUpdateError) throw studentUpdateError;

          // Note: Email notification to admin would be handled by a Supabase function/edge function
          // This is omitted here as it requires server-side email configuration
        }
      }

      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refresh the dashboard
      queryClient.invalidateQueries({ queryKey: ['pendingMeetings'] });
      queryClient.invalidateQueries({ queryKey: ['introductoryMeetings'] });
      queryClient.invalidateQueries({ queryKey: ['teacherStats'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      
      toast({
        title: 'Status Updated',
        description: 'Mediation status has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update mediation status',
        variant: 'destructive',
      });
    },
  });
};

