import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { useStudents, useStudentSubjects, useStudent, useStudentContracts, useStudentMutations, StudentStatus } from "@/hooks/useStudents";
import { formatPhoneNumber } from "@/lib/utils";
import StudentMatchMaking from "./StudentMatchMaking";
import StudentContracts from "./StudentContracts";
import StudentFinancials from "./StudentFinancials";
import StudentProgressNotes from "./StudentProgressNotes";
import StudentTimeLogs from "./StudentTimeLogs";
import StudentActivity from "./StudentActivity";
import StudentSettings from "./StudentSettings";
import StudentContractDownload from "./StudentContractDownload";

const StudentProfile: React.FC = () => {
  const { id, tab } = useParams<{ id: string; tab?: string }>();
  const navigate = useNavigate();
  const studentId = parseInt(id || "0");
  const [activeTab, setActiveTab] = useState(tab || "profile");

  // Update active tab when URL changes
  React.useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  // Handle tab change and update URL
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    if (newTab === "profile") {
      navigate(`/students/${studentId}`);
    } else {
      navigate(`/students/${studentId}/${newTab}`);
    }
  };

  const { data: student, isLoading: studentLoading } = useStudent(studentId);
  const { data: studentSubjects = [] } = useStudentSubjects(studentId);
  const { data: contracts = [] } = useStudentContracts(studentId);
  const { updateStatus } = useStudentMutations();

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
            <ArrowLeft className="h-4 w-4" />
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
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Button variant="ghost" onClick={() => navigate("/students")} className="hover:bg-gray-50 p-0 h-auto">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Students
            </Button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{student.fld_first_name} {student.fld_last_name}</span>
        </div>

        {/* Student Header */}
        <div className="bg-white rounded-lg shadow-sm border-0 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {student.fld_first_name?.[0]}
                    {student.fld_last_name?.[0]}
                  </span>
      </div>
              </div>

              {/* Student Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h1 className="text-2xl font-bold text-primary">
                    {student.fld_first_name} {student.fld_last_name}
                  </h1>
                  <Badge className={`${getStatusColor(student.fld_status)} text-sm font-medium px-3 py-1 rounded-md`}>
                    {student.fld_status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">ID: STU-{student.fld_id.toString().padStart(6, "0")}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {student.fld_email && (
                <Button variant="outline" size="sm" asChild className="hover:bg-primary/10 hover:text-primary hover:border-primary/20">
                  <a href={`mailto:${student.fld_email}`} target="_blank" rel="noopener noreferrer">
                    <Mail className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {student.fld_mobile && (
                <Button variant="outline" size="sm" asChild className="hover:bg-primary/10 hover:text-primary hover:border-primary/20">
                  <a
                    href={`https://web.whatsapp.com/send?phone=${formatPhoneForWhatsApp(student.fld_mobile)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </Button>
              )}
              <Select
                value={student.fld_status}
                onValueChange={(newStatus: string) => {
                  updateStatus({
                    studentId: studentId!,
                    status: newStatus as StudentStatus
                  });
                }}
              >
                <SelectTrigger className="w-40 h-8 border-gray-300 hover:border-primary/50 focus:border-primary">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Leads">Leads</SelectItem>
                  <SelectItem value="Mediation Open">Mediation Open</SelectItem>
                  <SelectItem value="Partially Mediated">Partially Mediated</SelectItem>
                  <SelectItem value="Mediated">Mediated</SelectItem>
                  <SelectItem value="Specialist Consulting">Specialist Consulting</SelectItem>
                  <SelectItem value="Contracted Customers">Contracted Customers</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                  <SelectItem value="Deleted">Deleted</SelectItem>
                  <SelectItem value="Unplaceable">Unplaceable</SelectItem>
                  <SelectItem value="Waiting List">Waiting List</SelectItem>
                  <SelectItem value="Appointment Call">Appointment Call</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Appl">Appl</SelectItem>
                  <SelectItem value="Eng">Eng</SelectItem>
                </SelectContent>
              </Select>
            </div>
                </div>
              </div>


        {/* Main Content Area */}
        <div className="w-full overflow-hidden">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="flex w-full bg-gray-100 p-1 rounded-lg justify-between">
              <TabsTrigger
                value="profile"
                className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap flex-1"
              >
                <User className="h-4 w-4 mr-2" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger
                value="match"
                className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap flex-1"
              >
                <User className="h-4 w-4 mr-2" />
                <span>Matching & Mediation</span>
              </TabsTrigger>
              <TabsTrigger
                value="contracts"
                className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                <span>Contracts</span>
              </TabsTrigger>
              <TabsTrigger
                value="financials"
                className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap flex-1"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                <span>Financials</span>
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                <span>Progress Notes</span>
              </TabsTrigger>
              <TabsTrigger
                value="time"
                className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap flex-1"
              >
                <Clock className="h-4 w-4 mr-2" />
                <span>Time Logs</span>
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap flex-1"
              >
                <Activity className="h-4 w-4 mr-2" />
                <span>Activity</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap flex-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </TabsTrigger>
              <TabsTrigger
                value="download"
                className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                <span>Download</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Information Card */}
                <Card className="shadow-sm border-0 bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-primary flex items-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="text-sm font-medium text-gray-900">
                          {student.fld_first_name} {student.fld_last_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-sm font-medium text-gray-900">{student.fld_email || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Mobile</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatPhoneNumber(student.fld_mobile || "") || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge className={`${getStatusColor(student.fld_status)} text-xs`}>{student.fld_status}</Badge>
                </div>
              </div>
          </CardContent>
        </Card>

                {/* Academic Information Card */}
                <Card className="shadow-sm border-0 bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-primary flex items-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <BookOpen className="h-4 w-4 text-primary" />
              </div>
                      Academic Info
            </CardTitle>
          </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Level</p>
                        <p className="text-sm font-medium text-gray-900">{student.fld_level || "Not specified"}</p>
            </div>
                      <div>
                        <p className="text-sm text-gray-600">School</p>
                        <p className="text-sm font-medium text-gray-900">{student.fld_school || "Not specified"}</p>
            </div>
                      <div>
                        <p className="text-sm text-gray-600">Learning Mode</p>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {student.fld_l_mode || "In-Person"}
                </Badge>
              </div>
                      <div>
                        <p className="text-sm text-gray-600">Reason</p>
                        <p className="text-sm font-medium text-gray-900">{student.fld_reason || "Not specified"}</p>
                      </div>
                    </div>
          </CardContent>
        </Card>

                {/* Financial Information Card */}
                <Card className="shadow-sm border-0 bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-primary flex items-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <DollarSign className="h-4 w-4 text-primary" />
              </div>
                      Financial Info
            </CardTitle>
          </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Price per Lesson</p>
                        <div className="bg-green-50 px-3 py-1 rounded-md inline-block">
                          <span className="text-sm font-medium text-green-800">€{student.fld_price || "0"}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Registration Fee</p>
                        <p className="text-sm font-medium text-gray-900">€{student.fld_reg_fee || "0"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payer</p>
                        <p className="text-sm font-medium text-gray-900">
                          {student.fld_payer || student.fld_first_name || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Self Paid</p>
                        <p className="text-sm font-medium text-gray-900">{student.fld_self_paid || "Not specified"}</p>
            </div>
            </div>
          </CardContent>
        </Card>

                {/* Subjects Card */}
                <Card className="shadow-sm border-0 bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-primary flex items-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <BookOpen className="h-4 w-4 text-primary" />
              </div>
                      Subjects
            </CardTitle>
          </CardHeader>
                  <CardContent>
                    {studentSubjects.length > 0 ? (
                      <div className="space-y-2">
                        {studentSubjects.map((subject: any) => (
                          <div key={subject.fld_id} className="flex items-center space-x-2 p-2 bg-indigo-50 rounded-md">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            <span className="text-sm text-gray-900">
                              {subject.tbl_subjects?.fld_subject || "Unknown Subject"}
                            </span>
                          </div>
                        ))}
            </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No subjects assigned</p>
                    )}
                  </CardContent>
                </Card>

                {/* Contracts Card */}
                <Card className="shadow-sm border-0 bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-primary flex items-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <FileText className="h-4 w-4 text-primary" />
            </div>
                      Contracts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {contracts.length > 0 ? (
                      <div className="space-y-2">
                        {contracts.map((contract: any) => (
                          <div
                            key={contract.fld_id}
                            className="flex items-center justify-between p-2 bg-green-50 rounded-md"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">Contract #{contract.fld_id}</p>
                              <p className="text-xs text-gray-600">€{contract.fld_s_per_lesson_rate || 0}/lesson</p>
                </div>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
                        ))}
              </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No active contracts</p>
            )}
          </CardContent>
        </Card>

                {/* Additional Info Card */}
                <Card className="shadow-sm border-0 bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-primary flex items-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <FileText className="h-4 w-4 text-primary" />
              </div>
                      Additional Info
            </CardTitle>
          </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Lead Source</p>
                        <p className="text-sm font-medium text-gray-900">{student.fld_f_lead || "Not specified"}</p>
                      </div>
                <div>
                        <p className="text-sm text-gray-600">Created</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(student.created_at).toLocaleDateString()}
                        </p>
                </div>
                <div>
                        <p className="text-sm text-gray-600">Last Updated</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(student.updated_at || student.fld_created_at).toLocaleDateString()}
                  </p>
                </div>
                      {student.fld_notes && (
                        <div>
                          <p className="text-sm text-gray-600">Notes</p>
                          <p className="text-sm font-medium text-gray-900">{student.fld_notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="match" className="space-y-6 overflow-hidden">
              <div className="bg-white rounded-lg shadow-sm border-0 p-6 overflow-hidden">
                <StudentMatchMaking />
              </div>
            </TabsContent>

            <TabsContent value="contracts" className="space-y-6 overflow-hidden">
              <div className="bg-white rounded-lg shadow-sm border-0 p-6 overflow-hidden">
                <StudentContracts />
              </div>
            </TabsContent>

            <TabsContent value="financials" className="space-y-6 overflow-hidden">
              <div className="bg-white rounded-lg shadow-sm border-0 p-6 overflow-hidden">
                <StudentFinancials />
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6 overflow-hidden">
              <div className="bg-white rounded-lg shadow-sm border-0 p-6 overflow-hidden">
                <StudentProgressNotes />
              </div>
            </TabsContent>

            <TabsContent value="time" className="space-y-6 overflow-hidden">
              <div className="bg-white rounded-lg shadow-sm border-0 p-6 overflow-hidden">
                <StudentTimeLogs />
                </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6 overflow-hidden">
              <div className="bg-white rounded-lg shadow-sm border-0 p-6 overflow-hidden">
                <StudentActivity />
              </div>
            </TabsContent>

            <TabsContent value="download" className="space-y-6 overflow-hidden">
              <div className="bg-white rounded-lg shadow-sm border-0 p-6 overflow-hidden">
                <StudentContractDownload />
              </div>
            </TabsContent>
            <TabsContent value="settings" className="space-y-6 overflow-hidden">
              <div className="bg-white rounded-lg shadow-sm border-0 p-6 overflow-hidden">
                <StudentSettings />
              </div>
            </TabsContent>
          </Tabs>
            </div>
      </div>
    </div>
  );
};

export default StudentProfile;
