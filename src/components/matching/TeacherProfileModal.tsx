import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Star, 
  Clock, 
  Euro, 
  Users, 
  BookOpen,
  GraduationCap,
  Award,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';

interface TeacherProfileModalProps {
  teacher: any;
  isOpen: boolean;
  onClose: () => void;
  onAssign: () => void;
  isAssigning: boolean;
}

export const TeacherProfileModal = ({ teacher, isOpen, onClose, onAssign, isAssigning }: TeacherProfileModalProps) => {
  const [teacherDetails, setTeacherDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && teacher) {
      loadTeacherDetails();
    }
  }, [isOpen, teacher]);

  const loadTeacherDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email,
            phone
          ),
          teacher_subjects (
            id,
            subject_id,
            level_id,
            experience_years,
            teacher_per_lesson_rate,
            subjects (
              id,
              name,
              category
            ),
            levels (
              id,
              name,
              category
            )
          ),
          teacher_engagements (
            id,
            status,
            student_subjects (
              subjects (
                name
              )
            )
          )
        `)
        .eq('id', teacher.id)
        .single();

      if (error) throw error;
      setTeacherDetails(data);
    } catch (error) {
      console.error('Error loading teacher details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!teacher) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {teacher.profiles?.first_name} {teacher.profiles?.last_name}
              </h2>
              <p className="text-sm text-muted-foreground font-normal">
                Teacher Profile & Availability
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading teacher details...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Email:</span>
                      <span className="text-sm">{teacherDetails?.profiles?.email || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Phone:</span>
                      <span className="text-sm">{teacherDetails?.profiles?.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Age:</span>
                      <span className="text-sm">{teacherDetails?.age || 'Not specified'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Location:</span>
                      <span className="text-sm">
                        {teacherDetails?.city && teacherDetails?.state 
                          ? `${teacherDetails.city}, ${teacherDetails.state}`
                          : 'Not specified'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Learning Mode:</span>
                      <Badge variant="outline">{teacherDetails?.learning_mode || 'Not specified'}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Experience:</span>
                      <span className="text-sm">
                        {teacherDetails?.teacher_subjects?.reduce((sum: number, ts: any) => sum + (ts.experience_years || 0), 0) || 0} years
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subjects & Expertise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Teaching Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teacherDetails?.teacher_subjects?.map((ts: any) => (
                    <div key={ts.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{ts.subjects?.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {ts.levels?.name} • {ts.experience_years || 0} years experience
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(ts.teacher_per_lesson_rate || 0)}</p>
                          <p className="text-sm text-muted-foreground">per lesson</p>
                        </div>
                      </div>
                      <Badge variant="outline">{ts.subjects?.category}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Current Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {teacherDetails?.teacher_engagements?.filter((e: any) => e.status === 'Active').length > 0 ? (
                    teacherDetails.teacher_engagements
                      .filter((e: any) => e.status === 'Active')
                      .map((engagement: any) => (
                        <div key={engagement.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm font-medium">
                            {engagement.student_subjects?.subjects?.name}
                          </span>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No active students currently</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Compatibility Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Match Compatibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Overall Compatibility</span>
                    <Badge className={`${
                      teacher.compatibility >= 80 ? 'bg-green-100 text-green-800' :
                      teacher.compatibility >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {teacher.compatibility}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subject Match:</span>
                      <span className={teacher.subjectMatch ? 'text-green-600' : 'text-red-600'}>
                        {teacher.subjectMatch ? '✓ Perfect Match' : '✗ No Match'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Level Compatibility:</span>
                      <span className={teacher.levelMatch ? 'text-green-600' : 'text-red-600'}>
                        {teacher.levelMatch ? '✓ Compatible' : '✗ Not Compatible'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Distance:</span>
                      <span>{teacher.distance.toFixed(1)} km</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Availability:</span>
                      <span className={teacher.availability ? 'text-green-600' : 'text-red-600'}>
                        {teacher.availability ? '✓ Available' : '✗ Not Available'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button 
                onClick={onAssign}
                disabled={isAssigning}
                className="min-w-[120px]"
              >
                {isAssigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Assigning...
                  </>
                ) : (
                  'Assign Teacher'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
