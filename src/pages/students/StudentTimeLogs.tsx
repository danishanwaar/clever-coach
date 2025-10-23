import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStudentTimeLogs } from '@/hooks/useStudentTimeLogs';
import { useStudent } from '@/hooks/useStudents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Clock, 
  BookOpen,
  User,
  Calendar,
  AlertCircle,
  FileText
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from 'date-fns';

export default function StudentTimeLogs() {
  const { id } = useParams<{ id: string }>();
  const studentId = parseInt(id || '0');
  const { data: student, isLoading: studentLoading } = useStudent(studentId);
  
  const {
    timeLogs,
    studentSubjects,
    isLoading,
    createTimeLog,
    isCreating,
  } = useStudentTimeLogs(studentId);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddTimeLogOpen, setIsAddTimeLogOpen] = useState(false);
  const [newTimeLog, setNewTimeLog] = useState({
    fld_ssid: '',
    fld_lesson: '',
    fld_notes: '',
  });

  // Filter time logs based on search term
  const filteredTimeLogs = timeLogs.filter(log => 
    log.tbl_students?.fld_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.tbl_students?.fld_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.tbl_students_subjects?.tbl_subjects?.fld_subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.fld_notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.tbl_users?.fld_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTimeLog = () => {
    if (!newTimeLog.fld_ssid || !newTimeLog.fld_lesson) {
      return;
    }

    createTimeLog({
      fld_sid: studentId,
      fld_ssid: parseInt(newTimeLog.fld_ssid),
      fld_lesson: parseFloat(newTimeLog.fld_lesson),
      fld_notes: newTimeLog.fld_notes || undefined,
    });

    setNewTimeLog({ fld_ssid: '', fld_lesson: '', fld_notes: '' });
    setIsAddTimeLogOpen(false);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd-MMM-yy');
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Suspended':
        return 'bg-red-100 text-red-800';
      case 'Deleted':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <span>Student not found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <Dialog open={isAddTimeLogOpen} onOpenChange={setIsAddTimeLogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Time Log
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Record Time Log</DialogTitle>
              <DialogDescription>
                Record a new time log for {student.fld_first_name} {student.fld_last_name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={newTimeLog.fld_ssid}
                  onValueChange={(value) => setNewTimeLog(prev => ({ ...prev, fld_ssid: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentSubjects.map((subject) => (
                      <SelectItem key={subject.fld_id} value={subject.fld_id.toString()}>
                        {subject.tbl_subjects.fld_subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lessons">No of Lessons</Label>
                <Input
                  id="lessons"
                  type="number"
                  placeholder="Enter number of lessons"
                  value={newTimeLog.fld_lesson}
                  onChange={(e) => setNewTimeLog(prev => ({ ...prev, fld_lesson: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Remarks</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter remarks (optional)"
                  rows={3}
                  value={newTimeLog.fld_notes}
                  onChange={(e) => setNewTimeLog(prev => ({ ...prev, fld_notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddTimeLogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddTimeLog} 
                disabled={isCreating || !newTimeLog.fld_ssid || !newTimeLog.fld_lesson}
              >
                {isCreating ? 'Recording...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Time Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Time Logs</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search time logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTimeLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-5 font-medium text-gray-600">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Subject</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">No of Lessons</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Remarks</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Created On</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Created By</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTimeLogs.map((log) => (
                    <tr key={log.fld_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-5 font-medium">
                        {log.tbl_students?.fld_first_name} {log.tbl_students?.fld_last_name}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {log.tbl_students_subjects?.tbl_subjects?.fld_subject}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {Math.round(log.fld_lesson)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {log.fld_notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(log.fld_edate)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {log.tbl_users?.fld_name}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(log.fld_status)}>
                          {log.fld_status || 'Pending'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No time logs found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No time logs match your search criteria.' : 'This student has no time logs yet.'}
              </p>
              {!searchTerm && (
                <Button 
                  className="mt-4" 
                  onClick={() => setIsAddTimeLogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Record First Time Log
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}




