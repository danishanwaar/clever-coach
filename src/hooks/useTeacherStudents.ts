import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ==================== Teacher Students ====================

export interface TeacherStudent {
  fld_id: number;
  fld_first_name: string;
  fld_last_name: string;
  fld_email: string;
  fld_mobile: string;
  fld_zip: string;
  fld_city: string;
  fld_level: string;
  subjects: Array<{
    fld_id: number;
    fld_subject: string;
  }>;
}

export const useTeacherStudents = (teacherId: number | undefined) => {
  return useQuery<TeacherStudent[]>({
    queryKey: ['teacherStudents', teacherId],
    queryFn: async () => {
      if (!teacherId) throw new Error('Teacher ID required');

      // Get students from mediation stages where FLD_M_FLAG='X'
      const { data: mediationStages, error: mediationError } = await supabase
        .from('tbl_students_mediation_stages')
        .select('fld_sid, fld_ssid')
        .eq('fld_tid', teacherId)
        .eq('fld_m_flag', 'X');

      if (mediationError) throw mediationError;

      const studentIds = [...new Set(mediationStages?.map(s => s.fld_sid) || [])];
      
      if (studentIds.length === 0) return [];

      // Get student details
      const { data: students, error: studentsError } = await supabase
        .from('tbl_students')
        .select(`
          fld_id,
          fld_first_name,
          fld_last_name,
          fld_email,
          fld_mobile,
          fld_zip,
          fld_city,
          fld_level
        `)
        .in('fld_id', studentIds)
        .order('fld_id', { ascending: false });

      if (studentsError) throw studentsError;

      // Get subjects for each student from mediation stages
      const studentsWithSubjects = await Promise.all(
        (students || []).map(async (student) => {
          const studentSubjectIds = mediationStages
            ?.filter(s => s.fld_sid === student.fld_id)
            .map(s => s.fld_ssid) || [];

          const { data: subjects } = await supabase
            .from('tbl_students_subjects')
            .select(`
              fld_id,
              tbl_subjects!inner(fld_subject)
            `)
            .in('fld_id', studentSubjectIds);

          return {
            ...student,
            fld_level: student.fld_level || '',
            subjects: (subjects || []).map(s => ({
              fld_id: s.fld_id,
              fld_subject: s.tbl_subjects?.fld_subject || 'Unknown'
            }))
          };
        })
      );

      return studentsWithSubjects;
    },
    enabled: !!teacherId
  });
};

