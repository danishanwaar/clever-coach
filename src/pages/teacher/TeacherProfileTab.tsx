import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  User as UserIcon, 
  Users, 
  FileCheck, 
  Mail, 
  MapPin, 
  IdCard,
  Euro,
  Calendar,
  Award,
  GraduationCap
} from "lucide-react";
import { format } from "date-fns";
import {
  useTeacherSubjects,
  useTeacherStudents,
  useTeacherActiveEngagements
} from "@/hooks/useTeacherProfile";

interface TeacherProfileTabProps {
  teacher: any;
  teacherId: string;
}

const TeacherProfileTab: React.FC<TeacherProfileTabProps> = ({ teacher, teacherId }) => {
  // Fetch teacher subjects
  const { data: subjects = [] } = useTeacherSubjects(teacher.fld_id);

  // Fetch students (those with contracts)
  const { data: students = [] } = useTeacherStudents(teacher.fld_id);

  // Fetch active engagements
  const { data: activeEngagements = [] } = useTeacherActiveEngagements(teacher.fld_id);

  return (
    <div className="space-y-6">
      {/* Top Row - About and Teacher Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Column - About Card */}
        <div className="lg:col-span-1 flex">
          <Card className="border-0 shadow-md w-full flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-primary flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {teacher.fld_self || 'No information available'}
                </p>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IdCard className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Teacher ID</p>
                    <p className="text-sm font-semibold text-gray-900">{teacherId}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                    <a 
                      href={`mailto:${teacher.fld_email}`} 
                      className="text-sm text-primary hover:underline font-medium break-all"
                    >
                      {teacher.fld_email}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {teacher.fld_street && (
                        <>
                          {teacher.fld_street},<br />
                        </>
                      )}
                      {teacher.fld_zip && teacher.fld_city ? (
                        <>
                          {teacher.fld_zip} {teacher.fld_city}
                          {teacher.fld_country && `, ${teacher.fld_country}`}
                        </>
                      ) : (
                        <span className="text-gray-400">No address provided</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Main Content */}
        <div className="lg:col-span-2 flex">
        <Card className="border-0 shadow-md w-full flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-primary flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Teacher Details
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</p>
                </div>
                <Badge 
                  className={`${
                    teacher.fld_status === 'Hired' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : teacher.fld_status === 'Suspended'
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  } text-sm font-semibold px-3 py-1 border`}
                >
                  {teacher.fld_status}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Euro className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hourly Rate</p>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  €{Math.round(parseFloat(teacher.fld_per_l_rate || '0'))}
                </p>
              </div>
              
              {teacher.fld_onboard_date && (
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Onboard Date</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {format(new Date(teacher.fld_onboard_date), 'dd MMMM yyyy')}
                  </p>
                </div>
              )}
              
              {teacher.fld_gender && (
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <UserIcon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{teacher.fld_gender}</p>
                </div>
              )}
              
              {teacher.fld_education && (
                <div className="space-y-1 md:col-span-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <GraduationCap className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Education</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{teacher.fld_education}</p>
                </div>
              )}
              
              {teacher.fld_t_mode && (
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Transport Mode</p>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {teacher.fld_t_mode}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Second Row - My Subjects, Students, Active Contracts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* My Subjects */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-primary flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              My Subjects
              {subjects.length > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {subjects.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {subjects.length > 0 ? (
                subjects.map((subject: any) => (
                  <div 
                    key={subject.fld_id} 
                    className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 group-hover:scale-125 transition-transform"></div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
                      {subject.tbl_subjects?.fld_subject || 'Unknown'}
                    </span>
                    {subject.tbl_levels && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        {subject.tbl_levels.fld_level}
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No subjects assigned</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Students */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-primary flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Students
              {students.length > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {students.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {students.length > 0 ? (
                students.map((student: any) => (
                  <div 
                    key={student.fld_id} 
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ring-2 ring-red-50 group-hover:ring-red-100 transition-all">
                      <span className="text-red-600 text-sm font-bold">
                        {student.fld_first_name[0]}{student.fld_last_name[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
                        {student.fld_first_name} {student.fld_last_name}
                      </p>
                      {student.tbl_levels && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {student.tbl_levels.fld_level}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No students assigned</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Contracts */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-primary flex items-center">
              <FileCheck className="h-5 w-5 mr-2" />
              Active Contracts
              {activeEngagements.length > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {activeEngagements.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeEngagements.length > 0 ? (
                activeEngagements.map((engagement: any) => (
                  <div 
                    key={engagement.fld_id} 
                    className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors group border border-green-50 bg-green-50/30"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ring-2 ring-green-50 group-hover:ring-green-100 transition-all">
                      <span className="text-green-600 text-sm font-bold">
                        {engagement.student_name.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
                        {engagement.student_name}
                      </p>
                      <div className="flex items-center mt-1">
                        <BookOpen className="h-3 w-3 text-gray-400 mr-1" />
                        <p className="text-xs text-gray-600">{engagement.subject}</p>
                      </div>
                      {engagement.fld_t_per_lesson_rate && (
                        <p className="text-xs text-gray-500 mt-1">
                          €{Math.round(engagement.fld_t_per_lesson_rate)}/lesson
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No active contracts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherProfileTab;

