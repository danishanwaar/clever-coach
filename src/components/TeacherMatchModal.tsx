import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { BookOpen, User } from 'lucide-react';

interface TeacherMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: any;
  studentSubjects: any[];
  onMatch: (subjectIds: number[]) => void;
  isLoading: boolean;
}

const TeacherMatchModal: React.FC<TeacherMatchModalProps> = ({
  isOpen,
  onClose,
  teacher,
  studentSubjects,
  onMatch,
  isLoading,
}) => {
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);

  const handleSubjectToggle = (subjectId: number) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleMatch = () => {
    if (selectedSubjects.length === 0) {
      return;
    }
    onMatch(selectedSubjects);
    setSelectedSubjects([]);
  };

  const handleClose = () => {
    setSelectedSubjects([]);
    onClose();
  };

  if (!teacher) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Match Teacher with Student</DialogTitle>
          <DialogDescription>
            Select the subjects to match with {teacher.fld_first_name} {teacher.fld_last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Teacher Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <User className="h-4 w-4" />
              <span className="font-medium">{teacher.fld_first_name} {teacher.fld_last_name}</span>
              <Badge variant="outline">{teacher.fld_gender}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {teacher.fld_phone} • {teacher.fld_email}
            </p>
            <p className="text-sm text-muted-foreground">
              {teacher.fld_street}, {teacher.fld_zip} {teacher.fld_city}
            </p>
          </div>

          {/* Available Subjects */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Available Subjects</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {studentSubjects
                .filter(subject => !subject.is_mediated)
                .map((subject) => (
                  <div key={subject.fld_id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subject-${subject.fld_id}`}
                      checked={selectedSubjects.includes(subject.fld_id)}
                      onCheckedChange={() => handleSubjectToggle(subject.fld_id)}
                    />
                    <Label
                      htmlFor={`subject-${subject.fld_id}`}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>{subject.fld_subject}</span>
                    </Label>
                  </div>
                ))}
            </div>
          </div>

          {/* Selected Subjects Summary */}
          {selectedSubjects.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Selected Subjects ({selectedSubjects.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSubjects.map(subjectId => {
                  const subject = studentSubjects.find(s => s.fld_id === subjectId);
                  return (
                    <Badge key={subjectId} variant="secondary">
                      {subject?.fld_subject}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Available Subjects */}
          {studentSubjects.filter(subject => !subject.is_mediated).length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No available subjects to match</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleMatch}
            disabled={selectedSubjects.length === 0 || isLoading}
          >
            {isLoading ? 'Matching...' : 'Match Teacher'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherMatchModal;
