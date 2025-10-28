import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useStudentMutations } from '@/hooks/useStudents';
import { useLevels } from '@/hooks/useLevels';
import { useSubjects } from '@/hooks/useSubjects';
import { useLessonDurations } from '@/hooks/useLessonDurations';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { X, User, GraduationCap, MapPin, Phone, Mail, BookOpen, FileText, Plus, Check } from 'lucide-react';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LeadFormData {
  // Contact Information
  fld_sal: string;
  fld_first_name: string;
  fld_last_name: string;
  
  // Student Data
  fld_sd: string;
  fld_s_first_name: string;
  fld_s_last_name: string;
  fld_level: string;
  fld_school: string;
  
  // Customer Data
  fld_address: string;
  fld_zip: string;
  fld_city: string;
  fld_phone: string;
  fld_mobile: string;
  fld_email: string;
  
  // Subjects
  fld_sid: string[];
  
  // Statistics
  fld_f_lead: string;
  fld_notes: string;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({ isOpen, onClose }) => {
  const { createLead, isCreatingLead } = useStudentMutations();
  const { data: levels } = useLevels();
  const { data: subjects } = useSubjects();
  const { data: lessonDurations = [] } = useLessonDurations();
  const { user } = useAuth();

  const [formData, setFormData] = useState<LeadFormData>({
    fld_sal: '',
    fld_first_name: '',
    fld_last_name: '',
    fld_sd: '',
    fld_s_first_name: '',
    fld_s_last_name: '',
    fld_level: '',
    fld_school: '',
    fld_address: '',
    fld_zip: '',
    fld_city: '',
    fld_phone: '',
    fld_mobile: '',
    fld_email: '',
    fld_sid: [],
    fld_f_lead: '',
    fld_notes: '',
  });

  const handleInputChange = (field: keyof LeadFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubjectToggle = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      fld_sid: prev.fld_sid.includes(subjectId)
        ? prev.fld_sid.filter(id => id !== subjectId)
        : [...prev.fld_sid, subjectId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Add user ID to form data
      const formDataWithUser = {
        ...formData,
        fld_uname: user?.fld_id || null
      };
      
      await createLead(formDataWithUser);
      toast.success('Lead created successfully!');
      
      // Reset form
      setFormData({
        fld_sal: '',
        fld_first_name: '',
        fld_last_name: '',
        fld_sd: '',
        fld_s_first_name: '',
        fld_s_last_name: '',
        fld_level: '',
        fld_school: '',
        fld_address: '',
        fld_zip: '',
        fld_city: '',
        fld_phone: '',
        fld_mobile: '',
        fld_email: '',
        fld_sid: [],
        fld_f_lead: '',
        fld_notes: '',
      });
      
      // Close modal after successful creation
      onClose();
    } catch (error) {
      toast.error('Failed to create lead. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Plus className="h-6 w-6 text-primary" />
            Create New Lead
          </DialogTitle>
          <p className="text-gray-600">Add a new lead to the system</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <User className="h-5 w-5 text-gray-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fld_sal" className="text-sm font-medium text-gray-700">Title</Label>
                  <Select value={formData.fld_sal} onValueChange={(value) => handleInputChange('fld_sal', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Herr">Herr</SelectItem>
                      <SelectItem value="Frau">Frau</SelectItem>
                      <SelectItem value="Divers">Divers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fld_first_name" className="text-sm font-medium text-gray-700">First Name</Label>
                  <Input
                    id="fld_first_name"
                    value={formData.fld_first_name}
                    onChange={(e) => handleInputChange('fld_first_name', e.target.value)}
                    placeholder="Enter first name"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fld_last_name" className="text-sm font-medium text-gray-700">Last Name</Label>
                  <Input
                    id="fld_last_name"
                    value={formData.fld_last_name}
                    onChange={(e) => handleInputChange('fld_last_name', e.target.value)}
                    placeholder="Enter last name"
                    className="h-11"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Data */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <GraduationCap className="h-5 w-5 text-gray-600" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fld_sd" className="text-sm font-medium text-gray-700">Relation</Label>
                  <Select value={formData.fld_sd} onValueChange={(value) => handleInputChange('fld_sd', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select relation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sohn">Sohn</SelectItem>
                      <SelectItem value="Tochter">Tochter</SelectItem>
                      <SelectItem value="Andere">Andere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fld_s_first_name" className="text-sm font-medium text-gray-700">Student First Name</Label>
                  <Input
                    id="fld_s_first_name"
                    value={formData.fld_s_first_name}
                    onChange={(e) => handleInputChange('fld_s_first_name', e.target.value)}
                    placeholder="Enter student first name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fld_s_last_name" className="text-sm font-medium text-gray-700">Student Last Name</Label>
                  <Input
                    id="fld_s_last_name"
                    value={formData.fld_s_last_name}
                    onChange={(e) => handleInputChange('fld_s_last_name', e.target.value)}
                    placeholder="Enter student last name"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fld_level" className="text-sm font-medium text-gray-700">Grade Level</Label>
                  <Select value={formData.fld_level} onValueChange={(value) => handleInputChange('fld_level', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels?.map((level) => (
                        <SelectItem key={level.fld_id} value={level.fld_id.toString()}>
                          {level.fld_level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fld_school" className="text-sm font-medium text-gray-700">School Type</Label>
                  <Input
                    id="fld_school"
                    value={formData.fld_school}
                    onChange={(e) => handleInputChange('fld_school', e.target.value)}
                    placeholder="Enter school type"
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Data */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <MapPin className="h-5 w-5 text-gray-600" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fld_address" className="text-sm font-medium text-gray-700">Street Address</Label>
                <Input
                  id="fld_address"
                  value={formData.fld_address}
                  onChange={(e) => handleInputChange('fld_address', e.target.value)}
                  placeholder="Enter street address"
                  className="h-11"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fld_zip" className="text-sm font-medium text-gray-700">Postal Code</Label>
                  <Input
                    id="fld_zip"
                    value={formData.fld_zip}
                    onChange={(e) => handleInputChange('fld_zip', e.target.value)}
                    placeholder="Enter postal code"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fld_city" className="text-sm font-medium text-gray-700">City</Label>
                  <Input
                    id="fld_city"
                    value={formData.fld_city}
                    onChange={(e) => handleInputChange('fld_city', e.target.value)}
                    placeholder="Enter city"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fld_phone" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Landline
                  </Label>
                  <Input
                    id="fld_phone"
                    value={formData.fld_phone}
                    onChange={(e) => handleInputChange('fld_phone', e.target.value)}
                    placeholder="Enter landline"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fld_mobile" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Mobile
                  </Label>
                  <Input
                    id="fld_mobile"
                    value={formData.fld_mobile}
                    onChange={(e) => handleInputChange('fld_mobile', e.target.value)}
                    placeholder="Enter mobile"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fld_email" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="fld_email"
                    type="email"
                    value={formData.fld_email}
                    onChange={(e) => handleInputChange('fld_email', e.target.value)}
                    placeholder="Enter email"
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subjects */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <BookOpen className="h-5 w-5 text-gray-600" />
                Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">Select Subjects</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {subjects?.map((subject) => (
                    <div
                      key={subject.fld_id}
                      onClick={() => handleSubjectToggle(subject.fld_id.toString())}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        formData.fld_sid.includes(subject.fld_id.toString())
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{subject.emoji}</span>
                          <span className="text-sm font-medium">{subject.fld_subject}</span>
                        </div>
                        {formData.fld_sid.includes(subject.fld_id.toString()) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {formData.fld_sid.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Selected Subjects</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.fld_sid.map((subjectId) => {
                        const subject = subjects?.find(s => s.fld_id.toString() === subjectId);
                        return (
                          <Badge
                            key={subjectId}
                            variant="secondary"
                            className="px-3 py-1 bg-primary/10 text-primary border-primary/20"
                          >
                            <span className="mr-1">{subject?.emoji}</span>
                            {subject?.fld_subject}
                            <button
                              type="button"
                              onClick={() => handleSubjectToggle(subjectId)}
                              className="ml-2 text-primary hover:text-primary/70"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <FileText className="h-5 w-5 text-gray-600" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fld_f_lead" className="text-sm font-medium text-gray-700">Marketing Source</Label>
                  <Input
                    id="fld_f_lead"
                    value={formData.fld_f_lead}
                    onChange={(e) => handleInputChange('fld_f_lead', e.target.value)}
                    placeholder="Enter marketing source"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fld_uname" className="text-sm font-medium text-gray-700">Recorded By</Label>
                  <Input
                    id="fld_uname"
                    value={user?.fld_name || 'Loading...'}
                    readOnly
                    className="h-11 bg-gray-100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fld_notes" className="text-sm font-medium text-gray-700">Notes</Label>
                <textarea
                  id="fld_notes"
                  value={formData.fld_notes}
                  onChange={(e) => handleInputChange('fld_notes', e.target.value)}
                  placeholder="Enter any additional notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isCreatingLead}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-medium"
            >
              {isCreatingLead ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Create Lead
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};