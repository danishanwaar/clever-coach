import React, { useState } from 'react';
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
  User
} from 'lucide-react';
import { useStudents, useStudentSubjects, useStudentMediationStages, useStudentMutations, useMediationTypes, StudentStatus } from '@/hooks/useStudents';
import { formatPhoneNumber } from '@/lib/utils';
import { StudentActivityModal } from '@/components/StudentActivityModal';
import { StudentFormModal } from '@/components/StudentFormModal';
import { LeadFormModal } from '@/components/LeadFormModal';
import { Link } from 'react-router-dom';

const Students: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<StudentStatus | 'All' | 'Eng'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isLeadFormModalOpen, setIsLeadFormModalOpen] = useState(false);

  const { data: students = [], isLoading } = useStudents(selectedStatus);
  const { data: mediationTypes = [] } = useMediationTypes();
  const { updateStatus, updateNotes, updateIMStatus, moveToMediationOpen, deleteMediation } = useStudentMutations();

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    `${student.fld_first_name} ${student.fld_last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${student.fld_s_first_name} ${student.fld_s_last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.fld_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.fld_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.fld_zip.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const statusOptions: { value: StudentStatus | 'All' | 'Eng'; label: string }[] = [
    { value: 'All', label: 'All' },
    { value: 'Leads', label: 'Leads' },
    { value: 'Mediation Open', label: 'Mediation Open' },
    { value: 'Partially Mediated', label: 'Partially Mediated' },
    { value: 'Mediated', label: 'Mediated' },
    { value: 'Specialist Consulting', label: 'Specialist Consulting' },
    { value: 'Contracted Customers', label: 'Contracted Customers' },
    { value: 'Suspended', label: 'Suspended' },
    { value: 'Deleted', label: 'Deleted' },
    { value: 'Unplaceable', label: 'Unplaceable' },
    { value: 'Waiting List', label: 'Waiting List' },
    { value: 'Appointment Call', label: 'Appointment Call' },
    { value: 'Follow-up', label: 'Follow-up' },
    { value: 'Appl', label: 'Appl' },
    { value: 'Eng', label: 'Eng' },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Students Directory</h1>
          <p className="text-gray-600">Manage and track student lifecycle</p>
            </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsFormModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
          <Button variant="outline" onClick={() => setIsLeadFormModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
                </Button>
            </div>
          </div>

      {/* Status Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedStatus === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(option.value)}
              >
                {option.label}
              </Button>
            ))}
        </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
          <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                placeholder="Search by name, email, location, or subject..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-w-full">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium min-w-[120px]">Actions</th>
                  <th className="text-left p-3 font-medium min-w-[150px]">Name</th>
                  <th className="text-left p-3 font-medium min-w-[80px]">Online</th>
                  <th className="text-left p-3 font-medium min-w-[100px]">Location</th>
                  <th className="text-left p-3 font-medium min-w-[120px]">Subject</th>
                  {selectedStatus !== 'Leads' && selectedStatus !== 'Mediation Open' && (
                    <>
                      <th className="text-left p-3 font-medium min-w-[120px]">Teachers</th>
                      <th className="text-left p-3 font-medium min-w-[120px]">IM Status - Date</th>
                    </>
                  )}
                  {selectedStatus === 'Specialist Consulting' && (
                    <th className="text-left p-3 font-medium min-w-[120px]">Admin Status</th>
                  )}
                  <th className="text-left p-3 font-medium min-w-[100px]">Status</th>
                  <th className="text-left p-3 font-medium min-w-[200px]">About</th>
                  <th className="text-left p-3 font-medium min-w-[100px]">Admin</th>
                  <th className="text-left p-3 font-medium min-w-[100px]">Applied Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="text-center p-8">
                      <Loader message="Loading students..." size="sm" className="min-h-[100px]" />
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center p-8 text-gray-500">
                      No students found
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <StudentRow
                      key={student.fld_id}
                      student={student}
                      selectedStatus={selectedStatus}
                      mediationTypes={mediationTypes}
                      onStatusChange={handleStatusChange}
                      onNotesChange={handleNotesChange}
                      onIMStatusChange={handleIMStatusChange}
                      onMoveToMediationOpen={handleMoveToMediationOpen}
                      onDeleteMediation={handleDeleteMediation}
                      onRecordActivity={handleRecordActivity}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Student Activity Modal */}
      {selectedStudent && (
        <StudentActivityModal
          studentId={selectedStudent}
          isOpen={isActivityModalOpen}
          onClose={() => {
            setIsActivityModalOpen(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {/* Student Form Modal */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
      />

      {/* Lead Form Modal */}
      <LeadFormModal
        isOpen={isLeadFormModalOpen}
        onClose={() => setIsLeadFormModalOpen(false)}
      />
    </div>
  );
};

// Student Row Component
interface StudentRowProps {
  student: any;
  selectedStatus: StudentStatus | 'All' | 'Eng';
  mediationTypes: any[];
  onStatusChange: (studentId: number, status: string) => void;
  onNotesChange: (studentId: number, notes: string) => void;
  onIMStatusChange: (studentId: number, imStatus: string) => void;
  onMoveToMediationOpen: (studentId: number) => void;
  onDeleteMediation: (studentId: number, subjectId: number) => void;
  onRecordActivity: (studentId: number) => void;
}

const StudentRow: React.FC<StudentRowProps> = ({
  student,
  selectedStatus,
  mediationTypes,
  onStatusChange,
  onNotesChange,
  onIMStatusChange,
  onMoveToMediationOpen,
  onDeleteMediation,
  onRecordActivity,
}) => {
  const formattedPhone = formatPhoneNumber(student.fld_mobile);
  const { data: subjects = [] } = useStudentSubjects(student.fld_id);
  const { data: mediationStages = [] } = useStudentMediationStages(student.fld_id);

  return (
    <tr className="border-b hover:bg-gray-50">
      {/* Actions */}
      <td className="p-3">
        <div className="flex flex-wrap items-center gap-1">
          {student.fld_status === 'Leads' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMoveToMediationOpen(student.fld_id)}
              title="Move to Mediation Open"
              className="h-8 w-8 p-0"
            >
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRecordActivity(student.fld_id)}
            title="Record Activity"
            className="h-8 w-8 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            asChild
            className="h-8 w-8 p-0"
          >
            <a href={`mailto:${student.fld_email}`} title="Send Email">
              <Mail className="h-3 w-3" />
            </a>
          </Button>
          <Button
            size="sm"
            variant="outline"
            asChild
            className="h-8 w-8 p-0"
          >
            <a href={`https://web.whatsapp.com/send?phone=${formattedPhone}`} target="_blank" title="WhatsApp">
              <MessageCircle className="h-3 w-3" />
            </a>
          </Button>
          <Button
            size="sm"
            variant="outline"
            asChild
            className="h-8 w-8 p-0"
          >
            <a href={`tel:${formattedPhone}`} title="Call">
              <Phone className="h-3 w-3" />
            </a>
          </Button>
          <Button
            size="sm"
            variant="outline"
            asChild
            className="h-8 w-8 p-0"
          >
            <Link to={`/students/${student.fld_id}/profile`} title="View Profile">
              <User className="h-3 w-3" />
            </Link>
          </Button>
          {(student.fld_status === 'Mediation Open' || student.fld_status === 'Partially Mediated') && (
            <Button
              size="sm"
              variant="outline"
              title="Dynamic Matcher"
              className="h-8 w-8 p-0"
            >
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            title="Create Contract"
            className="h-8 w-8 p-0"
          >
            <FileText className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            title="Delete"
            className="h-8 w-8 p-0 text-red-600"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </td>

      {/* Name */}
      <td className="p-3">
        <div>
          <div className="font-medium text-sm">
            {student.fld_s_first_name} {student.fld_s_last_name} ({student.fld_sal})
          </div>
          <div className="text-xs text-gray-600">
            {student.fld_gender} {student.fld_first_name} {student.fld_last_name}
          </div>
        </div>
      </td>

      {/* Online */}
      <td className="p-3 text-sm">{student.fld_l_mode}</td>

      {/* Location */}
      <td className="p-3">
        <div className="text-sm">
          {student.fld_zip}<br />
          {student.fld_city}
        </div>
      </td>

      {/* Subject */}
      <td className="p-3">
        <div className="space-y-1">
          {subjects.map((subject) => (
            <div key={subject.fld_id} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
              <span className="text-xs">
                {subject.tbl_subjects?.fld_subject} ({student.fld_level?.replace('Level ', '') || 'N/A'})
              </span>
            </div>
          ))}
        </div>
      </td>

      {/* Teachers (if not Leads or Mediation Open) */}
      {selectedStatus !== 'Leads' && selectedStatus !== 'Mediation Open' && (
        <td className="p-3">
          <div className="space-y-1">
            {mediationStages.map((stage) => (
              stage.tbl_teachers && (
                <div key={stage.fld_id} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <div className="text-xs">
                    <a href="#" className="text-blue-600 hover:underline">
                      {stage.tbl_teachers.fld_first_name} {stage.tbl_teachers.fld_last_name}
                    </a>
                    <Button size="sm" variant="ghost" className="ml-1 p-0 h-auto">
                      <Phone className="h-3 w-3" />
                    </Button>
                    {selectedStatus === 'Mediated' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-1 p-0 h-auto text-red-600"
                        onClick={() => onDeleteMediation(student.fld_id, stage.fld_ssid)}
                        title="Delete Mediation"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            ))}
            {mediationStages.length === 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                <span className="text-xs text-red-600">Not Mediated!</span>
              </div>
            )}
          </div>
        </td>
      )}

      {/* IM Status - Date (if not Leads or Mediation Open) */}
      {selectedStatus !== 'Leads' && selectedStatus !== 'Mediation Open' && (
        <td className="p-3">
          <div className="space-y-1">
            {mediationStages.map((stage) => (
              <div key={stage.fld_id} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full flex-shrink-0"></div>
                <div className="text-xs">
                  {stage.tbl_mediation_types?.fld_stage_name}<br />
                  {new Date(stage.fld_edate).toLocaleDateString()} {stage.fld_etime}
                </div>
              </div>
            ))}
            {mediationStages.length === 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                <span className="text-xs text-red-600">Pending</span>
              </div>
            )}
          </div>
        </td>
      )}

      {/* Admin Status (if Specialist Consulting) */}
      {selectedStatus === 'Specialist Consulting' && (
        <td className="p-3">
          <Select
            value={student.fld_im_status?.toString() || ''}
            onValueChange={(value) => onIMStatusChange(student.fld_id, value)}
          >
            <SelectTrigger className="w-full text-xs">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select status</SelectItem>
              {mediationTypes.map((type) => (
                <SelectItem key={type.fld_id} value={type.fld_id.toString()}>
                  {type.fld_stage_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </td>
      )}

      {/* Status */}
      <td className="p-3">
        <Select
          value={student.fld_status}
          onValueChange={(value) => onStatusChange(student.fld_id, value)}
        >
          <SelectTrigger className="w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Leads">Leads</SelectItem>
            <SelectItem value="Mediation Open">Mediation Open</SelectItem>
            <SelectItem value="Partially Mediated">Partially Mediated</SelectItem>
            <SelectItem value="Mediated">Mediated</SelectItem>
            <SelectItem value="Specialist Consulting">Specialist Consulting</SelectItem>
            <SelectItem value="Contracted Customers">Contracted Customers</SelectItem>
            <SelectItem value="Suspended">PS RG</SelectItem>
            <SelectItem value="Deleted">Deleted</SelectItem>
            <SelectItem value="Unplaceable">Unplaceable</SelectItem>
            <SelectItem value="Waiting List">Waiting List</SelectItem>
            <SelectItem value="Appointment Call">Appointment Call</SelectItem>
            <SelectItem value="Follow-up">Follow-up</SelectItem>
            <SelectItem value="Appl">Appl. Med.</SelectItem>
          </SelectContent>
        </Select>
      </td>

      {/* About */}
      <td className="p-3">
        <Textarea
          value={student.fld_notes || ''}
          onChange={(e) => onNotesChange(student.fld_id, e.target.value)}
          rows={3}
          className="min-w-[150px] text-xs"
          placeholder="Add notes..."
        />
      </td>

      {/* Admin */}
      <td className="p-3">
        <div className="text-xs">{student.tbl_users?.fld_name}</div>
      </td>

      {/* Applied Date */}
      <td className="p-3">
        <div className="text-xs">
          {new Date(student.fld_edate).toLocaleDateString()}
        </div>
      </td>
    </tr>
  );
};

export default Students;