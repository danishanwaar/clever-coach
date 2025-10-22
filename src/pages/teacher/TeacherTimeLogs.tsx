import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Clock, Plus, Search, Filter, Calendar, User, BookOpen, DollarSign } from 'lucide-react';

interface TimeLog {
  fld_id: number;
  fld_sid: number;
  fld_lesson: number;
  fld_s_rate: number;
  fld_t_rate: number;
  fld_mon: string;
  fld_year: string;
  fld_edate: string;
  fld_notes: string;
  fld_uname: number;
  student_name: string;
  subject: string;
  level: string;
}

interface Student {
  fld_id: number;
  fld_first_name: string;
  fld_last_name: string;
  subjects: Array<{
    fld_subject: string;
    fld_level: string;
  }>;
}

export default function TeacherTimeLogs() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [newLog, setNewLog] = useState({
    fld_sid: '',
    fld_lesson: 0,
    fld_s_rate: 0,
    fld_t_rate: 0,
    fld_notes: '',
    fld_edate: new Date().toISOString().split('T')[0],
  });

  // Fetch teacher's time logs
  const { data: timeLogs, isLoading } = useQuery<TimeLog[]>({
    queryKey: ['teacherTimeLogs', user?.fld_id, monthFilter, yearFilter],
    queryFn: async () => {
      if (!user?.fld_id) throw new Error('User not authenticated');

      // Get teacher ID
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select('fld_id')
        .eq('fld_uid', user.fld_id)
        .single();

      if (teacherError) throw teacherError;

      // Build query
      let query = supabase
        .from('tbl_teachers_lessons_history')
        .select(`
          fld_id,
          fld_sid,
          fld_lesson,
          fld_s_rate,
          fld_t_rate,
          fld_mon,
          fld_year,
          fld_edate,
          fld_notes,
          fld_uname
        `)
        .eq('fld_tid', teacher.fld_id)
        .eq('fld_year', yearFilter)
        .order('fld_edate', { ascending: false });

      if (monthFilter !== 'all') {
        query = query.eq('fld_mon', monthFilter);
      }

      const { data: logs, error: logsError } = await query;
      if (logsError) throw logsError;

      // Get student and subject information for each log
      const logsWithDetails = await Promise.all(
        logs?.map(async (log) => {
          // Get student info
          const { data: student } = await supabase
            .from('tbl_students')
            .select('fld_first_name, fld_last_name')
            .eq('fld_id', log.fld_sid)
            .single();

          // Get subject info
          const { data: subject } = await supabase
            .from('tbl_students_subjects')
            .select(`
              fld_suid,
              tbl_subjects(fld_subject)
            `)
            .eq('fld_sid', log.fld_sid)
            .limit(1)
            .single();

          return {
            ...log,
            student_name: student ? `${student.fld_first_name} ${student.fld_last_name}` : 'Unknown Student',
            subject: subject?.tbl_subjects?.fld_subject || 'Unknown Subject',
            level: 'N/A' // Level not available in this table
          };
        }) || []
      );

      return logsWithDetails;
    },
    enabled: !!user?.fld_id
  });

  // Fetch teacher's students for the add form
  const { data: students } = useQuery<Student[]>({
    queryKey: ['teacherStudentsForLogs', user?.fld_id],
    queryFn: async () => {
      if (!user?.fld_id) throw new Error('User not authenticated');

      // Get teacher ID
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select('fld_id')
        .eq('fld_uid', user.fld_id)
        .single();

      if (teacherError) throw teacherError;

      // Get students through mediation stages
      const { data: mediationStages, error: mediationError } = await supabase
        .from('tbl_students_mediation_stages')
        .select(`
          fld_sid,
          tbl_students(
            fld_id,
            fld_first_name,
            fld_last_name
          )
        `)
        .eq('fld_tid', teacher.fld_id);

      if (mediationError) throw mediationError;

      // Get unique students with their subjects
      const uniqueStudents = new Map();
      mediationStages?.forEach(stage => {
        if (stage.tbl_students && !uniqueStudents.has(stage.tbl_students.fld_id)) {
          uniqueStudents.set(stage.tbl_students.fld_id, stage.tbl_students);
        }
      });

      const studentsWithSubjects = await Promise.all(
        Array.from(uniqueStudents.values()).map(async (student) => {
          const { data: subjects } = await supabase
            .from('tbl_students_subjects')
            .select(`
              fld_suid,
              tbl_subjects(fld_subject)
            `)
            .eq('fld_sid', student.fld_id);

          return {
            ...student,
            subjects: subjects?.map(s => ({
              fld_subject: s.tbl_subjects?.fld_subject || '',
              fld_level: 'N/A' // Level not available in this table
            })) || []
          };
        })
      );

      return studentsWithSubjects;
    },
    enabled: !!user?.fld_id
  });

  // Add new time log mutation
  const addTimeLogMutation = useMutation({
    mutationFn: async (logData: typeof newLog) => {
      if (!user?.fld_id) throw new Error('User not authenticated');

      // Get teacher ID
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select('fld_id')
        .eq('fld_uid', user.fld_id)
        .single();

      if (teacherError) throw teacherError;

      const { error } = await supabase
        .from('tbl_teachers_lessons_history')
        .insert({
          fld_tid: teacher.fld_id,
          fld_sid: parseInt(logData.fld_sid),
          fld_lesson: logData.fld_lesson,
          fld_s_rate: logData.fld_s_rate,
          fld_t_rate: logData.fld_t_rate,
          fld_mon: (new Date(logData.fld_edate).getMonth() + 1).toString(),
          fld_year: new Date(logData.fld_edate).getFullYear().toString(),
          fld_edate: logData.fld_edate,
          fld_notes: logData.fld_notes,
          fld_uname: user.fld_id
        } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherTimeLogs'] });
      setIsAddDialogOpen(false);
      setNewLog({
        fld_sid: '',
        fld_lesson: 0,
        fld_s_rate: 0,
        fld_t_rate: 0,
        fld_notes: '',
        fld_edate: new Date().toISOString().split('T')[0],
      });
      toast.success('Time log added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add time log: ' + error.message);
    }
  });

  const handleAddTimeLog = () => {
    if (!newLog.fld_sid || newLog.fld_lesson <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    addTimeLogMutation.mutate(newLog);
  };

  const filteredLogs = timeLogs?.filter(log => {
    const matchesSearch = 
      log.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.fld_notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const totalHours = filteredLogs?.reduce((sum, log) => sum + log.fld_lesson, 0) || 0;
  const totalEarnings = filteredLogs?.reduce((sum, log) => sum + (log.fld_lesson * log.fld_t_rate), 0) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Time Logs</h1>
        <p className="text-muted-foreground">
          Track and manage your teaching hours and lesson history
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">{totalHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold">€{totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                <p className="text-2xl font-bold">{filteredLogs?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Log
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Time Log</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student">Student</Label>
                <Select value={newLog.fld_sid} onValueChange={(value) => setNewLog({ ...newLog, fld_sid: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students?.map((student) => (
                      <SelectItem key={student.fld_id} value={student.fld_id.toString()}>
                        {student.fld_first_name} {student.fld_last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lesson">Lesson Duration (hours)</Label>
                  <Input
                    id="lesson"
                    type="number"
                    step="0.5"
                    min="0"
                    value={newLog.fld_lesson}
                    onChange={(e) => setNewLog({ ...newLog, fld_lesson: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newLog.fld_edate}
                    onChange={(e) => setNewLog({ ...newLog, fld_edate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sRate">Student Rate (€/hour)</Label>
                  <Input
                    id="sRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newLog.fld_s_rate}
                    onChange={(e) => setNewLog({ ...newLog, fld_s_rate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tRate">Teacher Rate (€/hour)</Label>
                  <Input
                    id="tRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newLog.fld_t_rate}
                    onChange={(e) => setNewLog({ ...newLog, fld_t_rate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Notes</Label>
                <Textarea
                  id="note"
                  value={newLog.fld_notes}
                  onChange={(e) => setNewLog({ ...newLog, fld_notes: e.target.value })}
                  placeholder="Add any notes about this lesson..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTimeLog} disabled={addTimeLogMutation.isPending}>
                  {addTimeLogMutation.isPending ? 'Adding...' : 'Add Log'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Time Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lesson History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Student Rate</TableHead>
                <TableHead>Teacher Rate</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs?.map((log) => (
                <TableRow key={log.fld_id}>
                  <TableCell>{new Date(log.fld_edate).toLocaleDateString()}</TableCell>
                  <TableCell>{log.student_name}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.subject}</div>
                      <div className="text-sm text-gray-500">{log.level}</div>
                    </div>
                  </TableCell>
                  <TableCell>{log.fld_lesson}h</TableCell>
                  <TableCell>€{log.fld_s_rate}/h</TableCell>
                  <TableCell>€{log.fld_t_rate}/h</TableCell>
                  <TableCell className="font-medium">
                    €{(log.fld_lesson * log.fld_t_rate).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {log.fld_notes ? (
                      <div className="max-w-xs truncate" title={log.fld_notes}>
                        {log.fld_notes}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredLogs?.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No time logs found</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search criteria.'
                  : 'Start by adding your first time log.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
