import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMatchingEmails } from '@/hooks/useMatchingEmails';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  Edit,
  Trash2,
  Calendar,
  User
} from 'lucide-react';

interface MediationStage {
  id: string;
  mediation_type_id: string;
  mediation_types?: {
    name: string;
    description: string;
  };
  flag: string;
  note: string;
  entered_date: string;
  entered_time: string;
  teacher_id: string;
  teachers?: any;
  created_at: string;
}

interface MediationStagesManagerProps {
  studentSubjectId: string;
  onUpdate?: () => void;
}

export const MediationStagesManager = ({ studentSubjectId, onUpdate }: MediationStagesManagerProps) => {
  const [stages, setStages] = useState<MediationStage[]>([]);
  const [mediationTypes, setMediationTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const { toast } = useToast();
  const { sendAdminMatchingNotification } = useMatchingEmails();

  const [newStage, setNewStage] = useState({
    mediation_type_id: '',
    note: '',
    entered_date: new Date().toISOString().split('T')[0],
    entered_time: new Date().toTimeString().slice(0, 5),
    flag: 'Active'
  });

  useEffect(() => {
    loadMediationStages();
    loadMediationTypes();
  }, [studentSubjectId]);

  const loadMediationStages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mediation_stages')
        .select(`
          id,
          mediation_type_id,
          flag,
          note,
          entered_date,
          entered_time,
          teacher_id,
          created_at,
          mediation_types (
            name,
            description
          ),
          teachers (
            profiles:user_id (
              first_name,
              last_name
            )
          )
        `)
        .eq('student_subject_id', studentSubjectId)
        .order('entered_date', { ascending: false });

      if (error) throw error;
      setStages(data || []);
    } catch (error) {
      console.error('Error loading mediation stages:', error);
      toast({
        title: "Error",
        description: "Failed to load mediation stages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMediationTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('mediation_types')
        .select('id, name, description')
        .order('name');

      if (error) throw error;
      setMediationTypes(data || []);
    } catch (error) {
      console.error('Error loading mediation types:', error);
    }
  };

  const handleAddStage = async () => {
    if (!newStage.mediation_type_id) {
      toast({
        title: "Missing Type",
        description: "Please select a mediation type",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('mediation_stages')
        .insert({
          student_subject_id: studentSubjectId,
          mediation_type_id: newStage.mediation_type_id,
          flag: newStage.flag,
          note: newStage.note,
          entered_date: newStage.entered_date,
          entered_time: newStage.entered_time,
          teacher_id: null, // Will be set when teacher is assigned
          created_by: userData.user.id
        });

      if (error) throw error;

      // Send admin notification for important mediation stages
      try {
        // Get student and teacher info for email notification
        const { data: studentSubjectData } = await supabase
          .from('student_subjects')
          .select(`
            student_id,
            students!inner(
              id,
              first_name,
              last_name
            ),
            teacher_engagements!inner(
              teacher_id,
              teachers!inner(
                id,
                profiles!teachers_user_id_fkey(
                  first_name,
                  last_name
                )
              )
            )
          `)
          .eq('id', studentSubjectId)
          .single();

        if (studentSubjectData) {
          const studentId = studentSubjectData.student_id;
          const teacherId = studentSubjectData.teacher_engagements?.[0]?.teachers?.id;
          
          if (studentId && teacherId) {
            // Get the newly created mediation stage
            const { data: newStageData } = await supabase
              .from('mediation_stages')
              .select('id')
              .eq('student_subject_id', studentSubjectId)
              .eq('mediation_type_id', newStage.mediation_type_id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (newStageData) {
              await sendAdminMatchingNotification(studentId, teacherId, newStageData.id);
            }
          }
        }
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
        // Don't fail the operation if email fails
      }

      toast({
        title: "Stage Added",
        description: "Mediation stage has been added successfully",
      });

      setNewStage({
        mediation_type_id: '',
        note: '',
        entered_date: new Date().toISOString().split('T')[0],
        entered_time: new Date().toTimeString().slice(0, 5),
        flag: 'Active'
      });
      setShowAddForm(false);
      loadMediationStages();
      onUpdate?.();
    } catch (error) {
      console.error('Error adding mediation stage:', error);
      toast({
        title: "Error",
        description: "Failed to add mediation stage",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStage = async (stageId: string, updates: Partial<MediationStage>) => {
    try {
      const { error } = await supabase
        .from('mediation_stages')
        .update(updates)
        .eq('id', stageId);

      if (error) throw error;

      toast({
        title: "Stage Updated",
        description: "Mediation stage has been updated successfully",
      });

      loadMediationStages();
      setEditingStage(null);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating mediation stage:', error);
      toast({
        title: "Error",
        description: "Failed to update mediation stage",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    try {
      const { error } = await supabase
        .from('mediation_stages')
        .delete()
        .eq('id', stageId);

      if (error) throw error;

      toast({
        title: "Stage Deleted",
        description: "Mediation stage has been deleted successfully",
      });

      loadMediationStages();
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting mediation stage:', error);
      toast({
        title: "Error",
        description: "Failed to delete mediation stage",
        variant: "destructive",
      });
    }
  };

  const getStageStatusColor = (flag: string) => {
    return flag === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading mediation stages...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Mediation Stages
            </CardTitle>
            <CardDescription>
              Track the progress of teacher-student mediation
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Stage
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Stage Form */}
        {showAddForm && (
          <div className="p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium mb-3">Add New Mediation Stage</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Mediation Type</Label>
                <Select
                  value={newStage.mediation_type_id}
                  onValueChange={(value) => setNewStage(prev => ({ ...prev, mediation_type_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {mediationTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newStage.flag}
                  onValueChange={(value: any) => setNewStage(prev => ({ ...prev, flag: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <input
                  id="date"
                  type="date"
                  value={newStage.entered_date}
                  onChange={(e) => setNewStage(prev => ({ ...prev, entered_date: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <input
                  id="time"
                  type="time"
                  value={newStage.entered_time}
                  onChange={(e) => setNewStage(prev => ({ ...prev, entered_time: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                placeholder="Add a note about this mediation stage..."
                value={newStage.note}
                onChange={(e) => setNewStage(prev => ({ ...prev, note: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddStage}>
                Add Stage
              </Button>
            </div>
          </div>
        )}

        {/* Stages List */}
        {stages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No mediation stages recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">
                        {stage.mediation_types?.name || 'Unknown Type'}
                      </h4>
                      <Badge className={getStageStatusColor(stage.flag)}>
                        {stage.flag}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(stage.entered_date)} at {stage.entered_time}
                      </div>
                    </div>
                    
                    {stage.teachers?.profiles && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <User className="h-3 w-3" />
                        Teacher: {stage.teachers.profiles.first_name} {stage.teachers.profiles.last_name}
                      </div>
                    )}
                    
                    {stage.note && (
                      <p className="text-sm text-gray-600">{stage.note}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingStage(stage.id)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteStage(stage.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
