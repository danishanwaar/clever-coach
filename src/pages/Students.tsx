import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/ui/loader";
import {
  Mail,
  Phone,
  MessageCircle,
  Edit,
  Trash2,
  ArrowRight,
  ArrowLeft,
  FileText,
  Plus,
  Search,
  UserPlus,
  User,
  MapPin,
  GraduationCap,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  Target,
} from "lucide-react";
import { useStudents, useStudentMutations, useMediationTypes, StudentStatus } from "@/hooks/useStudents";
import { useAuthStore } from "@/stores/authStore";
import { formatPhoneNumber } from "@/lib/utils";
import ActivityModal from "@/components/ActivityModal";
import { StudentFormModal } from "@/components/StudentFormModal";
import { LeadFormModal } from "@/components/LeadFormModal";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Link } from "react-router-dom";

const statusOptions = [
  "All",
  "Leads",
  "Mediation Open",
  "Partially Mediated",
  "Mediated",
  "Specialist Consulting",
  "Contracted Customers",
  "Suspended",
  "Deleted",
  "Unplaceable",
  "Waiting List",
  "Appointment Call",
  "Follow-up",
  "Appl",
  "Eng",
];

const statusColors = {
  Leads: "bg-blue-100 text-blue-800 border-blue-200",
  "Mediation Open": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Partially Mediated": "bg-orange-100 text-orange-800 border-orange-200",
  Mediated: "bg-green-100 text-green-800 border-green-200",
  "Specialist Consulting": "bg-purple-100 text-purple-800 border-purple-200",
  "Contracted Customers": "bg-emerald-100 text-emerald-800 border-emerald-200",
  Suspended: "bg-red-100 text-red-800 border-red-200",
  Deleted: "bg-red-100 text-red-800 border-red-200",
  Unplaceable: "bg-gray-100 text-gray-800 border-gray-200",
  "Waiting List": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "Appointment Call": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Follow-up": "bg-pink-100 text-pink-800 border-pink-200",
  Appl: "bg-teal-100 text-teal-800 border-teal-200",
  Eng: "bg-violet-100 text-violet-800 border-violet-200",
};

const statusIcons = {
  All: Users,
  Leads: UserPlus,
  "Mediation Open": Users,
  "Partially Mediated": Users,
  Mediated: Users,
  "Specialist Consulting": Users,
  "Contracted Customers": Users,
  Suspended: Users,
  Deleted: Users,
  Unplaceable: Users,
  "Waiting List": Users,
  "Appointment Call": Users,
  "Follow-up": Users,
  Appl: Users,
  Eng: Users,
};

// Student Card Component
interface StudentCardProps {
  student: any;
  onStatusChange: (studentId: number, newStatus: string) => void;
  onActivityClick: () => void;
  isUpdatingStatus?: boolean;
  onDeleteMediation?: (studentId: number, subjectId: number) => void;
  onIMStatusChange?: (studentId: number, imStatus: string) => void;
  mediationTypes?: any[];
}

