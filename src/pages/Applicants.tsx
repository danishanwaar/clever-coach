import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApplicants, Applicant } from "@/hooks/useApplicants";
import ApplicantDetailModal from "@/components/ApplicantDetailModal";
import { Loader } from "@/components/ui/loader";
import ActivityModal from "@/components/ActivityModal";
import { toast } from "sonner";
import { 
  Search,
  Mail,
  Phone,
  MessageSquare,
  Edit,
  Eye,
  MapPin,
  GraduationCap,
  Clock,
  Users,
  DollarSign,
  Activity,
  CheckCircle,
  Send,
  UserCheck,
  X,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const statusOptions = [
  "All",
  "New",
  "Screening",
  "Interview",
  "Offer",
  "Pending For Signature",
  "Rejected",
  "Waiting List",
  "Unclear",
];

const statusColors = {
  New: "bg-blue-100 text-blue-800 border-blue-200",
  Screening: "bg-purple-100 text-purple-800 border-purple-200",
  Interview: "bg-orange-100 text-orange-800 border-orange-200",
  Offer: "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Pending For Signature": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Hired: "bg-green-100 text-green-800 border-green-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
  Deleted: "bg-red-100 text-red-800 border-red-200",
  "Waiting List": "bg-indigo-100 text-indigo-800 border-indigo-200",
  Unclear: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusIcons = {
  All: Users,
  New: Clock,
  Screening: Users,
  Interview: Users,
  Offer: CheckCircle,
  "Pending For Signature": Send,
  Hired: Users,
  Rejected: X,
  Deleted: Users,
  "Waiting List": AlertCircle,
  Unclear: AlertCircle,
};

export default function Applicants() {
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [processingApplicantId, setProcessingApplicantId] = useState<number | null>(null);

  const { 
    applicants, 
    isLoading, 
    updateStatus, 
    isUpdatingStatus, 
    refetch,
    totalCount,
    statusCounts
  } = useApplicants(searchTerm);

  // Handle search and filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  // Get subjects for an applicant from preloaded data
  const getApplicantSubjects = (applicant: Applicant) => {
    return applicant.tbl_teachers_subjects_expertise || [];
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

  // Get next status and button info
  const getStatusButtonInfo = (currentStatus: string) => {
    const statusFlow = {
      New: { next: "Screening", label: "Move to Screening", icon: Eye, variant: "default" as const },
      Screening: { next: "Interview", label: "Move to Interview", icon: Users, variant: "default" as const },
      Interview: { next: "Offer", label: "Make Offer", icon: CheckCircle, variant: "default" as const },
      Offer: { next: "Pending For Signature", label: "Send Contract", icon: Send, variant: "default" as const },
      "Pending For Signature": { next: "Hired", label: "Mark as Hired", icon: UserCheck, variant: "default" as const },
    };

    return statusFlow[currentStatus as keyof typeof statusFlow] || null;
  };

  // Check if status change requires rate validation
  const requiresRateValidation = (currentStatus: string, nextStatus: string) => {
    return currentStatus === "Interview" && nextStatus === "Offer";
  };

  // Handle status change with validation
  const handleApplicantStatusChange = async (applicant: Applicant, nextStatus: string) => {
    // Check if rate is required for Offer status
    if (requiresRateValidation(applicant.fld_status, nextStatus)) {
      const rate = Number(applicant.fld_per_l_rate);
      if (!rate || rate <= 0) {
        toast.error("Please set lesson rate before making an offer");
        setSelectedApplicant(applicant);
        setIsModalOpen(true);
        return;
      }
    }

    setProcessingApplicantId(applicant.fld_id);
    try {
      await updateStatus({
        applicantId: applicant.fld_id,
        status: nextStatus,
        rate: nextStatus === "Offer" ? Number(applicant.fld_per_l_rate) : undefined,
      });

      // Refetch data to update the UI
      refetch();
    } finally {
      setProcessingApplicantId(null);
    }
  };

  // Handle reject action
  const handleReject = async (applicant: Applicant) => {
    setProcessingApplicantId(applicant.fld_id);
    try {
      await updateStatus({
        applicantId: applicant.fld_id,
        status: "Rejected",
      });

      // Refetch data to update the UI
      refetch();
    } finally {
      setProcessingApplicantId(null);
    }
  };

  // Handle resend contract
  const handleResendContract = async (applicant: Applicant) => {
    setProcessingApplicantId(applicant.fld_id);
    try {
      await updateStatus({
        applicantId: applicant.fld_id,
        status: "Offer",
        rate: Number(applicant.fld_per_l_rate),
      });

      // Refetch data to update the UI
      refetch();
    } finally {
      setProcessingApplicantId(null);
    }
  };

  if (isLoading) {
    return <Loader message="Loading applications..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {/* Header */}
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">Teacher Applicants</h1>
            <p className="text-sm sm:text-base text-gray-600 hidden sm:block">
                Manage teacher applications and approvals
              </p>
            </div>
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 sm:px-4 py-2 shadow-sm border border-gray-200">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-gray-700">{totalCount} Total</span>
        </div>
          </div>

        {/* Status Statistics - Hidden on mobile */}
        <div className="hidden sm:block">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {statusOptions.filter(status => status !== "All").map((status) => {
              const count = statusCounts[status] || 0;
              const Icon = statusIcons[status as keyof typeof statusIcons] || Users;
              const isSelected = selectedStatus === status;

              // Define colors for each status to match the screenshot
              const getStatusColor = (status: string) => {
                switch (status) {
                  case "New": return "text-blue-600";
                  case "Screening": return "text-purple-600";
                  case "Interview": return "text-orange-600";
                  case "Offer": return "text-green-600";
                  case "Pending For Signature": return "text-yellow-600";
                  case "Waiting List": return "text-indigo-600";
                  case "Unclear": return "text-gray-600";
                  case "Rejected": return "text-red-600";
                  default: return "text-gray-600";
                }
              };

              const statusColor = getStatusColor(status);

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
                  <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : statusColor}`} />
                  <span className="text-xs font-medium">
                    <span className="font-semibold">{count}</span> {status}
                  </span>
                </button>
              );
            })}
          </div>
          </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                placeholder="Search applicants by name, email, or city..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 border-gray-300 focus:border-primary focus:ring-primary/20 h-10 sm:h-11"
                    />
                  </div>
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-primary focus:ring-primary/20 h-10 sm:h-11">
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

        {/* Applicant Cards - Grid Layout */}
        <div className="grid grid-cols-1 gap-4">
              {applicants.map((applicant) => {
            if (!applicant) return null;

                const subjects = getApplicantSubjects(applicant);
            const initials = `${applicant.fld_first_name?.[0] || ""}${
              applicant.fld_last_name?.[0] || ""
            }`.toUpperCase();

            // Subject display logic - show only 3, then show "more" indicator
            const displaySubjects = subjects.slice(0, 3);
            const remainingCount = subjects.length - 3;
                
                return (
              <div
                key={applicant.fld_id}
                className="bg-white rounded-lg shadow-sm border-l-4 border-l-primary hover:shadow-md transition-all duration-200 group cursor-pointer"
                onClick={() => {
                  setSelectedApplicant(applicant);
                  setIsModalOpen(true);
                }}
              >
                <div className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    {/* Left Section - Applicant Info */}
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm shadow-sm flex-shrink-0">
                        {initials}
                      </div>

                      {/* Basic Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                            {applicant.fld_first_name || ""} {applicant.fld_last_name || ""}
                          </h3>
                          <Badge
                            className={`${
                              statusColors[applicant.fld_status as keyof typeof statusColors]
                            } text-xs font-medium self-start sm:self-auto`}
                          >
                            {applicant.fld_status}
                          </Badge>
                        </div>

                        {/* Contact Info - Compact */}
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <Mail className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{applicant.fld_email || ""}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{applicant.fld_city || ""}</span>
                            </div>
                            <div className="flex items-center">
                              <GraduationCap className="h-3 w-3 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{applicant.fld_education || "university-applied-sciences"}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{applicant.fld_phone || ""}</span>
                            </div>
                            {applicant.fld_per_l_rate && (
                              <div className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
                                <span>€{applicant.fld_per_l_rate}/hour</span>
            </div>
          )}
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
                                    <span className="text-gray-500 hidden sm:inline">up to grade {subject.tbl_levels?.fld_level}</span>
                                    <span className="text-gray-500 sm:hidden">({subject.tbl_levels?.fld_level})</span>
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
                          <a href={`mailto:${applicant.fld_email}`}>
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
                            href={`https://web.whatsapp.com/send?phone=${formatPhoneNumber(applicant.fld_phone)}`}
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
                          <a href={`tel:${formatPhoneNumber(applicant.fld_phone)}`}>
                          <Phone className="h-3 w-3" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                        title="Activity Tracking"
                        onClick={(e) => {
                          e.stopPropagation();
                            setSelectedApplicant(applicant);
                          setIsActivityModalOpen(true);
                          }}
                        className="h-7 w-7 p-0 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                        >
                        <Activity className="h-3 w-3" />
                        </Button>
                      </div>
              </div>

                  {/* Bottom Section - Smart Action Buttons */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 flex-wrap">
                    {/* Status Action Button */}
                    {(() => {
                      const buttonInfo = getStatusButtonInfo(applicant.fld_status);
                      const isFinalState = ["Hired", "Rejected", "Deleted"].includes(applicant.fld_status);

                      if (isFinalState || !buttonInfo) return null;

                      const IconComponent = buttonInfo.icon;

                        const isProcessing = processingApplicantId === applicant.fld_id;
                        
                        return (
                          <Button
                            variant={buttonInfo.variant}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplicantStatusChange(applicant, buttonInfo.next);
                            }}
                            disabled={isProcessing}
                            className="h-6 px-2 text-xs flex-shrink-0"
                          >
                            {isProcessing ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <IconComponent className="h-3 w-3 mr-1" />
                            )}
                            <span className="hidden sm:inline">
                              {isProcessing ? "Processing..." : buttonInfo.label}
                            </span>
                            <span className="sm:hidden">
                              {isProcessing ? "..." : buttonInfo.label.split(" ")[0]}
                            </span>
                          </Button>
                        );
                    })()}

                    {/* Resend Contract Button */}
                    {applicant.fld_status === "Pending For Signature" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResendContract(applicant);
                        }}
                        disabled={processingApplicantId === applicant.fld_id}
                        className="h-6 px-2 text-xs flex-shrink-0"
                      >
                        {processingApplicantId === applicant.fld_id ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3 mr-1" />
                        )}
                        <span className="hidden sm:inline">
                          {processingApplicantId === applicant.fld_id ? "Sending..." : "Resend Contract"}
                        </span>
                        <span className="sm:hidden">{processingApplicantId === applicant.fld_id ? "..." : "Resend"}</span>
                      </Button>
                    )}

                    {/* Reject Button */}
                    {["New", "Screening", "Interview"].includes(applicant.fld_status) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(applicant);
                        }}
                        disabled={processingApplicantId === applicant.fld_id}
                        className="h-6 px-2 text-xs flex-shrink-0"
                      >
                        {processingApplicantId === applicant.fld_id ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <X className="h-3 w-3 mr-1" />
                        )}
                        <span className="hidden sm:inline">{processingApplicantId === applicant.fld_id ? "Processing..." : "Reject"}</span>
                        <span className="sm:hidden">{processingApplicantId === applicant.fld_id ? "..." : "Reject"}</span>
                      </Button>
                    )}
                        </div>
                      </div>
                      </div>
                );
              })}
              </div>

          
          {applicants.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="text-gray-500 text-lg font-medium">
              {searchTerm || selectedStatus !== "All"
                ? "No applicants found for the selected criteria."
                : "No applicants available."}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {searchTerm || selectedStatus !== "All"
                ? "Try adjusting your search or filter settings."
                : "New applications will appear here."}
            </p>
            </div>
          )}
      </div>

      {/* Applicant Detail Modal */}
        <ApplicantDetailModal
        applicant={selectedApplicant}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedApplicant(null);
        }}
      />

      {/* Activity Modal */}
      <ActivityModal
        applicant={selectedApplicant}
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setSelectedApplicant(null);
        }}
      />
    </div>
  );
}
