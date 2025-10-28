import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStudentContracts, ContractEngagement } from '@/hooks/useStudentContracts';
import { useStudents, useStudent } from '@/hooks/useStudents';
import { useLevels } from '@/hooks/useLevels';
import { useSubjects } from '@/hooks/useSubjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
  Send
} from 'lucide-react';
import { format } from 'date-fns';

export default function StudentContracts() {
  const { id } = useParams<{ id: string }>();
  const studentId = parseInt(id || '0');  
  const { data: student, isLoading: studentLoading } = useStudent(studentId);
  
  const {
    getStudentContracts,
    createContractMutation,
    sendContractEmailMutation,
    generateContractLink,
    fetchContractEngagements,
    cancelContract,
    cancelEngagement,
    updateMinimumLessons,
    isLoading,
    isCancellingContract,
    isCancellingEngagement,
    isUpdatingMinimumLessons,
  } = useStudentContracts();

  const { data: contracts = [], isLoading: contractsLoading } = getStudentContracts(studentId);
  const activeContracts = contracts.filter(c => c.fld_status === 'Active');
  const pendingContracts = contracts.filter(c => c.fld_status === 'Pending Signature');

  const [contractEngagements, setContractEngagements] = useState<Record<number, ContractEngagement[]>>({});
  const [minimumLessons, setMinimumLessons] = useState<Record<number, number>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
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
    fld_bps: ''
  });

  // Fetch engagements for each contract
  useEffect(() => {
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

    if (activeContracts.length > 0) {
      fetchEngagements();
    }
  }, [activeContracts.map(c => c.fld_id).join(',')]); // Use contract IDs as dependency

  // Initialize minimum lessons
  useEffect(() => {
    const initialMinimumLessons: Record<number, number> = {};
    activeContracts.forEach(contract => {
      initialMinimumLessons[contract.fld_id] = contract.fld_min_lesson;
    });
    setMinimumLessons(initialMinimumLessons);
  }, [activeContracts.map(c => c.fld_id).join(',')]); // Use contract IDs as dependency

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
          fld_bps: ''
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

  if (studentLoading || isLoading) {
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
      {/* Header */}
      <div className="flex items-center justify-end mb-4">
        {student.fld_status !== 'Contracted Customers' && (
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center px-3 py-2 primary rounded-md text-sm"
          >
            <Plus className="h-4 w-4" />
                Create Contract
              </Button>
        )}
      </div>

      {/* Contract Creation Form */}
      {showCreateForm && (
        <Card>
              <CardHeader>
                <CardTitle>Create New Contract</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Contract Duration (months)</label>
                    <Input
                  type="text"
                  value={contractForm.fld_ct}
                  onChange={(e) => setContractForm(prev => ({ ...prev, fld_ct: e.target.value }))}
                      placeholder="e.g., 6"
                    />
                  </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                    <Input
                      type="date"
                  value={contractForm.fld_start_date}
                  onChange={(e) => setContractForm(prev => ({ ...prev, fld_start_date: e.target.value }))}
                    />
                  </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                    <Input
                      type="date"
                  value={contractForm.fld_end_date}
                  onChange={(e) => setContractForm(prev => ({ ...prev, fld_end_date: e.target.value }))}
                    />
                  </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={contractForm.fld_p_mode}
                  onChange={(e) => setContractForm(prev => ({ ...prev, fld_p_mode: e.target.value as 'Lastschrift' | 'Überweisung' }))}
                >
                  <option value="Überweisung">Überweisung</option>
                  <option value="Lastschrift">Lastschrift</option>
                </select>
                  </div>
              <div>
                <label className="block text-sm font-medium mb-1">Learning Preference</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={contractForm.fld_lp}
                  onChange={(e) => setContractForm(prev => ({ ...prev, fld_lp: e.target.value as 'Online' | 'Onsite' }))}
                >
                  <option value="Online">Online</option>
                  <option value="Onsite">Onsite</option>
                </select>
                  </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lesson Duration</label>
                <Input
                  type="text"
                  value={contractForm.fld_lesson_dur}
                  onChange={(e) => setContractForm(prev => ({ ...prev, fld_lesson_dur: e.target.value }))}
                  placeholder="e.g., 60 minutes"
                />
                  </div>
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Lessons per Month</label>
                    <Input
                      type="number"
                  value={contractForm.fld_min_lesson}
                  onChange={(e) => setContractForm(prev => ({ ...prev, fld_min_lesson: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
              <div>
                <label className="block text-sm font-medium mb-1">Registration Fee (€)</label>
                    <Input
                      type="number"
                  value={contractForm.fld_reg_fee}
                  onChange={(e) => setContractForm(prev => ({ ...prev, fld_reg_fee: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
              <div>
                <label className="block text-sm font-medium mb-1">Per Lesson Rate (€)</label>
                    <Input
                      type="number"
                  value={contractForm.fld_s_per_lesson_rate}
                  onChange={(e) => setContractForm(prev => ({ ...prev, fld_s_per_lesson_rate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bypass Signature</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={contractForm.fld_bps}
                  onChange={(e) => setContractForm(prev => ({ ...prev, fld_bps: e.target.value }))}
                >
                  <option value="">No</option>
                  <option value="Yes">Yes</option>
                </select>
                  </div>
                </div>
            <div className="flex justify-end space-x-2">
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
              </CardContent>
            </Card>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Active Contracts */}
        <div className="space-y-4">
          {activeContracts.length > 0 ? (
            activeContracts.map((contract) => (
              <Card key={contract.fld_id} className="border border-gray-400">
                <CardContent className="p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                    Contract # {contract.fld_id} - €{Math.round(contract.fld_s_per_lesson_rate)}/lesson
                  </h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <span className="text-sm font-medium">Date</span>
                      </div>
                      <div className="text-gray-600">
                        {formatDate(contract.fld_edate)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                        <span className="text-sm font-medium">Lesson Duration</span>
                      </div>
                      <div className="text-gray-600">
                        {contract.fld_lesson_dur}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <span className="text-sm font-medium">Learning Preference</span>
                  </div>
                      <div className="text-gray-600">
                        {contract.fld_lp}
                  </div>
                </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <span className="text-sm font-medium">Lesson Rate</span>
                      </div>
                      <div className="text-gray-600">
                        €{Math.round(contract.fld_s_per_lesson_rate)} / lesson
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <span className="text-sm font-medium">Minimum Lessons</span>
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          value={minimumLessons[contract.fld_id] || contract.fld_min_lesson}
                          onChange={(e) => handleMinimumLessonsChange(contract.fld_id, e.target.value)}
                          onBlur={() => handleMinimumLessonsBlur(contract.fld_id)}
                          className="w-full"
                          disabled={isUpdatingMinimumLessons}
                        />
                      </div>
                  </div>
                  
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <span className="text-sm font-medium">Status</span>
                      </div>
                      <div>
                        <Badge className="bg-green-100 text-green-800">
                          {contract.fld_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Link 
                      to={`/students/${studentId}/create-engagement?contractId=${contract.fld_id}`}
                      className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                      Create Engagement
                    </Link>
                  </div>
                  
                  {/* Engagements */}
                  {contractEngagements[contract.fld_id] && contractEngagements[contract.fld_id].length > 0 && (
                    <div className="mt-6">
                      {contractEngagements[contract.fld_id].map((engagement, index) => (
                        <div key={engagement.fld_id} className="mb-4">
                          <div className="mb-3 sm:mb-4 px-4 sm:px-5">
                            <h5 className="text-lg font-medium">Engagement {index + 1}</h5>
                          </div>
                          
                          <div className="px-4 sm:px-8 space-y-3 sm:space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <span className="text-sm font-medium">Teacher Name</span>
                    </div>
                              <div className="text-gray-600">
                                {engagement.tbl_teachers?.fld_first_name} {engagement.tbl_teachers?.fld_last_name}
                  </div>
                </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <span className="text-sm font-medium">Teacher Rate</span>
                  </div>
                              <div className="text-gray-600">
                                €{Math.round(engagement.fld_t_per_lesson_rate)}
                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <span className="text-sm font-medium">Lesson Logged</span>
                              </div>
                              <div className="text-gray-600">
                                <Badge className="bg-blue-100 text-blue-800">
                                  {engagement.lesson_count || 0}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <span className="text-sm font-medium">Subject</span>
                              </div>
                              <div className="text-gray-600">
                                {engagement.tbl_students_subjects?.tbl_subjects?.fld_subject}
                            </div>
                          </div>
                          
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <span className="text-sm font-medium">Status</span>
                              </div>
                              <div>
                                <Badge className="bg-green-100 text-green-800">
                                  {engagement.fld_status}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <button 
                                className="text-primary hover:text-primary/80"
                                onClick={() => handleCancelEngagement(engagement.fld_id)}
                                disabled={isCancellingEngagement}
                              >
                                Cancel Engagement
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <button 
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                      onClick={() => handleCancelContract(contract.fld_id)}
                      disabled={isCancellingContract}
                    >
                      Cancel Contract
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 flex items-center">
              <AlertCircle className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <h4 className="text-blue-600 font-medium mb-1">No Active Contract Available</h4>
                <span className="text-blue-600"></span>
              </div>
            </div>
          )}
        </div>

        {/* Pending Contracts */}
        <div className="space-y-4">
          {pendingContracts.length > 0 ? (
            pendingContracts.map((contract) => (
              <Card key={contract.fld_id} className="border border-red-400">
                <CardContent className="p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                    Contract # {contract.fld_id} - €{contract.fld_s_per_lesson_rate}/lesson
                  </h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <span className="text-sm font-medium">Date</span>
                      </div>
                      <div className="text-gray-600">
                        {formatDate(contract.fld_edate)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <span className="text-sm font-medium">Contract Duration</span>
                      </div>
                      <div className="text-gray-600">
                        {contract.fld_ct}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <span className="text-sm font-medium">Lesson Duration</span>
                      </div>
                      <div className="text-gray-600">
                        {contract.fld_lesson_dur}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <span className="text-sm font-medium">Learning Preference</span>
                      </div>
                      <div className="text-gray-600">
                        {contract.fld_lp}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <span className="text-sm font-medium">Lesson Rate</span>
                      </div>
                      <div className="text-gray-600">
                        €{Math.round(contract.fld_s_per_lesson_rate)} / lesson
                      </div>
                </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <span className="text-sm font-medium">Status</span>
                      </div>
                      <div>
                        <Badge className="bg-red-100 text-red-800">
                          {contract.fld_status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button 
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                      onClick={() => handleCancelContract(contract.fld_id)}
                      disabled={isCancellingContract}
                    >
                      Cancel Contract
                    </button>
                </div>
              </CardContent>
            </Card>
          ))
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600 mr-4" />
              <div>
                <h4 className="text-red-600 font-medium mb-1">No Pending Contract Available</h4>
                <span className="text-red-600"></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




