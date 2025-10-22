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
import { useStudents, useStudentMutations } from '@/hooks/useStudents';
import { useLevels } from '@/hooks/useLevels';
import { useSubjects } from '@/hooks/useSubjects';
import { toast } from '@/hooks/use-toast';

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
  fld_gender: string;
  
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
    fld_gender: '',
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
  const { createStudent } = useStudentMutations();

  const handleInputChange = (field: keyof StudentFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubjectChange = (subjectId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      fld_sid: checked 
        ? [...prev.fld_sid, subjectId]
        : prev.fld_sid.filter(id => id !== subjectId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createStudent(formData);
      toast({
        title: 'Student Created',
        description: 'Student has been created successfully.',
      });
      onClose();
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
        fld_gender: '',
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
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create student. Please try again.',
        variant: 'destructive',
      });
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Student</DialogTitle>
          <DialogDescription>
            Create a new student record with all required information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Ansprechpartner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fld_sal">Anrede</Label>
                  <Select value={formData.fld_sal} onValueChange={(value) => handleInputChange('fld_sal', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select salutation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Herr">Herr</SelectItem>
                      <SelectItem value="Frau">Frau</SelectItem>
                      <SelectItem value="Divers">Divers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fld_first_name">Vorname</Label>
                  <Input
                    id="fld_first_name"
                    value={formData.fld_first_name}
                    onChange={(e) => handleInputChange('fld_first_name', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="fld_last_name">Nachname</Label>
                  <Input
                    id="fld_last_name"
                    value={formData.fld_last_name}
                    onChange={(e) => handleInputChange('fld_last_name', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Data */}
          <Card>
            <CardHeader>
              <CardTitle>Schülerdaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fld_sd">Sohn/Tochter</Label>
                  <Select value={formData.fld_sd} onValueChange={(value) => handleInputChange('fld_sd', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sohn">Sohn</SelectItem>
                      <SelectItem value="Tochter">Tochter</SelectItem>
                      <SelectItem value="Andere">Andere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fld_s_first_name">Vorname</Label>
                  <Input
                    id="fld_s_first_name"
                    value={formData.fld_s_first_name}
                    onChange={(e) => handleInputChange('fld_s_first_name', e.target.value)}
                    placeholder="Enter student first name"
                  />
                </div>
                <div>
                  <Label htmlFor="fld_s_last_name">Nachname</Label>
                  <Input
                    id="fld_s_last_name"
                    value={formData.fld_s_last_name}
                    onChange={(e) => handleInputChange('fld_s_last_name', e.target.value)}
                    placeholder="Enter student last name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fld_level">Klasse</Label>
                  <Select value={formData.fld_level} onValueChange={(value) => handleInputChange('fld_level', value)}>
                    <SelectTrigger>
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
                <div>
                  <Label htmlFor="fld_school">Schulform</Label>
                  <Input
                    id="fld_school"
                    value={formData.fld_school}
                    onChange={(e) => handleInputChange('fld_school', e.target.value)}
                    placeholder="Enter school type"
                  />
                </div>
                <div>
                  <Label htmlFor="fld_reason">Grund</Label>
                  <Input
                    id="fld_reason"
                    value={formData.fld_reason}
                    onChange={(e) => handleInputChange('fld_reason', e.target.value)}
                    placeholder="Enter reason"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fld_gender">Geschlecht</Label>
                  <Select value={formData.fld_gender} onValueChange={(value) => handleInputChange('fld_gender', value)}>
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
            </CardContent>
          </Card>

          {/* Customer Data */}
          <Card>
            <CardHeader>
              <CardTitle>Kundendaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fld_address">Straße, Nr</Label>
                  <Input
                    id="fld_address"
                    value={formData.fld_address}
                    onChange={(e) => handleInputChange('fld_address', e.target.value)}
                    placeholder="Enter address"
                  />
                </div>
                <div>
                  <Label htmlFor="fld_zip">PLZ/Ort</Label>
                  <Input
                    id="fld_zip"
                    value={formData.fld_zip}
                    onChange={(e) => handleInputChange('fld_zip', e.target.value)}
                    placeholder="Enter ZIP code"
                  />
                </div>
                <div>
                  <Label htmlFor="fld_city">Stadt</Label>
                  <Input
                    id="fld_city"
                    value={formData.fld_city}
                    onChange={(e) => handleInputChange('fld_city', e.target.value)}
                    placeholder="Enter city"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fld_phone">Tel. Festnetz</Label>
                  <Input
                    id="fld_phone"
                    value={formData.fld_phone}
                    onChange={(e) => handleInputChange('fld_phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="fld_mobile">Tel. Mobil</Label>
                  <Input
                    id="fld_mobile"
                    value={formData.fld_mobile}
                    onChange={(e) => handleInputChange('fld_mobile', e.target.value)}
                    placeholder="Enter mobile number"
                  />
                </div>
                <div>
                  <Label htmlFor="fld_email">E-Mail-Adresse</Label>
                  <Input
                    id="fld_email"
                    type="email"
                    value={formData.fld_email}
                    onChange={(e) => handleInputChange('fld_email', e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teaching & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Unterricht und Preis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fld_payer">Zahlungspflichtiger</Label>
                  <Input
                    id="fld_payer"
                    value={formData.fld_payer}
                    onChange={(e) => handleInputChange('fld_payer', e.target.value)}
                    placeholder="Enter payer"
                  />
                </div>
                <div>
                  <Label htmlFor="fld_ct">Vertragslaufzeit</Label>
                  <Select value={formData.fld_ct} onValueChange={(value) => handleInputChange('fld_ct', value)}>
                    <SelectTrigger>
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fld_wh">Wochenstunden</Label>
                  <Select value={formData.fld_wh} onValueChange={(value) => handleInputChange('fld_wh', value)}>
                    <SelectTrigger>
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
                <div>
                  <Label htmlFor="fld_ld">Unterrichtsdauer</Label>
                  <Input
                    id="fld_ld"
                    value={formData.fld_ld}
                    onChange={(e) => handleInputChange('fld_ld', e.target.value)}
                    placeholder="Enter lesson duration"
                  />
                </div>
                <div>
                  <Label htmlFor="fld_l_mode">Unterrichtsort</Label>
                  <Select value={formData.fld_l_mode} onValueChange={(value) => handleInputChange('fld_l_mode', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select learning mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Onsite">Onsite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fld_price">Preis</Label>
                  <Input
                    id="fld_price"
                    type="number"
                    value={formData.fld_price}
                    onChange={(e) => handleInputChange('fld_price', e.target.value)}
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <Label htmlFor="fld_reg_fee">Anmeldegebühr</Label>
                  <Input
                    id="fld_reg_fee"
                    type="number"
                    value={formData.fld_reg_fee}
                    onChange={(e) => handleInputChange('fld_reg_fee', e.target.value)}
                    placeholder="Enter registration fee"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subjects */}
          <Card>
            <CardHeader>
              <CardTitle>Fächer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <div key={subject.fld_id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`subject-${subject.fld_id}`}
                      checked={formData.fld_sid.includes(subject.fld_id.toString())}
                      onChange={(e) => handleSubjectChange(subject.fld_id.toString(), e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor={`subject-${subject.fld_id}`} className="flex items-center gap-2">
                      <span>{subject.emoji}</span>
                      {subject.fld_subject}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fld_f_lead">Werbemittel</Label>
                  <Input
                    id="fld_f_lead"
                    value={formData.fld_f_lead}
                    onChange={(e) => handleInputChange('fld_f_lead', e.target.value)}
                    placeholder="Enter marketing source"
                  />
                </div>
                <div>
                  <Label htmlFor="fld_admin">Kunde erfasst von</Label>
                  <Input
                    id="fld_admin"
                    value="Current User"
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notiz</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="fld_notes">Notiz</Label>
                <Textarea
                  id="fld_notes"
                  value={formData.fld_notes}
                  onChange={(e) => handleInputChange('fld_notes', e.target.value)}
                  placeholder="Enter notes"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Student
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
