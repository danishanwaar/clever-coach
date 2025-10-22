import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTeachers, Teacher, TeacherSubject, TeacherActivity } from '@/hooks/useTeachers';
import { Mail, Phone, MapPin, Calendar, User, GraduationCap, MessageSquare, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface TeacherDetailDrawerProps {
  teacher: Teacher | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusColors = {
  'New': 'bg-gray-100 text-gray-800',
  'Screening': 'bg-yellow-100 text-yellow-800',
  'Interview': 'bg-blue-100 text-blue-800',
  'Offer': 'bg-indigo-100 text-indigo-800',
  'Pending For Signature': 'bg-purple-100 text-purple-800',
  'Hired': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Deleted': 'bg-red-100 text-red-800',
  'Inactive': 'bg-gray-100 text-gray-800',
  'Waiting List': 'bg-blue-100 text-blue-800',
  'Unclear': 'bg-gray-100 text-gray-800',
};

export default function TeacherDetailDrawer({ teacher, isOpen, onClose }: TeacherDetailDrawerProps) {
  const [activityTitle, setActivityTitle] = useState('');
  const [activityContent, setActivityContent] = useState('');

  const { 
    teacherSubjects, 
    teacherActivities, 
    recordActivity,
    isRecordingActivity 
  } = useTeachers();

  if (!teacher) return null;

  const subjects = teacherSubjects.filter(subject => subject.fld_tid === teacher.fld_id);
  const activities = teacherActivities.filter(activity => activity.fld_tid === teacher.fld_id);

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return phone;
    const cleaned = phone.replace(/[\s()-]/g, '');
    if (cleaned.startsWith('0')) {
      return cleaned.replace(/^0/, '+49');
    }
    return cleaned;
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleRecordActivity = async () => {
    if (!activityTitle || !activityContent) {
      toast.error('Please fill in both title and content');
      return;
    }

    try {
      await recordActivity({
        teacherId: teacher.fld_id,
        title: activityTitle,
        content: activityContent
      });
      setActivityTitle('');
      setActivityContent('');
    } catch (error) {
      console.error('Activity recording error:', error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6" />
              <span>{teacher.fld_first_name} {teacher.fld_last_name}</span>
              <Badge className={statusColors[teacher.fld_status as keyof typeof statusColors]}>
                {teacher.fld_status}
              </Badge>
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)] pr-4">
          <div className="space-y-6 mt-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <div className="flex items-center space-x-2">
                      <span>{teacher.fld_email}</span>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:${teacher.fld_email}`}>
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <div className="flex items-center space-x-2">
                      <span>{teacher.fld_phone}</span>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`tel:${formatPhoneNumber(teacher.fld_phone)}`}>
                          <Phone className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                    <p>{teacher.fld_street}, {teacher.fld_zip} {teacher.fld_city}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                    <p>{teacher.fld_gender}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Age</Label>
                    <p>{calculateAge(teacher.fld_dob)} years old</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Education</Label>
                    <p>{teacher.fld_education}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Transport Mode</Label>
                    <p>{teacher.fld_t_mode}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Lesson Mode</Label>
                  <p>{teacher.fld_l_mode}</p>
                </div>
              </CardContent>
            </Card>

            {/* Subject Expertise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Subject Expertise</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {subjects.map((subject) => (
                    <div key={subject.fld_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{subject.tbl_subjects?.fld_subject}</p>
                        <p className="text-sm text-muted-foreground">
                          Level: {subject.tbl_levels?.fld_level} | Experience: {subject.fld_experience} years
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bio and Description */}
            <Card>
              <CardHeader>
                <CardTitle>Bio & Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Short Bio</Label>
                  <p className="mt-1 text-sm">{teacher.fld_short_bio || 'No bio provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Self Description</Label>
                  <p className="mt-1 text-sm">{teacher.fld_self || 'No description provided'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Record Activity Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Record Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="activityTitle">Activity Title</Label>
                  <Input
                    id="activityTitle"
                    placeholder="Enter activity title"
                    value={activityTitle}
                    onChange={(e) => setActivityTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="activityContent">Activity Content</Label>
                  <Textarea
                    id="activityContent"
                    placeholder="Enter activity details"
                    value={activityContent}
                    onChange={(e) => setActivityContent(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleRecordActivity}
                  disabled={isRecordingActivity}
                  className="w-full"
                >
                  {isRecordingActivity ? 'Recording...' : 'Record Activity'}
                </Button>
              </CardContent>
            </Card>

            {/* Activity History */}
            <Card>
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No activities recorded yet</p>
                  ) : (
                    activities.map((activity) => (
                      <div key={activity.fld_id} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{activity.fld_title}</h4>
                          <span className="text-sm text-muted-foreground">
                            {new Date(activity.fld_erdat).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{activity.fld_content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          By: {activity.tbl_users?.fld_name}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
