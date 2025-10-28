import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTeachers, Teacher } from "@/hooks/useTeachers";
import TeacherDetailModal from "../components/TeacherDetailModal";
import ActivityModal from "../components/ActivityModal";
import { Loader } from "@/components/ui/loader";
import {
  Search,
  Mail,
  Phone,
  MessageSquare,
  Edit,
  ArrowRight,
  ArrowLeft,
  MapPin,
  GraduationCap,
  Users,
  DollarSign,
  Activity,
} from "lucide-react";

const statusOptions = ["All", "Hired", "Inactive", "Deleted"];

const statusColors = {
  New: "bg-blue-100 text-blue-800 border-blue-200",
  Screening: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Interview: "bg-purple-100 text-purple-800 border-purple-200",
  Offer: "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Pending For Signature": "bg-orange-100 text-orange-800 border-orange-200",
  Hired: "bg-green-100 text-green-800 border-green-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
  Deleted: "bg-red-100 text-red-800 border-red-200",
  Inactive: "bg-gray-100 text-gray-800 border-gray-200",
  "Waiting List": "bg-cyan-100 text-cyan-800 border-cyan-200",
  Unclear: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusIcons = {
  All: Users,
  Hired: Users,
  Inactive: Users,
  Deleted: Users,
};

export default function Teachers() {
  const [selectedStatus, setSelectedStatus] = useState("Hired");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  const { 
    teachers, 
    isLoading, 
    updateStatus, 
    updateRate, 
    isUpdatingStatus, 
    isUpdatingRate, 
    refetch,
    totalCount,
    statusCounts
  } = useTeachers(selectedStatus, searchTerm);

  // Handle search and filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  // Get subjects for a teacher from preloaded data
  const getTeacherSubjects = (teacher: Teacher) => {
    return teacher.tbl_teachers_subjects_expertise || [];
  };

  // Format phone number (similar to PHP function)
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return phone;
    const cleaned = phone.replace(/[\s()-]/g, "");
    if (cleaned.startsWith("0")) {
      return cleaned.replace(/^0/, "+49");
    }
    return cleaned;
  };

  // Calculate age from date of birth
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Handle status update
  const handleStatusUpdate = async (teacherId: number, newStatus: string) => {
    try {
      await updateStatus({ teacherId, status: newStatus });
      // Refetch data to update the UI
      refetch();
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  // Handle rate update
  const handleRateUpdate = async (teacherId: number, newRate: number) => {
    try {
      await updateRate({ teacherId, rate: newRate });
      // Refetch data to update the UI
      refetch();
    } catch (error) {
      console.error("Rate update error:", error);
    }
  };

  if (isLoading) {
    return <Loader message="Loading teachers..." />;
  }

    return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">Teacher Directory</h1>
            <p className="text-sm sm:text-base text-gray-600 hidden sm:block">
              Manage hired teachers and their information
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 sm:px-4 py-2 shadow-sm border border-gray-200">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-gray-700">{totalCount} Total</span>
          </div>
        </div>

        {/* Status Statistics Pills - Hidden on mobile */}
        <div className="hidden sm:flex flex-wrap gap-2 justify-center sm:justify-start">
          {statusOptions.map((status) => {
            const count = statusCounts[status] || 0;
            const Icon = statusIcons[status as keyof typeof statusIcons] || Users;
            const isSelected = selectedStatus === status;

            // Define icon colors based on status
            const getIconColor = (status: string) => {
              switch (status) {
                case "Hired":
                  return "text-green-500";
                case "Inactive":
                  return "text-gray-500";
                case "Deleted":
                  return "text-red-500";
                default:
                  return "text-gray-500";
              }
            };

  return (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-sm hover:bg-primary/90"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-white" : getIconColor(status)}`} />
                <span className="text-xs font-medium">
                  <span className="font-semibold">{count}</span> {status}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search teachers by name, email, or city..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 border-gray-300 focus:border-primary focus:ring-primary/20"
              />
            </div>
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-primary focus:ring-primary/20">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status} ({statusCounts[status] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Teacher Cards */}
        <div className="space-y-4">
          {teachers.map((teacher) => {
            if (!teacher) return null;

            const subjects = getTeacherSubjects(teacher);
            const age = calculateAge(teacher.fld_dob);
            const initials = `${teacher.fld_first_name?.[0] || ""}${teacher.fld_last_name?.[0] || ""}`.toUpperCase();

            // Subject display logic - show only 3, then show "more" indicator
            const displaySubjects = subjects.slice(0, 3);
            const remainingCount = subjects.length - 3;

            return (
              <div
                key={teacher.fld_id}
                className="bg-white rounded-lg shadow-sm border-l-4 border-l-primary hover:shadow-md transition-all duration-200 group cursor-pointer"
                onClick={() => {
                  setSelectedTeacher(teacher);
                  setIsModalOpen(true);
                }}
              >
                <div className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    {/* Left Section - Teacher Info */}
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm shadow-sm flex-shrink-0">
                        {initials}
          </div>

                      {/* Basic Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                            {teacher.fld_first_name || ""} {teacher.fld_last_name || ""}
                          </h3>
                          <Badge
                            className={`${
                              statusColors[teacher.fld_status as keyof typeof statusColors]
                            } text-xs font-medium self-start sm:self-auto`}
                          >
                            {teacher.fld_status}
            </Badge>
          </div>

                        {/* Contact Info - Compact */}
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <Mail className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{teacher.fld_email || ""}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{teacher.fld_city || ""}</span>
                            </div>
                            {teacher.fld_per_l_rate && (
                              <div className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
                                <span>€{teacher.fld_per_l_rate}</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <GraduationCap className="h-3 w-3 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{teacher.fld_education || "university-applied-sciences"}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{teacher.fld_phone || ""}</span>
                            </div>
                          </div>
                        </div>

                        {/* Subjects & Levels - Compact with "more" indicator */}
                        <div className="border-t border-gray-100 pt-3">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <GraduationCap className="h-3 w-3 mr-2 text-primary flex-shrink-0" />
                            <span className="hidden sm:inline">Subjects & Levels</span>
                            <span className="sm:hidden">Subjects</span>
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {displaySubjects.length > 0 ? (
                              <>
                                {displaySubjects.map((subject) => (
                                  <div
                                    key={subject.fld_id}
                                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 rounded-full px-2 py-1 text-xs font-medium border border-gray-200"
                                  >
                                    <span className="font-semibold">{subject.tbl_subjects?.fld_subject}</span>
                                    <span className="text-gray-500">{subject.tbl_levels?.fld_level}</span>
                                  </div>
                                ))}
                                {remainingCount > 0 && (
                                  <div className="inline-flex items-center gap-1 bg-gray-200 text-gray-600 rounded-full px-2 py-1 text-xs font-medium border border-gray-300">
                                    <span>+{remainingCount} more</span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-xs text-gray-500 italic">No subjects assigned</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Contact Actions */}
                    <div className="flex items-center justify-end sm:justify-start space-x-1 flex-shrink-0 sm:self-start">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        title="Email"
                        className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={`mailto:${teacher.fld_email}`}>
                          <Mail className="h-3 w-3" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        title="WhatsApp"
                        className="h-7 w-7 p-0 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a
                          href={`https://web.whatsapp.com/send?phone=${formatPhoneNumber(teacher.fld_phone)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageSquare className="h-3 w-3" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        title="Phone"
                        className="h-7 w-7 p-0 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={`tel:${formatPhoneNumber(teacher.fld_phone)}`}>
                          <Phone className="h-3 w-3" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Activity Tracking"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTeacher(teacher);
                          setIsActivityModalOpen(true);
                        }}
                        className="h-7 w-7 p-0 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                      >
                        <Activity className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>


        {teachers.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-500 text-lg font-medium">No teachers found for the selected criteria.</div>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filter settings.</p>
        </div>
        )}
      </div>

      {/* Teacher Detail Modal */}
      <TeacherDetailModal
        teacher={selectedTeacher}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTeacher(null);
        }}
      />

      {/* Activity Modal */}
      <ActivityModal
        teacher={selectedTeacher}
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setSelectedTeacher(null);
        }}
      />
    </div>
  );
}
