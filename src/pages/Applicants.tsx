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
  Offer: DollarSign,
  "Pending For Signature": Edit,
  Hired: Users,
  Rejected: Users,
  Deleted: Users,
  "Waiting List": Users,
  Unclear: Users,
};

export default function Applicants() {
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  const { applicants, applicantSubjects, isLoading, updateStatus, isUpdatingStatus, refetch } = useApplicants();

  // Calculate status statistics
  const statusStats = useMemo(() => {
    const stats: Record<string, number> = {};
    statusOptions.forEach((status) => {
      if (status === "All") {
        stats[status] = applicants?.length || 0;
      } else {
        stats[status] = applicants?.filter((applicant) => applicant.fld_status === status).length || 0;
      }
    });
    return stats;
  }, [applicants]);

  // Filter applicants based on search term and status
  const filteredApplicants = useMemo(() => {
    if (!applicants || !Array.isArray(applicants)) {
      return [];
    }

    let filtered = applicants;

    // Apply status filter
    if (selectedStatus !== "All") {
      filtered = filtered.filter((applicant) => applicant.fld_status === selectedStatus);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (applicant) =>
          applicant.fld_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          applicant.fld_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          applicant.fld_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          applicant.fld_city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [applicants, selectedStatus, searchTerm]);

  // Get subjects for an applicant
  const getApplicantSubjects = (applicantId: number) => {
    if (!applicantSubjects || !Array.isArray(applicantSubjects)) {
      return [];
    }
    return applicantSubjects.filter((subject) => subject.fld_tid === applicantId);
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
      'New': { next: 'Screening', label: 'Move to Screening', icon: Eye, variant: 'default' as const },
      'Screening': { next: 'Interview', label: 'Move to Interview', icon: Users, variant: 'default' as const },
      'Interview': { next: 'Offer', label: 'Make Offer', icon: CheckCircle, variant: 'default' as const },
      'Offer': { next: 'Pending For Signature', label: 'Send Contract', icon: Send, variant: 'default' as const },
      'Pending For Signature': { next: 'Hired', label: 'Mark as Hired', icon: UserCheck, variant: 'default' as const },
    };
    
    return statusFlow[currentStatus as keyof typeof statusFlow] || null;
  };

  // Check if status change requires rate validation
  const requiresRateValidation = (currentStatus: string, nextStatus: string) => {
    return currentStatus === 'Interview' && nextStatus === 'Offer';
  };

  // Handle status change with validation
  const handleStatusChange = async (applicant: Applicant, nextStatus: string) => {
    // Check if rate is required for Offer status
    if (requiresRateValidation(applicant.fld_status, nextStatus)) {
      const rate = Number(applicant.fld_per_l_rate);
      if (!rate || rate <= 0) {
        toast.error('Please set lesson rate before making an offer');
        setSelectedApplicant(applicant);
        setIsModalOpen(true);
        return;
      }
    }

    await updateStatus({
      applicantId: applicant.fld_id,
      status: nextStatus,
      rate: nextStatus === 'Offer' ? Number(applicant.fld_per_l_rate) : undefined
    });
    
    // Refetch data to update the UI
    refetch();
  };

  // Handle reject action
  const handleReject = async (applicant: Applicant) => {
    await updateStatus({
      applicantId: applicant.fld_id,
      status: 'Rejected'
    });
    
    // Refetch data to update the UI
    refetch();
  };

  // Handle resend contract
  const handleResendContract = async (applicant: Applicant) => {
    await updateStatus({
      applicantId: applicant.fld_id,
      status: 'Offer',
      rate: Number(applicant.fld_per_l_rate)
    });
    
    // Refetch data to update the UI
    refetch();
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
            <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Manage teacher applications and approvals</p>
            </div>
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 sm:px-4 py-2 shadow-sm border border-gray-200">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-gray-700">{applicants.length} Total</span>
          </div>
        </div>

        {/* Status Statistics - Hidden on mobile */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hidden sm:block">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => {
              const count = statusStats[status];
              const Icon = statusIcons[status as keyof typeof statusIcons] || Users;
              const isSelected = selectedStatus === status;

              return (
                <Button
                  key={status}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                  className={`flex items-center gap-2 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
                    isSelected
                      ? "bg-primary text-white shadow-md hover:bg-primary/90"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">
                    {count} {status}
                  </span>
                  <span className="sm:hidden">{count}</span>
                </Button>
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
                      onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-primary focus:ring-primary/20 h-10 sm:h-11"
                    />
                  </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-primary focus:ring-primary/20 h-10 sm:h-11">
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
              </div>
        </div>

        {/* Applicant Cards - Grid Layout */}
        <div className="grid grid-cols-1 gap-4">
          {filteredApplicants.map((applicant) => {
            if (!applicant) return null;

            const subjects = getApplicantSubjects(applicant.fld_id);
            const initials = `${applicant.fld_first_name?.[0] || ""}${
              applicant.fld_last_name?.[0] || ""
            }`.toUpperCase();

            return (
              <div
                key={applicant.fld_id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group cursor-pointer"
                onClick={() => {
                  setSelectedApplicant(applicant);
                  setIsModalOpen(true);
                }}
              >
                <div className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left Section - Applicant Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center text-primary font-bold text-lg shadow-sm flex-shrink-0 group-hover:shadow-md transition-shadow">
                        {initials}
                      </div>

                      {/* Basic Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                          <h3 className="font-semibold text-lg text-gray-900 truncate">
                            {applicant.fld_first_name || ""} {applicant.fld_last_name || ""}
                          </h3>
                          <Badge
                            className={`${
                              statusColors[applicant.fld_status as keyof typeof statusColors]
                            } text-xs font-medium self-start`}
                          >
                            {applicant.fld_status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-4">{applicant.fld_email || ""}</p>

                        {/* Contact Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            {applicant.fld_city || ""}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {applicant.fld_phone || ""}
                          </div>
                          {applicant.fld_per_l_rate && (
                            <div className="flex items-center text-sm text-gray-600">
                              <DollarSign className="h-4 w-4 mr-2 text-gray-400" />€{applicant.fld_per_l_rate}/hour
            </div>
          )}
                        </div>

                        {/* Subjects & Levels */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <GraduationCap className="h-4 w-4 mr-2 text-primary" />
                            Subjects & Levels
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {subjects.map((subject) => (
                              <div
                                key={subject.fld_id}
                                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 rounded-full px-3 py-1.5 text-xs font-medium border border-gray-200 hover:bg-gray-200 transition-colors"
                              >
                                <span className="font-semibold">{subject.tbl_subjects?.fld_subject}</span>
                                <span className="text-gray-500">({subject.tbl_levels?.fld_level})</span>
                              </div>
                ))}
              </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Status Actions */}
                    <div className="flex flex-col lg:flex-row items-end lg:items-center space-y-2 lg:space-y-0 lg:space-x-2 lg:ml-6">
                      {/* Status Action Button */}
                      {(() => {
                        const buttonInfo = getStatusButtonInfo(applicant.fld_status);
                        const isFinalState = ['Hired', 'Rejected', 'Deleted'].includes(applicant.fld_status);
                        
                        if (isFinalState || !buttonInfo) return null;
                        
                        const IconComponent = buttonInfo.icon;
                        
                        return (
                          <Button
                            variant={buttonInfo.variant}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(applicant, buttonInfo.next);
                            }}
                            disabled={isUpdatingStatus}
                            className="min-w-[140px] sm:min-w-[160px]"
                          >
                            {isUpdatingStatus ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <IconComponent className="h-4 w-4 mr-2" />
                            )}
                            <span className="hidden sm:inline">
                              {isUpdatingStatus ? 'Processing...' : buttonInfo.label}
                            </span>
                            <span className="sm:hidden">
                              {isUpdatingStatus ? '...' : buttonInfo.label.split(' ')[0]}
                            </span>
                          </Button>
                        );
                      })()}

                      {/* Resend Contract Button */}
                      {applicant.fld_status === 'Pending For Signature' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResendContract(applicant);
                          }}
                          disabled={isUpdatingStatus}
                          className="min-w-[120px] sm:min-w-[140px]"
                        >
                          {isUpdatingStatus ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          <span className="hidden sm:inline">
                            {isUpdatingStatus ? 'Sending...' : 'Resend Contract'}
                          </span>
                          <span className="sm:hidden">
                            {isUpdatingStatus ? '...' : 'Resend'}
                          </span>
                        </Button>
                      )}

                      {/* Reject Button */}
                      {['New', 'Screening', 'Interview'].includes(applicant.fld_status) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(applicant);
                          }}
                          disabled={isUpdatingStatus}
                          className="min-w-[80px] sm:min-w-[100px]"
                        >
                          {isUpdatingStatus ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <X className="h-4 w-4 mr-2" />
                          )}
                          <span className="hidden sm:inline">
                            {isUpdatingStatus ? 'Processing...' : 'Reject'}
                          </span>
                          <span className="sm:hidden">
                            {isUpdatingStatus ? '...' : 'Reject'}
                          </span>
                        </Button>
                      )}

                      {/* Contact Actions */}
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          title="Email"
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                        >
                          <a href={`mailto:${applicant.fld_email}`}>
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          title="WhatsApp"
                          className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                        >
                          <a
                            href={`https://web.whatsapp.com/send?phone=${formatPhoneNumber(applicant.fld_phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          title="Phone"
                          className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
                        >
                          <a href={`tel:${formatPhoneNumber(applicant.fld_phone)}`}>
                            <Phone className="h-4 w-4" />
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
                          className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                        >
                          <Activity className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredApplicants.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="text-gray-500 text-lg font-medium">
              {searchTerm || selectedStatus !== 'All' 
                ? 'No applicants found for the selected criteria.' 
                : 'No applicants available.'}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {searchTerm || selectedStatus !== 'All' 
                ? 'Try adjusting your search or filter settings.' 
                : 'New applications will appear here.'}
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
