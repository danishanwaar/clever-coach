import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useTeachers, Teacher, TeacherSubject, TeacherActivity } from '@/hooks/useTeachers';
import { Mail, Phone, MapPin, Calendar, User, GraduationCap, MessageSquare, Edit, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TeacherDetailModalProps {
  teacher: Teacher | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusOptions = [
  { value: 'New', label: 'New', emoji: '🆕' },
  { value: 'Screening', label: 'Screening', emoji: '👀' },
  { value: 'Interview', label: 'Interview', emoji: '💼' },
  { value: 'Offer', label: 'Offer', emoji: '💰' },
  { value: 'Pending For Signature', label: 'Pending For Signature', emoji: '📝' },
  { value: 'Hired', label: 'Hired', emoji: '✅' },
  { value: 'Rejected', label: 'Rejected', emoji: '❌' },
  { value: 'Deleted', label: 'Deleted', emoji: '🗑️' },
  { value: 'Inactive', label: 'Inactive', emoji: '⏸️' },
  { value: 'Waiting List', label: 'Waiting List', emoji: '⏳' },
  { value: 'Unclear', label: 'Unclear', emoji: '❓' }
];

const statusColors = {
  'New': 'bg-gray-100 text-gray-800',
  'Screening': 'bg-yellow-100 text-yellow-800',
  'Interview': 'bg-blue-100 text-blue-800',
  'Offer': 'bg-indigo-100 text-indigo-800',
  'Pending For Signature': 'bg-purple-100 text-purple-800',
  'Hired': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Deleted': 'bg-red-100 text-red-800',
  'Inactive': 'bg-gray-100 text-gray-800',
  'Waiting List': 'bg-blue-100 text-blue-800',
  'Unclear': 'bg-gray-100 text-gray-800',
};

export default function TeacherDetailModal({ teacher, isOpen, onClose }: TeacherDetailModalProps) {
  const [rate, setRate] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');

  const { 
    teacherActivities, 
    updateStatus, 
    recordActivity,
    isUpdatingStatus,
    isRecordingActivity 
  } = useTeachers();

  // Update current status and rate when teacher changes
  useEffect(() => {
    if (teacher) {
      setCurrentStatus(teacher.fld_status);
      setRate(teacher.fld_per_l_rate && Number(teacher.fld_per_l_rate) > 0 ? String(teacher.fld_per_l_rate) : '');
    }
  }, [teacher]);

  // Prevent auto-focus when modal opens
  useEffect(() => {
    if (isOpen) {
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [isOpen]);

  if (!teacher) return null;

  const subjects = teacher.tbl_teachers_subjects_expertise || [];
  const activities = teacherActivities.filter(activity => activity.fld_tid === teacher.fld_id);

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return phone;
    const cleaned = phone.replace(/[\s()-]/g, '');
    if (cleaned.startsWith('0')) {
      return cleaned.replace(/^0/, '+49');
    }
    return cleaned;
  };

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


  // Handle reject teacher
  const handleRejectTeacher = async () => {
    try {
      await updateStatus({
        teacherId: teacher.fld_id,
        status: 'Rejected'
      });
      toast.success('Teacher rejected');
      onClose();
    } catch (error) {
      console.error('Reject teacher error:', error);
      toast.error('Failed to reject teacher');
    }
  };

  // Handle delete teacher
  const handleDeleteTeacher = async () => {
    try {
      await updateStatus({
        teacherId: teacher.fld_id,
        status: 'Deleted'
      });
      toast.success('Teacher deleted');
      onClose();
    } catch (error) {
      console.error('Delete teacher error:', error);
      toast.error('Failed to delete teacher');
    }
  };

  // Check if can reject
  const canReject = ['New', 'Screening', 'Interview'].includes(currentStatus);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[95vh] max-h-[95vh] p-0 flex flex-col bg-white border-0 shadow-2xl rounded-xl sm:rounded-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Teacher Details</DialogTitle>
          <DialogDescription>View and manage teacher information, status, and details</DialogDescription>
        </DialogHeader>

        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 p-3 sm:p-4 lg:p-6 flex-shrink-0 rounded-t-xl">
          {/* Status Controls */}
          <div className="flex flex-col gap-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex flex-col space-y-2 w-full sm:w-auto">
                <Label className="text-xs sm:text-sm font-semibold text-gray-700">
                  Per Lesson Rate
                </Label>
                <Input 
                  type="number" 
                  placeholder="€/hour" 
                  className="w-full sm:w-44 text-xs sm:text-sm rounded-lg border-gray-300 bg-gray-50 cursor-not-allowed"
                  value={rate}
                  disabled={true}
                  autoFocus={false}
                />
              </div>
              <div className="flex flex-col space-y-2 w-full sm:w-auto">
                <Label className="text-xs sm:text-sm font-semibold text-gray-700">Status</Label>
                <Select value={currentStatus} disabled={true}>
                  <SelectTrigger className="w-full sm:w-48 text-xs sm:text-sm border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <span className="flex items-center">
                          <span className="mr-2">{status.emoji}</span>
                          {status.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Teacher Header */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center text-primary font-bold text-lg sm:text-xl shadow-sm">
                {teacher.fld_first_name?.[0]}{teacher.fld_last_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {teacher.fld_first_name} {teacher.fld_last_name}
                </h1>
                <Badge className={`mt-1 sm:mt-2 ${statusColors[currentStatus as keyof typeof statusColors]} px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-lg`}>
                  {currentStatus}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              {/* Role and Email in same row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm bg-gray-50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 border border-gray-200">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Teacher</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm bg-gray-50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 border border-gray-200">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  <span className="text-gray-700 truncate">{teacher.fld_email}</span>
                </div>
              </div>
              {/* Address separate */}
              <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm bg-gray-50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 border border-gray-200">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                <span className="text-gray-700 truncate">{teacher.fld_street}, {teacher.fld_zip} {teacher.fld_city}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <ScrollArea className="flex-1 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 min-h-0">
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg mb-3 sm:mb-4">
              <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md text-xs font-medium px-1 sm:px-2 py-1.5 sm:py-2">
                <span className="hidden sm:inline">Unterlagen</span>
                <span className="sm:hidden">Docs</span>
              </TabsTrigger>
              <TabsTrigger value="subjects" className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md text-xs font-medium px-1 sm:px-2 py-1.5 sm:py-2">
                <span className="hidden sm:inline">Unterrichtsfächer</span>
                <span className="sm:hidden">Fächer</span>
              </TabsTrigger>
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md text-xs font-medium px-1 sm:px-2 py-1.5 sm:py-2">
                <span className="hidden sm:inline">Überblick</span>
                <span className="sm:hidden">Überblick</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-3 sm:space-y-4">
              {/* Coordinates */}
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 border border-gray-200 border-l-4 border-l-primary shadow-sm">
                <Label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center mb-3 sm:mb-4">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-primary flex-shrink-0" />
                  COORDINATES
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-xs font-medium text-gray-600 mb-1 sm:mb-2 block">LATITUDE</Label>
                    <p className="text-xs sm:text-sm text-gray-600 font-mono bg-gray-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">{teacher.fld_latitude || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600 mb-1 sm:mb-2 block">LONGITUDE</Label>
                    <p className="text-xs sm:text-sm text-gray-600 font-mono bg-gray-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">{teacher.fld_longitude || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Short Introduction */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Kurze Einführung
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Bitte beschreiben Sie Ihre aktuelle Tätigkeit und erläutern Sie, warum Sie gerne Nachhilfe geben möchten.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {teacher.fld_self || 'No introduction provided'}
                  </p>
                </div>
              </div>

              {/* How did you hear about us */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                  Wie sind sie auf uns aufmerksam geworden?
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-700">{teacher.fld_source || 'Not specified'}</p>
                </div>
              </div>

              {/* Internal Rating */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                  Interne Bewertung
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-700">{teacher.fld_evaluation || 'No evaluation provided'}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="overview" className="space-y-4">
              {/* Personal Information */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <Label className="text-sm font-semibold text-gray-700">Gender</Label>
                      <p className="text-sm text-gray-700 mt-1 font-medium">{teacher.fld_gender}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <Label className="text-sm font-semibold text-gray-700">Age</Label>
                      <p className="text-sm text-gray-700 mt-1 font-medium">{calculateAge(teacher.fld_dob)} years old</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <Label className="text-sm font-semibold text-gray-700">Education</Label>
                      <p className="text-sm text-gray-700 mt-1 font-medium">{teacher.fld_education}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <Label className="text-sm font-semibold text-gray-700">Transport Mode</Label>
                      <p className="text-sm text-gray-700 mt-1 font-medium">{teacher.fld_t_mode}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <Label className="text-sm font-semibold text-gray-700">Lesson Mode</Label>
                    <p className="text-sm text-gray-700 mt-1 font-medium">{teacher.fld_l_mode}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-primary" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <Label className="text-sm font-semibold text-gray-700">Phone</Label>
                    <p className="text-sm text-gray-700 mt-1 font-medium">{teacher.fld_phone}</p>
                  </div>
                </div>
              </div>

              {/* Bio and Description */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                  Bio & Description
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <Label className="text-sm font-semibold text-gray-700">Short Bio</Label>
                    <p className="text-sm text-gray-700 mt-1">{teacher.fld_short_bio || 'No bio provided'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <Label className="text-sm font-semibold text-gray-700">Self Description</Label>
                    <p className="text-sm text-gray-700 mt-1">{teacher.fld_self || 'No description provided'}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subjects" className="space-y-4">
              <div className="space-y-4">
                {subjects.map((subject) => (
                  <div key={subject.fld_id} className="bg-white rounded-xl p-5 border border-gray-200 border-l-4 border-l-primary shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg mb-4">{subject.tbl_subjects?.fld_subject}</h4>
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-center space-x-3">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            <span className="text-sm text-gray-700 font-medium">Level: {subject.tbl_levels?.fld_level}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-primary" />
                            <span className="text-sm text-gray-700 font-medium">Experience: {subject.fld_experience} years</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

          </Tabs>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 sm:p-4 lg:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0 gap-2 sm:gap-3 rounded-b-xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {canReject && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="text-xs font-medium rounded-lg h-8 sm:h-9">
                    <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Reject Teacher</span>
                    <span className="sm:hidden">Reject</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Teacher</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reject this teacher? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRejectTeacher} className="bg-red-600 hover:bg-red-700">
                      Reject Teacher
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="text-xs font-medium rounded-lg h-8 sm:h-9">
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                  <span className="sm:hidden">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this teacher? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteTeacher} className="bg-red-600 hover:bg-red-700">
                    Delete Teacher
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <div className="flex items-center justify-end sm:justify-start">
            <Button variant="outline" onClick={onClose} className="text-xs font-medium rounded-lg h-8 sm:h-9 w-full sm:w-auto">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
