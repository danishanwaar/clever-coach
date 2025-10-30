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
import { useAuthStore } from '@/stores/authStore';
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
  const { isAdmin, isTeacher: isTeacherUser } = useAuthStore();

  // Determine which entity we're working with
  const isApplicant = !!applicant;
  const isTeacher = !!teacher;
  const isStudent = !!student;
  const entity = applicant || teacher || student;
  
  // Determine if current user is admin or teacher for student activities
  const isAdminUser = isAdmin();
  const isTeacherRole = isTeacherUser();

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
        // Admin uses tbl_activity_students with title and content
        if (isAdminUser) {
          await createStudentActivity({
            fld_sid: entity.fld_id,
            title: activityTitle,
            content: activityContent
          });
        } else {
          // Teacher uses tbl_teachers_students_activity with activity_type_id and description
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
      <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] p-0 flex flex-col bg-white border-0 shadow-2xl rounded-xl sm:rounded-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Activity - {entity.fld_first_name} {entity.fld_last_name}</DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 sm:p-6 flex-shrink-0 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                Activity - {entity.fld_first_name} {entity.fld_last_name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Record and view activity history
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 min-h-0">
          <div className="space-y-6">
            {/* Add New Activity Form */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                Add New Activity
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="activityTitle" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Activity Title <span className="text-red-500">*</span>
                  </Label>
                  <Select value={activityTitle} onValueChange={setActivityTitle}>
                    <SelectTrigger className="w-full text-sm sm:text-base border-gray-300 rounded-lg">
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.length === 0 ? (
                        <SelectItem value="no-types" disabled>
                          No activity types available
                        </SelectItem>
                      ) : (
                        activityTypes.map((type) => (
                          <SelectItem key={type.fld_id} value={type.fld_activity_name}>
                            {type.fld_activity_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="activityContent" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Activity Content <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="activityContent"
                    placeholder="Enter activity details..."
                    value={activityContent}
                    onChange={(e) => setActivityContent(e.target.value)}
                    rows={4}
                    className="text-sm sm:text-base border-gray-300 rounded-lg resize-none"
                  />
                </div>

                <Button 
                  onClick={handleRecordActivity}
                  disabled={isRecordingActivity || !activityTitle || !activityContent}
                  className="w-full bg-primary hover:bg-primary/90 text-white text-sm sm:text-base h-10 sm:h-11 rounded-lg font-medium"
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
            </div>

            {/* Activity History */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                  Activity History
                </h3>
                <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {activities.length}
                </span>
              </div>
              
              <div className={`space-y-2 pr-2 ${activities.length > 2 ? 'max-h-[280px] overflow-y-auto' : ''}`}>
                {activities.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-xl border border-gray-200">
                    <MessageSquare className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm sm:text-base text-gray-500 font-medium">No activities recorded yet</p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">Start by adding your first activity above</p>
                  </div>
                ) : (
                  activities.map((activity) => {
                    // Handle different activity structures
                    const title = isStudent 
                      ? activity.tbl_activities_types?.fld_activity_name || activity.fld_title || 'Activity'
                      : activity.fld_title;
                    const content = isStudent 
                      ? activity.fld_description || activity.fld_notes || activity.fld_content || ''
                      : activity.fld_content;
                    const date = isStudent 
                      ? activity.fld_edate || activity.fld_erdat
                      : activity.fld_erdat;
                    const createdBy = isStudent 
                      ? activity.tbl_users?.fld_name || 'Unknown'
                      : activity.tbl_users?.fld_name || 'Unknown';

                    return (
                      <div 
                        key={activity.fld_id} 
                        className="bg-white rounded-lg border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow p-3 sm:p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-1">
                          <h4 className="font-semibold text-sm text-gray-900 flex-1 line-clamp-1">
                            {title}
                          </h4>
                          <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                            {new Date(date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-2 line-clamp-2">
                          {content}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="font-medium">By:</span>
                          <span className="ml-1">{createdBy}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6 flex-shrink-0 rounded-b-xl">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto text-sm sm:text-base rounded-lg h-10 sm:h-11"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}