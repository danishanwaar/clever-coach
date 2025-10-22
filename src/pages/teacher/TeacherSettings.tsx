import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Settings, User, Bell, Shield, Globe, Save, Eye, EyeOff } from 'lucide-react';

interface TeacherSettings {
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
  fld_is_available: "Y" | "N";
  fld_preferences: {
    email_notifications: boolean;
    sms_notifications: boolean;
    whatsapp_notifications: boolean;
    lesson_reminders: boolean;
    payment_notifications: boolean;
  };
}

export default function TeacherSettings() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<Partial<TeacherSettings>>({});
  interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch teacher settings
  const { data: teacherSettings, isLoading } = useQuery<TeacherSettings>({
    queryKey: ['teacherSettings', user?.fld_id],
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
          fld_is_available
        `)
        .eq('fld_uid', user.fld_id)
        .single();

      if (teacherError) throw teacherError;

      return {
        fld_id: teacher?.fld_id || 0,
        fld_first_name: teacher?.fld_first_name || '',
        fld_last_name: teacher?.fld_last_name || '',
        fld_email: teacher?.fld_email || '',
        fld_phone: teacher?.fld_phone || '',
        fld_street: teacher?.fld_street || '',
        fld_zip: teacher?.fld_zip || '',
        fld_city: teacher?.fld_city || '',
        fld_dob: teacher?.fld_dob || '',
        fld_gender: teacher?.fld_gender || 'Männlich' as "Männlich" | "Weiblich" | "Divers",
        fld_per_l_rate: typeof teacher?.fld_per_l_rate === 'string' ? parseFloat(teacher.fld_per_l_rate || '0') : teacher?.fld_per_l_rate || 0,
        fld_is_available: teacher?.fld_is_available || 'Y' as "Y" | "N",
        fld_preferences: {
          email_notifications: true,
          sms_notifications: false,
          whatsapp_notifications: true,
          lesson_reminders: true,
          payment_notifications: true
        }
      };
    },
    enabled: !!user?.fld_id
  });

  // Update teacher settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<TeacherSettings>) => {
      if (!user?.fld_id) throw new Error('User not authenticated');

      // Update teacher table
      const { error: teacherError } = await supabase
        .from('tbl_teachers')
        .update({
          fld_first_name: data.fld_first_name,
          fld_last_name: data.fld_last_name,
          fld_phone: data.fld_phone,
          fld_street: data.fld_street,
          fld_zip: data.fld_zip,
          fld_city: data.fld_city,
          fld_dob: data.fld_dob,
          fld_gender: data.fld_gender,
          fld_is_available: data.fld_is_available
        })
        .eq('fld_uid', user.fld_id);

      if (teacherError) throw teacherError;

      // Preferences are not stored in database for now
      // TODO: Implement preferences storage when table is created
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherSettings'] });
      setIsEditing(false);
      setSettings({});
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update settings: ' + error.message);
    }
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (passwordData: PasswordData) => {
      if (!user?.fld_id) throw new Error('User not authenticated');

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update password: ' + error.message);
    }
  });

  const handleEdit = () => {
    if (teacherSettings) {
      setSettings(teacherSettings);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSettings({});
  };

  const handlePasswordUpdate = () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    updatePasswordMutation.mutate(passwordData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!teacherSettings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings Not Found</h2>
          <p className="text-gray-600">Unable to load your settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                {!isEditing ? (
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm" disabled={updateSettingsMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
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
                    value={isEditing ? settings.fld_first_name || '' : teacherSettings.fld_first_name}
                    onChange={(e) => isEditing && setSettings({ ...settings, fld_first_name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={isEditing ? settings.fld_last_name || '' : teacherSettings.fld_last_name}
                    onChange={(e) => isEditing && setSettings({ ...settings, fld_last_name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={teacherSettings.fld_email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={isEditing ? settings.fld_phone || '' : teacherSettings.fld_phone}
                    onChange={(e) => isEditing && setSettings({ ...settings, fld_phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    value={isEditing ? settings.fld_street || '' : teacherSettings.fld_street}
                    onChange={(e) => isEditing && setSettings({ ...settings, fld_street: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={isEditing ? settings.fld_zip || '' : teacherSettings.fld_zip}
                    onChange={(e) => isEditing && setSettings({ ...settings, fld_zip: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={isEditing ? settings.fld_city || '' : teacherSettings.fld_city}
                    onChange={(e) => isEditing && setSettings({ ...settings, fld_city: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={isEditing ? settings.fld_is_available || '' : teacherSettings.fld_is_available}
                    onValueChange={(value) => isEditing && setSettings({ ...settings, fld_is_available: value as "Y" | "N" })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Weekends only">Weekends only</SelectItem>
                      <SelectItem value="Evenings only">Evenings only</SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={teacherSettings.fld_preferences.email_notifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      fld_preferences: {
                        ...teacherSettings.fld_preferences,
                        email_notifications: checked
                      }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={teacherSettings.fld_preferences.sms_notifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      fld_preferences: {
                        ...teacherSettings.fld_preferences,
                        sms_notifications: checked
                      }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>WhatsApp Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via WhatsApp</p>
                  </div>
                  <Switch
                    checked={teacherSettings.fld_preferences.whatsapp_notifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      fld_preferences: {
                        ...teacherSettings.fld_preferences,
                        whatsapp_notifications: checked
                      }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lesson Reminders</Label>
                    <p className="text-sm text-gray-600">Get reminded about upcoming lessons</p>
                  </div>
                  <Switch
                    checked={teacherSettings.fld_preferences.lesson_reminders}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      fld_preferences: {
                        ...teacherSettings.fld_preferences,
                        lesson_reminders: checked
                      }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Notifications</Label>
                    <p className="text-sm text-gray-600">Get notified about payments and invoices</p>
                  </div>
                  <Switch
                    checked={teacherSettings.fld_preferences.payment_notifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      fld_preferences: {
                        ...teacherSettings.fld_preferences,
                        payment_notifications: checked
                      }
                    })}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={updateSettingsMutation.isPending}>
                  {updateSettingsMutation.isPending ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handlePasswordUpdate} 
                  disabled={updatePasswordMutation.isPending}
                >
                  {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
