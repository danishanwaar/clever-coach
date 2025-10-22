import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types
export interface ContractDownloadData {
  contract: {
    fld_id: number;
    fld_sid: number;
    fld_start_date: string;
    fld_end_date: string;
    fld_lesson_dur: string;
    fld_s_per_lesson_rate: number;
    fld_reg_fee: number;
    fld_p_mode: string;
    fld_bi: string;
    fld_iban: string;
    fld_signature: string;
    fld_edtim: string;
    fld_status: string;
  };
  student: {
    fld_id: number;
    fld_first_name: string;
    fld_last_name: string;
    fld_s_first_name: string;
    fld_s_last_name: string;
    fld_address: string;
    fld_zip: string;
    fld_city: string;
    fld_phone: string;
    fld_mobile: string;
    fld_email: string;
    fld_school: string;
    fld_level: string | number;
    fld_ct: string | number;
    fld_wh: string | number;
    fld_payer: string;
  };
  level: {
    fld_id: number;
    fld_level: string;
  } | null;
  contractNumber: string;
}

// Hook for fetching contract download data
export function useStudentContractDownload(studentId: number) {
  // Fetch contract and student data
  const { data, isLoading, error } = useQuery({
    queryKey: ['student-contract-download', studentId],
    queryFn: async (): Promise<ContractDownloadData> => {
      // Fetch active contract
      const { data: contract, error: contractError } = await supabase
        .from('tbl_contracts')
        .select('*')
        .eq('fld_sid', studentId)
        .eq('fld_status', 'Active')
        .single();

      if (contractError) throw contractError;

      // Fetch student data
      const { data: student, error: studentError } = await supabase
        .from('tbl_students')
        .select('*')
        .eq('fld_id', studentId)
        .single();

      if (studentError) throw studentError;

      // Fetch level data if available
      let level = null;
      if (student.fld_level) {
        const { data: levelData } = await supabase
          .from('tbl_levels')
          .select('*')
          .eq('fld_id', parseInt(student.fld_level.toString()))
          .single();
        level = levelData;
      }

      // Generate contract number
      const currentYear = new Date().getFullYear();
      const contractNumber = `MAN-${student.fld_id}-${currentYear}-${contract.fld_id}`;

      return {
        contract,
        student,
        level,
        contractNumber,
      };
    },
  });

  return {
    data,
    isLoading,
    error,
  };
}
