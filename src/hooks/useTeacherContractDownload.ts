import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TeacherContractDownloadData {
  teacher: {
    fld_id: number;
    fld_first_name: string;
    fld_last_name: string;
    fld_dob: string;
    fld_phone: string;
    fld_email: string;
    fld_street: string;
    fld_zip: string;
    fld_city: string;
    fld_per_l_rate: number;
    fld_signature: string;
    fld_onboard_date: string;
  };
  subjects: string[];
  signatureUrl: string | null;
}

export function useTeacherContractDownload(teacherId: number | undefined) {
  return useQuery({
    queryKey: ['teacher-contract-download', teacherId],
    queryFn: async (): Promise<TeacherContractDownloadData> => {
      if (!teacherId) throw new Error('Teacher ID required');

      // Fetch teacher data
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select('fld_id, fld_first_name, fld_last_name, fld_dob, fld_phone, fld_email, fld_street, fld_zip, fld_city, fld_per_l_rate, fld_signature, fld_onboard_date')
        .eq('fld_id', teacherId)
        .single();

      if (teacherError) throw teacherError;

      // Fetch teacher subjects
      const { data: subjectData, error: subjectError } = await supabase
        .from('tbl_teachers_subjects_expertise')
        .select('tbl_subjects!inner(fld_subject)')
        .eq('fld_tid', teacherId);

      if (subjectError) throw subjectError;

      const subjects = (subjectData || []).map((item: any) => item.tbl_subjects?.fld_subject || '').filter(Boolean);

      // Get signature URL from Supabase Storage if signature exists
      let signatureUrl: string | null = null;
      if (teacher.fld_signature) {
        // Check if it's already a full URL
        if (teacher.fld_signature.startsWith('http')) {
          signatureUrl = teacher.fld_signature;
        } else {
          // Get public URL from Supabase Storage
          // Try contract-signatures bucket first
          const signaturePath = teacher.fld_signature.startsWith('signatures/') 
            ? teacher.fld_signature 
            : `signatures/${teacher.fld_signature}`;
          
          const { data: urlData } = supabase.storage
            .from('contract-signatures')
            .getPublicUrl(signaturePath);
          
          signatureUrl = urlData.publicUrl;
        }
      }

      return {
        teacher,
        subjects,
        signatureUrl,
      };
    },
    enabled: !!teacherId,
  });
}
