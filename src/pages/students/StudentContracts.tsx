import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useStudentContracts, ContractEngagement } from '@/hooks/useStudentContracts';
import { useStudents, useStudent } from '@/hooks/useStudents';
import { useLevels } from '@/hooks/useLevels';
import { useSubjects } from '@/hooks/useSubjects';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Euro, 
  Clock, 
  User,
  BookOpen, 
  CheckCircle,
  XCircle, 
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Download,
  Send,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function StudentContracts() {
  const { id } = useParams<{ id: string }>();
  const studentId = parseInt(id || '0');  
  const { data: student, isLoading: studentLoading } = useStudent(studentId);
  
  const {
    getActiveContracts,
    getPendingContracts,
    createContractMutation,
    sendContractEmailMutation,
    createEngagementMutation,
    generateContractLink,
    fetchContractEngagements,
    cancelContract,
    cancelEngagement,
    updateMinimumLessons,
    isCancellingContract,
    isCancellingEngagement,
    isUpdatingMinimumLessons,
  } = useStudentContracts();

  // Use separate queries for active and pending contracts
  const { data: activeContracts = [], isLoading: activeContractsLoading } = getActiveContracts(studentId);
  const { data: pendingContracts = [], isLoading: pendingContractsLoading } = getPendingContracts(studentId);
  
  const contractsLoading = activeContractsLoading || pendingContractsLoading;

  // Memoize contract IDs for stable dependencies
  const activeContractIds = useMemo(() => {
    if (!activeContracts || !Array.isArray(activeContracts)) return '';
    return activeContracts.map(c => c.fld_id).sort((a, b) => a - b).join(',');
  }, [activeContracts]);

  const [contractEngagements, setContractEngagements] = useState<Record<number, ContractEngagement[]>>({});
  const [minimumLessons, setMinimumLessons] = useState<Record<number, number>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateEngagementDialog, setShowCreateEngagementDialog] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [engagementForm, setEngagementForm] = useState({
    fld_ssid: '',
    fld_tid: '',
    fld_t_per_lesson_rate: 0
  });
  const [contractForm, setContractForm] = useState({
    fld_ct: '',
    fld_start_date: '',
    fld_end_date: '',
    fld_p_mode: 'Überweisung' as 'Lastschrift' | 'Überweisung',
    fld_lp: 'Online' as 'Online' | 'Onsite',
    fld_lesson_dur: '',
    fld_min_lesson: 4,
    fld_reg_fee: 0,
    fld_s_per_lesson_rate: 0,
    fld_bps: 'no'
  });

  // Contract duration options
  const contractDurationOptions = [
    { value: '3', label: '3 months' },
    { value: '6', label: '6 months' },
    { value: '12', label: '12 months' },
    { value: '18', label: '18 months' },
    { value: '24', label: '24 months' }
  ];

  // Lesson duration options
  const lessonDurationOptions = [
    { value: '45', label: '45 minutes' },
    { value: '60', label: '60 minutes' },
    { value: '90', label: '90 minutes' },
    { value: '120', label: '120 minutes' }
  ];

  // Minimum lessons options
  const minimumLessonsOptions = [
    { value: 2, label: '2 lessons' },
    { value: 4, label: '4 lessons' },
    { value: 6, label: '6 lessons' },
    { value: 8, label: '8 lessons' },
    { value: 10, label: '10 lessons' }
  ];

  // Fetch student subjects for engagement creation
  const { data: studentSubjects = [] } = useQuery({
    queryKey: ['student-subjects-for-engagement', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_students_subjects')
        .select(`
          fld_id,
          fld_suid,
          tbl_subjects!fld_suid(fld_id, fld_subject)
        `)
        .eq('fld_sid', studentId);

      if (error) throw error;
      return data;
    },
    enabled: !!studentId
  });

  // Fetch teachers for engagement creation
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers-for-engagement'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_teachers')
        .select('fld_id, fld_first_name, fld_last_name, fld_status')
        .eq('fld_status', 'Hired')
        .order('fld_first_name');

      if (error) throw error;
      return data;
    }
  });

  const handleOpenCreateEngagement = (contractId: number) => {
    setSelectedContractId(contractId);
    setShowCreateEngagementDialog(true);
    setEngagementForm({
      fld_ssid: '',
      fld_tid: '',
      fld_t_per_lesson_rate: 0
    });
  };

  const handleCreateEngagement = () => {
    if (!selectedContractId || !engagementForm.fld_ssid || !engagementForm.fld_tid || !engagementForm.fld_t_per_lesson_rate) {
      toast.error('Please fill in all fields');
      return;
    }

    createEngagementMutation.mutate({
      contractId: selectedContractId,
      studentSubjectId: parseInt(engagementForm.fld_ssid),
      teacherId: parseInt(engagementForm.fld_tid),
      teacherRate: engagementForm.fld_t_per_lesson_rate
    }, {
      onSuccess: () => {
        setShowCreateEngagementDialog(false);
        setEngagementForm({
          fld_ssid: '',
          fld_tid: '',
          fld_t_per_lesson_rate: 0
        });
        setSelectedContractId(null);
        // Refresh engagements for this contract
        fetchContractEngagements(selectedContractId).then(engagements => {
          setContractEngagements(prev => ({
            ...prev,
            [selectedContractId]: engagements
          }));
        });
      }
    });
  };

  // Fetch engagements for each contract
  useEffect(() => {
    // Don't clear engagements if we're still loading
    if (activeContractsLoading || !activeContracts || !Array.isArray(activeContracts)) return;
    
    if (activeContracts.length === 0) {
      setContractEngagements({});
      return;
    }

    const fetchEngagements = async () => {
      const engagements: Record<number, ContractEngagement[]> = {};
      
      // Fetch for active contracts
      for (const contract of activeContracts) {
        try {
          const engagementsData = await fetchContractEngagements(contract.fld_id);
          engagements[contract.fld_id] = engagementsData;
        } catch (error) {
          console.error('Error fetching engagements for contract', contract.fld_id, error);
          engagements[contract.fld_id] = [];
        }
      }
      
      setContractEngagements(engagements);
    };

    fetchEngagements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeContractIds, activeContractsLoading]); // Use stable contract IDs

  // Initialize minimum lessons
  useEffect(() => {
    // Don't clear if we're still loading
    if (activeContractsLoading || !activeContracts || !Array.isArray(activeContracts)) return;
    
    if (activeContracts.length === 0) {
      setMinimumLessons({});
      return;
    }

    const initialMinimumLessons: Record<number, number> = {};
    activeContracts.forEach(contract => {
      initialMinimumLessons[contract.fld_id] = contract.fld_min_lesson;
    });
    setMinimumLessons(initialMinimumLessons);
  }, [activeContractIds, activeContractsLoading]); // Use stable contract IDs

  const handleCancelContract = (contractId: number) => {
    if (window.confirm('Are you sure you want to cancel this contract?')) {
      cancelContract(contractId);
    }
  };

  const handleCancelEngagement = (engagementId: number) => {
    if (window.confirm('Are you sure you want to cancel this engagement?')) {
      cancelEngagement({ engagementId, studentId });
    }
  };

  const handleMinimumLessonsChange = (contractId: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setMinimumLessons(prev => ({ ...prev, [contractId]: numValue }));
  };

  const handleMinimumLessonsBlur = (contractId: number) => {
    const currentValue = minimumLessons[contractId];
    if (currentValue !== undefined && currentValue !== activeContracts.find(c => c.fld_id === contractId)?.fld_min_lesson) {
      if (window.confirm('Are you sure you want to change the minimum lessons?')) {
        updateMinimumLessons({ contractId, minimumLessons: currentValue });
      }
    }
  };

  const handleCreateContract = () => {
    if (!student) return;
    
    // Validate required fields
    if (!contractForm.fld_ct || !contractForm.fld_start_date || !contractForm.fld_end_date || 
        !contractForm.fld_lesson_dur || !contractForm.fld_s_per_lesson_rate) {
      alert('Please fill in all required fields');
      return;
    }
    
    const contractData = {
      fld_sid: studentId,
      fld_ct: contractForm.fld_ct,
      fld_start_date: contractForm.fld_start_date,
      fld_end_date: contractForm.fld_end_date,
      fld_p_mode: contractForm.fld_p_mode,
      fld_lp: contractForm.fld_lp,
      fld_lesson_dur: contractForm.fld_lesson_dur,
      fld_min_lesson: contractForm.fld_min_lesson,
      fld_reg_fee: contractForm.fld_reg_fee,
      fld_s_per_lesson_rate: contractForm.fld_s_per_lesson_rate,
      fld_bps: contractForm.fld_bps
    };

    createContractMutation.mutate(contractData, {
      onSuccess: (newContract) => {
        const isBypassed = contractData.fld_bps === 'Yes';
        const message = isBypassed 
          ? 'Contract created and activated successfully!'
          : 'Contract created successfully! Email sent to student for signature.';
        
        toast.success(message);
        setShowCreateForm(false);
        setContractForm({
          fld_ct: '',
          fld_start_date: '',
          fld_end_date: '',
          fld_p_mode: 'Überweisung',
          fld_lp: 'Online',
          fld_lesson_dur: '',
          fld_min_lesson: 4,
          fld_reg_fee: 0,
          fld_s_per_lesson_rate: 0,
          fld_bps: 'no'
        });
      }
    });
  };

  const handleSendContractEmail = (contractId: number) => {
    sendContractEmailMutation.mutate(contractId);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Pending Signature':
        return 'bg-red-100 text-red-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (studentLoading || contractsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Student not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Stats Cards */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              {activeContracts.length} Active
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">
              {pendingContracts.length} Pending
            </span>
          </div>
        </div>

        {/* Create Contract Button */}
        {student.fld_status !== 'Contracted Customers' && (
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Contract
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Contract</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  <p className="font-medium mb-1">Required Fields:</p>
                  <p>Fields marked with * are required to create a contract.</p>
      </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contract-duration">Contract Duration *</Label>
                    <Select
                      value={contractForm.fld_ct}
                      onValueChange={(value) => setContractForm(prev => ({ ...prev, fld_ct: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {contractDurationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date *</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={contractForm.fld_start_date}
                      onChange={(e) => setContractForm(prev => ({ ...prev, fld_start_date: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date *</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={contractForm.fld_end_date}
                      onChange={(e) => setContractForm(prev => ({ ...prev, fld_end_date: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payment-mode">Payment Method</Label>
                    <Select
                      value={contractForm.fld_p_mode}
                      onValueChange={(value) => setContractForm(prev => ({ ...prev, fld_p_mode: value as 'Lastschrift' | 'Überweisung' }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Überweisung">Überweisung</SelectItem>
                        <SelectItem value="Lastschrift">Lastschrift</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="learning-preference">Learning Preference</Label>
                    <Select
                      value={contractForm.fld_lp}
                      onValueChange={(value) => setContractForm(prev => ({ ...prev, fld_lp: value as 'Online' | 'Onsite' }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select learning preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Onsite">Onsite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lesson-duration">Lesson Duration *</Label>
                    <Select
                      value={contractForm.fld_lesson_dur}
                      onValueChange={(value) => setContractForm(prev => ({ ...prev, fld_lesson_dur: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lesson duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {lessonDurationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minimum-lessons">Minimum Lessons per Month</Label>
                    <Select
                      value={contractForm.fld_min_lesson.toString()}
                      onValueChange={(value) => setContractForm(prev => ({ ...prev, fld_min_lesson: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select minimum lessons" />
                      </SelectTrigger>
                      <SelectContent>
                        {minimumLessonsOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registration-fee">Registration Fee (€)</Label>
                    <Input
                      id="registration-fee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={contractForm.fld_reg_fee}
                      onChange={(e) => setContractForm(prev => ({ ...prev, fld_reg_fee: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lesson-rate">Per Lesson Rate (€) *</Label>
                    <Input
                      id="lesson-rate"
                      type="number"
                      step="0.01"
                      min="0"
                      value={contractForm.fld_s_per_lesson_rate}
                      onChange={(e) => setContractForm(prev => ({ ...prev, fld_s_per_lesson_rate: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bypass-signature">Bypass Signature</Label>
                    <Select
                      value={contractForm.fld_bps}
                      onValueChange={(value) => setContractForm(prev => ({ ...prev, fld_bps: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bypass option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No (Send Email for Signature)</SelectItem>
                        <SelectItem value="Yes">Yes (Activate Immediately)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      If "Yes" is selected, contract will be activated immediately without requiring student signature.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateContract}
                    disabled={createContractMutation.isPending}
                  >
                    {createContractMutation.isPending ? 'Creating...' : 'Create Contract'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Active Contracts */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Active Contracts</h3>
            <Badge variant="secondary" className="ml-auto">
              {activeContracts.length}
            </Badge>
                    </div>
          
          {activeContracts.length > 0 ? (
            activeContracts.map((contract) => (
              <Card key={contract.fld_id} className="border border-green-200 bg-green-50/30 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        Contract #{contract.fld_id}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Euro className="h-4 w-4" />
                        <span>€{Math.round(contract.fld_s_per_lesson_rate)}/lesson</span>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {contract.fld_status}
                    </Badge>
                  </div>
                  
                  {/* Contract Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Created</span>
                      </div>
                      <p className="text-sm font-medium">{formatDate(contract.fld_edate)}</p>
                </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Duration</span>
                      </div>
                      <p className="text-sm font-medium">{contract.fld_lesson_dur}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="h-4 w-4" />
                        <span>Learning</span>
                      </div>
                      <p className="text-sm font-medium">{contract.fld_lp}</p>
                  </div>
                  
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Euro className="h-4 w-4" />
                        <span>Rate</span>
                      </div>
                      <p className="text-sm font-medium">€{Math.round(contract.fld_s_per_lesson_rate)}/lesson</p>
                    </div>
                  </div>
                  
                  {/* Minimum Lessons */}
                  <div className="space-y-2 mb-6">
                    <Label htmlFor={`min-lessons-${contract.fld_id}`} className="text-sm font-medium">
                      Minimum Lessons per Month
                    </Label>
                    <Input 
                      id={`min-lessons-${contract.fld_id}`}
                      type="number"
                      value={minimumLessons[contract.fld_id] || contract.fld_min_lesson}
                      onChange={(e) => handleMinimumLessonsChange(contract.fld_id, e.target.value)}
                      onBlur={() => handleMinimumLessonsBlur(contract.fld_id)}
                      className="w-full"
                      disabled={isUpdatingMinimumLessons}
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white"
                      onClick={() => handleOpenCreateEngagement(contract.fld_id)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Create Engagement
                    </Button>
                  </div>
                  
                  {/* Engagements */}
                  {contractEngagements[contract.fld_id] && contractEngagements[contract.fld_id].length > 0 && (
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <h5 className="text-sm font-medium text-gray-600">Engagements</h5>
                      </div>
                      {contractEngagements[contract.fld_id].map((engagement, index) => (
                        <div key={engagement.fld_id} className="p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-center justify-between mb-3">
                            <h6 className="text-sm font-medium">Engagement {index + 1}</h6>
                            <Badge variant="secondary" className="text-xs">
                              {engagement.fld_status}
                            </Badge>
                </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Teacher</span>
                              <p className="font-medium">
                                {engagement.tbl_teachers?.fld_first_name} {engagement.tbl_teachers?.fld_last_name}
                  </p>
                </div>

                            <div>
                              <span className="text-gray-600">Rate</span>
                              <p className="font-medium">€{Math.round(engagement.fld_t_per_lesson_rate)}</p>
                            </div>
                            
                            <div>
                              <span className="text-gray-600">Subject</span>
                              <p className="font-medium">
                                {engagement.tbl_students_subjects?.tbl_subjects?.fld_subject || 'N/A'}
                              </p>
                            </div>
                            
                            <div>
                              <span className="text-gray-600">Lessons</span>
                              <Badge variant="outline" className="text-xs">
                                {engagement.lesson_count || 0}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t">
                            <Button 
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelEngagement(engagement.fld_id)}
                              disabled={isCancellingEngagement}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Engagement
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Separator className="my-4" />
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelContract(contract.fld_id)}
                    disabled={isCancellingContract}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel Contract
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-600 mb-2">No Active Contracts</h4>
                <p className="text-sm text-gray-500">
                  Create a contract to get started with this student.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pending Contracts */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Pending Contracts</h3>
            <Badge variant="secondary" className="ml-auto">
              {pendingContracts.length}
            </Badge>
          </div>
          
          {pendingContracts.length > 0 ? (
            pendingContracts.map((contract) => (
              <Card key={contract.fld_id} className="border border-orange-200 bg-orange-50/30 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        Contract #{contract.fld_id}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Euro className="h-4 w-4" />
                        <span>€{Math.round(contract.fld_s_per_lesson_rate)}/lesson</span>
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                      {contract.fld_status}
                    </Badge>
                  </div>
                  
                  {/* Contract Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Created</span>
                      </div>
                      <p className="text-sm font-medium">{formatDate(contract.fld_edate)}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Duration</span>
                      </div>
                      <p className="text-sm font-medium">{contract.fld_ct}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="h-4 w-4" />
                        <span>Lesson Duration</span>
                      </div>
                      <p className="text-sm font-medium">{contract.fld_lesson_dur}</p>
                </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>Learning</span>
                      </div>
                      <p className="text-sm font-medium">{contract.fld_lp}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendContractEmail(contract.fld_id)}
                      disabled={sendContractEmailMutation.isPending}
                      className="flex-1 sm:flex-none"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sendContractEmailMutation.isPending ? 'Sending...' : 'Send Email'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleCancelContract(contract.fld_id)}
                      disabled={isCancellingContract}
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancel Contract
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-600 mb-2">No Pending Contracts</h4>
                <p className="text-sm text-gray-500">
                  All contracts are either active or completed.
                </p>
              </CardContent>
            </Card>
        )}
        </div>
      </div>

      {/* Create Engagement Dialog - Single dialog outside the map */}
      <Dialog open={showCreateEngagementDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateEngagementDialog(false);
          setSelectedContractId(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Engagement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-subject">Student Subject *</Label>
              <Select
                value={engagementForm.fld_ssid}
                onValueChange={(value) => setEngagementForm(prev => ({ ...prev, fld_ssid: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {studentSubjects.map((subject: any) => (
                    <SelectItem key={subject.fld_id} value={subject.fld_id.toString()}>
                      {subject.tbl_subjects?.fld_subject || `Subject ${subject.fld_suid}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="teacher">Teacher *</Label>
              <Select
                value={engagementForm.fld_tid}
                onValueChange={(value) => setEngagementForm(prev => ({ ...prev, fld_tid: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher: any) => (
                    <SelectItem key={teacher.fld_id} value={teacher.fld_id.toString()}>
                      {teacher.fld_first_name} {teacher.fld_last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="teacher-rate">Teacher Rate per Lesson (€) *</Label>
              <Input
                id="teacher-rate"
                type="number"
                step="0.01"
                min="0"
                value={engagementForm.fld_t_per_lesson_rate}
                onChange={(e) => setEngagementForm(prev => ({ ...prev, fld_t_per_lesson_rate: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateEngagementDialog(false);
                  setSelectedContractId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateEngagement}
                disabled={createEngagementMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {createEngagementMutation.isPending ? 'Creating...' : 'Create Engagement'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}