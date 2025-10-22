import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApplicants, Applicant, ApplicantSubject, ApplicantActivity } from '@/hooks/useApplicants';
import { Mail, Phone, MapPin, Calendar, User, GraduationCap, MessageSquare, Edit, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ApplicantDetailDrawerProps {
  applicant: Applicant | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusOptions = [
  'New', 'Screening', 'Interview', 'Offer', 
  'Pending For Signature', 'Hired', 'Rejected', 'Waiting List', 'Unclear'
];

const statusColors = {
  'New': 'bg-gray-100 text-gray-800',
  'Screening': 'bg-yellow-100 text-yellow-800',
  'Interview': 'bg-blue-100 text-blue-800',
  'Offer': 'bg-indigo-100 text-indigo-800',
  'Pending For Signature': 'bg-purple-100 text-purple-800',
  'Hired': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Waiting List': 'bg-blue-100 text-blue-800',
  'Unclear': 'bg-gray-100 text-gray-800',
};

export default function ApplicantDetailDrawer({ applicant, isOpen, onClose }: ApplicantDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [rate, setRate] = useState(applicant?.fld_per_l_rate || '');;
  const [currentStatus, setCurrentStatus] = useState(applicant?.fld_status || '');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityContent, setActivityContent] = useState('');

  const { 
    applicantSubjects, 
    activityTypes, 
    applicantActivities, 
    updateStatus, 
    recordActivity,
    isUpdatingStatus,
    isRecordingActivity 
  } = useApplicants();

  // Update current status when applicant changes
  useEffect(() => {
    if (applicant) {
      setCurrentStatus(applicant.fld_status);
    }
  }, [applicant]);

  // Prevent auto-focus when drawer opens
  useEffect(() => {
    if (isOpen) {
      // Remove focus from any active element
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [isOpen]);

  if (!applicant) return null;

  const subjects = applicantSubjects.filter(subject => subject.fld_tid === applicant.fld_id);
  const activities = applicantActivities.filter(activity => activity.fld_aid === applicant.fld_id);

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return phone;
    const cleaned = phone.replace(/[\s()-]/g, '');
    if (cleaned.startsWith('0')) {
      return cleaned.replace(/^0/, '+49');
    }
    return cleaned;
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    const updateData: any = { applicantId: applicant.fld_id, status: newStatus };
    if (rate) {
      updateData.rate = parseFloat(rate);
    }

    try {
      await updateStatus(updateData);
      setIsEditing(false);
      setNewStatus('');
      setRate('');
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  const handleRecordActivity = async () => {
    if (!activityTitle || !activityContent) {
      toast.error('Please fill in both title and content');
      return;
    }

    try {
      await recordActivity({
        applicantId: applicant.fld_id,
        title: activityTitle,
        content: activityContent
      });
      setActivityTitle('');
      setActivityContent('');
    } catch (error) {
      console.error('Activity recording error:', error);
    }
  };

  const handleRateChange = async (newRate: string) => {
    if (!newRate || parseFloat(newRate) === 0) {
      return;
    }

    const updateData = {
      applicantId: applicant.fld_id,
      status: applicant.fld_status,
      rate: parseFloat(newRate)
    };

    try {
      await updateStatus(updateData);
      toast.success('Rate updated successfully');
    } catch (error) {
      console.error('Rate update error:', error);
      toast.error('Failed to update rate');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    // Check if status is "Offer" and rate is 0 or empty
    const currentRate = rate || applicant.fld_per_l_rate;
    if (newStatus === 'Offer' && (!currentRate || parseFloat(currentRate.toString()) === 0)) {
      toast.error('Please set a lesson rate before changing status to Offer');
      return;
    }

    const updateData: any = { 
      applicantId: applicant.fld_id, 
      status: newStatus 
    };

    // If rate is provided, include it in the update
    if (rate && parseFloat(rate) > 0) {
      updateData.rate = parseFloat(rate);
    }

    // Update local state immediately for UI responsiveness
    setCurrentStatus(newStatus);

    // Use the hook's updateStatus function which handles all the legacy logic
    updateStatus(updateData);

    // Clear the rate field after successful update
    setRate('');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        className="!w-[100vw] sm:!w-[500px] md:!w-[600px] lg:!w-[700px] !max-w-none flex flex-col"
        style={{ 
          width: '100vw !important', 
          maxWidth: 'none !important',
          minWidth: '280px',
          height: '100vh',
          maxHeight: '100vh'
        }}
      >
        <SheetHeader className="pb-4 bg-white border-b border-gray-200 -mx-6 px-6 pt-4 flex-shrink-0">
          <SheetTitle className="sr-only">Applicant Details</SheetTitle>
          <SheetDescription className="sr-only">View and manage applicant information, status, and details</SheetDescription>
          {/* Top Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex flex-col space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Per Lesson Rate</Label>
                <Input 
                  type="number" 
                  placeholder="€/hour" 
                  className="w-44 text-sm border-gray-300 rounded-lg"
                  value={rate || (applicant.fld_per_l_rate && Number(applicant.fld_per_l_rate) > 0 ? applicant.fld_per_l_rate : '')}
                  onChange={(e) => setRate(e.target.value)}
                  onBlur={() => handleRateChange(rate)}
                  autoFocus={false}
                />
                    </div>
              <div className="flex flex-col space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Status</Label>
                <Select value={currentStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-44 text-sm border-gray-300 rounded-lg">
                    <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
            </div>
            
          </div>

          {/* Applicant Header */}
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center text-primary font-bold text-xl shadow-sm">
                {applicant.fld_first_name?.[0]}{applicant.fld_last_name?.[0]}
                    </div>
                    <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {applicant.fld_first_name} {applicant.fld_last_name}
                </h1>
                <Badge className={`mt-2 ${statusColors[currentStatus as keyof typeof statusColors]} px-3 py-1 text-sm font-semibold rounded-lg`}>
                  {currentStatus}
                </Badge>
                    </div>
                  </div>
            
            <div className="space-y-2">
              {/* Role and Email in same row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center space-x-3 text-sm bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-gray-700 font-medium">Teacher</span>
                </div>
                <div className="flex items-center space-x-3 text-sm bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-gray-700 truncate">{applicant.fld_email}</span>
                </div>
              </div>
              {/* Address separate */}
              <div className="flex items-center space-x-3 text-sm bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-gray-700 truncate">{applicant.fld_street}, {applicant.fld_zip} {applicant.fld_city}</span>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 min-h-0 [&>[data-radix-scroll-area-scrollbar]]:hidden [&>[data-radix-scroll-area-scrollbar]]:!hidden">
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg mb-4">
              <TabsTrigger value="documents" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md text-xs sm:text-sm font-medium px-2 py-2">
                <span className="hidden sm:inline">Unterlagen</span>
                <span className="sm:hidden">Docs</span>
              </TabsTrigger>
              <TabsTrigger value="subjects" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md text-xs sm:text-sm font-medium px-2 py-2">
                <span className="hidden sm:inline">Unterrichtsfächer</span>
                <span className="sm:hidden">Subjects</span>
              </TabsTrigger>
              <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md text-xs sm:text-sm font-medium px-2 py-2">
                <span className="hidden sm:inline">Überblick</span>
                <span className="sm:hidden">Overview</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-4">
              {/* Coordinates */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 border-l-4 border-l-primary shadow-sm">
                <Label className="text-sm font-semibold text-gray-700 flex items-center mb-4">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  COORDINATES
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-gray-600 mb-2 block">LATITUDE</Label>
                    <p className="text-sm text-gray-600 font-mono bg-gray-50 rounded-lg px-3 py-2">{applicant.fld_latitude || 'N/A'}</p>
                  </div>
                <div>
                    <Label className="text-xs font-medium text-gray-600 mb-2 block">LONGITUDE</Label>
                    <p className="text-sm text-gray-600 font-mono bg-gray-50 rounded-lg px-3 py-2">{applicant.fld_longitude || 'N/A'}</p>
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
                    {applicant.fld_short_bio || 'No introduction provided'}
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
                  <p className="text-sm text-gray-700">{applicant.fld_source || 'Not specified'}</p>
                </div>
              </div>

              {/* Internal Rating */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                  Interne Bewertung
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-700">{applicant.fld_evaluation || 'No evaluation provided'}</p>
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

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary" />
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <Label className="text-sm font-semibold text-gray-700">Gender</Label>
                      <p className="text-sm text-gray-700 mt-1 font-medium">{applicant.fld_gender}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <Label className="text-sm font-semibold text-gray-700">Date of Birth</Label>
                      <p className="text-sm text-gray-700 mt-1 font-medium">{new Date(applicant.fld_dob).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <Label className="text-sm font-semibold text-gray-700">Education</Label>
                      <p className="text-sm text-gray-700 mt-1 font-medium">{applicant.fld_education}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-primary" />
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <Label className="text-sm font-semibold text-gray-700">Phone</Label>
                      <p className="text-sm text-gray-700 mt-1 font-medium">{applicant.fld_phone}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <Label className="text-sm font-semibold text-gray-700">Transport Mode</Label>
                      <p className="text-sm text-gray-700 mt-1 font-medium">{applicant.fld_t_mode}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <Label className="text-sm font-semibold text-gray-700">Lesson Mode</Label>
                      <p className="text-sm text-gray-700 mt-1 font-medium">{applicant.fld_l_mode}</p>
                    </div>
                  </div>
                </div>
          </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 bg-gray-50 -mx-6 px-6 pb-4 flex-shrink-0">
          <Button variant="outline" size="sm" className="text-sm font-medium rounded-lg hover:bg-gray-50">
            Reject
          </Button>
          <Button variant="destructive" size="sm" className="text-sm font-medium rounded-lg">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}


