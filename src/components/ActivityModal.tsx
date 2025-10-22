import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApplicants, Applicant, ApplicantActivity } from '@/hooks/useApplicants';
import { MessageSquare, X } from 'lucide-react';
import { toast } from 'sonner';

interface ActivityModalProps {
  applicant: Applicant | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ActivityModal({ applicant, isOpen, onClose }: ActivityModalProps) {
  const [activityTitle, setActivityTitle] = useState('');
  const [activityContent, setActivityContent] = useState('');

  const { 
    applicantActivities, 
    recordActivity,
    isRecordingActivity 
  } = useApplicants();

  if (!applicant) return null;

  const activities = applicantActivities.filter(activity => activity.fld_aid === applicant.fld_id);

  const handleRecordActivity = async () => {
    if (!activityTitle || !activityContent) {
      toast.error('Please fill in both title and content');
      return;
    }

    try {
      await recordActivity({
        applicantId: applicant.fld_id,
        title: activityTitle,
        content: activityContent
      });
      setActivityTitle('');
      setActivityContent('');
      toast.success('Activity recorded successfully');
    } catch (error) {
      console.error('Activity recording error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Activity - {applicant.fld_first_name} {applicant.fld_last_name}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Activity Form */}
          <div className="space-y-4">
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
                rows={4}
              />
            </div>
            <Button 
              onClick={handleRecordActivity}
              disabled={isRecordingActivity}
              className="w-full"
            >
              {isRecordingActivity ? 'Recording...' : 'Record Activity'}
            </Button>
          </div>

          {/* Activity History */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Activity History</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {activities.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No activities recorded yet</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.fld_id} className="border-l-2 border-primary pl-3 py-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{activity.fld_title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.fld_erdat).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.fld_content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      By: {activity.tbl_users?.fld_name}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}