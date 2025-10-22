import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export const useDashboard = () => {
  const user = useAuthStore(state => state.user);

  // Admin Dashboard Statistics
  const adminStats = useQuery({
    queryKey: ['dashboard', 'admin-stats'],
    queryFn: async () => {
      // Get applicants (teachers not hired/rejected)
      const { data: applicants } = await supabase
        .from('tbl_teachers')
        .select('fld_id')
        .not('fld_status', 'in', ['Deleted', 'Hired', 'Rejected']);

      // Get hired teachers
      const { data: teachers } = await supabase
        .from('tbl_teachers')
        .select('fld_id')
        .eq('fld_status', 'Hired');

      // Get active students
      const { data: students } = await supabase
        .from('tbl_students')
        .select('fld_id')
        .neq('fld_status', 'Deleted');

      // Get active contracts
      const { data: contracts } = await supabase
        .from('tbl_contracts')
        .select('fld_id')
        .eq('fld_status', 'Active');

      // Get total lessons
      const { data: lessons } = await supabase
        .from('tbl_teachers_lessons_history')
        .select('fld_id, fld_lesson, fld_edate');

      // Get completed lessons
      const { data: completedLessons } = await supabase
        .from('tbl_teachers_lessons_history')
        .select('fld_id')
        .eq('fld_status', 'Completed');

      // Get monthly revenue from invoices
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const { data: monthlyInvoices } = await supabase
        .from('tbl_teachers_invoices')
        .select('fld_invoice_total, fld_edate')
        .gte('fld_edate', `${currentMonth}-01`)
        .lt('fld_edate', `${currentMonth}-32`);

      // Get pending payments
      const { data: pendingPayments } = await supabase
        .from('tbl_teachers_invoices')
        .select('fld_id')
        .neq('fld_status', 'Paid');

      // Calculate lesson completion rate
      const totalLessons = lessons?.length || 0;
      const completedLessonsCount = completedLessons?.length || 0;
      const completionRate = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

      // Calculate monthly revenue
      const monthlyRevenue = monthlyInvoices?.reduce((sum, invoice) => sum + (invoice.fld_invoice_total || 0), 0) || 0;

      // Calculate average lesson duration
      const { data: lessonDurations } = await supabase
        .from('tbl_teachers_lessons_history')
        .select('fld_lesson')
        .not('fld_lesson', 'is', null);

      const avgLessonDuration = lessonDurations?.length > 0 
        ? Math.round(lessonDurations.reduce((sum, lesson) => sum + (lesson.fld_lesson || 0), 0) / lessonDurations.length)
        : 45;

      // Get students by status for detailed breakdown
      const { data: studentsOpenToMediation } = await supabase
        .from('tbl_students')
        .select('fld_id')
        .eq('fld_status', 'Mediation Open');

      const { data: mediatedStudents } = await supabase
        .from('tbl_students')
        .select('fld_id')
        .eq('fld_status', 'Mediated');

      const { data: partiallyMediatedStudents } = await supabase
        .from('tbl_students')
        .select('fld_id')
        .eq('fld_status', 'Partially Mediated');

      const { data: leadStudents } = await supabase
        .from('tbl_students')
        .select('fld_id')
        .eq('fld_status', 'Leads');

      const { data: contractedStudents } = await supabase
        .from('tbl_students')
        .select('fld_id')
        .eq('fld_status', 'Contracted Customers');

      // Calculate conversion rate (Leads to Contracted Customers)
      const totalLeads = leadStudents?.length || 0;
      const totalContracted = contractedStudents?.length || 0;
      const conversionRate = totalLeads > 0 ? Math.round((totalContracted / totalLeads) * 100) : 0;

      return {
        totalApplicants: applicants?.length || 0,
        totalTeachers: teachers?.length || 0,
        totalStudents: students?.length || 0,
        totalContracts: contracts?.length || 0,
        totalLessons: totalLessons,
        lessonCompletionRate: completionRate,
        monthlyRevenue: monthlyRevenue,
        pendingPayments: pendingPayments?.length || 0,
        avgLessonDuration: avgLessonDuration,
        studentsOpenToMediation: studentsOpenToMediation?.length || 0,
        mediatedStudents: mediatedStudents?.length || 0,
        partiallyMediatedStudents: partiallyMediatedStudents?.length || 0,
        leadStudents: leadStudents?.length || 0,
        contractedStudents: contractedStudents?.length || 0,
        conversionRate: conversionRate,
      };
    },
    enabled: !!user && user.fld_rid === 1, // Only for admins
  });

  // Recent Activities (Mediation Stages)
  const recentActivities = useQuery({
    queryKey: ['dashboard', 'recent-activities'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tbl_students_mediation_stages')
        .select(`
          fld_id,
          fld_sid,
          fld_tid,
          fld_ssid,
          fld_edate,
          fld_etime,
          fld_m_type,
          fld_m_flag,
          fld_note,
          tbl_students:fld_sid (
            fld_id,
            fld_first_name,
            fld_last_name
          ),
          tbl_teachers:fld_tid (
            fld_id,
            fld_first_name,
            fld_last_name
          ),
          tbl_students_subjects:fld_ssid (
            fld_id,
            fld_suid,
            tbl_subjects:fld_suid (
              fld_id,
              fld_subject
            )
          )
        `)
        .eq('fld_m_flag', 'X')
        .order('fld_edate', { ascending: false })
        .limit(5);

      return data || [];
    },
    enabled: !!user && user.fld_rid === 1, // Only for admins
  });

  // Recent Lesson History
  const recentLessons = useQuery({
    queryKey: ['dashboard', 'recent-lessons'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tbl_teachers_lessons_history')
               .select(`
                 fld_id,
                 fld_lesson,
                 fld_status,
                 fld_edate,
                 fld_sid,
                 fld_tid,
                 tbl_students:fld_sid (
                   fld_id,
                   fld_first_name,
                   fld_last_name
                 ),
                 tbl_teachers:fld_tid (
                   fld_id,
                   fld_first_name,
                   fld_last_name
                 )
               `)
        .order('fld_edate', { ascending: false })
        .limit(15);

      return data || [];
    },
    enabled: !!user && user.fld_rid === 1, // Only for admins
  });

  // Teacher Dashboard Data
  const teacherData = useQuery({
    queryKey: ['dashboard', 'teacher-data', user?.fld_id],
    queryFn: async () => {
      if (!user) return null;

      // Get teacher profile
      const { data: teacher } = await supabase
        .from('tbl_teachers')
        .select('*')
        .eq('fld_uid', user.fld_id)
        .single();

      if (!teacher) return null;

      // Get teacher's students
      const { data: teacherStudents } = await supabase
        .from('tbl_students_mediation_stages')
        .select('fld_sid')
        .eq('fld_tid', teacher.fld_id)
        .eq('fld_m_flag', 'X');

      // Get teacher's active contracts
      const { data: teacherContracts } = await supabase
        .from('tbl_contracts_engagement')
        .select('fld_id')
        .eq('fld_tid', teacher.fld_id)
        .eq('fld_status', 'Active');

      return {
        teacher,
        totalStudents: teacherStudents?.length || 0,
        totalContracts: teacherContracts?.length || 0,
      };
    },
    enabled: !!user && user.fld_rid === 2, // Only for teachers
  });

  // Student Dashboard Data
  const studentData = useQuery({
    queryKey: ['dashboard', 'student-data', user?.fld_id],
    queryFn: async () => {
      if (!user) return null;

      // Get student profile
      const { data: student } = await supabase
        .from('tbl_students')
        .select('*')
        .eq('fld_uid', user.fld_id)
        .single();

      if (!student) return null;

      // Get student's subjects
      const { data: studentSubjects } = await supabase
        .from('tbl_students_subjects')
        .select(`
          fld_id,
          fld_sid,
          fld_suid,
          fld_detail,
          tbl_subjects:fld_suid (
            fld_id,
            fld_subject,
            fld_image
          )
        `)
        .eq('fld_sid', student.fld_id);

      return {
        student,
        subjects: studentSubjects || [],
      };
    },
    enabled: !!user && user.fld_rid === 3, // Only for students
  });

  // Financial Overview (simplified - only monthly revenue)
  const financialOverview = useQuery({
    queryKey: ['dashboard', 'financial-overview'],
    queryFn: async () => {
      // Monthly revenue
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: monthlyInvoices } = await supabase
        .from('tbl_teachers_invoices')
        .select('fld_invoice_total')
        .gte('fld_edate', `${currentMonth}-01`)
        .lt('fld_edate', `${currentMonth}-32`);

      const monthlyRevenue = monthlyInvoices?.reduce((sum, invoice) => sum + (invoice.fld_invoice_total || 0), 0) || 0;

      return {
        monthlyRevenue,
      };
    },
    enabled: !!user && user.fld_rid === 1,
  });

  return {
    adminStats,
    recentActivities,
    recentLessons,
    teacherData,
    studentData,
    financialOverview,
  };
};
