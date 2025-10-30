import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Export hooks from separate files
export { 
  useTeacherFinancials, 
  useTeacherFinancialsStats,
  type TeacherInvoice,
  type TeacherFinancialsStats 
} from './useTeacherFinancials';

export {
  useTeacherProgressNotes,
  useTeacherProgressNoteStudents,
  useTeacherProgressNoteMutations,
  type TeacherProgressNote,
  type TeacherProgressNoteStudent
} from './useTeacherProgressNotes';

export {
  useTeacherTimeLogs,
  useTeacherTimeLogStudents,
  useTeacherTimeLogStudentSubjects,
  useTeacherTimeLogMutations,
  type TeacherTimeLog,
  type TeacherTimeLogStudent,
  type TeacherTimeLogStudentSubject
} from './useTeacherTimeLogs';

export {
  useTeacherStudents,
  type TeacherStudent
} from './useTeacherStudents';

export {
  useTeacherSettings,
  useTeacherSettingsMutations,
  type TeacherSettingsData
} from './useTeacherSettings';

// ==================== Teacher Profile ====================

export interface Teacher {
  fld_id: number;
  fld_first_name: string;
  fld_last_name: string;
  fld_email: string;
  fld_phone: string;
  fld_street: string;
  fld_zip: string;
  fld_city: string;
  fld_country: string;
  fld_dob: string;
  fld_gender: string;
  fld_status: string;
  fld_per_l_rate: number;
  fld_onboard_date: string;
  fld_self: string;
  fld_pimage: string;
  fld_uid: number;
}

export const useTeacher = (userId: number | undefined) => {
  return useQuery({
    queryKey: ['teacher', userId],
    queryFn: async (): Promise<Teacher | null> => {
      if (!userId) throw new Error('User not authenticated');

      const { data: teacherData, error } = await supabase
        .from('tbl_teachers')
        .select(`
          fld_id,
          fld_first_name,
          fld_last_name,
          fld_email,
          fld_phone,
          fld_street,
          fld_zip,
          fld_city,
          fld_country,
          fld_dob,
          fld_gender,
          fld_status,
          fld_per_l_rate,
          fld_onboard_date,
          fld_self,
          fld_pimage,
          fld_uid
        `)
        .eq('fld_uid', userId)
        .single();

      if (error) throw error;
      return {
        ...teacherData,
        fld_per_l_rate: typeof teacherData.fld_per_l_rate === 'string' ? parseFloat(teacherData.fld_per_l_rate) : teacherData.fld_per_l_rate
      } as Teacher;
    },
    enabled: !!userId
  });
};

// ==================== Teacher Subjects ====================

export interface TeacherSubject {
  fld_id: number;
  fld_experience: number;
  fld_level: number;
  fld_sid: number;
  tbl_subjects: {
    fld_subject: string;
  };
  tbl_levels: {
    fld_level: string;
  } | null;
}

