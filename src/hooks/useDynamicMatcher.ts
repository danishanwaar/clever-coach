import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import type { Database } from '@/integrations/supabase/types';

// Types
export interface Student {
  fld_id: number;
  fld_first_name: string;
  fld_last_name: string;
  fld_level: string;
  fld_latitude: string | null;
  fld_longitude: string | null;
  fld_status: string;
}

export interface Teacher {
  fld_id: number;
  fld_first_name: string;
  fld_last_name: string;
  fld_gender: string;
  fld_dob: string;
  fld_phone: string;
  fld_email: string;
  fld_street: string;
  fld_zip: string;
  fld_city: string;
  fld_latitude: number | null;
  fld_longitude: number | null;
  fld_t_mode: string;
  fld_self: string;
  fld_evaluation: string;
  fld_status: string;
  age?: number;
  distance?: number;
  active_students?: number;
  subjects?: TeacherSubject[];
}

export interface TeacherSubject {
  fld_id: number;
  fld_subject: string;
  fld_level: number;
  fld_level_name: string;
  is_matching: boolean;
  is_mediated: boolean;
  color: string;
}

export interface StudentSubject {
  fld_id: number;
  fld_sid: number;
  fld_suid: number;
  fld_subject: string;
  is_mediated: boolean;
}

export interface MediationStage {
  fld_id: number;
  fld_tid: number;
  fld_sid: number;
  fld_ssid: number;
  fld_m_type: number;
  fld_edate: string;
  fld_etime: string | null;
  fld_m_flag: string | null;
  fld_note: string | null;
  fld_uname: number;
}

export interface MediationType {
  fld_id: number;
  fld_stage_name: string;
  fld_rid: number;
  fld_status: string;
}

export interface MatchFormData {
  fld_sid: number;
  fld_ts: string; // 'Teacher' | 'Inactive' | 'Applicant'
  fld_suid: number[];
  fld_radius: number;
  fld_gender: string;
  fld_ss: string; // 'AND' | 'OR'
  fld_lid: number;
}

