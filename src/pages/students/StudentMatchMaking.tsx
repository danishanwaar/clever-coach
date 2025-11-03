import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  User,
  Trash2,
  Euro,
  Clock,
  BookOpen, 
  Calendar,
  Eye,
  Download,
  Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  useStudent,
  useStudentMutations,
  useStudentSubjectsWithMediation
} from '@/hooks/useStudents';
import { format } from 'date-fns';

const StudentMatchMaking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = parseInt(id || '0');

  const { data: student, isLoading: studentLoading } = useStudent(studentId);
  const { data: studentSubjects = [], isLoading: subjectsLoading } = useStudentSubjectsWithMediation(studentId);

  // Extract contract IDs and subject IDs for parallel loading
  const contractIds = useMemo(() => {
    return [...new Set(studentSubjects
      .filter((s: any) => s.fld_cid && s.fld_cid > 0)
      .map((s: any) => s.fld_cid)
    )];
  }, [studentSubjects]);

  const subjectIds = useMemo(() => {
    return studentSubjects.map((s: any) => s.fld_id);
  }, [studentSubjects]);

  // Preload all contracts in parallel
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ['student-contracts-for-matchmaking', studentId, contractIds.join(',')],
    queryFn: async () => {
      if (contractIds.length === 0) return [];

      const { data, error } = await supabase
        .from('tbl_contracts')
        .select(`
          *,
          tbl_contracts_engagement(
            fld_id,
            fld_tid,
            tbl_teachers(
              fld_first_name,
              fld_last_name
            )
          )
        `)
        .in('fld_id', contractIds)
        .eq('fld_status', 'Active');

      if (error) throw error;
      return data || [];
    },
    enabled: contractIds.length > 0 && !subjectsLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Preload all mediations in parallel
  const { data: mediations = {}, isLoading: mediationsLoading } = useQuery({
    queryKey: ['student-mediations-for-matchmaking', studentId, subjectIds.join(',')],
    queryFn: async () => {
      if (subjectIds.length === 0) return {};

      // Get latest mediation stage for each subject (ordered by fld_id desc)
      const { data, error } = await supabase
        .from('tbl_students_mediation_stages')
        .select(`
          fld_ssid,
          fld_m_type,
          fld_id,
          tbl_mediation_types!fld_m_type(
            fld_stage_name
          )
        `)
        .eq('fld_sid', studentId)
        .in('fld_ssid', subjectIds)
        .order('fld_id', { ascending: false });

      if (error) throw error;

      // Group by fld_ssid and get the latest (first) for each
      const mediationMap: Record<number, any> = {};
      data?.forEach((med: any) => {
        if (!mediationMap[med.fld_ssid]) {
          mediationMap[med.fld_ssid] = med;
        }
      });

      return mediationMap;
    },
    enabled: subjectIds.length > 0 && !subjectsLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create lookup maps for contracts and mediations (MUST be before any conditional returns)
  const contractMap = useMemo(() => {
    const map: Record<number, any> = {};
    contracts.forEach((contract: any) => {
      map[contract.fld_id] = contract;
    });
    return map;
  }, [contracts]);

  const isLoading = studentLoading || subjectsLoading || contractsLoading || mediationsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading match making data...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Not Found</h2>
          <p className="text-gray-600 mb-4">The student you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/students')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Subjects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {studentSubjects.map((subject: any) => (
          <SubjectCard 
            key={subject.fld_id} 
            subject={subject} 
            studentId={studentId}
            studentName={`${student.fld_first_name} ${student.fld_last_name}`}
            contract={contractMap[subject.fld_cid]}
            mediation={mediations[subject.fld_id]}
          />
        ))}
      </div>

      {studentSubjects.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="text-gray-500">
              <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-400" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Subjects Assigned</h3>
              <p className="text-sm sm:text-base text-gray-600">This student doesn't have any subjects assigned yet.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Subject Card Component
interface SubjectCardProps {
  subject: any;
  studentId: number;
  studentName: string;
  contract?: any;
  mediation?: any;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, studentId, studentName, contract, mediation }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteStudentSubject } = useStudentMutations();

  // Following PHP logic: if FLD_M_TYPE is empty, show "Not Mediated"
  // Otherwise get stage name from tbl_mediation_types
  const getMediationStatus = () => {
    if (!mediation || !mediation.fld_m_type) {
      return 'Not Mediated';
    }
    return mediation.tbl_mediation_types?.fld_stage_name || 'Unknown Stage';
  };

  const getMediationStatusColor = (status: string) => {
    switch (status) {
      case 'Not Mediated': return 'bg-gray-100 text-gray-800';
      case 'Initial Contact': return 'bg-blue-100 text-blue-800';
      case 'Interview Scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'Interview Completed': return 'bg-orange-100 text-orange-800';
      case 'Offer Made': return 'bg-green-100 text-green-800';
      case 'Contract Signed': return 'bg-purple-100 text-purple-800';
      case 'Mediated': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteSubject = async () => {
    if (!confirm(`Are you sure you want to delete ${subject.tbl_subjects?.fld_subject} from ${studentName}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteStudentSubject(subject.fld_id);
    } catch (error) {
      console.error('Error deleting subject:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const mediationStatus = getMediationStatus();
  
  // Following PHP logic: check if contract exists (num > 0)
  const hasContract = contract && contract.fld_id;

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 truncate flex-1">
            {subject.tbl_subjects?.fld_subject || 'Unknown Subject'}
          </CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className={`${getMediationStatusColor(mediationStatus)} text-xs sm:text-sm`}>
              {mediationStatus}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteSubject}
              disabled={isDeleting}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 sm:space-y-4 pb-4 px-4 sm:px-6">
        {hasContract ? (
          <div className="space-y-4">
            {/* Contract Header - Following PHP structure */}
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-gray-200">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                  Contract #{contract.fld_id} - €{contract.fld_s_per_lesson_rate?.toFixed(2) || '0.00'}/lesson
                </div>
                {/* Following PHP: Get teacher from engagement using FLD_C_EID */}
                {subject.fld_c_eid && contract.tbl_contracts_engagement?.find((eng: any) => eng.fld_id === subject.fld_c_eid) ? (
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {contract.tbl_contracts_engagement.find((eng: any) => eng.fld_id === subject.fld_c_eid)?.tbl_teachers?.fld_first_name} {contract.tbl_contracts_engagement.find((eng: any) => eng.fld_id === subject.fld_c_eid)?.tbl_teachers?.fld_last_name} | 
                    Dated {format(new Date(contract.fld_edate), 'dd MMM yyyy')}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 mt-1">
                    Dated {format(new Date(contract.fld_edate), 'dd MMM yyyy')}
                  </div>
                )}
              </div>
            </div>

            {/* Contract Metrics - Following PHP layout */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="border border-gray-300 border-dashed rounded-lg py-2 sm:py-3 px-2 sm:px-4 text-center">
                <div className="text-sm sm:text-base font-bold text-gray-900">
                  €{contract.fld_s_per_lesson_rate?.toFixed(2) || '0.00'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Rate</div>
              </div>
              
              <div className="border border-gray-300 border-dashed rounded-lg py-2 sm:py-3 px-2 sm:px-4 text-center">
                <div className="text-sm sm:text-base font-bold text-gray-900 truncate">
                  {contract.fld_lesson_dur || 'N/A'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Duration</div>
              </div>
              
              <div className="border border-gray-300 border-dashed rounded-lg py-2 sm:py-3 px-2 sm:px-4 text-center">
                <div className="text-sm sm:text-base font-bold text-gray-900">
                  {contract.fld_min_lesson || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Min Lessons</div>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-4 sm:py-6">
            <h3 className="text-gray-500 text-base sm:text-lg font-medium mb-2">No Contract Available</h3>
            <p className="text-gray-400 text-xs sm:text-sm px-2">This subject doesn't have an active contract yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentMatchMaking;
