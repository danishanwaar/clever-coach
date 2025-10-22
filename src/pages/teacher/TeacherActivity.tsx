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
import { Activity, Plus, Search, Filter, Calendar, User, BookOpen, MessageSquare } from 'lucide-react';

interface ActivityRecord {
  fld_id: number;
  fld_sid: number;
  fld_activity_type: string;
  fld_description: string;
  fld_date: string;
  fld_notes?: string;
  student_name: string;
  subject: string;
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

export default function TeacherActivity() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [newActivity, setNewActivity] = useState({
    fld_sid: '',
    fld_activity_type: '',
    fld_description: '',
    fld_notes: '',
    fld_date: new Date().toISOString().split('T')[0]
  });

  // Fetch teacher's activities
  const { data: activities, isLoading } = useQuery<ActivityRecord[]>({
    queryKey: ['teacherActivities', user?.fld_id],
    queryFn: async () => {
      if (!user?.fld_id) throw new Error('User not authenticated');

      // Get teacher ID
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select('fld_id')
        .eq('fld_uid', user.fld_id)
        .single();

      if (teacherError) throw teacherError;

      // Get activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('tbl_activity_teacher')
        .select(`
          fld_id,
          fld_tid,
          fld_title,
          fld_content,
          fld_erdat
        `)
        .eq('fld_tid', teacher.fld_id)
        .order('fld_erdat', { ascending: false });

      if (activitiesError) throw activitiesError;

      // Map to expected format
      const activitiesWithDetails = activitiesData?.map(activity => ({
        fld_id: activity.fld_id,
        fld_sid: 0, // Not applicable for teacher activities
        fld_activity_type: 'Teacher Activity',
        fld_description: activity.fld_content,
        fld_date: activity.fld_erdat,
        fld_notes: '',
        student_name: 'N/A',
        subject: 'N/A'
      })) || [];

      return activitiesWithDetails;
    },
    enabled: !!user?.fld_id
  });

  // Fetch teacher's students for the add form
  const { data: students } = useQuery<Student[]>({
    queryKey: ['teacherStudentsForActivity', user?.fld_id],
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
              fld_level: ''
            })) || []
          };
        })
      );

      return studentsWithSubjects;
    },
    enabled: !!user?.fld_id
  });

  // Add new activity mutation
  const addActivityMutation = useMutation({
    mutationFn: async (activityData: typeof newActivity) => {
      if (!user?.fld_id) throw new Error('User not authenticated');

      // Get teacher ID
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select('fld_id')
        .eq('fld_uid', user.fld_id)
        .single();

      if (teacherError) throw teacherError;

      const { error } = await supabase
        .from('tbl_activity_teacher')
        .insert({
          fld_tid: teacher.fld_id,
          fld_title: activityData.fld_activity_type,
          fld_content: activityData.fld_description,
          fld_erdat: activityData.fld_date,
          fld_uid: user.fld_id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherActivities'] });
      setIsAddDialogOpen(false);
      setNewActivity({
        fld_sid: '',
        fld_activity_type: '',
        fld_description: '',
        fld_notes: '',
        fld_date: new Date().toISOString().split('T')[0]
      });
      toast.success('Activity recorded successfully');
    },
    onError: (error) => {
      toast.error('Failed to record activity: ' + error.message);
    }
  });

  const handleAddActivity = () => {
    if (!newActivity.fld_sid || !newActivity.fld_activity_type || !newActivity.fld_description) {
      toast.error('Please fill in all required fields');
      return;
    }
    addActivityMutation.mutate(newActivity);
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'Lesson':
        return 'default';
      case 'Assessment':
        return 'secondary';
      case 'Progress Review':
        return 'outline';
      case 'Communication':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const filteredActivities = activities?.filter(activity => {
    const matchesSearch = 
      activity.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.fld_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.fld_notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || activity.fld_activity_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

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
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground">
          Record and track your teaching activities and student interactions
        </p>
      </div>

      {/* Add Activity Button */}
      <div className="mb-6">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record New Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student">Student</Label>
                <Select value={newActivity.fld_sid} onValueChange={(value) => setNewActivity({ ...newActivity, fld_sid: value })}>
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
              <div className="space-y-2">
                <Label htmlFor="type">Activity Type</Label>
                <Select value={newActivity.fld_activity_type} onValueChange={(value) => setNewActivity({ ...newActivity, fld_activity_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lesson">Lesson</SelectItem>
                    <SelectItem value="Assessment">Assessment</SelectItem>
                    <SelectItem value="Progress Review">Progress Review</SelectItem>
                    <SelectItem value="Communication">Communication</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newActivity.fld_date}
                  onChange={(e) => setNewActivity({ ...newActivity, fld_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newActivity.fld_description}
                  onChange={(e) => setNewActivity({ ...newActivity, fld_description: e.target.value })}
                  placeholder="Describe the activity..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newActivity.fld_notes}
                  onChange={(e) => setNewActivity({ ...newActivity, fld_notes: e.target.value })}
                  placeholder="Additional notes (optional)..."
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddActivity} disabled={addActivityMutation.isPending}>
                  {addActivityMutation.isPending ? 'Recording...' : 'Record Activity'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Lesson">Lesson</SelectItem>
            <SelectItem value="Assessment">Assessment</SelectItem>
            <SelectItem value="Progress Review">Progress Review</SelectItem>
            <SelectItem value="Communication">Communication</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities?.map((activity) => (
                <TableRow key={activity.fld_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {new Date(activity.fld_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {activity.student_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      {activity.subject}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActivityTypeColor(activity.fld_activity_type)}>
                      {activity.fld_activity_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm">{activity.fld_description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {activity.fld_notes ? (
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600">{activity.fld_notes}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredActivities?.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-600">
                {searchTerm || typeFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start by recording your first activity.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