const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onStatusChange,
  onActivityClick,
  isUpdatingStatus = false,
  onDeleteMediation,
  onIMStatusChange,
  mediationTypes = [],
}) => {
  const { user } = useAuthStore();
  const isAdmin = () => user?.fld_rid === 1;
  const subjects = student.tbl_students_subjects || [];
  // Use mediation stages from the root query (student object) instead of separate query
  const mediationStages = student.mediation_stages || [];

  const initials = `${student.fld_first_name?.[0] || ""}${student.fld_last_name?.[0] || ""}`.toUpperCase();
  const studentName = `${student.fld_first_name || ""} ${student.fld_last_name || ""}`.trim();

  // Status workflow logic
  const getStatusButtonInfo = (currentStatus: string) => {
    const statusFlow = {
      Leads: { next: "Appointment Call", label: "Schedule Call", icon: Phone, variant: "default" as const },
      "Appointment Call": {
        next: "Mediation Open",
        label: "Start Mediation",
        icon: Users,
        variant: "default" as const,
      },
      "Mediation Open": {
        next: "Partially Mediated",
        label: "Continue Mediation",
        icon: ArrowRight,
        variant: "default" as const,
      },
      "Partially Mediated": {
        next: "Mediated",
        label: "Complete Mediation",
        icon: CheckCircle,
        variant: "default" as const,
      },
      Mediated: {
        next: "Contracted Customers",
        label: "Create Contract",
        icon: UserCheck,
        variant: "default" as const,
      },
      "Specialist Consulting": {
        next: "Mediation Open",
        label: "Start Mediation",
        icon: Users,
        variant: "default" as const,
      },
      "Waiting List": { next: "Mediation Open", label: "Start Mediation", icon: Users, variant: "default" as const },
      "Follow-up": { next: "Appointment Call", label: "Schedule Call", icon: Phone, variant: "default" as const },
      Appl: { next: "Mediation Open", label: "Start Mediation", icon: Users, variant: "default" as const },
    };

    return statusFlow[currentStatus as keyof typeof statusFlow] || null;
  };

  // Check if status is final state
  const isFinalState = ["Contracted Customers", "Suspended", "Deleted"].includes(student.fld_status);

  const buttonInfo = getStatusButtonInfo(student.fld_status);

  // Build lookups: first (earliest) stage for teacher, latest stage for status
  // mediationStages are ordered by fld_id DESC (latest first)
  const firstStageBySubject: Record<number, any> = {}; // Earliest (first assigned teacher)
  const latestStageBySubject: Record<number, any> = {}; // Latest (current status)

  // Reverse iterate to get first (earliest) record, then forward for latest
  const stagesBySubject: Record<number, any[]> = {};
  for (const stage of mediationStages) {
    const ssid = stage.fld_ssid;
    if (!stagesBySubject[ssid]) {
      stagesBySubject[ssid] = [];
    }
    stagesBySubject[ssid].push(stage);
  }

  // First stage (earliest) - smallest fld_id
  // Latest stage - largest fld_id (already first in DESC order)
  for (const ssid in stagesBySubject) {
    const stages = stagesBySubject[ssid];
    if (stages.length > 0) {
      // Latest is first in DESC order
      latestStageBySubject[ssid] = stages[0];
      // First is last in DESC order (or find min fld_id)
      const firstStage = stages.reduce((earliest, current) => (current.fld_id < earliest.fld_id ? current : earliest));
      firstStageBySubject[ssid] = firstStage;
    }
  }

  // Helper to format level (remove "Level " prefix)
  const formatLevel = (level: string | null | undefined) => {
    if (!level) return "N/A";
    return level.replace(/^Level\s+/i, "");
  };

  return (
    <div
      className="bg-white rounded-md border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-150 group cursor-pointer"
      onClick={() => (window.location.href = `/students/${student.fld_id}`)}
    >
      <div className="p-2.5">
        {/* Header Row - Name, Status, Actions */}
        <div className="flex items-start justify-between gap-2.5 mb-1.5">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <div className="w-9 h-9 bg-gray-100 rounded-md flex items-center justify-center text-gray-700 font-semibold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-sm text-gray-900 truncate">{studentName}</h3>
                <Badge
                  className={`${
                    statusColors[student.fld_status as keyof typeof statusColors]
                  } text-[10px] font-medium px-1.5 py-0 flex-shrink-0`}
                >
                  {student.fld_status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                {student.fld_email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span className="truncate max-w-[200px]">{student.fld_email}</span>
                  </span>
                )}
                {student.fld_mobile && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{student.fld_mobile}</span>
                  </span>
                )}
                {student.fld_city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{student.fld_city}</span>
                  </span>
                )}
                {student.fld_level && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    <span>{formatLevel(student.fld_level)}</span>
                  </span>
                )}
                {student.fld_reg_fee && student.fld_reg_fee > 0 && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        student.fld_rf_flag === "Y" ? "bg-green-500" : "bg-orange-500"
                      }`}
                    ></div>
                    <span className="text-[11px]">Reg: {student.fld_rf_flag === "Y" ? "Paid" : "Pending"}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      student.fld_nec === "Y" || student.fld_nec === "Y"
                        ? student.contracts && student.contracts.length > 0
                          ? student.contracts.some((c) => c.fld_status === "Active")
                            ? "bg-green-500"
                            : "bg-yellow-500"
                          : "bg-red-500"
                        : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="text-[11px]">
                    Contract:{" "}
                    {student.fld_nec === "Y"
                      ? student.contracts && student.contracts.length > 0
                        ? student.contracts.some((c) => c.fld_status === "Active")
                          ? "Active"
                          : "Pending"
                        : "Needed"
                      : "Not Required"}
                  </span>
                </span>
                {student.fld_f_lead && (
                  <span className="flex items-center gap-1">
                    <UserPlus className="h-3 w-3" />
                    <span className="text-[11px]">Source: {student.fld_f_lead}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              asChild
              title="Email"
              className="h-7 w-7 p-0 hover:bg-gray-100 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <a href={`mailto:${student.fld_email}`}>
                <Mail className="h-3.5 w-3.5 text-gray-600" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              title="WhatsApp"
              className="h-7 w-7 p-0 hover:bg-gray-100 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <a
                href={`https://wa.me/${formatPhoneNumber(student.fld_mobile || "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-3.5 w-3.5 text-gray-600" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title="Activity"
              onClick={(e) => {
                e.stopPropagation();
                onActivityClick();
              }}
              className="h-7 w-7 p-0 hover:bg-gray-100 rounded"
            >
              <FileText className="h-3.5 w-3.5 text-gray-600" />
            </Button>
            {(student.fld_status === "Mediation Open" || student.fld_status === "Partially Mediated") && (
              <Button
                variant="ghost"
                size="sm"
                title="Match"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/dynamic-matcher?studentId=${student.fld_id}`;
                }}
                className="h-7 w-7 p-0 hover:bg-gray-100 rounded"
              >
                <Target className="h-3.5 w-3.5 text-gray-600" />
              </Button>
            )}
          </div>
        </div>

        {/* Info Row - Rate */}
        {student.fld_per_l_rate && (
          <div className="flex items-center gap-2.5 text-xs text-gray-600 mb-1.5 pb-1.5 border-b border-gray-100 flex-wrap">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>€{student.fld_per_l_rate}</span>
            </span>
          </div>
        )}

        {/* Subjects List - Compact */}
        {subjects.length > 0 && (
          <div className="space-y-0.5">
            {subjects.map((subject: any) => {
              const firstStage = firstStageBySubject[subject.fld_id];
              const teacher = firstStage?.tbl_teachers;
              const latestStage = latestStageBySubject[subject.fld_id];
              const stageName = latestStage?.tbl_mediation_types?.fld_stage_name;
              const stageDate = latestStage?.fld_edate;
              const mediated = !!firstStage;
              const canDelete = mediated && student.fld_status === "Mediated" && onDeleteMediation;

              return (
                <div
                  key={subject.fld_id}
                  className={`flex items-center gap-2 py-1 px-1.5 rounded text-xs ${
                    mediated ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-50"
                  } transition-colors`}
                >
                  <span className={`font-semibold min-w-[80px] ${mediated ? "text-gray-900" : "text-gray-700"}`}>
                    {subject.tbl_subjects?.fld_subject}
                  </span>
                  <div
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${mediated ? "bg-gray-600" : "bg-gray-400"}`}
                  ></div>
                  <span
                    className={`text-[11px] font-medium min-w-[90px] ${mediated ? "text-gray-700" : "text-gray-500"}`}
                  >
                    {mediated ? "Mediated" : "Not Mediated"}
                  </span>
                  {mediated && teacher && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-700 font-medium min-w-[120px] truncate">
                        {teacher.fld_first_name} {teacher.fld_last_name}
                      </span>
                    </>
                  )}
                  {mediated && teacher?.fld_phone && (
                    <>
                      <span className="text-gray-400">•</span>
                      <a
                        href={`tel:${teacher.fld_phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                        title="Call"
                      >
                        <Phone className="h-3 w-3" />
                      </a>
                    </>
                  )}
                  {mediated && teacher?.fld_email && (
                    <>
                      <span className="text-gray-400">•</span>
                      <a
                        href={`mailto:${teacher.fld_email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                        title="Email"
                      >
                        <Mail className="h-3 w-3" />
                      </a>
                    </>
                  )}
                  {canDelete && (
                    <>
                      <span className="text-gray-400">•</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 rounded flex-shrink-0"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Are you sure you want to delete this mediation?")) {
                            onDeleteMediation(student.fld_id, subject.fld_id);
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  {mediated && latestStage && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-[11px] text-gray-600">{stageName || "Pending"}</span>
                      {stageDate && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-[11px] text-gray-500">
                            {new Date(stageDate)
                              .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
                              .replace(/,/g, "")}
                          </span>
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Section - Smart Action Buttons */}
        <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-gray-100">
          {/* Status Action Button */}
          {!isFinalState && buttonInfo && (
            <Button
              variant={buttonInfo.variant}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(student.fld_id, buttonInfo.next);
              }}
              disabled={isUpdatingStatus}
              className="h-6 px-2 text-xs flex-shrink-0"
            >
              {isUpdatingStatus ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
              ) : (
                <buttonInfo.icon className="h-3 w-3 mr-1" />
              )}
              <span className="hidden sm:inline">{isUpdatingStatus ? "Processing..." : buttonInfo.label}</span>
              <span className="sm:hidden">{isUpdatingStatus ? "..." : buttonInfo.label.split(" ")[0]}</span>
            </Button>
          )}

          {/* Admin Status Dropdown */}
          {isAdmin() && (
            <Select
              value={student.fld_status}
              onValueChange={(value) => {
                if (confirm(`Are you sure you want to change status to ${value}?`)) {
                  onStatusChange(student.fld_id, value);
                }
              }}
            >
              <SelectTrigger
                className="h-6 text-xs w-auto max-w-[140px] sm:max-w-none truncate flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <SelectValue placeholder="Change Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions
                  .filter((status) => status !== "All")
                  .map((status) => {
                    const Icon = statusIcons[status as keyof typeof statusIcons] || Users;
                    return (
                      <SelectItem
                        key={status}
                        value={status}
                        disabled={status === student.fld_status}
                        className="text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-3 w-3" />
                          {status}
                        </div>
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          )}

          {/* IM Status dropdown for Specialist Consulting */}
          {student.fld_status === "Specialist Consulting" && mediationTypes && mediationTypes.length > 0 && (
            <Select onValueChange={(value) => onIMStatusChange && onIMStatusChange(student.fld_id, value)}>
              <SelectTrigger
                className="h-6 text-xs w-auto max-w-[160px] flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <SelectValue placeholder="IM Status" />
              </SelectTrigger>
              <SelectContent>
                {mediationTypes.map((mt: any) => (
                  <SelectItem key={mt.fld_id} value={String(mt.fld_id)} className="text-xs">
                    {mt.fld_stage_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
};

const Students: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<StudentStatus | "All" | "Eng">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isLeadFormModalOpen, setIsLeadFormModalOpen] = useState(false);

  const { data: studentsData, isLoading } = useStudents(selectedStatus, searchTerm);
  const students = studentsData?.data || [];
  const statusStats = studentsData?.statusCounts || {};
  const totalCount = studentsData?.totalCount || 0;
  const { data: mediationTypes = [] } = useMediationTypes();
  const { updateStatus, updateNotes, updateIMStatus, moveToMediationOpen, deleteMediation, isUpdating } =
    useStudentMutations();

  // Handle search and filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (status: StudentStatus | "All" | "Eng") => {
    setSelectedStatus(status);
  };

  const getStatusBadgeColor = (status: StudentStatus) => {
    switch (status) {
      case "Leads":
        return "bg-gray-100 text-gray-800";
      case "Mediation Open":
        return "bg-yellow-100 text-yellow-800";
      case "Partially Mediated":
        return "bg-blue-100 text-blue-800";
      case "Mediated":
        return "bg-indigo-100 text-indigo-800";
      case "Specialist Consulting":
        return "bg-green-100 text-green-800";
      case "Contracted Customers":
        return "bg-green-100 text-green-800";
      case "Suspended":
        return "bg-red-100 text-red-800";
      case "Deleted":
        return "bg-red-100 text-red-800";
      case "Unplaceable":
        return "bg-orange-100 text-orange-800";
      case "Waiting List":
        return "bg-purple-100 text-purple-800";
      case "Appointment Call":
        return "bg-cyan-100 text-cyan-800";
      case "Follow-up":
        return "bg-teal-100 text-teal-800";
      case "Appl":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStudentStatusChange = (studentId: number, newStatus: string) => {
    if (newStatus) {
      updateStatus({ studentId, status: newStatus as StudentStatus });
    }
  };

  const handleNotesChange = (studentId: number, notes: string) => {
    updateNotes({ studentId, notes });
  };

  const handleIMStatusChange = (studentId: number, imStatus: string) => {
    if (imStatus) {
      updateIMStatus({ studentId, imStatus: parseInt(imStatus) });
    }
  };

  const handleMoveToMediationOpen = (studentId: number) => {
    moveToMediationOpen(studentId);
  };

  const handleDeleteMediation = (studentId: number, subjectId: number) => {
    if (confirm("Are you sure you want to delete this mediation?")) {
      deleteMediation({ studentId, subjectId });
    }
  };

  const handleRecordActivity = (studentId: number) => {
    setSelectedStudent(studentId);
    setIsActivityModalOpen(true);
  };

  if (isLoading) {
    return <Loader message="Loading students..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">Students</h1>
          <div className="flex items-center gap-2 bg-white rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm border border-gray-200 flex-shrink-0">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">{totalCount} Total</span>
          </div>
        </div>

        {/* Status Statistics Pills - Hidden on mobile */}
        <div className="hidden sm:flex flex-wrap gap-2 justify-center sm:justify-start">
          {statusOptions.map((status) => {
            const count = statusStats[status];
            const Icon = statusIcons[status as keyof typeof statusIcons] || Users;
            const isSelected = selectedStatus === status;

            // Define icon colors based on status
            const getIconColor = (status: string) => {
              switch (status) {
                case "Leads":
                  return "text-blue-500";
                case "Mediation Open":
                  return "text-yellow-500";
                case "Partially Mediated":
                  return "text-orange-500";
                case "Mediated":
                  return "text-green-500";
                case "Specialist Consulting":
                  return "text-purple-500";
                case "Contracted Customers":
                  return "text-green-600";
                case "Suspended":
                  return "text-red-500";
                case "Deleted":
                  return "text-red-600";
                case "Unplaceable":
                  return "text-gray-500";
                case "Waiting List":
                  return "text-indigo-500";
                case "Appointment Call":
                  return "text-blue-600";
                case "Follow-up":
                  return "text-teal-500";
                case "Appl":
                  return "text-cyan-500";
                case "Eng":
                  return "text-emerald-500";
                default:
                  return "text-gray-500";
              }
            };

            return (
              <button
                key={status}
                onClick={() => handleStatusChange(status as StudentStatus | "All" | "Eng")}
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
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 border-gray-300 focus:border-primary focus:ring-primary/20"
              />
            </div>
            <Select
              value={selectedStatus}
              onValueChange={(value) => handleStatusChange(value as StudentStatus | "All" | "Eng")}
            >
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-primary focus:ring-primary/20">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status} ({statusStats[status]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={() => setIsFormModalOpen(true)} className="bg-primary hover:bg-primary/90">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
              <Button variant="outline" onClick={() => setIsLeadFormModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </div>
        </div>

        {/* Student Cards */}
        <div className="space-y-4">
          {students.map((student) => {
            if (!student) return null;

            return (
              <StudentCard
                key={student.fld_id}
                student={student}
                onStatusChange={handleStudentStatusChange}
                onActivityClick={() => {
                  setSelectedStudent(student.fld_id);
                  setIsActivityModalOpen(true);
                }}
                isUpdatingStatus={isUpdating}
                onDeleteMediation={handleDeleteMediation}
                onIMStatusChange={handleIMStatusChange}
                mediationTypes={mediationTypes}
              />
            );
          })}
        </div>

        {/* Empty State */}
        {students.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setIsFormModalOpen(true)} className="bg-primary hover:bg-primary/90">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
              <Button variant="outline" onClick={() => setIsLeadFormModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </div>
        )}

        {/* Student Activity Modal */}
        {selectedStudent && (
          <ActivityModal
            student={students.find((s) => s.fld_id === selectedStudent) || null}
            isOpen={isActivityModalOpen}
            onClose={() => {
              setIsActivityModalOpen(false);
              setSelectedStudent(null);
            }}
          />
        )}

        {/* Student Form Modal */}
        <ErrorBoundary>
          <StudentFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} />
        </ErrorBoundary>

        {/* Lead Form Modal */}
        <ErrorBoundary>
          <LeadFormModal isOpen={isLeadFormModalOpen} onClose={() => setIsLeadFormModalOpen(false)} />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default Students;
