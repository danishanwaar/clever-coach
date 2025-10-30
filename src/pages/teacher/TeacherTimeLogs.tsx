import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Clock, Plus, Search, Calendar, User, Trash2, BookOpen } from 'lucide-react';
import { useTeacher, useTeacherTimeLogs, useTeacherTimeLogStudents, useTeacherTimeLogStudentSubjects, useTeacherTimeLogMutations } from '@/hooks/useTeacherProfile';
import { format } from 'date-fns';

export default function TeacherTimeLogs() {
  const { user } = useAuthStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<number | undefined>();
  const [newLog, setNewLog] = useState({
    fld_sid: '',
    fld_ssid: '',
    fld_lesson: '',
    fld_notes: '',
    fld_edate: new Date().toISOString().split('T')[0]
  });

  // Get teacher ID
  const { data: teacher } = useTeacher(user?.fld_id);
  
  // Fetch time logs using hooks (following PHP: only students with contracts)
  const { data: timeLogs = [], isLoading } = useTeacherTimeLogs(teacher?.fld_id);
  const { data: students = [] } = useTeacherTimeLogStudents(teacher?.fld_id);
  const { data: studentSubjects = [] } = useTeacherTimeLogStudentSubjects(teacher?.fld_id, selectedStudentId);
  const { addTimeLogMutation, deleteTimeLogMutation } = useTeacherTimeLogMutations();

  // Filter logs by search term (following PHP: search by student name)
  const filteredLogs = timeLogs.filter(log => {
    const matchesSearch = 
      log.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.fld_notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleAddTimeLog = () => {
    if (!newLog.fld_sid || !newLog.fld_ssid || !newLog.fld_lesson || !teacher?.fld_id || !user?.fld_id) {
      return;
    }

    addTimeLogMutation.mutate({
      teacherId: teacher.fld_id,
      studentId: parseInt(newLog.fld_sid),
      studentSubjectId: parseInt(newLog.fld_ssid),
      lesson: parseInt(newLog.fld_lesson),
      notes: newLog.fld_notes,
      date: newLog.fld_edate,
      userId: user.fld_id
    }, {
      onSuccess: () => {
        setNewLog({ fld_sid: '', fld_ssid: '', fld_lesson: '', fld_notes: '', fld_edate: new Date().toISOString().split('T')[0] });
        setSelectedStudentId(undefined);
        setIsAddDialogOpen(false);
      }
    });
  };

  const handleDeleteLog = (logId: number) => {
    if (confirm('Bist du sicher? Sie mochten diesen Betreff loschen')) {
      deleteTimeLogMutation.mutate(logId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Add Button - Following PHP layout */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">Stunden</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Stunden eintragen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Stunden eintragen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student">Schüler*innen <span className="text-red-500">*</span></Label>
                <Select 
                  value={newLog.fld_sid} 
                  onValueChange={(value) => {
                    setNewLog({ ...newLog, fld_sid: value, fld_ssid: '' });
                    setSelectedStudentId(parseInt(value));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.fld_id} value={student.fld_id.toString()}>
                        {student.fld_first_name} {student.fld_last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Fach/ Fächer <span className="text-red-500">*</span></Label>
                <Input
                  id="subject"
                  value={newLog.fld_notes}
                  onChange={(e) => setNewLog({ ...newLog, fld_notes: e.target.value })}
                  placeholder="Enter subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Datum <span className="text-red-500">*</span></Label>
                <Input
                  id="date"
                  type="date"
                  value={newLog.fld_edate}
                  onChange={(e) => setNewLog({ ...newLog, fld_edate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson">Anzahl Stunden <span className="text-red-500">*</span></Label>
                <Select 
                  value={newLog.fld_lesson} 
                  onValueChange={(value) => setNewLog({ ...newLog, fld_lesson: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hours" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Bemerkungen</Label>
                <Textarea
                  id="notes"
                  value={newLog.fld_notes}
                  onChange={(e) => setNewLog({ ...newLog, fld_notes: e.target.value })}
                  placeholder="Enter remarks"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddTimeLog} 
                  disabled={addTimeLogMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {addTimeLogMutation.isPending ? 'Speichern...' : 'Speichern'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar - Following PHP layout */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Schüler*in suchen"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Time Logs Cards - Card-based layout following PHP business logic */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredLogs.map((log) => (
          <Card key={log.fld_id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{log.student_name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4" />
                    <span>{log.subject_name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                    {Math.round(log.fld_lesson)}
                  </div>
                </div>
              </div>
              
              {log.fld_notes && (
                <p className="text-sm text-gray-700 mb-3">{log.fld_notes}</p>
              )}
              
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(log.fld_edate), 'dd-MMM-yy')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <User className="h-3 w-3" />
                  <span>{log.user_name}</span>
                </div>
              </div>
              
              {/* Delete button only if status is Pending (following PHP logic) */}
              {log.fld_status === 'Pending' && (
                <div className="mt-2 pt-2 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteLog(log.fld_id)}
                    disabled={deleteTimeLogMutation.isPending}
                    className="w-full h-8 text-xs"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    {deleteTimeLogMutation.isPending ? 'Loschen...' : 'Loschen'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No time logs found</h3>
            <p className="text-sm text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Start by adding your first time log.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
