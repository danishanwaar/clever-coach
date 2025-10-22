import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Calendar, GraduationCap, Edit, Save, X } from 'lucide-react';

interface TeacherProfile {
  fld_id: number;
  fld_first_name: string;
  fld_last_name: string;
  fld_email: string;
  fld_phone: string;
  fld_street: string;
  fld_zip: string;
  fld_city: string;
  fld_dob: string;
  fld_gender: "Männlich" | "Weiblich" | "Divers";
  fld_per_l_rate: number;
  fld_status: string;
  fld_onboard_date: string;
  fld_signature: string;
  subjects: Array<{
    fld_id: number;
    fld_subject: string;
    fld_level: number;
    fld_experience: number;
  }>;
  engagements: Array<{
    fld_id: number;
    fld_sid: number;
    fld_subject: string;
    fld_student_name: string;
    fld_status: string;
  }>;
}

export default function TeacherProfile() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<TeacherProfile>>({});

  // Fetch teacher profile data
  const { data: teacherProfile, isLoading } = useQuery<TeacherProfile>({
    queryKey: ['teacherProfile', user?.fld_id],
    queryFn: async () => {
      if (!user?.fld_id) throw new Error('User not authenticated');

      // Get teacher basic info
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select(`
          fld_id,
          fld_first_name,
          fld_last_name,
          fld_email,
          fld_phone,
          fld_street,
          fld_zip,
          fld_city,
          fld_dob,
          fld_gender,
          fld_per_l_rate,
          fld_status,
          fld_onboard_date,
          fld_signature
        `)
        .eq('fld_uid', user.fld_id)
        .single();

      if (teacherError) throw teacherError;

      // Get teacher subjects
      const { data: subjects, error: subjectsError } = await supabase
        .from('tbl_teachers_subjects_expertise')
        .select(`
          fld_id,
          fld_experience,
          fld_level,
          tbl_subjects(fld_subject)
        `)
        .eq('fld_tid', teacher.fld_id);

      if (subjectsError) throw subjectsError;

      // Get active engagements
      const { data: engagements, error: engagementsError } = await supabase
        .from('tbl_contracts_engagement')
        .select(`
          fld_id,
          fld_ssid,
          fld_status,
          tbl_students_subjects(
            fld_id,
            fld_sid,
            tbl_subjects(fld_subject),
            tbl_students(fld_first_name, fld_last_name)
          )
        `)
        .eq('fld_tid', teacher.fld_id)
        .eq('fld_status', 'Active');

      if (engagementsError) throw engagementsError;

      return {
        ...teacher,
        fld_per_l_rate: typeof teacher.fld_per_l_rate === 'string' ? parseFloat(teacher.fld_per_l_rate || '0') : teacher.fld_per_l_rate || 0,
        subjects: subjects?.map(s => ({
          fld_id: s.fld_id,
          fld_subject: s.tbl_subjects.fld_subject,
          fld_level: s.fld_level,
          fld_experience: s.fld_experience
        })) || [],
        engagements: engagements?.map(e => ({
          fld_id: e.fld_id,
          fld_sid: e.fld_ssid,
          fld_subject: e.tbl_students_subjects?.tbl_subjects?.fld_subject || '',
          fld_student_name: `${e.tbl_students_subjects?.tbl_students?.fld_first_name || ''} ${e.tbl_students_subjects?.tbl_students?.fld_last_name || ''}`.trim(),
          fld_status: e.fld_status
        })) || []
      };
    },
    enabled: !!user?.fld_id
  });

  // Update teacher profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<TeacherProfile>) => {
      if (!user?.fld_id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('tbl_teachers')
        .update({
          fld_first_name: data.fld_first_name,
          fld_last_name: data.fld_last_name,
          fld_phone: data.fld_phone,
          fld_street: data.fld_street,
          fld_zip: data.fld_zip,
          fld_city: data.fld_city,
          fld_dob: data.fld_dob,
          fld_gender: data.fld_gender
        })
        .eq('fld_uid', user.fld_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherProfile'] });
      setIsEditing(false);
      setEditData({});
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile: ' + error.message);
    }
  });

  const handleEdit = () => {
    if (teacherProfile) {
      setEditData(teacherProfile);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    updateProfileMutation.mutate(editData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!teacherProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">Unable to load your teacher profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your teacher profile and view your information
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="engagements">Active Engagements</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                {!isEditing ? (
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm" disabled={updateProfileMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={isEditing ? editData.fld_first_name || '' : teacherProfile.fld_first_name}
                    onChange={(e) => isEditing && setEditData({ ...editData, fld_first_name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={isEditing ? editData.fld_last_name || '' : teacherProfile.fld_last_name}
                    onChange={(e) => isEditing && setEditData({ ...editData, fld_last_name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={teacherProfile.fld_email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={isEditing ? editData.fld_phone || '' : teacherProfile.fld_phone}
                    onChange={(e) => isEditing && setEditData({ ...editData, fld_phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    value={isEditing ? editData.fld_street || '' : teacherProfile.fld_street}
                    onChange={(e) => isEditing && setEditData({ ...editData, fld_street: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={isEditing ? editData.fld_zip || '' : teacherProfile.fld_zip}
                    onChange={(e) => isEditing && setEditData({ ...editData, fld_zip: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={isEditing ? editData.fld_city || '' : teacherProfile.fld_city}
                    onChange={(e) => isEditing && setEditData({ ...editData, fld_city: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={isEditing ? editData.fld_dob || '' : teacherProfile.fld_dob}
                    onChange={(e) => isEditing && setEditData({ ...editData, fld_dob: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={isEditing ? editData.fld_gender || '' : teacherProfile.fld_gender}
                    onValueChange={(value) => isEditing && setEditData({ ...editData, fld_gender: value as "Männlich" | "Weiblich" | "Divers" })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Männlich">Männlich</SelectItem>
                      <SelectItem value="Weiblich">Weiblich</SelectItem>
                      <SelectItem value="Divers">Divers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Badge variant={teacherProfile.fld_status === 'Hired' ? 'default' : 'secondary'}>
                    {teacherProfile.fld_status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>Hourly Rate</Label>
                  <Input
                    value={`€${teacherProfile.fld_per_l_rate}`}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Onboard Date</Label>
                  <Input
                    value={new Date(teacherProfile.fld_onboard_date).toLocaleDateString()}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Teaching Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teacherProfile.subjects.map((subject) => (
                  <div key={subject.fld_id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg">{subject.fld_subject}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p><strong>Level:</strong> {subject.fld_level}</p>
                      <p><strong>Experience:</strong> {subject.fld_experience}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagements">
          <Card>
            <CardHeader>
              <CardTitle>Active Engagements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teacherProfile.engagements.length > 0 ? (
                  teacherProfile.engagements.map((engagement) => (
                    <div key={engagement.fld_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{engagement.fld_student_name}</h3>
                          <p className="text-gray-600">{engagement.fld_subject}</p>
                        </div>
                        <Badge variant="default">{engagement.fld_status}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No active engagements found.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
