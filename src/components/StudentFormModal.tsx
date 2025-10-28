import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useStudents, useStudentMutations } from '@/hooks/useStudents';
import { useLevels } from '@/hooks/useLevels';
import { useSubjects } from '@/hooks/useSubjects';
import { useLessonDurations } from '@/hooks/useLessonDurations';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  User, 
  GraduationCap, 
  MapPin, 
  Phone, 
  Mail, 
  BookOpen, 
  FileText, 
  DollarSign, 
  Clock, 
  Plus, 
  Check, 
  X 
} from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StudentFormData {
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
  fld_reason: string;
  
  // Customer Data
  fld_address: string;
  fld_zip: string;
  fld_city: string;
  fld_phone: string;
  fld_mobile: string;
  fld_email: string;
  
  // Teaching & Pricing
  fld_payer: string;
  fld_ct: string;
  fld_wh: string;
  fld_ld: string;
  fld_l_mode: string;
  fld_price: string;
  fld_reg_fee: string;
  
  // Subjects
  fld_sid: string[];
  
  // Statistics
  fld_f_lead: string;
  fld_notes: string;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<StudentFormData>({
    fld_sal: '',
    fld_first_name: '',
    fld_last_name: '',
    fld_sd: '',
    fld_s_first_name: '',
    fld_s_last_name: '',
    fld_level: '',
    fld_school: '',
    fld_reason: '',
    fld_address: '',
    fld_zip: '',
    fld_city: '',
    fld_phone: '',
    fld_mobile: '',
    fld_email: '',
    fld_payer: '',
    fld_ct: '',
    fld_wh: '',
    fld_ld: '',
    fld_l_mode: '',
    fld_price: '',
    fld_reg_fee: '',
    fld_sid: [],
    fld_f_lead: '',
    fld_notes: '',
  });

  const { data: levels = [] } = useLevels();
  const { data: subjects = [] } = useSubjects();
  const { data: lessonDurations = [] } = useLessonDurations();
  const { createStudent, isCreating } = useStudentMutations();
  const { user } = useAuth();

  const handleInputChange = (field: keyof StudentFormData, value: string | string[]) => {
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
      
      await createStudent(formDataWithUser);
      toast.success('Student created successfully!');
      
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
        fld_reason: '',
        fld_address: '',
        fld_zip: '',
        fld_city: '',
        fld_phone: '',
        fld_mobile: '',
        fld_email: '',
        fld_payer: '',
        fld_ct: '',
        fld_wh: '',
        fld_ld: '',
        fld_l_mode: '',
        fld_price: '',
        fld_reg_fee: '',
        fld_sid: [],
        fld_f_lead: '',
        fld_notes: '',
      });
      
      // Close modal after successful creation
      onClose();
    } catch (error) {
      toast.error('Failed to create student. Please try again.');
    }
  };

  const generateOptions = (start: number, end: number) => {
    const options = [];
    for (let i = start; i <= end; i++) {
      options.push(i);
    }
    return options;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Plus className="h-6 w-6 text-primary" />
            Add New Student
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Create a new student record with all required information
          </DialogDescription>
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
                      <SelectValue placeholder="Select salutation" />
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fld_level" className="text-sm font-medium text-gray-700">Grade Level</Label>
                  <Select value={formData.fld_level} onValueChange={(value) => handleInputChange('fld_level', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level.fld_id} value={level.fld_level}>
                          {level.fld_level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fld_school" className="text-sm font-medium text-gray-700">School Type</Label>
                  <Select value={formData.fld_school} onValueChange={(value) => handleInputChange('fld_school', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select school type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Grundschule">Grundschule</SelectItem>
                      <SelectItem value="Realschule">Realschule</SelectItem>
                      <SelectItem value="Gymnasium">Gymnasium</SelectItem>
                      <SelectItem value="Gesamtschule">Gesamtschule</SelectItem>
                      <SelectItem value="Hauptschule">Hauptschule</SelectItem>
                      <SelectItem value="Berufsschule">Berufsschule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fld_reason" className="text-sm font-medium text-gray-700">Reason</Label>
                  <Select value={formData.fld_reason} onValueChange={(value) => handleInputChange('fld_reason', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nachhilfe">Nachhilfe</SelectItem>
                      <SelectItem value="Prüfungsvorbereitung">Prüfungsvorbereitung</SelectItem>
                      <SelectItem value="Hausaufgabenbetreuung">Hausaufgabenbetreuung</SelectItem>
                      <SelectItem value="Sprachförderung">Sprachförderung</SelectItem>
                      <SelectItem value="Lernschwierigkeiten">Lernschwierigkeiten</SelectItem>
                      <SelectItem value="Begabtenförderung">Begabtenförderung</SelectItem>
                    </SelectContent>
                  </Select>
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
                  placeholder="Enter address"
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
                    placeholder="Enter ZIP code"
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
                    required
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
                    placeholder="Enter phone number"
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
                    placeholder="Enter mobile number"
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
                    placeholder="Enter email address"
                    className="h-11"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teaching & Pricing */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <DollarSign className="h-5 w-5 text-gray-600" />
                Teaching & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fld_payer" className="text-sm font-medium text-gray-700">Payer</Label>
                  <Input
                    id="fld_payer"
                    value={formData.fld_payer}
                    onChange={(e) => handleInputChange('fld_payer', e.target.value)}
                    placeholder="Enter payer"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fld_ct" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Contract Duration
                  </Label>
                  <Select value={formData.fld_ct} onValueChange={(value) => handleInputChange('fld_ct', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select contract duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateOptions(1, 12).map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {month} Monate
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fld_wh" className="text-sm font-medium text-gray-700">Weekly Hours</Label>
                  <Select value={formData.fld_wh} onValueChange={(value) => handleInputChange('fld_wh', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select weekly hours" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateOptions(1, 10).map((hour) => (
                        <SelectItem key={hour} value={hour.toString()}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fld_ld" className="text-sm font-medium text-gray-700">Lesson Duration</Label>
                  <Select value={formData.fld_ld} onValueChange={(value) => handleInputChange('fld_ld', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select lesson duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {lessonDurations.map((duration) => (
                        <SelectItem key={duration.fld_id} value={duration.fld_l_duration}>
                          {duration.fld_l_duration}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fld_l_mode" className="text-sm font-medium text-gray-700">Learning Mode</Label>
                  <Select value={formData.fld_l_mode} onValueChange={(value) => handleInputChange('fld_l_mode', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select learning mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Onsite">Onsite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fld_price" className="text-sm font-medium text-gray-700">Price</Label>
                  <Input
                    id="fld_price"
                    type="number"
                    value={formData.fld_price}
                    onChange={(e) => handleInputChange('fld_price', e.target.value)}
                    placeholder="Enter price"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fld_reg_fee" className="text-sm font-medium text-gray-700">Registration Fee</Label>
                  <Input
                    id="fld_reg_fee"
                    type="number"
                    value={formData.fld_reg_fee}
                    onChange={(e) => handleInputChange('fld_reg_fee', e.target.value)}
                    placeholder="Enter registration fee"
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
                  {subjects.map((subject) => (
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
                        const subject = subjects.find(s => s.fld_id.toString() === subjectId);
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
                  <Select value={formData.fld_f_lead} onValueChange={(value) => handleInputChange('fld_f_lead', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select marketing source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Google">Google</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Flyer">Flyer</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Textarea
                  id="fld_notes"
                  value={formData.fld_notes}
                  onChange={(e) => handleInputChange('fld_notes', e.target.value)}
                  placeholder="Enter any additional notes"
                  rows={4}
                  className="resize-none"
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
              disabled={isCreating}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-medium"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Save Student
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};