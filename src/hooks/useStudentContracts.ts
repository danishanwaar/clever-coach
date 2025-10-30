import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import type { Database } from '@/integrations/supabase/types';

interface CreateContractData {
  fld_sid: number;
  fld_ct: string;
  fld_start_date: string;
  fld_end_date: string;
  fld_p_mode: 'Lastschrift' | 'Überweisung';
  fld_lp: 'Online' | 'Onsite';
  fld_lesson_dur: string;
  fld_min_lesson: number;
  fld_reg_fee: number;
  fld_s_per_lesson_rate: number;
  fld_bps?: string;
}

interface ContractEngagement {
  fld_id: number;
  fld_ssid: number;
  fld_cid: number;
  fld_tid: number;
  fld_t_per_lesson_rate: number;
  fld_ename: number;
  fld_edate: string;
  fld_status: string;
  lesson_count?: number;
  tbl_teachers?: {
    fld_first_name: string;
    fld_last_name: string;
  };
  tbl_students_subjects?: {
    tbl_subjects?: {
      fld_subject: string;
    };
  };
}

interface StudentContract {
  fld_id: number;
  fld_sid: number;
  fld_ct: string;
  fld_start_date: string;
  fld_end_date: string;
  fld_p_mode: 'Lastschrift' | 'Überweisung';
  fld_lp: 'Online' | 'Onsite';
  fld_lesson_dur: string;
  fld_min_lesson: number;
  fld_reg_fee: number;
  fld_s_per_lesson_rate: number;
  fld_file: string | null;
  fld_bps: string | null;
  fld_ename: number;
  fld_edate: string;
  fld_status: 'Pending Signature' | 'Active' | 'Deleted';
  fld_bi: string | null;
  fld_iban: string | null;
  fld_bic: string | null;
  fld_signature: string | null;
  fld_edtim: string | null;
  student: {
    fld_id: number;
    fld_first_name: string;
    fld_last_name: string;
    fld_email: string;
    fld_phone: string;
    fld_mobile: string | null;
    fld_address: string | null;
    fld_zip: string | null;
    fld_city: string | null;
    fld_s_first_name: string | null;
    fld_s_last_name: string | null;
    fld_school: string | null;
    fld_level: string | null;
    fld_payer: string | null;
    fld_bank_name: string | null;
    fld_bank_act: string | null;
  };
}

