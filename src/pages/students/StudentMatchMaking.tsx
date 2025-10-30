import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Calendar
} from 'lucide-react';
import { 
  useStudent,
  useStudentMutations,
  useStudentSubjectsWithMediation, 
  useStudentSubjectMediation, 
  useStudentSubjectContract 
} from '@/hooks/useStudents';
import { format } from 'date-fns';

const StudentMatchMaking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = parseInt(id || '0');

  const { data: student, isLoading: studentLoading } = useStudent(studentId);
  const { data: studentSubjects = [], isLoading: subjectsLoading } = useStudentSubjectsWithMediation(studentId);

  if (studentLoading || subjectsLoading) {
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
    <div className="space-y-6">
      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studentSubjects.map((subject: any) => (
          <SubjectCard 
            key={subject.fld_id} 
            subject={subject} 
            studentId={studentId}
            studentName={`${student.fld_first_name} ${student.fld_last_name}`}
          />
        ))}
      </div>

      {studentSubjects.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Subjects Assigned</h3>
              <p className="text-gray-600">This student doesn't have any subjects assigned yet.</p>
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
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, studentId, studentName }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Following PHP logic: use subject.fld_id as fld_ssid (student subject ID)
  // Get latest mediation stage ordered by fld_id desc
  const { data: mediation } = useStudentSubjectMediation(studentId, subject.fld_id);
  
  // Get contract if fld_cid exists (following PHP logic)
  const { data: contract } = useStudentSubjectContract(subject.fld_cid || 0);
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
      <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {subject.tbl_subjects?.fld_subject || 'Unknown Subject'}
          </CardTitle>
          <Badge className={getMediationStatusColor(mediationStatus)}>
            {mediationStatus}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pb-4">
        {hasContract ? (
          <div className="space-y-4">
            {/* Contract Header - Following PHP structure */}
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-primary" />
                        </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm">
                  Contract #{contract.fld_id} - €{Math.round(contract.fld_s_per_lesson_rate || 0)}/lesson
                      </div>
                {/* Following PHP: Get teacher from engagement using FLD_C_EID */}
                {subject.fld_c_eid && contract.tbl_contracts_engagement?.find((eng: any) => eng.fld_id === subject.fld_c_eid) ? (
                  <div className="text-xs text-gray-500 mt-1">
                    {contract.tbl_contracts_engagement.find((eng: any) => eng.fld_id === subject.fld_c_eid)?.tbl_teachers?.fld_first_name} {contract.tbl_contracts_engagement.find((eng: any) => eng.fld_id === subject.fld_c_eid)?.tbl_teachers?.fld_last_name} | 
                    Dated {format(new Date(contract.fld_edate), 'dd MMMM yyyy')}
                    </div>
                ) : (
                  <div className="text-xs text-gray-500 mt-1">
                    Dated {format(new Date(contract.fld_edate), 'dd MMMM yyyy')}
                  </div>
                )}
              </div>
            </div>

            {/* Contract Metrics - Following PHP layout */}
            <div className="flex flex-wrap gap-3 justify-center">
              <div className="border border-gray-300 border-dashed rounded-lg py-3 px-4 flex-1 min-w-[100px] text-center">
                <div className="text-base font-bold text-gray-900">
                  €{Math.round(contract.fld_s_per_lesson_rate || 0)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Rate</div>
              </div>
              
              <div className="border border-gray-300 border-dashed rounded-lg py-3 px-4 flex-1 min-w-[100px] text-center">
                <div className="text-base font-bold text-gray-900">
                  {contract.fld_lesson_dur || 'N/A'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Lesson Dur.</div>
              </div>
              
              <div className="border border-gray-300 border-dashed rounded-lg py-3 px-4 flex-1 min-w-[100px] text-center">
                <div className="text-base font-bold text-gray-900">
                  {Math.round(contract.fld_min_lesson || 0)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Min Lessons</div>
              </div>
            </div>

            {/* Delete Button - Following PHP placement */}
            <div className="pt-4 border-t border-gray-200 -mb-4">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDeleteSubject}
                disabled={isDeleting}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete Subject'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <h3 className="text-gray-500 text-lg font-medium mb-2">No Contract Available</h3>
            <p className="text-gray-400 text-sm">This subject doesn't have an active contract yet.</p>
            
            {/* Delete Button - Also show when no contract */}
            <div className="pt-4 border-t border-gray-200 mt-4 -mb-4">
                      <Button 
                variant="destructive" 
                        size="sm"
                onClick={handleDeleteSubject}
                disabled={isDeleting}
                className="w-full"
                      >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete Subject'}
                      </Button>
                        </div>
                      </div>
                    )}
              </CardContent>
            </Card>
  );
};

export default StudentMatchMaking;
