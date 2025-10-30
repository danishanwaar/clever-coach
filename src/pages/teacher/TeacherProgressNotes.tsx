import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Search, Calendar, User, Trash2 } from 'lucide-react';
import { useTeacher, useTeacherProgressNotes, useTeacherProgressNoteStudents, useTeacherProgressNoteMutations } from '@/hooks/useTeacherProfile';
import { format } from 'date-fns';

export default function TeacherProgressNotes() {
  const { user } = useAuthStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNote, setNewNote] = useState({
    fld_sid: '',
    fld_note_subject: '',
    fld_note_body: ''
  });

  // Get teacher ID
  const { data: teacher } = useTeacher(user?.fld_id);
  
  // Fetch progress notes using hooks (following PHP: only students with contracts)
  const { data: progressNotes = [], isLoading } = useTeacherProgressNotes(teacher?.fld_id);
  const { data: students = [] } = useTeacherProgressNoteStudents(teacher?.fld_id);
  const { addNoteMutation, deleteNoteMutation } = useTeacherProgressNoteMutations();

  // Filter notes by search term (following PHP: search by student name)
  const filteredNotes = progressNotes.filter(note => {
    const matchesSearch = 
      note.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.fld_note_subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.fld_note_body.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleAddNote = () => {
    if (!newNote.fld_sid || !newNote.fld_note_subject || !newNote.fld_note_body || !teacher?.fld_id || !user?.fld_id) {
      return;
    }

    addNoteMutation.mutate({
      teacherId: teacher.fld_id,
      studentId: parseInt(newNote.fld_sid),
      subject: newNote.fld_note_subject,
      body: newNote.fld_note_body,
      userId: user.fld_id
    }, {
      onSuccess: () => {
        setNewNote({ fld_sid: '', fld_note_subject: '', fld_note_body: '' });
        setIsAddDialogOpen(false);
      }
    });
  };

  const handleDeleteNote = (noteId: number) => {
    if (confirm('Bist du dir sicher? Du mochtest diese Notiz loschen ?')) {
      deleteNoteMutation.mutate(noteId);
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
        <h1 className="text-xl font-bold text-primary">Fortschrittsnotizen</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Notizen hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Neue Notiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student">Schüler*innen <span className="text-red-500">*</span></Label>
                <Select 
                  value={newNote.fld_sid} 
                  onValueChange={(value) => setNewNote({ ...newNote, fld_sid: value })}
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
                <Label htmlFor="subject">Notiz Betreff <span className="text-red-500">*</span></Label>
                <Input
                  id="subject"
                  value={newNote.fld_note_subject}
                  onChange={(e) => setNewNote({ ...newNote, fld_note_subject: e.target.value })}
                  placeholder="Enter note subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Notiz Details <span className="text-red-500">*</span></Label>
                <Textarea
                  id="body"
                  value={newNote.fld_note_body}
                  onChange={(e) => setNewNote({ ...newNote, fld_note_body: e.target.value })}
                  placeholder="Enter note details"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddNote} 
                  disabled={addNoteMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {addNoteMutation.isPending ? 'Speichern...' : 'Speichern'}
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

      {/* Progress Notes Cards - Card-based layout following PHP business logic */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredNotes.map((note) => (
          <Card key={note.fld_id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-semibold text-xs">
                    {note.student_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-500">{note.student_name}</h3>
                  <p className="text-xs text-gray-900 font-medium mt-1">Betreff: {note.fld_note_subject}</p>
                  <p className="text-xs text-gray-700 mt-2 line-clamp-3">{note.fld_note_body}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(note.fld_edate), 'dd-MMM-yy')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <User className="h-3 w-3" />
                  <span>{note.user_name}</span>
                </div>
              </div>
              
              <div className="mt-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteNote(note.fld_id)}
                  disabled={deleteNoteMutation.isPending}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full h-8 text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {deleteNoteMutation.isPending ? 'Löschen...' : 'Löschen'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No progress notes found</h3>
            <p className="text-sm text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Start by adding your first progress note.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
