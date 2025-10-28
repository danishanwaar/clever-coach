import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import type { Database } from '@/integrations/supabase/types';

// Types
export interface TeacherContractData {
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
  fld_status: string;
  fld_uid: number;
  subjects: string[];
}

export interface ContractSignatureData {
  signatureData: string;
  fullName: string;
  date: string;
}

// Hook for teacher contract functionality
export function useTeacherContract() {
  const queryClient = useQueryClient();
  // Get teacher contract data by ID
  const getTeacherContractData = useMutation({
    mutationFn: async (teacherId: number) => {
      // Get teacher details
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select(`
          fld_id,
          fld_first_name,
          fld_last_name,
          fld_dob,
          fld_phone,
          fld_email,
          fld_street,
          fld_zip,
          fld_city,
          fld_per_l_rate,
          fld_status,
          fld_uid
        `)
        .eq('fld_id', teacherId)
        .single();

      console.log("teacher", teacher);

      if (teacherError) throw teacherError;

      // Get teacher's subjects
      const { data: subjects, error: subjectsError } = await supabase
        .from('tbl_teachers_subjects_expertise')
        .select(`
          tbl_subjects!inner(fld_subject)
        `)
        .eq('fld_tid', teacherId);

      console.log("subjects", subjects);

      if (subjectsError) throw subjectsError;

      return {
        ...teacher,
        fld_per_l_rate: parseFloat(teacher.fld_per_l_rate),
        subjects: subjects.map(s => s.tbl_subjects.fld_subject),
      } as TeacherContractData;
    },
  });

  // Upload signature to Supabase Storage
  const uploadSignature = async (signatureData: string, teacherId: number): Promise<string> => {
    try {
      // Convert base64 to blob with error handling
      const response = await fetch(signatureData);
      if (!response.ok) {
        throw new Error('Failed to process signature data');
      }
      
      const blob = await response.blob();
      
      // Check blob size to prevent memory issues
      if (blob.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Signature file too large');
      }
      
      // Generate unique filename
      const filename = `signature_${teacherId}_${Date.now()}.png`;
      const filePath = `signatures/${filename}`;

      // Upload to Supabase Storage with timeout
      const uploadPromise = supabase.storage
        .from('contract-signatures')
        .upload(filePath, blob, {
          contentType: 'image/png',
          upsert: false
        });

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout')), 30000)
      );

      const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any;

      if (error) throw error;

      return filename;
    } catch (error) {
      console.error('Signature upload error:', error);
      throw new Error('Failed to upload signature: ' + (error as Error).message);
    }
  };

  // Sign contract and update teacher status
  const signContractMutation = useMutation({
    mutationFn: async ({ teacherId, signatureData }: { teacherId: number; signatureData: string }) => {
      try {
        // Upload signature to Supabase Storage
        const signatureFilename = await uploadSignature(signatureData, teacherId);

      // Get teacher details for user ID
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select('fld_uid')
        .eq('fld_id', teacherId)
        .single();

      if (teacherError) throw teacherError;

      // Generate random passcode
      const passcode = Math.random().toString(36).substring(2, 8).toUpperCase() + 
                      Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

      // Update teacher status and signature
      const { error: updateTeacherError } = await supabase
        .from('tbl_teachers')
        .update({
          fld_status: 'Hired' as Database["public"]["Enums"]["teacher_status"],
          fld_onboard_date: new Date().toISOString(),
          fld_onboard_uid: teacher.fld_uid,
          fld_signature: signatureFilename,
        })
        .eq('fld_id', teacherId);

      if (updateTeacherError) throw updateTeacherError;

      // Update user passcode
      const { error: updateUserError } = await supabase
        .from('tbl_users')
        .update({
          fld_passcode: passcode, // Store as plain text for now, should be hashed in production
        })
        .eq('fld_id', teacher.fld_uid);

      if (updateUserError) throw updateUserError;

      return { signatureFilename, passcode };
      } catch (error) {
        console.error('Contract signing error:', error);
        throw new Error('Failed to sign contract: ' + (error as Error).message);
      }
    },
    onSuccess: async (data, variables) => {
      // Send welcome email to teacher
      await sendWelcomeEmail(variables.teacherId, data.passcode);
      
      toast.success('Contract signed successfully! Welcome email sent.');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
    onError: (error) => {
      toast.error('Failed to sign contract');
      console.error('Contract signing error:', error);
    },
  });

  // Send welcome email to teacher after contract signing
  const sendWelcomeEmail = async (teacherId: number, passcode: string) => {
    try {
      // Get teacher details for email
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select(`
          fld_first_name,
          fld_last_name,
          fld_email,
          fld_city,
          fld_phone
        `)
        .eq('fld_id', teacherId)
        .single();

      if (teacherError) throw teacherError;

      // Get teacher's subjects separately
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('tbl_teachers_subjects_expertise')
        .select(`
          tbl_subjects(fld_subject)
        `)
        .eq('fld_tid', teacherId);

      if (subjectsError) throw subjectsError;

      const teacherName = `${teacher.fld_first_name} ${teacher.fld_last_name}`;
      const subjects = subjectsData
        ?.map((ts: any) => ts.tbl_subjects.fld_subject)
        .join(', ') || '';

      // Send welcome email to teacher
      const { error: teacherEmailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: teacher.fld_email,
          subject: 'Willkommen in unserem Team',
          template: 'teacher-welcome',
          data: {
            teacherName,
            email: teacher.fld_email,
            passcode,
            portalUrl: 'https://clevercoach-nachhilfe.de'
          }
        }
      });

      if (teacherEmailError) throw teacherEmailError;

      // Send notification email to admin
      const { error: adminEmailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'admin@clevercoach.com', // TODO: Get from environment or settings
          subject: `Honorarvereinbarung unterzeichnet von ${teacherName}`,
          template: 'admin-contract-notification',
          data: {
            teacherName,
            subjects,
            city: teacher.fld_city,
            phone: teacher.fld_phone,
          }
        }
      });

      if (adminEmailError) throw adminEmailError;

    } catch (error) {
      console.error('Email sending error:', error);
      // Don't throw error here to avoid breaking the contract signing process
    }
  };

  // Generate secure contract link
  const generateContractLink = (teacherId: number): string => {
    // In production, you would use a more secure method like JWT tokens
    const encodedId = btoa(teacherId.toString());
    return `${window.location.origin}/teacher-contract-signing/${encodedId}`;
  };

  // Verify contract access
  const verifyContractAccess = useMutation({
    mutationFn: async (encodedId: string) => {
      const teacherId = parseInt(atob(encodedId));
      
      const { data: teacher, error } = await supabase
        .from('tbl_teachers')
        .select('fld_id, fld_status')
        .eq('fld_id', teacherId)
        .single();

      if (error) throw error;

      // Check if teacher is in pending signature status
      if (teacher.fld_status !== 'Pending For Signature') {
        throw new Error('Contract not available for signing');
      }

      return teacherId;
    },
  });

  return {
    // Mutations
    getTeacherContractData,
    signContractMutation,
    verifyContractAccess,
    
    // Helper functions
    generateContractLink,
  };
}
