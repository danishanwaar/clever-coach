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
  UserCheck
} from 'lucide-react';
import { useStudents, useStudentSubjects, useStudentMediationStages, useStudentMutations, useMediationTypes, StudentStatus } from '@/hooks/useStudents';
import { useAuth } from '@/hooks/useAuth';
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
  const { data: subjects = [] } = useStudentSubjects(student.fld_id);
  const { user, isAdmin } = useAuth();
  
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

  // Subject display logic - show only 2, then show "more" indicator
  const displaySubjects = subjects.slice(0, 2);
  const remainingCount = subjects.length - 2;
  
  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group cursor-pointer"
      onClick={() => window.location.href = `/students/${student.fld_id}`}
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left Section - Student Info */}
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {/* Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center text-primary font-bold text-sm shadow-sm flex-shrink-0 group-hover:shadow-md transition-shadow">
              {initials}
            </div>
            
            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-base text-gray-900 truncate">
                  {studentName}
                </h3>
                <Badge className={`${statusColors[student.fld_status as keyof typeof statusColors]} text-xs font-medium flex-shrink-0`}>
                  {student.fld_status}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 truncate mb-2">{student.fld_email || ''}</p>
              
              {/* Contact Info - Compact */}
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center text-xs text-gray-600">
                  <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                  {student.fld_city || ''}
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <Phone className="h-3 w-3 mr-1 text-gray-400" />
                  {student.fld_mobile || ''}
                </div>
              </div>

              {/* Subjects & Levels - Compact with "more" indicator */}
              <div className="flex flex-wrap gap-1">
                {displaySubjects.length > 0 ? (
                  <>
                    {displaySubjects.map((subject) => (
                      <div key={subject.fld_id} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 rounded-full px-2 py-1 text-xs font-medium border border-gray-200">
                        <span className="font-semibold">{subject.tbl_subjects?.fld_subject}</span>
                        <span className="text-gray-500">({student.fld_level || 'N/A'})</span>
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

          {/* Right Section - Contact Actions */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Button variant="ghost" size="sm" asChild title="Email" className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors" onClick={(e) => e.stopPropagation()}>
              <a href={`mailto:${student.fld_email}`}>
                <Mail className="h-3 w-3" />
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild title="WhatsApp" className="h-7 w-7 p-0 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors" onClick={(e) => e.stopPropagation()}>
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
              className="h-7 w-7 p-0 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
            >
              <FileText className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Bottom Section - Status Controls */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
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
              className="h-7 px-3 text-xs"
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
              <SelectTrigger className="w-40 h-7 text-xs" onClick={(e) => e.stopPropagation()}>
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

  const { data: students = [], isLoading } = useStudents(selectedStatus);
  const { data: mediationTypes = [] } = useMediationTypes();
  const { updateStatus, updateNotes, updateIMStatus, moveToMediationOpen, deleteMediation, isUpdating } = useStudentMutations();

  // Get subjects for a student
  const getStudentSubjects = (studentId: number) => {
    // This would need to be implemented based on your data structure
    return [];
  };

  // Calculate status statistics
  const statusStats = useMemo(() => {
    const stats: Record<string, number> = {};
    statusOptions.forEach(status => {
      if (status === 'All') {
        stats[status] = students?.length || 0;
      } else {
        stats[status] = students?.filter(student => student.fld_status === status).length || 0;
      }
    });
    return stats;
  }, [students]);

  // Filter students based on search term and status
  const filteredStudents = useMemo(() => {
    if (!students || !Array.isArray(students)) {
      return [];
    }

    let filtered = students;

    // Apply status filter
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(student => student.fld_status === selectedStatus);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        `${student.fld_first_name} ${student.fld_last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${student.fld_s_first_name} ${student.fld_s_last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.fld_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.fld_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.fld_zip.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [students, selectedStatus, searchTerm]);

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

  const handleStatusChange = (studentId: number, newStatus: string) => {
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Students</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage all students in the platform</p>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200 self-start sm:self-auto">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-gray-700">{students.length} Total</span>
          </div>
            </div>

        {/* Status Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
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
                  onClick={() => setSelectedStatus(status as StudentStatus | 'All' | 'Eng')}
                  className={`flex items-center gap-2 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
                    isSelected 
                      ? 'bg-primary text-white shadow-md hover:bg-primary/90' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{count} {status}</span>
                  <span className="sm:hidden">{count}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as StudentStatus | 'All' | 'Eng')}>
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
          {filteredStudents.map((student) => {
            if (!student) return null;
            
            return (
              <StudentCard
                key={student.fld_id}
                student={student}
                onStatusChange={handleStatusChange}
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
        {filteredStudents.length === 0 && (
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