export function useStudentContracts() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Get all contracts for a student (for backward compatibility)
  const getStudentContracts = (studentId: number) => {
    return useQuery({
    queryKey: ['student-contracts', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
          .from('tbl_contracts')
          .select(`
          *,
            student:tbl_students(
              fld_id,
              fld_first_name,
              fld_last_name,
              fld_email,
              fld_phone,
              fld_mobile,
              fld_address,
              fld_zip,
              fld_city,
              fld_s_first_name,
              fld_s_last_name,
              fld_school,
              fld_level,
              fld_payer,
              fld_bank_name,
              fld_bank_act
            )
        `)
          .eq('fld_sid', studentId)
          .neq('fld_status', 'Deleted')
          .order('fld_id', { ascending: false });

        if (error) throw error;
        return data as StudentContract[];
      },
      staleTime: 1000 * 60 * 5, // 5 minutes - prevent refetching too often
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    });
  };

  // Get active contracts for a student
  const getActiveContracts = (studentId: number) => {
    return useQuery({
      queryKey: ['student-contracts-active', studentId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('tbl_contracts')
          .select(`
          *,
            student:tbl_students(
              fld_id,
              fld_first_name,
              fld_last_name,
              fld_email,
              fld_phone,
              fld_mobile,
              fld_address,
              fld_zip,
              fld_city,
              fld_s_first_name,
              fld_s_last_name,
              fld_school,
              fld_level,
              fld_payer,
              fld_bank_name,
              fld_bank_act
            )
        `)
          .eq('fld_sid', studentId)
          .eq('fld_status', 'Active')
          .order('fld_id', { ascending: false });

      if (error) throw error;
        return data as StudentContract[];
      },
      staleTime: 1000 * 60 * 5, // 5 minutes - prevent refetching too often
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    });
  };

  // Get pending contracts for a student
  const getPendingContracts = (studentId: number) => {
    return useQuery({
      queryKey: ['student-contracts-pending', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
          .from('tbl_contracts')
          .select(`
          *,
            student:tbl_students(
              fld_id,
              fld_first_name,
              fld_last_name,
              fld_email,
              fld_phone,
              fld_mobile,
              fld_address,
              fld_zip,
              fld_city,
              fld_s_first_name,
              fld_s_last_name,
              fld_school,
              fld_level,
              fld_payer,
              fld_bank_name,
              fld_bank_act
            )
        `)
          .eq('fld_sid', studentId)
          .eq('fld_status', 'Pending Signature')
          .order('fld_id', { ascending: false });

      if (error) throw error;
        return data as StudentContract[];
      },
      staleTime: 1000 * 60 * 5, // 5 minutes - prevent refetching too often
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    });
  };

  // Get contract by ID for signing
  const getContractForSigning = (contractId: number) => {
    return useQuery({
      queryKey: ['contract-signing', contractId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('tbl_contracts')
          .select(`
            *,
            student:tbl_students(
              fld_id,
              fld_first_name,
              fld_last_name,
              fld_email,
              fld_phone,
              fld_mobile,
              fld_address,
              fld_zip,
              fld_city,
              fld_s_first_name,
              fld_s_last_name,
              fld_school,
              fld_level,
              fld_payer,
              fld_bank_name,
              fld_bank_act
            )
          `)
          .eq('fld_id', contractId)
          .neq('fld_status', 'Deleted')
          .single();

        if (error) throw error;
        return data as StudentContract;
      },
      enabled: !!contractId,
    });
  };

  // Create new contract
  const createContractMutation = useMutation({
    mutationFn: async (contractData: CreateContractData) => {
      const { data, error } = await supabase
        .from('tbl_contracts')
        .insert({
          fld_sid: contractData.fld_sid,
          fld_ct: contractData.fld_ct,
          fld_start_date: contractData.fld_start_date,
          fld_end_date: contractData.fld_end_date,
          fld_p_mode: contractData.fld_p_mode,
          fld_lp: contractData.fld_lp,
          fld_lesson_dur: contractData.fld_lesson_dur,
          fld_min_lesson: contractData.fld_min_lesson,
          fld_reg_fee: contractData.fld_reg_fee,
          fld_s_per_lesson_rate: contractData.fld_s_per_lesson_rate, // Set to 0 if bypassed
          fld_file: '',
          fld_bps: contractData.fld_bps || null,
          fld_ename: user?.fld_id || 1, // Use authenticated user's ID
          fld_edate: new Date().toISOString().split('T')[0],
          fld_status: contractData.fld_bps === 'Yes' ? 'Active' : 'Pending Signature'
        })
        .select()
        .single();

      if (error) throw error;

      // Following legacy business logic: Send email only if fld_bps is 'no' or empty (not bypassed)
      if (!contractData.fld_bps || contractData.fld_bps === '' || contractData.fld_bps === 'no') {
        try {
          await supabase.functions.invoke('send-contract-email', {
            body: {
              contract_id: data.fld_id,
              contract_type: 'student',
              base_url: window.location.origin,
              admin_user_id: user?.fld_id?.toString()
            }
          });
        } catch (emailError) {
          console.error('Failed to send contract email:', emailError);
          // Don't throw error - contract creation succeeded, email is secondary
        }
      }

      // Update student NEC status to 'N' (following legacy logic)
      try {
      await supabase
          .from('tbl_students')
          .update({ fld_nec: 'N' })
          .eq('fld_id', contractData.fld_sid);
      } catch (updateError) {
        console.error('Failed to update student NEC status:', updateError);
        // Don't throw error - contract creation succeeded
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['student-contracts-active'] });
      queryClient.invalidateQueries({ queryKey: ['student-contracts-pending'] });
      toast.success('Contract created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create contract');
      console.error('Error creating contract:', error);
    }
  });

  // Send contract email
  const sendContractEmailMutation = useMutation({
    mutationFn: async (contractId: number) => {
      const { error } = await supabase.functions.invoke('send-contract-email', {
        body: {
          contract_id: contractId,
          contract_type: 'student',
          base_url: window.location.origin,
          admin_user_id: user?.fld_id?.toString()
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Contract email sent successfully');
    },
    onError: (error) => {
      toast.error('Failed to send contract email');
      console.error('Error sending contract email:', error);
    }
  });

  // Upload signature to Supabase Storage
  const uploadSignature = async (signatureData: string, contractId: number): Promise<string> => {
    try {
      // Convert base64 to blob
      const response = await fetch(signatureData);
      const blob = await response.blob();
      
      // Generate unique filename
      const filename = `signature_${contractId}_${Date.now()}.png`;
      const filePath = `students/${filename}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('contract-signatures')
        .upload(filePath, blob, {
          contentType: 'image/png',
          upsert: false
        });

      if (error) throw error;
      
      // Return the complete public URL
      const { data: urlData } = supabase.storage
        .from('contract-signatures')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading signature:', error);
      throw error;
    }
  };

  // Sign contract
  const signContractMutation = useMutation({
    mutationFn: async ({ 
      contractId, 
      signatureData, 
      bankDetails 
    }: { 
      contractId: number; 
      signatureData: string; 
      bankDetails?: { 
        fld_bi: string; 
        fld_iban: string; 
        fld_bic?: string; 
      } 
    }) => {
      // Upload signature and get the complete URL
      const signatureUrl = await uploadSignature(signatureData, contractId);

      // Update contract with signature and bank details
      const updateData: any = {
        fld_signature: signatureUrl,
        fld_status: 'Active',
        fld_edtim: new Date().toISOString()
      };

      if (bankDetails) {
        updateData.fld_bi = bankDetails.fld_bi;
        updateData.fld_iban = bankDetails.fld_iban;
        if (bankDetails.fld_bic) {
          updateData.fld_bic = bankDetails.fld_bic;
        }
      }

      const { error: contractError } = await supabase
        .from('tbl_contracts')
        .update(updateData)
        .eq('fld_id', contractId);

      if (contractError) throw contractError;

      // Update student status and bank info if provided
      const { data: contract } = await supabase
        .from('tbl_contracts')
        .select('fld_sid')
        .eq('fld_id', contractId)
        .single();

      if (contract) {
        const studentUpdateData: any = {
          fld_status: 'Contracted Customers',
          fld_rf_flag: 'N'
        };

        // Also save bank info to student record if provided
        if (bankDetails && bankDetails.fld_bi && bankDetails.fld_iban) {
          studentUpdateData.fld_bank_name = bankDetails.fld_bi;
          studentUpdateData.fld_bank_act = bankDetails.fld_iban;
        }

        const { error: studentError } = await supabase
          .from('tbl_students')
          .update(studentUpdateData)
          .eq('fld_id', contract.fld_sid);

        if (studentError) throw studentError;
      }

      // Send confirmation emails
      await supabase.functions.invoke('send-contract-email', {
        body: {
          contract_id: contractId,
          contract_type: 'student',
          action: 'confirmation',
          base_url: window.location.origin,
          admin_user_id: user?.fld_id?.toString()
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract-signing'] });
      toast.success('Contract signed successfully');
    },
    onError: (error) => {
      toast.error('Failed to sign contract');
      console.error('Error signing contract:', error);
    }
  });


  // Generate secure contract link
  const generateContractLink = (contractId: number): string => {
    const encodedId = btoa(contractId.toString());
    return `${window.location.origin}/student-contract-signing/${encodedId}`;
  };

  // Decode contract link
  const decodeContractLink = (encodedId: string): number => {
    const decodedId = parseInt(atob(encodedId));
    if (isNaN(decodedId)) {
      throw new Error('Invalid contract link');
    }
    return decodedId;
  };

  // Get contracts for a student (compatible with existing code)
  const getStudentContractsData = (studentId: number) => {
    return useQuery({
      queryKey: ['student-contracts', studentId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('tbl_contracts')
          .select(`
          *,
            student:tbl_students(
              fld_id,
              fld_first_name,
              fld_last_name,
              fld_email,
              fld_phone,
              fld_mobile,
              fld_address,
              fld_zip,
              fld_city,
              fld_s_first_name,
              fld_s_last_name,
              fld_school,
              fld_level,
              fld_payer,
              fld_bank_name,
              fld_bank_act
            )
        `)
          .eq('fld_sid', studentId)
          .neq('fld_status', 'Deleted')
          .order('fld_id', { ascending: false });

        if (error) throw error;
        return data as StudentContract[];
      },
    });
  };

  // State for loading and mutations
  const [isCancellingContract, setIsCancellingContract] = useState(false);
  const [isCancellingEngagement, setIsCancellingEngagement] = useState(false);
  const [isUpdatingMinimumLessons, setIsUpdatingMinimumLessons] = useState(false);

  const fetchContractEngagements = async (contractId: number): Promise<ContractEngagement[]> => {
    const { data, error } = await supabase
      .from('tbl_contracts_engagement')
      .select(`
        *,
        tbl_teachers(fld_first_name, fld_last_name)
      `)
      .eq('fld_cid', contractId);

    if (error) throw error;

    // Get lesson counts and subject data for each engagement
    const engagementsWithData = await Promise.all(
      data.map(async (engagement: any) => {
        // Fetch student subject with subject name
        const { data: studentSubjectData, error: subjectError } = await supabase
          .from('tbl_students_subjects')
          .select(`
            fld_id,
            fld_sid,
            fld_suid,
            tbl_subjects!fld_suid(fld_id, fld_subject)
          `)
          .eq('fld_id', engagement.fld_ssid)
          .single();

        if (subjectError) {
          console.error('Error fetching student subject:', subjectError);
          return { ...engagement, lesson_count: 0 };
        }

        // Get lesson count
        const { data: lessonData, error: lessonError } = await supabase
          .from('tbl_teachers_lessons_history')
          .select('fld_lesson')
          .eq('fld_sid', studentSubjectData?.fld_sid)
          .eq('fld_ssid', studentSubjectData?.fld_id);

        if (lessonError) {
          console.error('Error fetching lesson count:', lessonError);
          return { 
            ...engagement, 
            lesson_count: 0,
            tbl_students_subjects: studentSubjectData 
          };
        }

        const lessonCount = lessonData?.reduce((sum: number, lesson: any) => sum + (lesson.fld_lesson || 0), 0) || 0;
        return { 
          ...engagement, 
          lesson_count: lessonCount,
          tbl_students_subjects: studentSubjectData 
        };
      })
    );

    return engagementsWithData as ContractEngagement[];
  };

  const cancelContract = async (contractId: number) => {
    setIsCancellingContract(true);
    try {
      // Get all engagements for this contract
      const { data: engagements, error: engagementsError } = await supabase
        .from('tbl_contracts_engagement')
        .select('fld_ssid')
        .eq('fld_cid', contractId);

      if (engagementsError) throw engagementsError;

      // Update student subjects to remove contract references (following legacy logic)
      if (engagements && engagements.length > 0) {
        const engagementIds = engagements.map(e => e.fld_ssid);
        const { error: subjectsError } = await supabase
          .from('tbl_students_subjects')
          .update({ fld_cid: 0, fld_c_eid: 0 })
          .in('fld_id', engagementIds);

        if (subjectsError) throw subjectsError;
      }

      // Update contract status to 'Deleted'
      const { error: contractError } = await supabase
        .from('tbl_contracts')
        .update({ fld_status: 'Deleted' })
        .eq('fld_id', contractId);

      if (contractError) throw contractError;

      // Update engagements status to 'Inactive'
      const { error: engagementStatusError } = await supabase
        .from('tbl_contracts_engagement')
        .update({ fld_status: 'Inactive' })
        .eq('fld_cid', contractId);

      if (engagementStatusError) throw engagementStatusError;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['student-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['student-contracts-active'] });
      queryClient.invalidateQueries({ queryKey: ['student-contracts-pending'] });
      toast.success('Contract cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel contract');
      console.error('Error cancelling contract:', error);
    } finally {
      setIsCancellingContract(false);
    }
  };

  const cancelEngagement = async ({ engagementId, studentId }: { engagementId: number; studentId: number }) => {
    setIsCancellingEngagement(true);
    try {
      // Get engagement details first
      const { data: engagement, error: engagementError } = await supabase
        .from('tbl_contracts_engagement')
        .select('fld_ssid')
        .eq('fld_id', engagementId)
        .single();

      if (engagementError) throw engagementError;

      // Update mediation stages to remove teacher (following legacy logic)
      const { error: mediationError } = await supabase
        .from('tbl_students_mediation_stages')
        .update({ fld_tid: 0 })
        .eq('fld_ssid', engagement.fld_ssid)
        .eq('fld_m_flag', 'X');

      if (mediationError) throw mediationError;

      // Update student subjects to remove contract references
      const { error: subjectsError } = await supabase
        .from('tbl_students_subjects')
        .update({ fld_cid: 0, fld_c_eid: 0 })
        .eq('fld_id', engagement.fld_ssid);

      if (subjectsError) throw subjectsError;

      // Delete the engagement
      const { error: deleteError } = await supabase
        .from('tbl_contracts_engagement')
        .delete()
        .eq('fld_id', engagementId);

      if (deleteError) throw deleteError;

      // Update student NEC flag to 'N' (following legacy logic)
      const { error: studentError } = await supabase
        .from('tbl_students')
        .update({ fld_nec: 'N' })
        .eq('fld_id', studentId);

      if (studentError) throw studentError;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['student-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['student-contracts-active'] });
      queryClient.invalidateQueries({ queryKey: ['student-contracts-pending'] });
      toast.success('Engagement cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel engagement');
      console.error('Error cancelling engagement:', error);
    } finally {
      setIsCancellingEngagement(false);
    }
  };

  const updateMinimumLessons = async ({ contractId, minimumLessons }: { contractId: number; minimumLessons: number }) => {
    setIsUpdatingMinimumLessons(true);
    try {
      const { error } = await supabase
        .from('tbl_contracts')
        .update({ fld_min_lesson: minimumLessons })
        .eq('fld_id', contractId);

      if (error) throw error;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['student-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['student-contracts-active'] });
      queryClient.invalidateQueries({ queryKey: ['student-contracts-pending'] });
      toast.success('Minimum lessons updated successfully');
    } catch (error) {
      toast.error('Failed to update minimum lessons');
      console.error('Error updating minimum lessons:', error);
    } finally {
      setIsUpdatingMinimumLessons(false);
    }
  };

  // Create engagement mutation
  const createEngagementMutation = useMutation({
    mutationFn: async ({ contractId, studentSubjectId, teacherId, teacherRate }: { contractId: number; studentSubjectId: number; teacherId: number; teacherRate: number }) => {
      // Insert engagement
      const { data: engagement, error: engagementError } = await supabase
        .from('tbl_contracts_engagement')
        .insert({
          fld_cid: contractId,
          fld_ssid: studentSubjectId,
          fld_tid: teacherId,
          fld_t_per_lesson_rate: teacherRate,
          fld_ename: user?.fld_id || 1,
          fld_edate: new Date().toISOString().split('T')[0],
          fld_status: 'Active'
        })
        .select()
        .single();

      if (engagementError) throw engagementError;

      // Update student subject to link it to contract and engagement
      const { error: subjectError } = await supabase
        .from('tbl_students_subjects')
        .update({
          fld_cid: contractId,
          fld_c_eid: engagement.fld_id
        })
        .eq('fld_id', studentSubjectId);

      if (subjectError) throw subjectError;

      // Update mediation stages to set fld_m_flag='X' (following legacy logic)
      const { error: mediationError } = await supabase
        .from('tbl_students_mediation_stages')
        .update({ fld_m_flag: 'X' })
        .eq('fld_ssid', studentSubjectId);

      if (mediationError) throw mediationError;

      return engagement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['student-contracts-active'] });
      queryClient.invalidateQueries({ queryKey: ['student-contracts-pending'] });
      toast.success('Engagement created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create engagement: ' + error.message);
      console.error('Error creating engagement:', error);
    }
  });

  return {
    getStudentContracts,
    getActiveContracts,
    getPendingContracts,
    getContractForSigning,
    createContractMutation,
    sendContractEmailMutation,
    signContractMutation,
    createEngagementMutation,
    generateContractLink,
    decodeContractLink,
    fetchContractEngagements,
    cancelContract,
    cancelEngagement,
    updateMinimumLessons,
    isCancellingContract,
    isCancellingEngagement,
    isUpdatingMinimumLessons
  };
}

export type { ContractEngagement };