export const useTeacherSubjects = (teacherId: number | undefined) => {
  return useQuery<TeacherSubject[]>({
    queryKey: ['teacherSubjects', teacherId],
    queryFn: async () => {
      if (!teacherId) throw new Error('Teacher ID required');

      const { data, error } = await supabase
        .from('tbl_teachers_subjects_expertise')
        .select(`
          fld_id,
          fld_experience,
          fld_level,
          fld_sid,
          tbl_subjects!inner(
            fld_subject
          ),
          tbl_levels(
            fld_level
          )
        `)
        .eq('fld_tid', teacherId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!teacherId
  });
};

// ==================== Teacher Active Engagements (for sidebar) ====================

export interface TeacherActiveEngagement {
  fld_id: number;
  fld_cid: number;
  fld_t_per_lesson_rate: number;
  student_name: string;
  subject: string;
}

export const useTeacherActiveEngagements = (teacherId: number | undefined) => {
  return useQuery<TeacherActiveEngagement[]>({
    queryKey: ['teacherActiveEngagements', teacherId],
    queryFn: async () => {
      if (!teacherId) throw new Error('Teacher ID required');

      const { data: engagements, error: engagementsError } = await supabase
        .from('tbl_contracts_engagement')
        .select(`
          fld_id,
          fld_ssid,
          fld_cid,
          fld_t_per_lesson_rate
        `)
        .eq('fld_tid', teacherId)
        .eq('fld_status', 'Active');

      if (engagementsError) throw engagementsError;

      // Fetch student subject and student data for each engagement
      const engagementsWithData = await Promise.all(
        (engagements || []).map(async (engagement: any) => {
          // Fetch student subject with subject and student data
          const { data: studentSubject, error: subjectError } = await supabase
            .from('tbl_students_subjects')
            .select(`
              fld_id,
              fld_sid,
              fld_suid,
              tbl_subjects!fld_suid(fld_id, fld_subject),
              tbl_students!fld_sid(fld_id, fld_first_name, fld_last_name)
            `)
            .eq('fld_id', engagement.fld_ssid)
            .single();

          if (subjectError) {
            console.error('Error fetching student subject:', subjectError);
            return {
              fld_id: engagement.fld_id,
              fld_cid: engagement.fld_cid,
              fld_t_per_lesson_rate: engagement.fld_t_per_lesson_rate,
              student_name: 'Unknown',
              subject: 'Unknown'
            };
          }

          return {
            fld_id: engagement.fld_id,
            fld_cid: engagement.fld_cid,
            fld_t_per_lesson_rate: engagement.fld_t_per_lesson_rate,
            student_name: `${studentSubject?.tbl_students?.fld_first_name || ''} ${studentSubject?.tbl_students?.fld_last_name || ''}`.trim() || 'Unknown',
            subject: studentSubject?.tbl_subjects?.fld_subject || 'Unknown'
          };
        })
      );

      return engagementsWithData;
    },
    enabled: !!teacherId
  });
};

// ==================== Teacher Documents ====================

export interface TeacherDocument {
  fld_id: number;
  fld_doc_file: string;
  fld_edate: string;
}

export const useTeacherDocuments = (teacherId: number | undefined) => {
  return useQuery<TeacherDocument[]>({
    queryKey: ['teacherDocuments', teacherId],
    queryFn: async () => {
      if (!teacherId) throw new Error('Teacher ID required');

      const { data, error } = await supabase
        .from('tbl_teachers_documents')
        .select('fld_id, fld_doc_file, fld_edate')
        .eq('fld_tid', teacherId)
        .order('fld_edate', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!teacherId
  });
};

export const useUploadTeacherDocuments = (teacherId: number | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      if (!teacherId) throw new Error('Teacher ID required');

      // Get teacher UID for folder structure
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select('fld_uid')
        .eq('fld_id', teacherId)
        .single();

      if (teacherError) throw teacherError;

      const uploadPromises = files.map(async (file) => {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${teacher.fld_uid}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Save document metadata to database
        const { error: dbError } = await supabase
          .from('tbl_teachers_documents')
          .insert({
            fld_tid: teacherId,
            fld_uid: teacher.fld_uid,
            fld_uname: teacher.fld_uid,
            fld_doc_file: fileName,
            fld_edate: new Date().toISOString().split('T')[0]
          });

        if (dbError) throw dbError;
      });

      await Promise.all(uploadPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherDocuments', teacherId] });
      toast.success('Documents uploaded successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to upload documents: ' + error.message);
    }
  });
};

export const useDeleteTeacherDocument = (teacherId: number | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, fileName }: { documentId: number; fileName: string }) => {
      if (!teacherId) throw new Error('Teacher ID required');

      // Get teacher UID for folder structure
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select('fld_uid')
        .eq('fld_id', teacherId)
        .single();

      if (teacherError) throw teacherError;

      const filePath = `${teacher.fld_uid}/${fileName}`;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('tbl_teachers_documents')
        .delete()
        .eq('fld_id', documentId);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherDocuments', teacherId] });
      toast.success('Document deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete document: ' + error.message);
    }
  });
};

export const useGetDocumentUrl = () => {
  return async (teacherId: number, fileName: string): Promise<string> => {
    const { data: teacher } = await supabase
      .from('tbl_teachers')
      .select('fld_uid')
      .eq('fld_id', teacherId)
      .single();

    if (!teacher) return '';

    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(`${teacher.fld_uid}/${fileName}`);

    return data.publicUrl;
  };
};

// ==================== Teacher Contracts ====================

export interface TeacherContract {
  fld_id: number;
  fld_cid: number;
  fld_t_per_lesson_rate: number;
  fld_status: string;
  student_name: string;
  subject: string;
  contract_min_lesson: number;
}

