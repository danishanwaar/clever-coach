import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Phone, 
  ArrowLeft,
  User,
  FileText,
  FileCheck,
  Settings,
  DollarSign,
  Users,
  Clock,
  StickyNote,
  Download,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { formatPhoneNumber } from "@/lib/utils";
import { useTeacher, Teacher } from "@/hooks/useTeacherProfile";
import TeacherProfileTab from "./TeacherProfileTab";
import TeacherDocuments from "./TeacherDocuments";
import TeacherContracts from "./TeacherContracts";
import TeacherFinancials from "./TeacherFinancials";
import TeacherProgressNotes from "./TeacherProgressNotes";
import TeacherStudents from "./TeacherStudents";
import TeacherTimeLogs from "./TeacherTimeLogs";
import TeacherSettings from "./TeacherSettings";
import TeacherContractDownload from "./TeacherContractDownload";

const TeacherProfile: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
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
      navigate(`/teacher/profile`);
    } else {
      navigate(`/teacher/profile/${newTab}`);
    }
  };

  // Fetch teacher data
  const { data: teacher, isLoading: teacherLoading } = useTeacher(user?.fld_id);
  
  if (teacherLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading teacher profile...</p>
        </div>
      </div>
    );
  }
  
  if (!teacher) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load your teacher profile.</p>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
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

  const teacherId = `T${teacher.fld_id}`;

  return (
    <>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Teacher Header */}
        <div className="bg-white rounded-lg shadow-sm border-0 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {teacher.fld_pimage ? (
                <img 
                  src={teacher.fld_pimage} 
                  alt={`${teacher.fld_first_name} ${teacher.fld_last_name}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-primary text-xl sm:text-2xl font-bold">
                  {teacher.fld_first_name[0]}{teacher.fld_last_name[0]}
                </span>
              )}
            </div>

            {/* Teacher Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {teacher.fld_first_name} {teacher.fld_last_name}
                </h1>
                <Badge className={`${teacher.fld_status === 'Hired' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} text-xs font-medium self-start sm:self-center`}>
                  {teacher.fld_status}
                </Badge>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-2">
                Teacher ID: {teacherId}
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <a 
                  href={`mailto:${teacher.fld_email}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">{teacher.fld_email}</span>
                </a>
                {teacher.fld_phone && (
                  <a 
                    href={`https://web.whatsapp.com/send?phone=${formatPhoneForWhatsApp(teacher.fld_phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="hidden sm:inline">{formatPhoneNumber(teacher.fld_phone)}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="w-full">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <div className="overflow-x-auto">
              <TabsList className="flex w-max min-w-full bg-gray-100 p-1 rounded-lg lg:w-full lg:justify-between">
                <TabsTrigger
                  value="profile"
                  className="flex items-center justify-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap lg:flex-1"
                >
                  <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="flex items-center justify-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap lg:flex-1"
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span>Documents</span>
                </TabsTrigger>
                <TabsTrigger
                  value="contracts"
                  className="flex items-center justify-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap lg:flex-1"
                >
                  <FileCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span>Contracts</span>
                </TabsTrigger>
                <TabsTrigger
                  value="students"
                  className="flex items-center justify-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap lg:flex-1"
                >
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span>Students</span>
                </TabsTrigger>
                <TabsTrigger
                  value="time-logs"
                  className="flex items-center justify-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap lg:flex-1"
                >
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span>Time Logs</span>
                </TabsTrigger>
                <TabsTrigger
                  value="financials"
                  className="flex items-center justify-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap lg:flex-1"
                >
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span>Financials</span>
                </TabsTrigger>
                <TabsTrigger
                  value="progress-notes"
                  className="flex items-center justify-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap lg:flex-1"
                >
                  <StickyNote className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span>Notes</span>
                </TabsTrigger>
                <TabsTrigger
                  value="contract-download"
                  className="flex items-center justify-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap lg:flex-1"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span>Contract</span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center justify-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary whitespace-nowrap lg:flex-1"
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span>Settings</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profile" className="space-y-4 sm:space-y-6 mt-6">
              <TeacherProfileTab teacher={teacher} teacherId={teacherId} />
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 sm:space-y-6 mt-6">
              <TeacherDocuments />
            </TabsContent>

            <TabsContent value="contracts" className="space-y-4 sm:space-y-6 mt-6">
              <TeacherContracts />
            </TabsContent>

            <TabsContent value="students" className="space-y-4 sm:space-y-6 mt-6">
              <TeacherStudents />
            </TabsContent>

            <TabsContent value="time-logs" className="space-y-4 sm:space-y-6 mt-6">
              <TeacherTimeLogs />
            </TabsContent>

            <TabsContent value="financials" className="space-y-4 sm:space-y-6 mt-6">
              <TeacherFinancials />
            </TabsContent>

            <TabsContent value="progress-notes" className="space-y-4 sm:space-y-6 mt-6">
              <TeacherProgressNotes />
            </TabsContent>

            <TabsContent value="contract-download" className="space-y-4 sm:space-y-6 mt-6">
              <TeacherContractDownload />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 sm:space-y-6 mt-6">
              <TeacherSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default TeacherProfile;
