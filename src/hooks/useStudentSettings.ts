import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

// Types
export interface StudentSettings {
  // Basic info
  fld_sal: string;
  fld_first_name: string;
  fld_last_name: string;
  fld_sd: string;
  fld_s_first_name: string;
  fld_s_last_name: string;
  fld_level: number;
  fld_school: string;
  fld_reason: string;
  // Contact info
  fld_email: string;
  fld_mobile: string;
  fld_phone: string;
  fld_city: string;
  fld_zip: string;
  fld_address: string;
  // Contract info
  fld_payer: string;
  fld_ct: number;
  fld_wh: number;
  fld_ld: string;
  fld_l_mode: string;
  fld_price: string;
  fld_reg_fee: string;
  // Bank info
  fld_iban: string;
  fld_bi: string;
  // Statistics
  fld_f_lead: string;
  fld_uname: string;
  // Notes
  fld_notes: string;
  // Status
  fld_status: string;
}

export interface StudentSettingsForm {
  // Basic info
  fld_sal: string;
  fld_first_name: string;
  fld_last_name: string;
  fld_sd: string;
  fld_s_first_name: string;
  fld_s_last_name: string;
  fld_level: string;
  fld_school: string;
  fld_reason: string;
  // Contact info
  fld_email: string;
  fld_mobile: string;
  fld_phone: string;
  fld_city: string;
  fld_zip: string;
  fld_address: string;
  // Contract info
  fld_payer: string;
  fld_ct: string;
  fld_wh: string;
  fld_ld: string;
  fld_l_mode: string;
  fld_price: string;
  fld_reg_fee: string;
  // Bank info
  fld_iban: string;
  fld_bi: string;
  // Statistics
  fld_f_lead: string;
  fld_uname: string;
  // Notes
  fld_notes: string;
  // Status
  fld_status: string;
}

export interface Level {
  fld_id: number;
  fld_level: string;
}

export interface SchoolType {
  fld_id: number;
  fld_name: string;
}

export interface Reason {
  fld_id: number;
  fld_reason: string;
  fld_status: string;
}

export interface LessonDuration {
  fld_id: number;
  fld_l_duration: string;
}

export interface Subject {
  fld_id: number;
  fld_subject: string;
  fld_status: string;
  fld_image?: string;
}

export interface StudentSubject {
  fld_id: number;
  fld_sid: number;
  fld_suid: number;
  tbl_subjects?: {
    fld_id: number;
    fld_subject: string;
    fld_image?: string;
  };
}

export interface Source {
  fld_id: number;
  fld_source: string;
  fld_type: string;
  fld_status: string;
}

export interface DeleteReason {
  fld_id: number;
  fld_reason: string;
  fld_type: string;
  fld_status: string;
}

export interface Contract {
  fld_id: number;
  fld_sid: number;
  fld_iban: string;
  fld_bi: string;
  fld_status: string;
}

