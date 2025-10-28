import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Calendar,
  Edit, 
  Save,
  Shield,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from 'date-fns';

export default function Profile() {
  const navigate = useNavigate();
  const { profile, authUserData, isLoading, updateProfile, changePassword, changePasswordMutation, isUpdating, isChangingPassword } = useProfile();
  const isAdminFn = useAuthStore((state) => state.isAdmin);
  const isTeacherFn = useAuthStore((state) => state.isTeacher);
  const isStudentFn = useAuthStore((state) => state.isStudent);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fld_name: profile?.fld_name || '',
  });

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Update form when profile data changes
  React.useEffect(() => {
    if (profile) {
      setFormData({
        fld_name: profile.fld_name || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!formData.fld_name.trim()) {
      alert('Name cannot be empty');
      return;
    }
    updateProfile({ fld_name: formData.fld_name });
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword) {
      alert('Please enter your current password');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      // Only close on success
      setIsPasswordDialogOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      // Redirect to home after successful password change
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      // Dialog stays open on error - error is already shown via toast
      console.error('Password change error:', error);
    }
  };

  const getRoleBadgeColor = () => {
    if (isAdminFn()) return 'bg-red-100 text-red-800';
    if (isTeacherFn()) return 'bg-blue-100 text-blue-800';
    if (isStudentFn()) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getRoleText = () => {
    if (isAdminFn()) return 'Administrator';
    if (isTeacherFn()) return 'Teacher';
    if (isStudentFn()) return 'Student';
    return 'User';
  };

  const getInitials = () => {
    if (!profile?.fld_name) return '';
    const names = profile.fld_name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return profile.fld_name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient">
              Profile Settings
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your account information and preferences
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              disabled={isUpdating}
            >
              {isEditing ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
            {isEditing && (
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={isUpdating}
              >
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Information Card */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-primary">
                {getInitials()}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {profile?.fld_name || 'Unknown User'}
                </h3>
                <Badge className={getRoleBadgeColor()}>
                  {getRoleText()}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{profile?.fld_email}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {authUserData?.last_sign_in_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Last login: {format(new Date(authUserData.last_sign_in_at), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${profile?.fld_status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>{profile?.fld_status || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fld_name" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              {isEditing ? (
                <Input
                  id="fld_name"
                  value={formData.fld_name}
                  onChange={(e) => setFormData({...formData, fld_name: e.target.value})}
                  placeholder="Enter your full name"
                  className="w-full"
                />
              ) : (
                <div className="p-3 border border-gray-300 rounded-md bg-gray-50">
                  {profile?.fld_name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="p-3 border border-gray-300 rounded-md bg-gray-50 flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{profile?.fld_email}</span>
              </div>
              <p className="text-xs text-gray-500">
                Contact support to change your email address
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Status & Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Status */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Account Status</span>
                <Badge variant={profile?.fld_status === 'Active' ? 'default' : 'destructive'}>
                  {profile?.fld_status || 'Unknown'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Email Verified</span>
                <Badge variant={profile?.fld_is_verify === 'Y' ? 'default' : 'outline'}>
                  {profile?.fld_is_verify === 'Y' ? 'Verified' : 'Pending'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Profile Complete</span>
                <Badge variant={profile?.fld_is_form_fill === 'Y' ? 'default' : 'outline'}>
                  {profile?.fld_is_form_fill === 'Y' ? 'Complete' : 'Incomplete'}
                </Badge>
              </div>

              {authUserData?.email_confirmed_at && (
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                  <span>Email confirmed</span>
                  <span>{format(new Date(authUserData.email_confirmed_at), 'MMM dd, yyyy')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <Lock className="h-5 w-5 text-red-600" />
              </div>
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start" disabled={isChangingPassword}>
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and choose a new one. Password must be at least 6 characters.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        placeholder="Enter your current password"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        placeholder="Enter new password (min 6 characters)"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handlePasswordChange} disabled={isChangingPassword}>
                      {isChangingPassword ? 'Changing...' : 'Change Password'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