// Hook for dynamic matcher functionality
export function useDynamicMatcher() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Get students with mediation status
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students-for-matching'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_students')
        .select(`
          fld_id,
          fld_first_name,
          fld_last_name,
          fld_level,
          fld_latitude,
          fld_longitude,
          fld_status
        `)
        .in('fld_status', ['Mediation Open', 'Partially Mediated'])
        .order('fld_id', { ascending: false });

      if (error) throw error;
      return data as Student[];
    },
  });

  // Get student details with level information
  const getStudentDetails = useMutation({
    mutationFn: async (studentId: number) => {
      const { data: student, error: studentError } = await supabase
        .from('tbl_students')
        .select(`
          fld_id,
          fld_first_name,
          fld_last_name,
          fld_level,
          fld_latitude,
          fld_longitude,
          fld_status
        `)
        .eq('fld_id', studentId)
        .single();

      if (studentError) throw studentError;

      return {
        ...student
      };
    },
  });

  // Get student subjects (following legacy logic)
  const getStudentSubjects = useMutation({
    mutationFn: async (studentId: number) => {
      // First get all active subjects
      const { data: allSubjects, error: subjectsError } = await supabase
        .from('tbl_subjects')
        .select('fld_id, fld_subject')
        .eq('fld_status', 'Active');

      if (subjectsError) throw subjectsError;

      // Then get student's subjects
      const { data: studentSubjects, error: studentSubjectsError } = await supabase
        .from('tbl_students_subjects')
        .select(`
          fld_id,
          fld_sid,
          fld_suid,
          tbl_subjects!inner(fld_id, fld_subject)
        `)
        .eq('fld_sid', studentId);

        if (studentSubjectsError) throw studentSubjectsError;

      // Get mediation stages for this student
      const { data: mediationStages, error: mediationError } = await supabase
        .from('tbl_students_mediation_stages')
        .select('fld_ssid')
        .eq('fld_sid', studentId);

      if (mediationError) throw mediationError;

      // Create a set of mediated subject IDs
      const mediatedSubjectIds = new Set(mediationStages.map(stage => stage.fld_ssid));

      // Filter subjects: only include subjects the student has that are not yet in mediation
      const filteredSubjects = studentSubjects
        .filter(studentSubject => !mediatedSubjectIds.has(studentSubject.fld_id))
        .map(item => ({
          fld_id: item.fld_id,
          fld_sid: item.fld_sid,
          fld_suid: item.fld_suid,
          fld_subject: item.tbl_subjects.fld_subject,
          is_mediated: false,
        })) as StudentSubject[];

      return filteredSubjects;
    },
  });

  // Get subjects for selection
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_subjects')
        .select('fld_id, fld_subject')
        .eq('fld_status', 'Active')
        .order('fld_subject');

      if (error) throw error;
      return data;
    },
  });

  // Get mediation types
  const { data: mediationTypes = [], isLoading: mediationTypesLoading } = useQuery({
    queryKey: ['mediation-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_mediation_types')
        .select('fld_id, fld_stage_name, fld_rid, fld_status')
        .eq('fld_rid', 2)
        .eq('fld_status', 'Active')
        .order('fld_stage_name');

      if (error) throw error;
      return data as MediationType[];
    },
  });

  // Search teachers based on criteria
  const searchTeachersMutation = useMutation({
    mutationFn: async (formData: MatchFormData) => {
      let query = supabase
        .from('tbl_teachers')
        .select(`
          fld_id,
          fld_first_name,
          fld_last_name,
          fld_gender,
          fld_dob,
          fld_phone,
          fld_email,
          fld_street,
          fld_zip,
          fld_city,
          fld_latitude,
          fld_longitude,
          fld_t_mode,
          fld_self,
          fld_evaluation,
          fld_status
        `);

      // Apply filters
      if (formData.fld_gender && formData.fld_gender.trim() !== '') {
        query = query.eq('fld_gender', formData.fld_gender as 'Männlich' | 'Weiblich' | 'Divers');
      }

      // Apply status filter
      if (formData.fld_ts === 'Teacher') {
        query = query.eq('fld_status', 'Hired');
      } else if (formData.fld_ts === 'Inactive') {
        query = query.eq('fld_status', 'Inactive');
      } else if (formData.fld_ts === 'Applicant') {
        query = query.in('fld_status', ['New', 'Screening', 'Interview', 'Offer', 'Pending For Signature']);
      }

      const { data: teachers, error } = await query;
      if (error) throw error;

      // Filter by subject expertise if subjects are selected
      if (formData.fld_suid.length > 0) {
        const { data: teacherSubjects, error: subjectsError } = await supabase
          .from('tbl_teachers_subjects_expertise')
          .select('fld_tid, fld_sid, fld_level')
          .in('fld_sid', formData.fld_suid);

        if (subjectsError) throw subjectsError;

        const teacherIds = teacherSubjects.map(ts => ts.fld_tid);
        const filteredTeachers = teachers.filter(t => teacherIds.includes(t.fld_id));

        // Apply level filter if AND search
        if (formData.fld_ss === 'AND') {
          const levelFilteredTeachers = filteredTeachers.filter(teacher => {
            const teacherSubject = teacherSubjects.find(ts => ts.fld_tid === teacher.fld_id);
            return teacherSubject && teacherSubject.fld_level >= formData.fld_lid;
          });
          return levelFilteredTeachers;
        }

        return filteredTeachers;
      }

      return teachers || [];
    },
    onSuccess: () => {
      toast.success('Teachers found successfully');
    },
    onError: (error) => {
      toast.error('Failed to search teachers');
      console.error('Search error:', error);
    },
  });

  // Get teacher details with subjects and active students
  const getTeacherDetails = useMutation({
    mutationFn: async ({ teacherId, studentId }: { teacherId: number; studentId: number }) => {
      // Get teacher details
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select('*')
        .eq('fld_id', teacherId)
        .single();

      if (teacherError) throw teacherError;

      // Get teacher's subjects
      const { data: teacherSubjects, error: subjectsError } = await supabase
        .from('tbl_teachers_subjects_expertise')
        .select(`
          fld_level,
          tbl_subjects!inner(fld_id, fld_subject)
        `)
        .eq('fld_tid', teacherId);

      if (subjectsError) throw subjectsError;

      // Get student's subjects for matching
      const { data: studentSubjects, error: studentSubjectsError } = await supabase
        .from('tbl_students_subjects')
        .select(`
          fld_id,
          fld_suid,
          tbl_subjects!inner(fld_id, fld_subject)
        `)
        .eq('fld_sid', studentId);

      if (studentSubjectsError) throw studentSubjectsError;

      // Get mediation stages
      const { data: mediationStages, error: mediationError } = await supabase
        .from('tbl_students_mediation_stages')
        .select('fld_ssid, fld_m_type')
        .eq('fld_sid', studentId);

      if (mediationError) throw mediationError;

      // Get levels for subject expertise
      const { data: levels, error: levelsError } = await supabase
        .from('tbl_levels')
        .select('fld_id, fld_level');

      if (levelsError) throw levelsError;

      // Get active students count
      const { data: activeStudents, error: activeStudentsError } = await supabase
        .from('tbl_students_mediation_stages')
        .select('fld_sid')
        .eq('fld_tid', teacherId)
        .eq('fld_m_flag', 'X');

      if (activeStudentsError) throw activeStudentsError;

      // Process subjects with matching logic
      const processedSubjects: TeacherSubject[] = teacherSubjects.map(ts => {
        const studentSubject = studentSubjects.find(ss => ss.fld_suid === ts.tbl_subjects.fld_id);
        const isMatching = !!studentSubject;
        const isMediated = mediationStages.some(ms => ms.fld_ssid === studentSubject?.fld_id);
        const level = levels.find(l => l.fld_id === ts.fld_level);
        
        let color = '';
        if (isMatching && !isMediated) {
          color = 'text-success';
        }

        return {
          fld_id: ts.tbl_subjects.fld_id,
          fld_subject: ts.tbl_subjects.fld_subject,
          fld_level: ts.fld_level,
          fld_level_name: level?.fld_level || '',
          is_matching: isMatching,
          is_mediated: isMediated,
          color: color,
        };
      });

      // Calculate age
      const birthDate = new Date(teacher.fld_dob);
      const currentDate = new Date();
      const age = currentDate.getFullYear() - birthDate.getFullYear();

      return {
        ...teacher,
        age,
        active_students: activeStudents.length,
        subjects: processedSubjects,
        fld_latitude: teacher.fld_latitude ? parseFloat(teacher.fld_latitude) : null,
        fld_longitude: teacher.fld_longitude ? parseFloat(teacher.fld_longitude) : null,
      } as Teacher;
    },
  });

  // Match teacher with student
  const matchTeacherMutation = useMutation({
    mutationFn: async ({ studentId, teacherId, subjectIds }: { studentId: number; teacherId: number; subjectIds: number[] }) => {
      // Get the "Match" mediation type from database
      const { data: matchType, error: matchTypeError } = await supabase
        .from('tbl_mediation_types')
        .select('fld_id')
        .eq('fld_stage_name', 'Match')
        .eq('fld_rid', 2)
        .eq('fld_status', 'Active')
        .single();

      if (matchTypeError) throw matchTypeError;

      // Insert mediation stages for each subject
      const mediationStages = subjectIds.map(subjectId => ({
        fld_tid: teacherId,
        fld_sid: studentId,
        fld_ssid: subjectId,
        fld_m_type: matchType.fld_id,
        fld_edate: new Date().toISOString().split('T')[0],
        fld_uname: user?.fld_id || 1,
      }));

      const { error } = await supabase
        .from('tbl_students_mediation_stages')
        .insert(mediationStages);

      if (error) throw error;

      // Check if all student subjects are now mediated
      const { data: allStudentSubjects, error: subjectsError } = await supabase
        .from('tbl_students_subjects')
        .select('fld_id')
        .eq('fld_sid', studentId);

      if (subjectsError) throw subjectsError;

      const { data: mediatedSubjects, error: mediatedError } = await supabase
        .from('tbl_students_mediation_stages')
        .select('fld_ssid')
        .eq('fld_sid', studentId)
        .eq('fld_m_type', 1);

      if (mediatedError) throw mediatedError;

      // Update student status
      let newStatus = 'Partially Mediated';
      if (allStudentSubjects.length === mediatedSubjects.length) {
        newStatus = 'Mediated';
      }

      const { error: updateError } = await supabase
        .from('tbl_students')
        .update({ fld_status: newStatus as Database["public"]["Enums"]["student_status"] })
        .eq('fld_id', studentId);

      if (updateError) throw updateError;

      return { success: true, newStatus };
    },
    onSuccess: (data) => {
      toast.success(`Teacher matched successfully. Student status: ${data.newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['students-for-matching'] });
    },
    onError: (error) => {
      toast.error('Failed to match teacher');
      console.error('Match error:', error);
    },
  });

  // Record activity
  const recordActivityMutation = useMutation({
    mutationFn: async ({ teacherId, studentId, subjectId, mediationTypeName }: { teacherId: number; studentId: number; subjectId: number; mediationTypeName: string }) => {
      // Get the mediation type ID from database
      const { data: mediationType, error: mediationTypeError } = await supabase
        .from('tbl_mediation_types')
        .select('fld_id')
        .eq('fld_stage_name', mediationTypeName)
        .eq('fld_rid', 2)
        .eq('fld_status', 'Active')
        .single();

      if (mediationTypeError) throw mediationTypeError;

      const { error } = await supabase
        .from('tbl_students_mediation_stages')
        .insert({
          fld_tid: teacherId,
          fld_sid: studentId,
          fld_ssid: subjectId,
          fld_m_type: mediationType.fld_id,
          fld_edate: new Date().toISOString().split('T')[0],
          fld_etime: new Date().toTimeString().split(' ')[0],
          fld_uname: user?.fld_id || 1,
        });

      if (error) throw error;

      // Check for specialist consulting status
      if (mediationTypeName === 'Specialist Consulting') {
        const { data: allSubjects, error: subjectsError } = await supabase
          .from('tbl_students_subjects')
          .select('fld_id')
          .eq('fld_sid', studentId);

        if (subjectsError) throw subjectsError;

        const { data: specialistSubjects, error: specialistError } = await supabase
          .from('tbl_students_mediation_stages')
          .select('fld_ssid')
          .eq('fld_sid', studentId)
          .eq('fld_m_type', mediationType.fld_id);

        if (specialistError) throw specialistError;

        if (allSubjects.length === specialistSubjects.length) {
          const { error: updateError } = await supabase
            .from('tbl_students')
            .update({ fld_status: 'Specialist Consulting' as Database["public"]["Enums"]["student_status"] })
            .eq('fld_id', studentId);

          if (updateError) throw updateError;
        }
      }
    },
    onSuccess: () => {
      toast.success('Activity recorded successfully');
      queryClient.invalidateQueries({ queryKey: ['students-for-matching'] });
    },
    onError: (error) => {
      toast.error('Failed to record activity');
      console.error('Activity error:', error);
    },
  });

  return {
    // Data
    students,
    subjects,
    mediationTypes,
    
    // Loading states
    studentsLoading,
    subjectsLoading,
    mediationTypesLoading,
    
    // Mutations
    searchTeachersMutation,
    getStudentDetails,
    getStudentSubjects,
    getTeacherDetails,
    matchTeacherMutation,
    recordActivityMutation,
    
    // Helper functions
    calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    },
  };
}
