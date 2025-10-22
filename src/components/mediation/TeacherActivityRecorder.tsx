import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageSquare, 
  CheckCircle
} from 'lucide-react';

interface TeacherActivityRecorderProps {
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentSubjectId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TeacherActivityRecorder = ({ 
  teacherId, 
  teacherName, 
  studentId, 
  studentSubjectId,
  onClose,
  onSuccess 
}: TeacherActivityRecorderProps) => {
  const [loading, setLoading] = useState(false);
  const [activityData, setActivityData] = useState({
    activity_type_id: '',
    description: '',
    notes: ''
  });
  const { toast } = useToast();

  const [activityTypes, setActivityTypes] = useState<any[]>([]);

  useEffect(() => {
    loadActivityTypes();
  }, []);

  const loadActivityTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_types')
        .select('id, name, description')
        .in('category', ['Teacher', 'Both'])
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setActivityTypes(data || []);
    } catch (error) {
      console.error('Error loading activity types:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activityData.activity_type_id || !activityData.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // Insert activity record
      const { error: activityError } = await supabase
        .from('teacher_activities')
        .insert({
          teacher_id: teacherId,
          activity_type_id: activityData.activity_type_id,
          admin_user_id: userData.user.id,
          description: activityData.description,
          notes: activityData.notes
        });

      if (activityError) throw activityError;

      toast({
        title: "Activity Recorded",
        description: "Teacher activity has been recorded successfully",
      });

      setActivityData({
        activity_type_id: '',
        description: '',
        notes: ''
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error recording activity:', error);
      toast({
        title: "Error",
        description: "Failed to record activity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Record Activity - {teacherName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activity_type">Activity Type *</Label>
            <Select
              value={activityData.activity_type_id}
              onValueChange={(value) => setActivityData(prev => ({ ...prev, activity_type_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="Brief description of the activity..."
              value={activityData.description}
              onChange={(e) => setActivityData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional details, outcomes, and important information..."
              value={activityData.notes}
              onChange={(e) => setActivityData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Record Activity
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
