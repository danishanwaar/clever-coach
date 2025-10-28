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
  Activity,
  Plus
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
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                Welcome back, {user?.fld_name}! Here's what's happening in your platform.
                </p>
              </div>
            <div className="flex gap-3">
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2.5 rounded-lg font-medium"
                onClick={() => window.location.href = '/students'}
              >
                <Users className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Manage Students</span>
                <span className="sm:hidden">Students</span>
                </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-gray-300 hover:border-primary hover:bg-primary/5 text-gray-700 hover:text-primary transition-all duration-300 px-6 py-2.5 rounded-lg font-medium"
                onClick={() => window.location.href = '/settings'}
              >
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </div>
            </div>
          </div>

        {/* Key Metrics Section - Modern White Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Teachers */}
          <Card className="bg-white border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Teachers</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{adminStats.data?.totalTeachers || 0}</p>
                  <div className="text-sm text-gray-500 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Hired and available
                  </div>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <GraduationCap className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Students */}
          <Card className="bg-white border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Students</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{adminStats.data?.totalStudents || 0}</p>
                  <div className="text-sm text-gray-500 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Currently enrolled
                  </div>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Revenue */}
          <Card className="bg-white border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">€{financialOverview.data?.monthlyRevenue?.toLocaleString() || 0}</p>
                  <div className="text-sm text-gray-500 flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                    Current month
                  </div>
                </div>
                <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Applications */}
          <Card className="bg-white border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending Applications</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{adminStats.data?.totalApplicants || 0}</p>
                  <div className="text-sm text-gray-500 flex items-center">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                    Requiring review
                  </div>
                </div>
                <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <BarChart3 className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
            </div>

        {/* Additional Metrics Section - Modern White Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Lessons */}
          <Card className="bg-white border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                  <p className="text-3xl font-bold text-gray-900">{adminStats.data?.totalLessons || 0}</p>
                  <p className="text-sm text-gray-500">All time lessons</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Contracts */}
          <Card className="bg-white border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Contracts</p>
                  <p className="text-3xl font-bold text-gray-900">{adminStats.data?.totalContracts || 0}</p>
                  <p className="text-sm text-gray-500">Currently active</p>
                </div>
                <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Open to Mediation */}
          <Card className="bg-white border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open to Mediation</p>
                  <p className="text-3xl font-bold text-gray-900">{adminStats.data?.studentsOpenToMediation || 0}</p>
                  <p className="text-sm text-gray-500">Awaiting matching</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mediated Students */}
          <Card className="bg-white border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mediated Students</p>
                  <p className="text-3xl font-bold text-gray-900">{adminStats.data?.mediatedStudents || 0}</p>
                  <p className="text-sm text-gray-500">Successfully matched</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
            </div>

        {/* Student Status Breakdown - Modern White Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Partially Mediated */}
          <Card className="bg-white border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Partially Mediated</p>
                  <p className="text-3xl font-bold text-gray-900">{adminStats.data?.partiallyMediatedStudents || 0}</p>
                  <p className="text-sm text-gray-500">Some subjects matched</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leads */}
          <Card className="bg-white border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Leads</p>
                  <p className="text-3xl font-bold text-gray-900">{adminStats.data?.leadStudents || 0}</p>
                  <p className="text-sm text-gray-500">Initial inquiries</p>
                </div>
                <div className="h-12 w-12 bg-cyan-100 rounded-xl flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                  <Calendar className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contracted Customers */}
          <Card className="bg-white border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contracted Customers</p>
                  <p className="text-3xl font-bold text-gray-900">{adminStats.data?.contractedStudents || 0}</p>
                  <p className="text-sm text-gray-500">Active contracts</p>
                </div>
                <div className="h-12 w-12 bg-teal-100 rounded-xl flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                  <UserCheck className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card className="bg-white border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {adminStats.data?.conversionRate ? `${adminStats.data.conversionRate}%` : '0%'}
                  </p>
                  <p className="text-sm text-gray-500">Lead to contract</p>
                </div>
                <div className="h-12 w-12 bg-rose-100 rounded-xl flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                  <TrendingUp className="h-6 w-6 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
            </div>



        {/* Recent Activity and Recent Lesson Logged - Modern White Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-white border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                Recent Activity
              </CardTitle>
              <CardDescription className="text-gray-600">Latest system activities and updates</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {recentActivities.data?.map((activity, index) => (
                <div key={activity.fld_id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200">
                  <div className="flex-shrink-0">
                    <Avatar className="h-12 w-12 ring-2 ring-gray-200 shadow-sm">
                      <AvatarFallback className="bg-gray-100 text-gray-700 font-semibold">
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
                        <span className="block mt-2 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg inline-block">Note: {activity.fld_note}</span>
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
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">No recent activities</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Lesson Logged */}
          <Card className="bg-white border border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                Recent Lesson Logged
              </CardTitle>
              <CardDescription className="text-gray-600">Latest lesson entries in the system</CardDescription>
                </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentLessons.data?.map((lesson) => (
                  <div key={lesson.fld_id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200">
                    <div className="flex-shrink-0">
                      <Avatar className="h-12 w-12 ring-2 ring-gray-200 shadow-sm">
                        <AvatarFallback className="bg-gray-100 text-gray-700 font-semibold">
                          {lesson.tbl_teachers?.fld_first_name?.[0]}{lesson.tbl_teachers?.fld_last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-1 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
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
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-gray-400" />
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