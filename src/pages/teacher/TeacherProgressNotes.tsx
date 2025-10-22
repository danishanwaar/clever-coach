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
import { FileText, Plus, Search, Filter, Calendar, User, BookOpen, Edit, Trash2 } from 'lucide-react';

interface ProgressNote {
  fld_id: number;
  fld_sid: number;
  fld_body: string;
  fld_edate: string;
  fld_uname: number;
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

export default function TeacherProgressNotes() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ProgressNote | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentFilter, setStudentFilter] = useState('all');
  const [newNote, setNewNote] = useState({
    fld_sid: '',
    fld_body: '',
    fld_date: new Date().toISOString().split('T')[0]
  });

  // Fetch teacher's progress notes
  const { data: progressNotes, isLoading } = useQuery<ProgressNote[]>({
    queryKey: ['teacherProgressNotes', user?.fld_id],
    queryFn: async () => {
      if (!user?.fld_id) throw new Error('User not authenticated');

      // Get teacher ID
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select('fld_id')
        .eq('fld_uid', user.fld_id)
        .single();

      if (teacherError) throw teacherError;

      // Get progress notes
      const { data: notesData, error: notesError } = await supabase
        .from('tbl_teachers_students_notes')
        .select(`
          fld_id,
          fld_sid,
          fld_body,
          fld_edate,
          fld_uname
        `)
        .eq('fld_tid', teacher.fld_id)
        .order('fld_edate', { ascending: false });

      if (notesError) throw notesError;

      // Get student and subject information for each note
      const notesWithDetails = await Promise.all(
        notesData?.map(async (note) => {
          // Get student info
          const { data: student } = await supabase
            .from('tbl_students')
            .select('fld_first_name, fld_last_name')
            .eq('fld_id', note.fld_sid)
            .single();

          // Get subject info
          const { data: subject } = await supabase
            .from('tbl_students_subjects')
            .select(`
              fld_suid,
              tbl_subjects(fld_subject)
            `)
            .eq('fld_sid', note.fld_sid)
            .limit(1)
            .single();

          return {
            ...note,
            student_name: student ? `${student.fld_first_name} ${student.fld_last_name}` : 'Unknown Student',
            subject: subject?.tbl_subjects?.fld_subject || 'Unknown Subject'
          };
        }) || []
      );

      return notesWithDetails;
    },
    enabled: !!user?.fld_id
  });

  // Fetch teacher's students for the add form
  const { data: students } = useQuery<Student[]>({
    queryKey: ['teacherStudentsForNotes', user?.fld_id],
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

  // Add new progress note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (noteData: typeof newNote) => {
      if (!user?.fld_id) throw new Error('User not authenticated');

      // Get teacher ID
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select('fld_id')
        .eq('fld_uid', user.fld_id)
        .single();

      if (teacherError) throw teacherError;

      const { error } = await supabase
        .from('tbl_teachers_students_notes')
        .insert({
          fld_tid: teacher.fld_id,
          fld_sid: parseInt(noteData.fld_sid),
          fld_body: noteData.fld_body,
          fld_edate: noteData.fld_date,
          fld_subject: 'General', // Default subject since it's required
          fld_uname: user.fld_id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherProgressNotes'] });
      setIsAddDialogOpen(false);
      setNewNote({
        fld_sid: '',
        fld_body: '',
        fld_date: new Date().toISOString().split('T')[0]
      });
      toast.success('Progress note added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add progress note: ' + error.message);
    }
  });

  // Update progress note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, note }: { id: number; note: string }) => {
      const { error } = await supabase
        .from('tbl_teachers_students_notes')
        .update({ fld_body: note })
        .eq('fld_id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherProgressNotes'] });
      setIsEditDialogOpen(false);
      setEditingNote(null);
      toast.success('Progress note updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update progress note: ' + error.message);
    }
  });

  // Delete progress note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      const { error } = await supabase
        .from('tbl_teachers_students_notes')
        .delete()
        .eq('fld_id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherProgressNotes'] });
      toast.success('Progress note deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete progress note: ' + error.message);
    }
  });

  const handleAddNote = () => {
    if (!newNote.fld_sid || !newNote.fld_body) {
      toast.error('Please fill in all required fields');
      return;
    }
    addNoteMutation.mutate(newNote);
  };

  const handleEditNote = (note: ProgressNote) => {
    setEditingNote(note);
    setIsEditDialogOpen(true);
  };

  const handleUpdateNote = () => {
    if (!editingNote) return;
    updateNoteMutation.mutate({ 
      id: editingNote.fld_id, 
      note: editingNote.fld_body 
    });
  };

  const handleDeleteNote = (noteId: number) => {
    if (confirm('Are you sure you want to delete this progress note?')) {
      deleteNoteMutation.mutate(noteId);
    }
  };

  const filteredNotes = progressNotes?.filter(note => {
    const matchesSearch = 
      note.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.fld_body.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStudent = studentFilter === 'all' || note.fld_sid.toString() === studentFilter;
    
    return matchesSearch && matchesStudent;
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
        <h1 className="text-3xl font-bold">Progress Notes</h1>
        <p className="text-muted-foreground">
          Track and document student progress and development
        </p>
      </div>

      {/* Add Note Button */}
      <div className="mb-6">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Progress Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Progress Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student">Student</Label>
                <Select value={newNote.fld_sid} onValueChange={(value) => setNewNote({ ...newNote, fld_sid: value })}>
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
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newNote.fld_date}
                  onChange={(e) => setNewNote({ ...newNote, fld_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Progress Note *</Label>
                <Textarea
                  id="note"
                  value={newNote.fld_body}
                  onChange={(e) => setNewNote({ ...newNote, fld_body: e.target.value })}
                  placeholder="Describe the student's progress..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddNote} disabled={addNoteMutation.isPending}>
                  {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
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
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={studentFilter} onValueChange={setStudentFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by student" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            {students?.map((student) => (
              <SelectItem key={student.fld_id} value={student.fld_id.toString()}>
                {student.fld_first_name} {student.fld_last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Progress Notes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Notes History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotes?.map((note) => (
                <TableRow key={note.fld_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {new Date(note.fld_edate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {note.student_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      {note.subject}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="text-sm">{note.fld_body}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditNote(note)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteNote(note.fld_id)}
                        disabled={deleteNoteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredNotes?.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No progress notes found</h3>
              <p className="text-gray-600">
                {searchTerm || studentFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start by adding your first progress note.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Note Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Progress Note</DialogTitle>
          </DialogHeader>
          {editingNote && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editNote">Progress Note</Label>
                <Textarea
                  id="editNote"
                  value={editingNote.fld_body}
                  onChange={(e) => setEditingNote({ ...editingNote, fld_body: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateNote} disabled={updateNoteMutation.isPending}>
                  {updateNoteMutation.isPending ? 'Updating...' : 'Update Note'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
