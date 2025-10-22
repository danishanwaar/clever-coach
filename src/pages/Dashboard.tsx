import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuthStore } from '@/stores/authStore';
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BookOpen, 
  Target,
  Calendar,
  DollarSign, 
  BarChart3,
  Settings,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  const user = useAuthStore(state => state.user);
  const { 
    adminStats, 
    recentActivities, 
    recentLessons, 
    teacherData, 
    studentData,
    financialOverview
  } = useDashboard();

  // Loading state
  const isLoading = adminStats.isLoading || recentActivities.isLoading || recentLessons.isLoading || 
                   teacherData.isLoading || studentData.isLoading || financialOverview.isLoading;

  if (isLoading) {
    return <Loader message="Loading dashboard..." />;
  }

  // Admin Dashboard
  if (user?.fld_rid === 1) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Admin Dashboard</h1>
              <p className="text-gray-600 text-lg">Welcome back, Admin! Here's what's happening in your platform.</p>
            </div>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="border-primary/30 bg-white/80 backdrop-blur-sm text-primary hover:bg-primary hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
                onClick={() => window.location.href = '/students'}
              >
                <Users className="h-5 w-5 mr-2" />
                Students
              </Button>
              <Button 
                variant="outline" 
                className="border-primary/30 bg-white/80 backdrop-blur-sm text-primary hover:bg-primary hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
                onClick={() => window.location.href = '/settings'}
              >
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </Button>
            </div>
          </div>
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        {/* Key Metrics Section - Essential Stats Only */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Teachers */}
          <Card className="bg-gradient-to-br from-white via-primary/3 to-primary/8 border border-primary/20 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-primary/80 mb-1">Active Teachers</p>
                  <p className="text-4xl font-bold text-primary mb-1">{adminStats.data?.totalTeachers || 0}</p>
                  <p className="text-sm text-primary/60 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Hired and available
                  </p>
                </div>
                <div className="h-16 w-16 bg-gradient-to-br from-primary/20 to-primary/30 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Students */}
          <Card className="bg-gradient-to-br from-white via-primary/3 to-primary/8 border border-primary/20 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-primary/80 mb-1">Active Students</p>
                  <p className="text-4xl font-bold text-primary mb-1">{adminStats.data?.totalStudents || 0}</p>
                  <p className="text-sm text-primary/60 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                    Currently enrolled
                  </p>
                </div>
                <div className="h-16 w-16 bg-gradient-to-br from-primary/20 to-primary/30 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Revenue */}
          <Card className="bg-gradient-to-br from-white via-primary/3 to-primary/8 border border-primary/20 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-primary/80 mb-1">Monthly Revenue</p>
                  <p className="text-4xl font-bold text-primary mb-1">€{financialOverview.data?.monthlyRevenue?.toLocaleString() || 0}</p>
                  <p className="text-sm text-primary/60 flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                    Current month
                  </p>
                </div>
                <div className="h-16 w-16 bg-gradient-to-br from-primary/20 to-primary/30 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Applications */}
          <Card className="bg-gradient-to-br from-white via-primary/3 to-primary/8 border border-primary/20 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm font-semibold text-primary/80 mb-1">Pending Applications</p>
                  <p className="text-4xl font-bold text-primary mb-1">{adminStats.data?.totalApplicants || 0}</p>
                  <p className="text-sm text-primary/60 flex items-center">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></div>
                    Requiring review
                  </p>
                </div>
                <div className="h-16 w-16 bg-gradient-to-br from-primary/20 to-primary/30 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Lessons */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Total Lessons</p>
                  <p className="text-3xl font-bold text-primary">{adminStats.data?.totalLessons || 0}</p>
                  <p className="text-sm text-primary/70">All time lessons</p>
                </div>
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Contracts */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Active Contracts</p>
                  <p className="text-3xl font-bold text-primary">{adminStats.data?.totalContracts || 0}</p>
                  <p className="text-sm text-primary/70">Currently active</p>
                </div>
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Open to Mediation */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Open to Mediation</p>
                  <p className="text-3xl font-bold text-primary">{adminStats.data?.studentsOpenToMediation || 0}</p>
                  <p className="text-sm text-primary/70">Awaiting matching</p>
                </div>
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
            </div>
          </div>
            </CardContent>
          </Card>

          {/* Mediated Students */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Mediated Students</p>
                  <p className="text-3xl font-bold text-primary">{adminStats.data?.mediatedStudents || 0}</p>
                  <p className="text-sm text-primary/70">Successfully matched</p>
                </div>
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
            </div>

        {/* Student Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Partially Mediated */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Partially Mediated</p>
                  <p className="text-3xl font-bold text-primary">{adminStats.data?.partiallyMediatedStudents || 0}</p>
                  <p className="text-sm text-primary/70">Some subjects matched</p>
                </div>
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leads */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">New Leads</p>
                  <p className="text-3xl font-bold text-primary">{adminStats.data?.leadStudents || 0}</p>
                  <p className="text-sm text-primary/70">Initial inquiries</p>
                </div>
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contracted Customers */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Contracted Customers</p>
                  <p className="text-3xl font-bold text-primary">{adminStats.data?.contractedStudents || 0}</p>
                  <p className="text-sm text-primary/70">Active contracts</p>
                </div>
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Conversion Rate</p>
                  <p className="text-3xl font-bold text-primary">
                    {adminStats.data?.conversionRate ? `${adminStats.data.conversionRate}%` : '0%'}
                  </p>
                  <p className="text-sm text-primary/70">Lead to contract</p>
                </div>
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
            </div>



        {/* Recent Activity and Recent Lesson Logged - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-white border border-primary/20 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-primary/100">
              <CardTitle className="text-lg font-semibold text-primary flex items-center">
                <div className="h-8 w-8 bg-primary/20 rounded-lg flex items-center justify-center mr-3">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                Recent Activity
              </CardTitle>
              <CardDescription className="text-gray-600">Latest system activities and updates</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {recentActivities.data?.map((activity, index) => (
                <div key={activity.fld_id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-200 border border-transparent hover:border-primary/10">
                  <div className="flex-shrink-0">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20 shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-semibold">
                        {activity.tbl_teachers?.fld_first_name?.[0]}{activity.tbl_teachers?.fld_last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Mediation Stage - {activity.tbl_students_subjects?.tbl_subjects?.fld_subject}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Teacher ({activity.tbl_teachers?.fld_first_name} {activity.tbl_teachers?.fld_last_name}) 
                      with Student ({activity.tbl_students?.fld_first_name} {activity.tbl_students?.fld_last_name})
                      {activity.fld_note && (
                        <span className="block mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg inline-block">Note: {activity.fld_note}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(activity.fld_edate).toLocaleDateString()}{activity.fld_etime && ` at ${activity.fld_etime}`}
                    </p>
                  </div>
                </div>
              ))}
              {(!recentActivities.data || recentActivities.data.length === 0) && (
                <div className="text-center py-12">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-primary/40" />
                  </div>
                  <p className="text-gray-500 text-lg">No recent activities</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Lesson Logged */}
          <Card className="bg-white border border-primary/20 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-primary/100">
              <CardTitle className="text-lg font-semibold text-primary flex items-center">
                <div className="h-8 w-8 bg-primary/20 rounded-lg flex items-center justify-center mr-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                Recent Lesson Logged
              </CardTitle>
              <CardDescription className="text-gray-600">Latest lesson entries in the system</CardDescription>
                </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentLessons.data?.map((lesson) => (
                  <div key={lesson.fld_id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-200 border border-transparent hover:border-primary/10">
                    <div className="flex-shrink-0">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/20 shadow-md">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-semibold">
                          {lesson.tbl_teachers?.fld_first_name?.[0]}{lesson.tbl_teachers?.fld_last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-1 flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></div>
                        Lesson Completed - {lesson.fld_lesson} min
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Teacher: {lesson.tbl_teachers?.fld_first_name} {lesson.tbl_teachers?.fld_last_name}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        Student: {lesson.tbl_students?.fld_first_name} {lesson.tbl_students?.fld_last_name}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(lesson.fld_edate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {(!recentLessons.data || recentLessons.data.length === 0) && (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-primary/40" />
                    </div>
                    <p className="text-gray-500 text-lg">No recent lessons</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Teacher Dashboard
  if (user?.fld_rid === 2) {
    const teacher = teacherData.data?.teacher;
    
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.fld_name}</p>
          </div>
          <Badge variant="secondary" className="text-sm">
            Teacher
          </Badge>
        </div>

        {teacher?.fld_status !== 'Hired' ? (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Registration Under Review</h3>
                  <p className="text-yellow-700">
                    Welcome to Clever Coach, {user.fld_name}! Your registration form is under approval process.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Teacher Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-blue-500 text-white">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">My Students</p>
                      <p className="text-3xl font-bold">{teacherData.data?.totalStudents || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Active Contracts</p>
                      <p className="text-3xl font-bold">{teacherData.data?.totalContracts || 0}</p>
                    </div>
                    <FileText className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Onboarding Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-primary">Onboarding Panel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">🔄 Process Flow</h4>
                    <ul className="text-blue-700 space-y-1 text-sm">
                      <li>• We will contact you via phone or WhatsApp when we have a suitable student for you</li>
                      <li>• You will receive a message with student details and subject information</li>
                      <li>• You can accept or decline the assignment</li>
                      <li>• Once accepted, you'll receive contract documents to sign</li>
                    </ul>
            </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">📚 Teaching Guidelines</h4>
                    <ul className="text-green-700 space-y-1 text-sm">
                      <li>• Always be punctual for lessons</li>
                      <li>• Prepare lesson materials in advance</li>
                      <li>• Maintain professional communication</li>
                      <li>• Log lesson details after each session</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  }

  // Student Dashboard
  if (user?.fld_rid === 3) {
    const student = studentData.data?.student;
    
    return (
      <div className="container mx-auto p-6 space-y-6">
                    <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.fld_name}</p>
          </div>
          <Badge variant="secondary" className="text-sm">
            Student
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Profile */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/assets/media/avatars/blank.png" />
                    <AvatarFallback>{student?.fld_first_name?.[0]}{student?.fld_last_name?.[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold text-lg">
                      {student?.fld_first_name} {student?.fld_last_name}
                    </h3>
                    <p className="text-muted-foreground">{student?.fld_email}</p>
                  </div>

                  <Separator />

                  <div className="space-y-3 w-full">
                    <div>
                      <p className="text-sm font-medium">Account ID</p>
                      <p className="text-sm text-muted-foreground">{student?.fld_id}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Level</p>
                      <p className="text-sm text-muted-foreground">{student?.fld_level}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {student?.fld_address}, {student?.fld_city}, {student?.fld_zip}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">School</p>
                      <p className="text-sm text-muted-foreground">{student?.fld_school}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-blue-50">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">0</p>
                      <p className="text-sm text-blue-700">Total Lessons</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">0</p>
                      <p className="text-sm text-green-700">Total Invoices</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subject Preferences */}
              <Card>
              <CardHeader>
                <CardTitle>Subject Preferences</CardTitle>
                <CardDescription>Your selected subjects and learning goals</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {studentData.data?.subjects.map((subjectData) => (
                    <div key={subjectData.fld_id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl">
                        {/* You can add subject icons here */}
                        📚
                      </div>
                      <div>
                        <p className="font-medium">{subjectData.tbl_subjects?.fld_subject}</p>
                        <p className="text-sm text-muted-foreground">Detail: {subjectData.fld_detail || 'No details'}</p>
                      </div>
                    </div>
                  ))}
                  {(!studentData.data?.subjects || studentData.data.subjects.length === 0) && (
                    <p className="text-muted-foreground col-span-full text-center py-8">
                      No subjects selected
                    </p>
                  )}
                      </div>
              </CardContent>
            </Card>

            {/* Goals & Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Goals & Preferences</CardTitle>
                <CardDescription>Your learning objectives and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Target className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Learning Goals</p>
                      <p className="text-sm text-muted-foreground">
                        {student?.fld_reason || 'No specific goals defined yet'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <BookOpen className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">About</p>
                      <p className="text-sm text-muted-foreground">
                        {student?.fld_short_bio || 'No bio available'}
                      </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
    );
  }

  // Fallback for unknown roles
    return (
    <div className="container mx-auto p-6">
      <Card>
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to Clever Coach</h2>
          <p className="text-muted-foreground">
            Your account is being set up. Please contact support if you need assistance.
          </p>
        </CardContent>
      </Card>
        </div>
  );
}