import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStudentProgressNotes } from '@/hooks/useStudentProgressNotes';
import { useStudent } from '@/hooks/useStudents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Trash2, 
  User, 
  Calendar,
  FileText,
  AlertCircle
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';

export default function StudentProgressNotes() {
  const { id } = useParams<{ id: string }>();
  const studentId = parseInt(id || '0');
  const { data: student, isLoading: studentLoading } = useStudent(studentId);
  
  const {
    notes,
    isLoading,
    createNote,
    deleteNote,
    isCreating,
    isDeleting,
  } = useStudentProgressNotes(studentId);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    fld_subject: '',
    fld_body: '',
  });

  // Filter notes based on search term
  const filteredNotes = notes.filter(note => 
    note.fld_subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.fld_body.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tbl_users?.fld_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNote = () => {
    if (!newNote.fld_subject.trim() || !newNote.fld_body.trim()) {
      return;
    }

    createNote({
      fld_sid: studentId,
      fld_subject: newNote.fld_subject,
      fld_body: newNote.fld_body,
    });

    setNewNote({ fld_subject: '', fld_body: '' });
    setIsAddNoteOpen(false);
  };

  const handleDeleteNote = (noteId: number) => {
    deleteNote(noteId);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd-MMM-yy');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-semibold text-primary">Progress Notes</h2>
          <p className="text-xs sm:text-sm text-gray-600">Track and manage student progress notes</p>
        </div>
        <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Progress Note</DialogTitle>
              <DialogDescription>
                Add a new progress note for {student.fld_first_name} {student.fld_last_name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Progress Note Subject</Label>
                <Input
                  id="subject"
                  placeholder="Enter note subject"
                  value={newNote.fld_subject}
                  onChange={(e) => setNewNote(prev => ({ ...prev, fld_subject: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="body">Notes Detail</Label>
                <Textarea
                  id="body"
                  placeholder="Enter note details"
                  rows={3}
                  value={newNote.fld_body}
                  onChange={(e) => setNewNote(prev => ({ ...prev, fld_body: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote} disabled={isCreating || !newNote.fld_subject.trim() || !newNote.fld_body.trim()}>
                {isCreating ? 'Adding...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-primary focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Notes Cards */}
      <div className="space-y-4">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <div 
              key={note.fld_id}
              className="bg-white rounded-lg shadow-sm border-l-4 border-l-primary hover:shadow-md transition-all duration-200 group"
            >
              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  {/* Left Section - Note Info */}
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    {/* Note Icon */}
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm shadow-sm flex-shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    
                    {/* Note Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                          {note.fld_subject}
                        </h3>
                        <Badge className="bg-blue-100 text-blue-800 text-xs font-medium self-start sm:self-auto">
                          {formatDate(note.fld_edate)}
                        </Badge>
                      </div>
                      
                      {/* Note Info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="truncate">
                            {note.tbl_students?.fld_first_name} {note.tbl_students?.fld_last_name}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="truncate">By: {note.tbl_users?.fld_name}</span>
                        </div>
                      </div>

                      {/* Note Content */}
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {note.fld_body}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex items-center justify-end sm:justify-start space-x-2 flex-shrink-0 sm:self-start">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            You want to delete this progress note. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteNote(note.fld_id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No progress notes found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'No notes match your search criteria.' : 'This student has no progress notes yet.'}
            </p>
            {!searchTerm && (
              <Button 
                className="bg-primary hover:bg-primary/90" 
                onClick={() => setIsAddNoteOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Note
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}




