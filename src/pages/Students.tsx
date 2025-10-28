import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader } from '@/components/ui/loader';
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
  Target
} from 'lucide-react';
import { useStudents, useStudentSubjects, useStudentMediationStages, useStudentMutations, useMediationTypes, StudentStatus } from '@/hooks/useStudents';
import { useAuthStore } from '@/stores/authStore';
import { formatPhoneNumber } from '@/lib/utils';
import ActivityModal from '@/components/ActivityModal';
import { StudentFormModal } from '@/components/StudentFormModal';
import { LeadFormModal } from '@/components/LeadFormModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Link } from 'react-router-dom';

const statusOptions = ['All', 'Leads', 'Mediation Open', 'Partially Mediated', 'Mediated', 'Specialist Consulting', 'Contracted Customers', 'Suspended', 'Deleted', 'Unplaceable', 'Waiting List', 'Appointment Call', 'Follow-up', 'Appl', 'Eng'];

const statusColors = {
  'Leads': 'bg-blue-100 text-blue-800 border-blue-200',
  'Mediation Open': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Partially Mediated': 'bg-orange-100 text-orange-800 border-orange-200',
  'Mediated': 'bg-green-100 text-green-800 border-green-200',
  'Specialist Consulting': 'bg-purple-100 text-purple-800 border-purple-200',
  'Contracted Customers': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Suspended': 'bg-red-100 text-red-800 border-red-200',
  'Deleted': 'bg-red-100 text-red-800 border-red-200',
  'Unplaceable': 'bg-gray-100 text-gray-800 border-gray-200',
  'Waiting List': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Appointment Call': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Follow-up': 'bg-pink-100 text-pink-800 border-pink-200',
  'Appl': 'bg-teal-100 text-teal-800 border-teal-200',
  'Eng': 'bg-violet-100 text-violet-800 border-violet-200',
};

const statusIcons = {
  'All': Users,
  'Leads': UserPlus,
  'Mediation Open': Users,
  'Partially Mediated': Users,
  'Mediated': Users,
  'Specialist Consulting': Users,
  'Contracted Customers': Users,
  'Suspended': Users,
  'Deleted': Users,
  'Unplaceable': Users,
  'Waiting List': Users,
  'Appointment Call': Users,
  'Follow-up': Users,
  'Appl': Users,
  'Eng': Users,
};

// Student Card Component
interface StudentCardProps {
    student: any;
  onStatusChange: (studentId: number, newStatus: string) => void;
  onActivityClick: () => void;
  isUpdatingStatus?: boolean;
}

