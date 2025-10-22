import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Phone,
  MessageCircle,
  ArrowLeft,
  User,
  FileText,
  DollarSign,
  BookOpen,
  Clock,
  Activity,
  Settings,
  Download,
} from "lucide-react";
import { useStudents, useStudentSubjects, useStudent, useStudentContracts } from "@/hooks/useStudents";
import { formatPhoneNumber } from "@/lib/utils";

const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = parseInt(id || "0");
  const [activeTab, setActiveTab] = useState("profile");

  const { data: student, isLoading: studentLoading } = useStudent(studentId);
  const { data: studentSubjects = [] } = useStudentSubjects(studentId);
  const { data: contracts = [] } = useStudentContracts(studentId);

  if (studentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Not Found</h2>
          <p className="text-gray-600 mb-4">The student you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/students")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

  const formatPhoneForWhatsApp = (phone: string | null) => {
    if (!phone) return "";
    const formatted = formatPhoneNumber(phone);
    return formatted.startsWith("+") ? formatted : `+${formatted}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Leads":
        return "bg-yellow-100 text-yellow-800";
      case "Mediation Open":
        return "bg-blue-100 text-blue-800";
      case "Partially Mediated":
        return "bg-orange-100 text-orange-800";
      case "Mediated":
        return "bg-green-100 text-green-800";
      case "Contracted Customers":
        return "bg-purple-100 text-purple-800";
      case "Suspended":
        return "bg-red-100 text-red-800";
      case "Deleted":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate("/students")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Student Profile</h1>
            <p className="text-gray-600">Manage student information and activities</p>
          </div>
        </div>
      </div>

      {/* Student Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            {/* Student Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {student.fld_first_name} {student.fld_last_name}
                </h2>
                <Badge className={getStatusColor(student.fld_status)}>{student.fld_status}</Badge>
              </div>

              <div className="text-lg text-gray-600 mb-4">Student ID: {student.fld_id}</div>

              {/* Contact Actions */}
              <div className="flex items-center space-x-4">
                {student.fld_email && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${student.fld_email}`} target="_blank" rel="noopener noreferrer">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </a>
                  </Button>
                )}
                {student.fld_phone && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://web.whatsapp.com/send?phone=${formatPhoneForWhatsApp(student.fld_phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="font-semibold text-gray-900">Account ID</div>
                <div className="text-gray-600">{student.fld_id}</div>
              </div>

              <div>
                <div className="font-semibold text-gray-900">Email</div>
                <div className="text-gray-600">
                  {student.fld_email ? (
                    <a href={`mailto:${student.fld_email}`} className="text-blue-600 hover:text-blue-800">
                      {student.fld_email}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </div>
              </div>

              <div>
                <div className="font-semibold text-gray-900">Address</div>
                <div className="text-gray-600">
                  {student.fld_address && (
                    <>
                      {student.fld_address}
                      <br />
                      {student.fld_city}, {student.fld_zip}
                      <br />
                      {student.fld_country}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subjects Taught */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Subjects Taught</CardTitle>
            </CardHeader>
            <CardContent>
              {studentSubjects.length > 0 ? (
                <ul className="space-y-2">
                  {studentSubjects.map((subject: any) => (
                    <li key={subject.fld_id} className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                      {subject.tbl_subjects?.fld_subject || "Unknown Subject"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No subjects assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Active Contracts */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Active Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              {contracts.length > 0 ? (
                <div className="space-y-3">
                  {contracts.map((contract: any) => (
                    <div key={contract.fld_id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">Contract #{contract.fld_id}</div>
                        <div className="text-sm text-gray-600">€{contract.fld_s_per_lesson_rate || 0}/lesson</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No active contracts</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="profile" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="match" className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />M Making
              </TabsTrigger>
              <TabsTrigger value="contracts" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Contracts
              </TabsTrigger>
              <TabsTrigger value="financials" className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Financials
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />P Notes
              </TabsTrigger>
              <TabsTrigger value="time" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Time Logs
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium">Name:</span> {student.fld_first_name} {student.fld_last_name}
                        </div>
                        <div>
                          <span className="font-medium">Student Name:</span> {student.fld_s_first_name}{" "}
                          {student.fld_s_last_name}
                        </div>
                        <div>
                          <span className="font-medium">Gender:</span> {student.fld_gender}
                        </div>
                        <div>
                          <span className="font-medium">Level:</span> {student.fld_level}
                        </div>
                        <div>
                          <span className="font-medium">School:</span> {student.fld_school || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium">Email:</span> {student.fld_email || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {student.fld_phone || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Mobile:</span> {student.fld_mobile || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">City:</span> {student.fld_city || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">ZIP:</span> {student.fld_zip || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {student.fld_notes && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{student.fld_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="match" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Match Making</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Manage subject-teacher matching for this student.</p>
                    <Button asChild>
                      <Link to={`/students/${studentId}/match-making`}>
                        Open Match Making
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contracts" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contracts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600">Manage student contracts, engagements, and lesson tracking.</p>
                    <Link 
                      to={`/students/${studentId}/contracts`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Open Contracts
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financials" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600">View student invoices, payments, and financial statistics.</p>
                    <Link 
                      to={`/students/${studentId}/financials`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Open Financials
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progress Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600">View and manage student progress notes, add new notes, and track development.</p>
                    <Link 
                      to={`/students/${studentId}/progress-notes`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Open Progress Notes
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="time" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Time Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600">View and record time logs for lessons, track lesson history and progress.</p>
                    <Link 
                      to={`/students/${studentId}/time-logs`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Open Time Logs
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600">View and record student activities, track engagement and progress.</p>
                    <Link 
                      to={`/students/${studentId}/activity`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Open Activity
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600">Manage student settings, contact information, subjects, contracts, and status.</p>
                    <Link 
                      to={`/students/${studentId}/settings`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Open Settings
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