export const useTeacherActiveContracts = (teacherId: number | undefined) => {
  return useQuery<TeacherContract[]>({
    queryKey: ['teacherActiveContracts', teacherId],
    queryFn: async () => {
      if (!teacherId) throw new Error('Teacher ID required');

      const { data: engagements, error: engagementsError } = await supabase
        .from('tbl_contracts_engagement')
        .select(`
          fld_id,
          fld_ssid,
          fld_cid,
          fld_t_per_lesson_rate,
          fld_status
        `)
        .eq('fld_tid', teacherId)
        .eq('fld_status', 'Active');

      if (engagementsError) throw engagementsError;

      // Fetch student subject, student, and contract data for each engagement
      const engagementsWithData = await Promise.all(
        (engagements || []).map(async (engagement: any) => {
          // Fetch student subject with subject and student data
          const { data: studentSubject, error: subjectError } = await supabase
            .from('tbl_students_subjects')
            .select(`
              fld_id,
              fld_sid,
              fld_suid,
              tbl_subjects!fld_suid(fld_id, fld_subject),
              tbl_students!fld_sid(fld_id, fld_first_name, fld_last_name)
            `)
            .eq('fld_id', engagement.fld_ssid)
            .single();

          // Fetch contract data
          const { data: contract, error: contractError } = await supabase
            .from('tbl_contracts')
            .select('fld_id, fld_min_lesson')
            .eq('fld_id', engagement.fld_cid)
            .single();

          if (subjectError || contractError) {
            console.error('Error fetching engagement data:', subjectError || contractError);
            return {
              fld_id: engagement.fld_id,
              fld_cid: engagement.fld_cid,
              fld_t_per_lesson_rate: engagement.fld_t_per_lesson_rate,
              fld_status: engagement.fld_status,
              student_name: 'Unknown',
              subject: 'Unknown',
              contract_min_lesson: contract?.fld_min_lesson || 0
            };
          }

          return {
            fld_id: engagement.fld_id,
            fld_cid: engagement.fld_cid,
            fld_t_per_lesson_rate: engagement.fld_t_per_lesson_rate,
            fld_status: engagement.fld_status,
            student_name: `${studentSubject?.tbl_students?.fld_first_name || ''} ${studentSubject?.tbl_students?.fld_last_name || ''}`.trim() || 'Unknown',
            subject: studentSubject?.tbl_subjects?.fld_subject || 'Unknown',
            contract_min_lesson: contract?.fld_min_lesson || 0
          };
        })
      );

      return engagementsWithData;
    },
    enabled: !!teacherId
  });
};

export const useTeacherInactiveContracts = (teacherId: number | undefined) => {
  return useQuery<TeacherContract[]>({
    queryKey: ['teacherInactiveContracts', teacherId],
    queryFn: async () => {
      if (!teacherId) throw new Error('Teacher ID required');

      const { data: engagements, error: engagementsError } = await supabase
        .from('tbl_contracts_engagement')
        .select(`
          fld_id,
          fld_ssid,
          fld_cid,
          fld_t_per_lesson_rate,
          fld_status
        `)
        .eq('fld_tid', teacherId)
        .eq('fld_status', 'Inactive');

      if (engagementsError) throw engagementsError;

      // Fetch student subject, student, and contract data for each engagement
      const engagementsWithData = await Promise.all(
        (engagements || []).map(async (engagement: any) => {
          // Fetch student subject with subject and student data
          const { data: studentSubject, error: subjectError } = await supabase
            .from('tbl_students_subjects')
            .select(`
              fld_id,
              fld_sid,
              fld_suid,
              tbl_subjects!fld_suid(fld_id, fld_subject),
              tbl_students!fld_sid(fld_id, fld_first_name, fld_last_name)
            `)
            .eq('fld_id', engagement.fld_ssid)
            .single();

          // Fetch contract data
          const { data: contract, error: contractError } = await supabase
            .from('tbl_contracts')
            .select('fld_id, fld_min_lesson')
            .eq('fld_id', engagement.fld_cid)
            .single();

          if (subjectError || contractError) {
            console.error('Error fetching engagement data:', subjectError || contractError);
            return {
              fld_id: engagement.fld_id,
              fld_cid: engagement.fld_cid,
              fld_t_per_lesson_rate: engagement.fld_t_per_lesson_rate,
              fld_status: engagement.fld_status,
              student_name: 'Unknown',
              subject: 'Unknown',
              contract_min_lesson: contract?.fld_min_lesson || 0
            };
          }

          return {
            fld_id: engagement.fld_id,
            fld_cid: engagement.fld_cid,
            fld_t_per_lesson_rate: engagement.fld_t_per_lesson_rate,
            fld_status: engagement.fld_status,
            student_name: `${studentSubject?.tbl_students?.fld_first_name || ''} ${studentSubject?.tbl_students?.fld_last_name || ''}`.trim() || 'Unknown',
            subject: studentSubject?.tbl_subjects?.fld_subject || 'Unknown',
            contract_min_lesson: contract?.fld_min_lesson || 0
          };
        })
      );

      return engagementsWithData;
    },
    enabled: !!teacherId
  });
};

