import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApplicants, Applicant, ApplicantActivity } from '@/hooks/useApplicants';
import { useTeachers, Teacher, TeacherActivity } from '@/hooks/useTeachers';
import { useStudentActivity, StudentActivity } from '@/hooks/useStudentActivity';
import { Student } from '@/hooks/useStudents';
import { MessageSquare, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ActivityModalProps {
  applicant?: Applicant | null;
  teacher?: Teacher | null;
  student?: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ActivityModal({ applicant, teacher, student, isOpen, onClose }: ActivityModalProps) {
  const [activityTitle, setActivityTitle] = useState('');
  const [activityContent, setActivityContent] = useState('');

  // Determine which entity we're working with
  const isApplicant = !!applicant;
  const isTeacher = !!teacher;
  const isStudent = !!student;
  const entity = applicant || teacher || student;

  // Use appropriate hooks based on entity type
  const applicantHooks = useApplicants();
  const teacherHooks = useTeachers();
  const studentHooks = useStudentActivity(student?.fld_id || 0);

  const { 
    applicantActivities, 
    activityTypes: applicantActivityTypes,
    recordActivity: recordApplicantActivity,
    isRecordingActivity: isRecordingApplicantActivity 
  } = applicantHooks;

  const { 
    teacherActivities, 
    activityTypes: teacherActivityTypes,
    recordActivity: recordTeacherActivity,
    isRecordingActivity: isRecordingTeacherActivity 
  } = teacherHooks;

  const { 
    activities: studentActivities, 
    activityTypes: studentActivityTypes,
    createActivity: createStudentActivity,
    isCreating: isCreatingStudentActivity 
  } = studentHooks;

  // Use the appropriate data based on entity type
  const activities = isApplicant 
    ? applicantActivities.filter(activity => activity.fld_aid === entity?.fld_id)
    : isTeacher 
    ? teacherActivities.filter(activity => activity.fld_tid === entity?.fld_id)
    : studentActivities;
  
  const activityTypes = isApplicant ? applicantActivityTypes : isTeacher ? teacherActivityTypes : studentActivityTypes;
  const recordActivity = isApplicant ? recordApplicantActivity : isTeacher ? recordTeacherActivity : createStudentActivity;
  const isRecordingActivity = isApplicant ? isRecordingApplicantActivity : isTeacher ? isRecordingTeacherActivity : isCreatingStudentActivity;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setActivityTitle('');
      setActivityContent('');
    }
  }, [isOpen]);

  // Prevent auto-focus when modal opens
  useEffect(() => {
    if (isOpen) {
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [isOpen]);

  if (!entity) return null;

  const handleRecordActivity = async () => {
    if (!activityTitle || !activityContent) {
      toast.error('Please fill in both title and content');
      return;
    }

    try {
      if (isApplicant) {
        await recordApplicantActivity({
          applicantId: entity.fld_id,
          title: activityTitle,
          content: activityContent
        });
      } else if (isTeacher) {
        await recordTeacherActivity({
          teacherId: entity.fld_id,
          title: activityTitle,
          content: activityContent
        });
      } else if (isStudent) {
        // Find the activity type ID from the selected title
        const activityType = activityTypes.find(type => type.fld_activity_name === activityTitle);
        if (!activityType) {
          toast.error('Invalid activity type selected');
          return;
        }
        
        await createStudentActivity({
          fld_sid: entity.fld_id,
          fld_activity_type_id: activityType.fld_id,
          fld_description: activityContent,
          fld_notes: activityContent
        });
      }
      setActivityTitle('');
      setActivityContent('');
      toast.success('Activity recorded successfully');
    } catch (error) {
      console.error('Activity recording error:', error);
      toast.error('Failed to record activity');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Activity - {entity.fld_first_name} {entity.fld_last_name}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Activity Form */}
          <div className="space-y-4">

            <div>
              <Label htmlFor="activityTitle">Activity Title *</Label>
              <Select value={activityTitle} onValueChange={setActivityTitle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity type for title" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type.fld_id} value={type.fld_activity_name}>
                      {type.fld_activity_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="activityContent">Activity Content *</Label>
              <Textarea
                id="activityContent"
                placeholder="Enter activity details"
                value={activityContent}
                onChange={(e) => setActivityContent(e.target.value)}
                rows={4}
              />
            </div>
            <Button 
              onClick={handleRecordActivity}
              disabled={isRecordingActivity || !activityTitle || !activityContent}
              className="w-full"
            >
              {isRecordingActivity ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Record Activity
                </>
              )}
            </Button>
          </div>

          {/* Activity History */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Activity History</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {activities.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No activities recorded yet</p>
              ) : (
                activities.map((activity) => {
                  // Handle different activity structures
                  const title = isStudent 
                    ? activity.tbl_activities_types?.fld_activity_name || 'Activity'
                    : activity.fld_title;
                  const content = isStudent 
                    ? activity.fld_description || activity.fld_notes || ''
                    : activity.fld_content;
                  const date = isStudent 
                    ? activity.fld_edate 
                    : activity.fld_erdat;
                  const createdBy = isStudent 
                    ? 'System' // Student activities don't have user tracking
                    : activity.tbl_users?.fld_name;

                  return (
                    <div key={activity.fld_id} className="border-l-2 border-primary pl-3 py-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        By: {createdBy}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}