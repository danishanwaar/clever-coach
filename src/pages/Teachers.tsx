import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeachers, Teacher } from '@/hooks/useTeachers';
import TeacherDetailModal from '../components/TeacherDetailModal';
import ActivityModal from '../components/ActivityModal';
import { Loader } from "@/components/ui/loader";
import { Search, Mail, Phone, MessageSquare, Edit, ArrowRight, MapPin, GraduationCap, Users, DollarSign, Activity } from 'lucide-react';

const statusOptions = ['All', 'Hired', 'Inactive', 'Deleted'];

const statusColors = {
  'New': 'bg-blue-100 text-blue-800 border-blue-200',
  'Screening': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Interview': 'bg-purple-100 text-purple-800 border-purple-200',
  'Offer': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Pending For Signature': 'bg-orange-100 text-orange-800 border-orange-200',
  'Hired': 'bg-green-100 text-green-800 border-green-200',
  'Rejected': 'bg-red-100 text-red-800 border-red-200',
  'Deleted': 'bg-red-100 text-red-800 border-red-200',
  'Inactive': 'bg-gray-100 text-gray-800 border-gray-200',
  'Waiting List': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Unclear': 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusIcons = {
  'All': Users,
  'Hired': Users,
  'Inactive': Users,
  'Deleted': Users,
};

export default function Teachers() {
  const [selectedStatus, setSelectedStatus] = useState('Hired');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  const { 
    teachers, 
    teacherSubjects, 
    isLoading, 
    updateStatus,
    updateRate,
    isUpdatingStatus,
    isUpdatingRate,
    refetch
  } = useTeachers(selectedStatus);

  // Calculate status statistics
  const statusStats = useMemo(() => {
    const stats: Record<string, number> = {};
    statusOptions.forEach(status => {
      if (status === 'All') {
        stats[status] = teachers?.length || 0;
      } else {
        stats[status] = teachers?.filter(teacher => teacher.fld_status === status).length || 0;
      }
    });
    return stats;
  }, [teachers]);

  // Filter teachers based on search term and status
  const filteredTeachers = useMemo(() => {
    if (!teachers || !Array.isArray(teachers)) {
      return [];
    }

    let filtered = teachers;

    // Apply status filter
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(teacher => teacher.fld_status === selectedStatus);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(teacher =>
        teacher.fld_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.fld_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.fld_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.fld_city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [teachers, selectedStatus, searchTerm]);

  // Get subjects for a teacher
  const getTeacherSubjects = (teacherId: number) => {
    return teacherSubjects.filter(subject => subject.fld_tid === teacherId);
  };

  // Format phone number (similar to PHP function)
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return phone;
    const cleaned = phone.replace(/[\s()-]/g, '');
    if (cleaned.startsWith('0')) {
      return cleaned.replace(/^0/, '+49');
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
      console.error('Status update error:', error);
    }
  };

  // Handle rate update
  const handleRateUpdate = async (teacherId: number, newRate: number) => {
    try {
      await updateRate({ teacherId, rate: newRate });
      // Refetch data to update the UI
      refetch();
    } catch (error) {
      console.error('Rate update error:', error);
    }
  };

  if (isLoading) {
    return <Loader message="Loading teachers..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Teachers Directory</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage hired teachers and their information</p>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200 self-start sm:self-auto">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-gray-700">{teachers.length} Total</span>
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
                  onClick={() => setSelectedStatus(status)}
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
                placeholder="Search teachers by name, email, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-primary focus:ring-primary/20"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
          </div>
        </div>

        {/* Teacher Cards */}
        <div className="space-y-4">
          {filteredTeachers.map((teacher) => {
            if (!teacher) return null;
            
            const subjects = getTeacherSubjects(teacher.fld_id);
            const age = calculateAge(teacher.fld_dob);
            const initials = `${teacher.fld_first_name?.[0] || ''}${teacher.fld_last_name?.[0] || ''}`.toUpperCase();
            
            return (
              <div 
                key={teacher.fld_id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group cursor-pointer"
                onClick={() => {
                  setSelectedTeacher(teacher);
                  setIsModalOpen(true);
                }}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left Section - Teacher Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center text-primary font-bold text-lg shadow-sm flex-shrink-0 group-hover:shadow-md transition-shadow">
                        {initials}
                      </div>
                      
                      {/* Basic Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                          <h3 className="font-semibold text-lg text-gray-900 truncate">
                            {teacher.fld_first_name || ''} {teacher.fld_last_name || ''}
                          </h3>
                          <Badge className={`${statusColors[teacher.fld_status as keyof typeof statusColors]} text-xs font-medium self-start`}>
                            {teacher.fld_status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-4">{teacher.fld_email || ''}</p>
                        
                        {/* Contact Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            {teacher.fld_city || ''}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {teacher.fld_phone || ''}
                          </div>
                          {teacher.fld_per_l_rate && (
                            <div className="flex items-center text-sm text-gray-600">
                              <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                              €{teacher.fld_per_l_rate}/hour
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
                              <div key={subject.fld_id} className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 rounded-full px-3 py-1.5 text-xs font-medium border border-gray-200 hover:bg-gray-200 transition-colors">
                                <span className="font-semibold">{subject.tbl_subjects?.fld_subject}</span>
                                <span className="text-gray-500">({subject.tbl_levels?.fld_level})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Contact Actions */}
                    <div className="flex items-center justify-end lg:justify-start space-x-2 lg:ml-6">
                      <Button variant="ghost" size="sm" asChild title="Email" className="h-10 w-10 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                        <a href={`mailto:${teacher.fld_email}`}>
                          <Mail className="h-5 w-5" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" asChild title="WhatsApp" className="h-10 w-10 p-0 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors">
                        <a 
                          href={`https://web.whatsapp.com/send?phone=${formatPhoneNumber(teacher.fld_phone)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageSquare className="h-5 w-5" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" asChild title="Phone" className="h-10 w-10 p-0 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors">
                        <a href={`tel:${formatPhoneNumber(teacher.fld_phone)}`}>
                          <Phone className="h-5 w-5" />
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
                        className="h-10 w-10 p-0 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                      >
                        <Activity className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      
        {filteredTeachers.length === 0 && (
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
