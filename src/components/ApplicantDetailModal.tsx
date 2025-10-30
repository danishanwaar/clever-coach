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
import { useApplicants, Applicant, ApplicantSubject, ApplicantActivity } from '@/hooks/useApplicants';
import { Mail, Phone, MapPin, Calendar, User, GraduationCap, MessageSquare, Edit, X, Trash2, Send, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ApplicantDetailModalProps {
  applicant: Applicant | null;
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
  'Waiting List': 'bg-blue-100 text-blue-800',
  'Unclear': 'bg-gray-100 text-gray-800',
};

export default function ApplicantDetailModal({ applicant, isOpen, onClose }: ApplicantDetailModalProps) {
  const [rate, setRate] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [rateError, setRateError] = useState(false);
  const [isSendingContract, setIsSendingContract] = useState(false);

  const { 
    activityTypes, 
    applicantActivities, 
    updateStatus, 
    recordActivity,
    isUpdatingStatus,
    isRecordingActivity 
  } = useApplicants();

  // Update current status and rate when applicant changes
  useEffect(() => {
    if (applicant) {
      setCurrentStatus(applicant.fld_status);
      setRate(applicant.fld_per_l_rate && Number(applicant.fld_per_l_rate) > 0 ? applicant.fld_per_l_rate : '');
    }
  }, [applicant]);

  // Prevent auto-focus when modal opens
  useEffect(() => {
    if (isOpen) {
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [isOpen]);

  if (!applicant) return null;

  const subjects = applicant.tbl_teachers_subjects_expertise || [];
  const activities = applicantActivities.filter(activity => activity.fld_aid === applicant.fld_id);

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return phone;
    const cleaned = phone.replace(/[\s()-]/g, '');
    if (cleaned.startsWith('0')) {
      return cleaned.replace(/^0/, '+49');
    }
    return cleaned;
  };

  // Handle rate change with validation
  const handleRateChange = async (newRate: string) => {
    setRate(newRate);
    
    // Validate rate
    const rateValue = parseFloat(newRate);
    const isValid = newRate === '' || (rateValue > 0 && !isNaN(rateValue));
    setRateError(!isValid);

    // Auto-save if valid
    if (isValid && newRate && rateValue > 0) {
      try {
        await updateStatus({
          applicantId: applicant.fld_id,
          status: applicant.fld_status,
          rate: rateValue
        });
        toast.success('Rate updated successfully');
      } catch (error) {
        console.error('Rate update error:', error);
        toast.error('Failed to update rate');
      }
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    // Check if status is "Offer" and rate is empty or 0
    if (newStatus === 'Offer') {
      const rateValue = parseFloat(rate);
      if (!rate || rateValue <= 0) {
        toast.error('Please set a lesson rate before changing status to Offer');
        setRateError(true);
        return;
      }
    }

    // Update local state immediately for UI responsiveness
    setCurrentStatus(newStatus);

    try {
      await updateStatus({
        applicantId: applicant.fld_id,
        status: newStatus,
        rate: newStatus === 'Offer' ? parseFloat(rate) : undefined
      });
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update status');
    }
  };

  // Handle send contract
  const handleSendContract = async () => {
    if (currentStatus !== 'Offer') {
      toast.error('Status must be Offer to send contract');
      return;
    }

    const rateValue = parseFloat(rate);
    if (!rate || rateValue <= 0) {
      toast.error('Please set a lesson rate before sending contract');
      setRateError(true);
      return;
    }

    setIsSendingContract(true);
    try {
      await updateStatus({
        applicantId: applicant.fld_id,
        status: 'Offer',
        rate: rateValue
      });
      toast.success('Contract sent successfully');
    } catch (error) {
      console.error('Send contract error:', error);
      toast.error('Failed to send contract');
    } finally {
      setIsSendingContract(false);
    }
  };

  // Handle reject application
  const handleRejectApplication = async () => {
    try {
      await updateStatus({
        applicantId: applicant.fld_id,
        status: 'Rejected'
      });
      toast.success('Application rejected');
      onClose();
    } catch (error) {
      console.error('Reject application error:', error);
      toast.error('Failed to reject application');
    }
  };

  // Check if can send contract
  const canSendContract = currentStatus === 'Offer' && rate && parseFloat(rate) > 0;
  
  // Check if can reject
  const canReject = ['New', 'Screening', 'Interview'].includes(currentStatus);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[95vh] max-h-[95vh] p-0 flex flex-col bg-white border-0 shadow-2xl rounded-xl sm:rounded-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Applicant Details</DialogTitle>
          <DialogDescription>View and manage applicant information, status, and details</DialogDescription>
        </DialogHeader>

        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 p-3 sm:p-4 lg:p-6 flex-shrink-0 rounded-t-xl">
          {/* Status Controls */}
          <div className="flex flex-col gap-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex flex-col space-y-2 w-full sm:w-auto">
                <Label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center">
                  Per Lesson Rate
                  {currentStatus === 'Offer' && (!rate || parseFloat(rate) <= 0) && (
                    <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 ml-2 text-orange-500 flex-shrink-0" />
                  )}
                </Label>
                <Input 
                  type="number" 
                  placeholder="€/hour" 
                  className={`w-full sm:w-44 text-xs sm:text-sm rounded-lg ${
                    rateError || (currentStatus === 'Offer' && (!rate || parseFloat(rate) <= 0))
                      ? 'border-orange-500 focus:border-orange-500 focus:ring-orange-500'
                      : 'border-gray-300'
                  }`}
                  value={rate}
                  onChange={(e) => handleRateChange(e.target.value)}
                  autoFocus={false}
                />
                {rateError && (
                  <p className="text-xs text-orange-600">Please enter a valid rate</p>
                )}
              </div>
              <div className="flex flex-col space-y-2 w-full sm:w-auto">
                <Label className="text-xs sm:text-sm font-semibold text-gray-700">Status</Label>
                <Select value={currentStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full sm:w-48 text-xs sm:text-sm border-gray-300 rounded-lg">
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

          {/* Applicant Header */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center text-primary font-bold text-xl shadow-sm">
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
        </div>

        {/* Content Section */}
        <ScrollArea className="flex-1 px-4 sm:px-6 py-4 min-h-0">
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg mb-4">
              <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md text-xs sm:text-sm font-medium px-2 py-2">
                <span className="hidden sm:inline">Unterlagen</span>
                <span className="sm:hidden">Docs</span>
              </TabsTrigger>
              <TabsTrigger value="subjects" className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md text-xs sm:text-sm font-medium px-2 py-2">
                <span className="hidden sm:inline">Unterrichtsfächer</span>
                <span className="sm:hidden">Fächer</span>
              </TabsTrigger>
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md text-xs sm:text-sm font-medium px-2 py-2">
                <span className="hidden sm:inline">Überblick</span>
                <span className="sm:hidden">Überblick</span>
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0 gap-3 rounded-b-xl">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {canReject && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="text-xs sm:text-sm font-medium rounded-lg">
                    <X className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Reject Application</span>
                    <span className="sm:hidden">Reject</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Application</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reject this application? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRejectApplication} className="bg-red-600 hover:bg-red-700">
                      Reject Application
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button variant="outline" onClick={onClose} className="text-xs sm:text-sm font-medium rounded-lg">
              Close
            </Button>
            {canSendContract && (
              <Button 
                onClick={handleSendContract}
                disabled={isSendingContract || isUpdatingStatus}
                className="text-xs sm:text-sm font-medium rounded-lg bg-primary hover:bg-primary/90"
              >
                {isSendingContract ? (
                  <Loader2 className="h-4 w-4 mr-1 sm:mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-1 sm:mr-2" />
                )}
                <span className="hidden sm:inline">
                  {isSendingContract ? 'Sending...' : 'Send Contract'}
                </span>
                <span className="sm:hidden">
                  {isSendingContract ? 'Sending...' : 'Send'}
                </span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
