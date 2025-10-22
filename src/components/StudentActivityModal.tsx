import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Activity,
  X,
  Trash2
} from 'lucide-react';
import { useStudents, useStudentActivities, useStudentMutations } from '@/hooks/useStudents';

interface StudentActivityModalProps {
  studentId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentActivityModal: React.FC<StudentActivityModalProps> = ({
  studentId,
  isOpen,
  onClose,
}) => {
  const [activityTitle, setActivityTitle] = useState('');
  const [activityContent, setActivityContent] = useState('');

  const { data: students = [] } = useStudents('All');
  const { data: activities = [] } = useStudentActivities(studentId);
  const { recordActivity, isRecording } = useStudentMutations();

  const student = students.find(s => s.fld_id === studentId);

  if (!student) {
    return null;
  }

  const handleRecordActivity = () => {
    if (activityTitle.trim() && activityContent.trim()) {
      recordActivity({
        studentId,
        title: activityTitle,
        content: activityContent,
      });
      setActivityTitle('');
      setActivityContent('');
    }
  };

  const handleDeleteStudent = () => {
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      // TODO: Implement delete student functionality
      console.log('Delete student:', studentId);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Record Activity - {student.fld_s_first_name} {student.fld_s_last_name}
          </DialogTitle>
          <DialogDescription>
            Manage activities and actions for this student
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Name</Label>
                  <p className="text-sm mt-1">
                    {student.fld_s_first_name} {student.fld_s_last_name} ({student.fld_sal})
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-sm mt-1">{student.fld_email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <p className="text-sm mt-1">{student.fld_mobile}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <p className="text-sm mt-1">{student.fld_status}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Record New Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Record New Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="activity-title">Activity Title</Label>
                <Input
                  id="activity-title"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="Enter activity title"
                />
              </div>
              <div>
                <Label htmlFor="activity-content">Activity Details</Label>
                <Textarea
                  id="activity-content"
                  value={activityContent}
                  onChange={(e) => setActivityContent(e.target.value)}
                  placeholder="Enter activity details"
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleRecordActivity}
                  disabled={!activityTitle.trim() || !activityContent.trim() || isRecording}
                >
                  {isRecording ? 'Recording...' : 'Record Activity'}
                </Button>
                <Button variant="destructive" onClick={handleDeleteStudent}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Student
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No activities recorded</p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.fld_id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{activity.fld_title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{activity.fld_content}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>{new Date(activity.fld_erdat).toLocaleDateString()}</p>
                          <p>{new Date(activity.fld_erdat).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};


