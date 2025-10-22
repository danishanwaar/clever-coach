import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudentMutations } from '@/hooks/useStudents';
import { useLevels } from '@/hooks/useLevels';
import { useSubjects } from '@/hooks/useSubjects';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createLead(formData);
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
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Lead</DialogTitle>
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
                      <SelectValue placeholder="Select title" />
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
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fld_last_name">Nachname</Label>
                  <Input
                    id="fld_last_name"
                    value={formData.fld_last_name}
                    onChange={(e) => handleInputChange('fld_last_name', e.target.value)}
                    placeholder="Enter last name"
                    required
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
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sohn">Sohn</SelectItem>
                      <SelectItem value="Tochter">Tochter</SelectItem>
                      <SelectItem value="Andere">Andere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fld_s_first_name">Nachname</Label>
                  <Input
                    id="fld_s_first_name"
                    value={formData.fld_s_first_name}
                    onChange={(e) => handleInputChange('fld_s_first_name', e.target.value)}
                    placeholder="Enter student first name"
                  />
                </div>
                <div>
                  <Label htmlFor="fld_s_last_name">Vorname</Label>
                  <Input
                    id="fld_s_last_name"
                    value={formData.fld_s_last_name}
                    onChange={(e) => handleInputChange('fld_s_last_name', e.target.value)}
                    placeholder="Enter student last name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fld_level">Klasse</Label>
                  <Select value={formData.fld_level} onValueChange={(value) => handleInputChange('fld_level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
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
                <div>
                  <Label htmlFor="fld_school">Schulform</Label>
                  <Input
                    id="fld_school"
                    value={formData.fld_school}
                    onChange={(e) => handleInputChange('fld_school', e.target.value)}
                    placeholder="Enter school type"
                  />
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
              <div>
                <Label htmlFor="fld_address">Straße, Nr</Label>
                <Input
                  id="fld_address"
                  value={formData.fld_address}
                  onChange={(e) => handleInputChange('fld_address', e.target.value)}
                  placeholder="Enter street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fld_zip">Postleitzahl</Label>
                  <Input
                    id="fld_zip"
                    value={formData.fld_zip}
                    onChange={(e) => handleInputChange('fld_zip', e.target.value)}
                    placeholder="Enter postal code"
                  />
                </div>
                <div>
                  <Label htmlFor="fld_city">Stadt</Label>
                  <Input
                    id="fld_city"
                    value={formData.fld_city}
                    onChange={(e) => handleInputChange('fld_city', e.target.value)}
                    placeholder="Enter city"
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
                    placeholder="Enter landline"
                  />
                </div>
                <div>
                  <Label htmlFor="fld_mobile">Tel. Mobil</Label>
                  <Input
                    id="fld_mobile"
                    value={formData.fld_mobile}
                    onChange={(e) => handleInputChange('fld_mobile', e.target.value)}
                    placeholder="Enter mobile"
                  />
                </div>
                <div>
                  <Label htmlFor="fld_email">E-Mail-Adresse</Label>
                  <Input
                    id="fld_email"
                    type="email"
                    value={formData.fld_email}
                    onChange={(e) => handleInputChange('fld_email', e.target.value)}
                    placeholder="Enter email"
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
              <div>
                <Label htmlFor="fld_sid">Subjects</Label>
                <Select 
                  value={formData.fld_sid} 
                  onValueChange={(value) => {
                    const currentSubjects = formData.fld_sid;
                    if (currentSubjects.includes(value)) {
                      handleInputChange('fld_sid', currentSubjects.filter(s => s !== value));
                    } else {
                      handleInputChange('fld_sid', [...currentSubjects, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((subject) => (
                      <SelectItem key={subject.fld_id} value={subject.fld_id.toString()}>
                        {subject.emoji} {subject.fld_subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.fld_sid.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.fld_sid.map((subjectId) => {
                      const subject = subjects?.find(s => s.fld_id.toString() === subjectId);
                      return (
                        <span key={subjectId} className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-sm">
                          {subject?.emoji} {subject?.fld_subject}
                          <button
                            type="button"
                            onClick={() => {
                              const newSubjects = formData.fld_sid.filter(s => s !== subjectId);
                              handleInputChange('fld_sid', newSubjects);
                            }}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
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
                    value="Current User" // This would come from auth context
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
                <Input
                  id="fld_notes"
                  value={formData.fld_notes}
                  onChange={(e) => handleInputChange('fld_notes', e.target.value)}
                  placeholder="Enter notes"
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingLead}>
              {isCreatingLead ? 'Creating...' : 'Save Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};


