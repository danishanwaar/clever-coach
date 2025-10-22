import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
    fld_address: string | null;
    fld_zip: string | null;
    fld_city: string | null;
    fld_s_first_name: string | null;
    fld_s_last_name: string | null;
    fld_school: string | null;
    fld_level: string | null;
    fld_payer: string | null;
  };
}

export function useStudentContracts() {
  const queryClient = useQueryClient();

  // Get all contracts for a student
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
              fld_address,
              fld_zip,
              fld_city,
              fld_s_first_name,
              fld_s_last_name,
              fld_school,
              fld_level,
              fld_payer
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
              fld_address,
              fld_zip,
              fld_city,
              fld_s_first_name,
              fld_s_last_name,
              fld_school,
              fld_level,
              fld_payer
            )
          `)
          .eq('fld_id', contractId)
          .neq('fld_status', 'Deleted')
          .single();

        if (error) throw error;
        return data as StudentContract;
      },
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
          fld_s_per_lesson_rate: contractData.fld_s_per_lesson_rate,
          fld_file: '',
          fld_bps: contractData.fld_bps || null,
          fld_ename: 1, // TODO: Get from auth context
          fld_edate: new Date().toISOString().split('T')[0],
          fld_status: contractData.fld_bps === 'Yes' ? 'Active' : 'Pending Signature'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student-contracts'] });
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
          contract_type: 'student'
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
      return filePath;
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
      // Upload signature
      const signaturePath = await uploadSignature(signatureData, contractId);

      // Update contract with signature and bank details
      const updateData: any = {
        fld_signature: signaturePath,
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

      // Update student status
      const { data: contract } = await supabase
        .from('tbl_contracts')
        .select('fld_sid')
        .eq('fld_id', contractId)
        .single();

      if (contract) {
        const { error: studentError } = await supabase
          .from('tbl_students')
          .update({
            fld_status: 'Contracted Customers',
            fld_rf_flag: 'N'
          })
          .eq('fld_id', contract.fld_sid);

        if (studentError) throw studentError;
      }

      // Send confirmation emails
      await supabase.functions.invoke('send-contract-email', {
        body: {
          contract_id: contractId,
          contract_type: 'student',
          action: 'confirmation'
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

  // Get signature URL from Supabase Storage
  const getSignatureUrl = (signaturePath: string): string => {
    const { data } = supabase.storage
      .from('contract-signatures')
      .getPublicUrl(signaturePath);
    
    return data.publicUrl;
  };

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
              fld_address,
              fld_zip,
              fld_city,
              fld_s_first_name,
              fld_s_last_name,
              fld_school,
              fld_level,
              fld_payer
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

  // Mock functions for compatibility with existing code
  const activeContracts: StudentContract[] = [];
  const pendingContracts: StudentContract[] = [];
  const isLoading = false;
  const isCancellingContract = false;
  const isCancellingEngagement = false;
  const isUpdatingMinimumLessons = false;

  const fetchContractEngagements = async (contractId: number): Promise<ContractEngagement[]> => {
    const { data, error } = await supabase
      .from('tbl_contracts_engagement')
      .select(`
        *,
        tbl_teachers(fld_first_name, fld_last_name),
        tbl_students_subjects(
          tbl_subjects(fld_subject)
        )
      `)
      .eq('fld_cid', contractId);

    if (error) throw error;
    return data as ContractEngagement[];
  };

  const cancelContract = async (contractId: number) => {
    const { error } = await supabase
      .from('tbl_contracts')
      .update({ fld_status: 'Deleted' })
      .eq('fld_id', contractId);

    if (error) throw error;
  };

  const cancelEngagement = async ({ engagementId, studentId }: { engagementId: number; studentId: number }) => {
    const { error } = await supabase
      .from('tbl_contracts_engagement')
      .delete()
      .eq('fld_id', engagementId);

    if (error) throw error;
  };

  const updateMinimumLessons = async ({ contractId, minimumLessons }: { contractId: number; minimumLessons: number }) => {
    const { error } = await supabase
      .from('tbl_contracts')
      .update({ fld_min_lesson: minimumLessons })
      .eq('fld_id', contractId);

    if (error) throw error;
  };

  return {
    getStudentContracts,
    getContractForSigning,
    createContractMutation,
    sendContractEmailMutation,
    signContractMutation,
    getSignatureUrl,
    generateContractLink,
    decodeContractLink,
    // Compatibility properties
    activeContracts,
    pendingContracts,
    isLoading,
    isCancellingContract,
    isCancellingEngagement,
    isUpdatingMinimumLessons,
    fetchContractEngagements,
    cancelContract,
    cancelEngagement,
    updateMinimumLessons
  };
}

export type { ContractEngagement };