import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { useState } from 'react';
import { User, Mail, Phone, MapPin, Edit, Save, Camera } from 'lucide-react';

export default function Profile() {
  const { user, updateUserProfile, isAdmin, isTeacher, isStudent } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const handleSave = async () => {
    await updateUserProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
    });
    setIsEditing(false);
  };

  const getInitials = () => {
    return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
  };

  const getRoleBadgeColor = () => {
    if (isAdmin()) return 'bg-red-100 text-red-800';
    if (isTeacher()) return 'bg-blue-100 text-blue-800';
    if (isStudent()) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getRoleText = () => {
    if (isAdmin()) return 'Administrator';
    if (isTeacher()) return 'Teacher';
    if (isStudent()) return 'Student';
    return 'User';
  };

  return (
    <>
      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="" alt={user?.firstName} />
                    <AvatarFallback className="text-lg font-semibold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <Badge className={getRoleBadgeColor()}>
                      {getRoleText()}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <div className={`w-2 h-2 rounded-full ${
                      user?.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    {user?.status}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  ) : (
                    <div className="p-3 border rounded-md bg-muted/50">
                      {user?.firstName}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  ) : (
                    <div className="p-3 border rounded-md bg-muted/50">
                      {user?.lastName}
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="p-3 border rounded-md bg-muted/50 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {user?.email}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Contact support to change your email address
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Your account information and verification status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Status</span>
                <Badge variant={user?.status === 'Active' ? 'default' : 'destructive'}>
                  {user?.status}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Verified</span>
                <Badge variant={user?.isVerified ? 'default' : 'outline'}>
                  {user?.isVerified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profile Complete</span>
                <Badge variant={user?.isFormFilled ? 'default' : 'outline'}>
                  {user?.isFormFilled ? 'Complete' : 'Incomplete'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Two-Factor Authentication
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Login History
              </Button>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </>
  );
}