const StudentCard: React.FC<StudentCardProps> = ({ 
  student, 
  onStatusChange, 
  onActivityClick, 
  isUpdatingStatus = false 
}) => {
  const { user } = useAuthStore();
  const isAdmin = () => user?.fld_rid === 1;
  const subjects = student.tbl_students_subjects || [];
  
  const initials = `${student.fld_first_name?.[0] || ''}${student.fld_last_name?.[0] || ''}`.toUpperCase();
  const studentName = `${student.fld_first_name || ''} ${student.fld_last_name || ''}`.trim();
  
  // Status workflow logic
  const getStatusButtonInfo = (currentStatus: string) => {
    const statusFlow = {
      'Leads': { next: 'Appointment Call', label: 'Schedule Call', icon: Phone, variant: 'default' as const },
      'Appointment Call': { next: 'Mediation Open', label: 'Start Mediation', icon: Users, variant: 'default' as const },
      'Mediation Open': { next: 'Partially Mediated', label: 'Continue Mediation', icon: ArrowRight, variant: 'default' as const },
      'Partially Mediated': { next: 'Mediated', label: 'Complete Mediation', icon: CheckCircle, variant: 'default' as const },
      'Mediated': { next: 'Contracted Customers', label: 'Create Contract', icon: UserCheck, variant: 'default' as const },
      'Specialist Consulting': { next: 'Mediation Open', label: 'Start Mediation', icon: Users, variant: 'default' as const },
      'Waiting List': { next: 'Mediation Open', label: 'Start Mediation', icon: Users, variant: 'default' as const },
      'Follow-up': { next: 'Appointment Call', label: 'Schedule Call', icon: Phone, variant: 'default' as const },
      'Appl': { next: 'Mediation Open', label: 'Start Mediation', icon: Users, variant: 'default' as const },
    };
    
    return statusFlow[currentStatus as keyof typeof statusFlow] || null;
  };

  // Check if status is final state
  const isFinalState = ['Contracted Customers', 'Suspended', 'Deleted'].includes(student.fld_status);
  
  const buttonInfo = getStatusButtonInfo(student.fld_status);

  // Subject display logic - show only 3, then show "more" indicator
  const displaySubjects = subjects.slice(0, 3);
  const remainingCount = subjects.length - 3;
  
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border-l-4 border-l-primary hover:shadow-md transition-all duration-200 group cursor-pointer"
      onClick={() => window.location.href = `/students/${student.fld_id}`}
    >
      <div className="p-2 sm:p-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
          {/* Left Section - Student Info */}
          <div className="flex items-start space-x-2 flex-1 min-w-0">
            {/* Avatar */}
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs shadow-sm flex-shrink-0">
              {initials}
            </div>
            
            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                <h3 className="font-semibold text-sm text-gray-900 truncate">
                  {studentName}
                </h3>
                <Badge className={`${statusColors[student.fld_status as keyof typeof statusColors]} text-xs font-medium self-start sm:self-auto`}>
                  {student.fld_status}
                </Badge>
              </div>
              
              {/* Email */}
              <div className="flex items-center text-xs text-gray-600 mb-1">
                <Mail className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                <span className="truncate">{student.fld_email || ''}</span>
              </div>
              
              {/* Contact Info - Compact */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600 mb-2">
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{student.fld_city || ''}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{student.fld_mobile || ''}</span>
                </div>
                {student.fld_per_l_rate && (
                  <div className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                    <span>€{student.fld_per_l_rate}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <GraduationCap className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{student.fld_level || 'N/A'}</span>
                </div>
              </div>

              {/* Status Indicators - All in same row */}
              <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                {/* Registration Fee Status */}
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-1 flex-shrink-0 ${
                    student.fld_reg_fee && student.fld_reg_fee > 0 
                      ? (student.fld_rf_flag === 'Yes' ? 'bg-green-500' : 'bg-orange-500')
                      : 'bg-gray-400'
                  }`}></div>
                  <span>Reg Fee: {
                    student.fld_reg_fee && student.fld_reg_fee > 0 
                      ? (student.fld_rf_flag === 'Yes' ? 'Paid' : 'Pending')
                      : 'Not Set'
                  }</span>
                </div>
                
                {/* Contract Status */}
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-1 flex-shrink-0 ${
                    student.fld_nec === 'Yes' 
                      ? (student.contracts && student.contracts.length > 0 
                          ? (student.contracts.some(c => c.fld_status === 'Active') ? 'bg-green-500' : 'bg-yellow-500')
                          : 'bg-red-500')
                      : 'bg-gray-400'
                  }`}></div>
                  <span>Contract: {
                    student.fld_nec === 'Yes' 
                      ? (student.contracts && student.contracts.length > 0 
                          ? (student.contracts.some(c => c.fld_status === 'Active') ? 'Active' : 'Pending')
                          : 'Needed')
                      : 'Not Required'
                  }</span>
                </div>
                
                {/* Source */}
                <div className="flex items-center">
                  <span>Source: {student.fld_f_lead || 'Unknown'}</span>
                </div>
              </div>

              {/* Subjects & Levels - Compact with "more" indicator */}
              <div className="border-t border-gray-100 pt-2">
                <h4 className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                  <GraduationCap className="h-3 w-3 mr-1 text-primary flex-shrink-0" />
                  <span className="hidden sm:inline">Subjects & Levels</span>
                  <span className="sm:hidden">Subjects</span>
                </h4>
                <div className="flex flex-wrap gap-1">
                  {displaySubjects.length > 0 ? (
                    <>
                      {displaySubjects.map((subject) => (
                        <div key={subject.fld_id} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs font-medium border border-gray-200">
                          <span className="font-semibold">{subject.tbl_subjects?.fld_subject}</span>
                          <span className="text-gray-500 hidden sm:inline">{student.fld_level || 'N/A'}</span>
                          <span className="text-gray-500 sm:hidden">({student.fld_level || 'N/A'})</span>
                        </div>
                      ))}
                      {remainingCount > 0 && (
                        <div className="inline-flex items-center gap-1 bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 text-xs font-medium border border-gray-300">
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
          <div className="flex items-center justify-end sm:justify-start space-x-0.5 flex-shrink-0 sm:self-start">
            <Button variant="ghost" size="sm" asChild title="Email" className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors" onClick={(e) => e.stopPropagation()}>
              <a href={`mailto:${student.fld_email}`}>
                <Mail className="h-3 w-3" />
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild title="WhatsApp" className="h-6 w-6 p-0 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors" onClick={(e) => e.stopPropagation()}>
              <a href={`https://wa.me/${formatPhoneNumber(student.fld_mobile || '')}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-3 w-3" />
              </a>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              title="Activity Tracking"
              onClick={(e) => {
                e.stopPropagation();
                onActivityClick();
              }}
              className="h-6 w-6 p-0 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
            >
              <FileText className="h-3 w-3" />
            </Button>
            {/* Dynamic Matcher Button - Only show for Mediation Open and Partially Mediated students */}
            {(student.fld_status === 'Mediation Open' || student.fld_status === 'Partially Mediated') && (
              <Button 
                variant="ghost" 
                size="sm" 
                title="Dynamic Matcher"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/dynamic-matcher?studentId=${student.fld_id}`;
                }}
                className="h-6 w-6 p-0 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
              >
                <Target className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Bottom Section - Smart Action Buttons */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
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
              className="h-6 px-2 text-xs flex-shrink"
            >
              {isUpdatingStatus ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
              ) : (
                <buttonInfo.icon className="h-3 w-3 mr-1" />
              )}
              <span className="hidden sm:inline">
                {isUpdatingStatus ? 'Processing...' : buttonInfo.label}
              </span>
              <span className="sm:hidden">
                {isUpdatingStatus ? '...' : buttonInfo.label.split(' ')[0]}
              </span>
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
              <SelectTrigger className="h-6 text-xs w-auto max-w-[140px] sm:max-w-none truncate" onClick={(e) => e.stopPropagation()}>
                <SelectValue placeholder="Change Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.filter(status => status !== 'All').map((status) => {
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
        </div>
      </div>
    </div>
  );
};

const Students: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<StudentStatus | 'All' | 'Eng'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isLeadFormModalOpen, setIsLeadFormModalOpen] = useState(false);

  const { data: studentsData, isLoading } = useStudents(selectedStatus, searchTerm);
  const students = studentsData?.data || [];
  const statusStats = studentsData?.statusCounts || {};
  const totalCount = studentsData?.totalCount || 0;
  const { data: mediationTypes = [] } = useMediationTypes();
  const { updateStatus, updateNotes, updateIMStatus, moveToMediationOpen, deleteMediation, isUpdating } = useStudentMutations();

  // Get subjects for a student
  const getStudentSubjects = (studentId: number) => {
    // This would need to be implemented based on your data structure
    return [];
  };

  // Handle search and filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (status: StudentStatus | 'All' | 'Eng') => {
    setSelectedStatus(status);
  };

  const getStatusBadgeColor = (status: StudentStatus) => {
    switch (status) {
      case 'Leads': return 'bg-gray-100 text-gray-800';
      case 'Mediation Open': return 'bg-yellow-100 text-yellow-800';
      case 'Partially Mediated': return 'bg-blue-100 text-blue-800';
      case 'Mediated': return 'bg-indigo-100 text-indigo-800';
      case 'Specialist Consulting': return 'bg-green-100 text-green-800';
      case 'Contracted Customers': return 'bg-green-100 text-green-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      case 'Deleted': return 'bg-red-100 text-red-800';
      case 'Unplaceable': return 'bg-orange-100 text-orange-800';
      case 'Waiting List': return 'bg-purple-100 text-purple-800';
      case 'Appointment Call': return 'bg-cyan-100 text-cyan-800';
      case 'Follow-up': return 'bg-teal-100 text-teal-800';
      case 'Appl': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
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
    if (confirm('Are you sure you want to delete this mediation?')) {
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
                case 'Leads': return 'text-blue-500';
                case 'Mediation Open': return 'text-yellow-500';
                case 'Partially Mediated': return 'text-orange-500';
                case 'Mediated': return 'text-green-500';
                case 'Specialist Consulting': return 'text-purple-500';
                case 'Contracted Customers': return 'text-green-600';
                case 'Suspended': return 'text-red-500';
                case 'Deleted': return 'text-red-600';
                case 'Unplaceable': return 'text-gray-500';
                case 'Waiting List': return 'text-indigo-500';
                case 'Appointment Call': return 'text-blue-600';
                case 'Follow-up': return 'text-teal-500';
                case 'Appl': return 'text-cyan-500';
                case 'Eng': return 'text-emerald-500';
                default: return 'text-gray-500';
              }
            };

            return (
              <button
                key={status}
                onClick={() => handleStatusChange(status as StudentStatus | 'All' | 'Eng')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-sm hover:bg-primary/90"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : getIconColor(status)}`} />
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
            <Select value={selectedStatus} onValueChange={(value) => handleStatusChange(value as StudentStatus | 'All' | 'Eng')}>
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
            student={students.find(s => s.fld_id === selectedStudent) || null}
            isOpen={isActivityModalOpen}
            onClose={() => {
              setIsActivityModalOpen(false);
              setSelectedStudent(null);
            }}
          />
        )}

        {/* Student Form Modal */}
        <ErrorBoundary>
          <StudentFormModal
            isOpen={isFormModalOpen}
            onClose={() => setIsFormModalOpen(false)}
          />
        </ErrorBoundary>

        {/* Lead Form Modal */}
        <ErrorBoundary>
          <LeadFormModal
            isOpen={isLeadFormModalOpen}
            onClose={() => setIsLeadFormModalOpen(false)}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default Students;