// Hook for managing student settings
export function useStudentSettings(studentId: number) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  // Fetch student data
  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ['student-settings', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_students')
        .select('*')
        .eq('fld_id', studentId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch contract data
  const { data: contract } = useQuery({
    queryKey: ['student-contract', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_contracts')
        .select('*')
        .eq('fld_sid', studentId)
        .in('fld_status', ['Active', 'Pending Signature'])
        .limit(1);

      if (error) throw error;
      return data?.[0] as Contract | null;
    },
  });

  // Fetch levels
  const { data: levels = [] } = useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_levels')
        .select('*')
        .order('fld_level');

      if (error) throw error;
      return data as Level[];
    },
  });

  // Fetch school types
  const { data: schoolTypes = [] } = useQuery({
    queryKey: ['school-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_su_types')
        .select('*')
        .order('fld_name');

      if (error) throw error;
      return data as SchoolType[];
    },
  });

  // Fetch reasons
  const { data: reasons = [] } = useQuery({
    queryKey: ['reasons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_reasons')
        .select('*')
        .eq('fld_status', 'Active')
        .order('fld_reason');

      if (error) throw error;
      return data as Reason[];
    },
  });

  // Fetch lesson durations
  const { data: lessonDurations = [] } = useQuery({
    queryKey: ['lesson-durations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_lesson_durations')
        .select('*')
        .order('fld_l_duration');

      if (error) throw error;
      return data as LessonDuration[];
    },
  });

  // Fetch subjects
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_subjects')
        .select('*')
        .eq('fld_status', 'Active')
        .order('fld_subject');

      if (error) throw error;
      return data as Subject[];
    },
  });

  // Fetch student subjects
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
            fld_subject,
            fld_image
          )
        `)
        .eq('fld_sid', studentId);

      if (error) throw error;
      return data as StudentSubject[];
    },
  });

  // Fetch sources
  const { data: sources = [] } = useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_source')
        .select('*')
        .eq('fld_type', 'Student')
        .eq('fld_status', 'Active')
        .order('fld_source');

      if (error) throw error;
      return data as Source[];
    },
  });

  // Fetch delete reasons
  const { data: deleteReasons = [] } = useQuery({
    queryKey: ['delete-reasons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_delete_reasons')
        .select('*')
        .eq('fld_type', 'Student')
        .eq('fld_status', 'Active')
        .order('fld_reason');

      if (error) throw error;
      return data as DeleteReason[];
    },
  });

  // Fetch user data for the admin field
  const { data: userData } = useQuery({
    queryKey: ['user-data', student?.fld_uname],
    queryFn: async () => {
      if (!student?.fld_uname) return null;
      
      const { data, error } = await supabase
        .from('tbl_users')
        .select('fld_id, fld_name')
        .eq('fld_id', student.fld_uname)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!student?.fld_uname,
  });

  // Check if student has active contracts
  const { data: hasActiveContracts = false } = useQuery({
    queryKey: ['student-active-contracts', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_contracts')
        .select('fld_id')
        .eq('fld_sid', studentId)
        .eq('fld_status', 'Active')
        .limit(1);

      if (error) throw error;
      return (data?.length || 0) > 0;
    },
  });

  // Update basic info mutation
  const updateBasicMutation = useMutation({
    mutationFn: async (data: Partial<StudentSettingsForm>) => {
      // Convert form data to database format
      const dbData: any = { ...data };
      if (data.fld_level) {
        dbData.fld_level = parseInt(data.fld_level);
      }
      if (data.fld_ct) {
        dbData.fld_ct = parseInt(data.fld_ct);
      }
      if (data.fld_wh) {
        dbData.fld_wh = parseInt(data.fld_wh);
      }

      const { error } = await supabase
        .from('tbl_students')
        .update(dbData)
        .eq('fld_id', studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-settings', studentId] });
      toast.success('Basic information updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update basic information: ' + error.message);
    },
  });

  // Update contract info mutation
  const updateContractMutation = useMutation({
    mutationFn: async (data: Partial<StudentSettingsForm>) => {
      // Convert form data to database format
      const dbData: any = { ...data };
      if (data.fld_ct) {
        dbData.fld_ct = parseInt(data.fld_ct);
      }
      if (data.fld_wh) {
        dbData.fld_wh = parseInt(data.fld_wh);
      }

      const { error } = await supabase
        .from('tbl_students')
        .update(dbData)
        .eq('fld_id', studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-settings', studentId] });
      toast.success('Contract information updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update contract information: ' + error.message);
    },
  });

  // Update bank info mutation
  const updateBankMutation = useMutation({
    mutationFn: async (data: { fld_iban: string; fld_bi: string }) => {
      const { error } = await supabase
        .from('tbl_contracts')
        .update(data)
        .eq('fld_sid', studentId)
        .in('fld_status', ['Active', 'Pending Signature']);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-contract', studentId] });
      toast.success('Bank information updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update bank information: ' + error.message);
    },
  });

  // Update subjects mutation
  const updateSubjectsMutation = useMutation({
    mutationFn: async (subjectIds: number[]) => {
      // Delete existing subjects
      await supabase
        .from('tbl_students_subjects')
        .delete()
        .eq('fld_sid', studentId);

      // Insert new subjects
      if (subjectIds.length > 0) {
        const { error } = await supabase
          .from('tbl_students_subjects')
          .insert(
            subjectIds.map(suid => ({
              fld_sid: studentId,
              fld_suid: suid,
              fld_cid: null, // Default value
              fld_edate: new Date().toISOString(),
              fld_c_eid: null,
              fld_uname: user?.fld_id || null,
            }))
          );

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-subjects', studentId] });
      toast.success('Subjects updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update subjects: ' + error.message);
    },
  });

  // Add subject mutation (similar to TeacherSettings)
  const addSubjectMutation = useMutation({
    mutationFn: async ({ subjectIds, userId }: { subjectIds: number[]; userId: number }) => {
      // Check if subjects already exist
      const { data: existingSubjects, error: checkError } = await supabase
        .from('tbl_students_subjects')
        .select('fld_suid')
        .eq('fld_sid', studentId);

      if (checkError) throw checkError;

      const existingSubjectIds = new Set(existingSubjects?.map(ss => ss.fld_suid) || []);
      
      // Filter out subjects that already exist
      const newSubjectIds = subjectIds.filter(suid => !existingSubjectIds.has(suid));

      if (newSubjectIds.length === 0) {
        throw new Error('All selected subjects are already assigned');
      }

      // Insert new subjects
      const { error } = await supabase
        .from('tbl_students_subjects')
        .insert(
          newSubjectIds.map(suid => ({
            fld_sid: studentId,
            fld_suid: suid,
            fld_cid: null,
            fld_c_eid: null,
            fld_edate: new Date().toISOString().split('T')[0],
            fld_uname: userId,
          }))
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-subjects', studentId] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Subjects added successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to add subjects: ' + error.message);
    },
  });

  // Delete subject mutation
  const deleteSubjectMutation = useMutation({
    mutationFn: async (subjectId: number) => {
      const { error } = await supabase
        .from('tbl_students_subjects')
        .delete()
        .eq('fld_id', subjectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-subjects', studentId] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Subject deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete subject: ' + error.message);
    },
  });

  // Update statistics mutation
  const updateStatisticsMutation = useMutation({
    mutationFn: async (data: Partial<StudentSettingsForm>) => {
      // Convert form data to database format
      const dbData: any = { ...data };
      if (data.fld_uname) {
        dbData.fld_uname = parseInt(data.fld_uname);
      }

      const { error } = await supabase
        .from('tbl_students')
        .update(dbData)
        .eq('fld_id', studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-settings', studentId] });
      toast.success('Statistics updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update statistics: ' + error.message);
    },
  });

  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async (data: Partial<StudentSettingsForm>) => {
      // Convert form data to database format
      const dbData: any = { ...data };
      if (data.fld_price) {
        dbData.fld_price = parseFloat(data.fld_price);
      }
      if (data.fld_reg_fee) {
        dbData.fld_reg_fee = parseFloat(data.fld_reg_fee);
      }

      const { error } = await supabase
        .from('tbl_students')
        .update(dbData)
        .eq('fld_id', studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-settings', studentId] });
      toast.success('Notes updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update notes: ' + error.message);
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (data: Partial<StudentSettingsForm>) => {
      // Convert form data to database format
      const dbData: any = { ...data };
      if (data.fld_price) {
        dbData.fld_price = parseFloat(data.fld_price);
      }
      if (data.fld_reg_fee) {
        dbData.fld_reg_fee = parseFloat(data.fld_reg_fee);
      }

      const { error } = await supabase
        .from('tbl_students')
        .update(dbData)
        .eq('fld_id', studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-settings', studentId] });
      toast.success('Status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update status: ' + error.message);
    },
  });

  return {
    student,
    contract,
    levels,
    schoolTypes,
    reasons,
    lessonDurations,
    subjects,
    studentSubjects,
    sources,
    deleteReasons,
    hasActiveContracts,
    userData,
    isLoading: studentLoading,
    updateBasic: updateBasicMutation.mutate,
    updateContract: updateContractMutation.mutate,
    updateBank: updateBankMutation.mutate,
    updateSubjects: updateSubjectsMutation.mutate,
    updateSubjectsMutation,
    addSubjectMutation,
    addSubject: addSubjectMutation.mutate,
    deleteSubject: deleteSubjectMutation.mutate,
    deleteSubjectMutation,
    updateStatistics: updateStatisticsMutation.mutate,
    updateNotes: updateNotesMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: 
      updateBasicMutation.isPending ||
      updateContractMutation.isPending ||
      updateBankMutation.isPending ||
      updateSubjectsMutation.isPending ||
      addSubjectMutation.isPending ||
      deleteSubjectMutation.isPending ||
      updateStatisticsMutation.isPending ||
      updateNotesMutation.isPending ||
      updateStatusMutation.isPending,
  };
}
