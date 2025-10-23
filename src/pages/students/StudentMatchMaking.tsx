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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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

  const getMediationStatusColor = (status: string) => {
    switch (status) {
      case 'Not Mediated': return 'bg-gray-100 text-gray-800';
      case 'Initial Contact': return 'bg-blue-100 text-blue-800';
      case 'Interview Scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'Interview Completed': return 'bg-orange-100 text-orange-800';
      case 'Offer Made': return 'bg-green-100 text-green-800';
      case 'Contract Signed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Subjects Assigned</h3>
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
  
  const { data: mediation } = useStudentSubjectMediation(studentId, subject.fld_suid);
  const { data: contract } = useStudentSubjectContract(subject.fld_cid);
  const { deleteStudentSubject } = useStudentMutations();

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

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {subject.tbl_subjects?.fld_subject || 'Unknown Subject'}
          </CardTitle>
          <Badge className={getMediationStatusColor(mediationStatus)}>
            {mediationStatus}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {contract ? (
          <div className="space-y-4">
            {/* Contract Header */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  Contract #{contract.fld_id} - €{Math.round(contract.fld_s_per_lesson_rate || 0)}/lesson
                </div>
                <div className="text-sm text-gray-500">
                  {contract.tbl_contracts_engagement?.[0]?.tbl_teachers?.fld_first_name} {contract.tbl_contracts_engagement?.[0]?.tbl_teachers?.fld_last_name} | 
                  Dated {formatDate(contract.fld_edate)}
                </div>
              </div>
            </div>

            {/* Contract Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="border border-gray-300 border-dashed rounded py-2 px-3 text-center">
                <div className="text-sm font-bold text-gray-700">
                  €{Math.round(contract.fld_s_per_lesson_rate || 0)}
                </div>
                <div className="text-xs text-gray-500">Rate</div>
              </div>
              
              <div className="border border-gray-300 border-dashed rounded py-2 px-3 text-center">
                <div className="text-sm font-bold text-gray-700">
                  {contract.fld_lesson_dur || 'N/A'}
                </div>
                <div className="text-xs text-gray-500">Lesson Dur.</div>
              </div>
              
              <div className="border border-gray-300 border-dashed rounded py-2 px-3 text-center">
                <div className="text-sm font-bold text-gray-700">
                  {Math.round(contract.fld_min_lesson || 0)}
                </div>
                <div className="text-xs text-gray-500">Min Lessons</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-gray-500 text-lg">No Contract Available</h3>
            <p className="text-gray-400 text-sm mt-2">This subject doesn't have an active contract yet.</p>
          </div>
        )}

        {/* Delete Button */}
        <div className="pt-4 border-t">
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
      </CardContent>
    </Card>
  );
};

// Helper function for date formatting
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default StudentMatchMaking;
