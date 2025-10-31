import * as React from 'react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTeacher, useTeacherSubjects } from '@/hooks/useTeacherProfile';
import { useTeacherSettings, useTeacherSettingsMutations } from '@/hooks/useTeacherSettings';
import { useSubjects } from '@/hooks/useSubjects';
import { useLevels } from '@/hooks/useLevels';
import { useEducational } from '@/hooks/useEducational';
import { useSourceOptions } from '@/hooks/useSourceOptions';
import { useDeleteReasons } from '@/hooks/useDeleteReasons';
import { Save, Trash2, Bus, Bike, Car, BookOpen, User, CreditCard, Navigation, AlertCircle } from 'lucide-react';

export default function TeacherSettings() {
  const { user } = useAuthStore();
  const isAdmin = user?.fld_rid === 1;
  
  // Get teacher ID - from auth user if teacher, or from URL param if admin
  const { data: teacher } = useTeacher(user?.fld_id);
  const teacherId = teacher?.fld_id;

  // Fetch all data
  const { data: settings, isLoading: settingsLoading } = useTeacherSettings(teacherId);
  const { data: teacherSubjects = [], isLoading: subjectsLoading } = useTeacherSubjects(teacherId);
  const { data: subjects = [] } = useSubjects();
  const { data: levels = [] } = useLevels();
  const { data: educationalOptions = [] } = useEducational();
  const { data: sourceOptions = [] } = useSourceOptions();
  const { data: deleteReasons = [] } = useDeleteReasons('Teacher');

  // Mutations
  const {
    updateBasicMutation,
    updateBankMutation,
    updateMobilityMutation,
    addSubjectMutation,
    deleteSubjectMutation,
    addUnavailabilityMutation,
    updateStatusMutation
  } = useTeacherSettingsMutations();

  // Form states
  const [basicForm, setBasicForm] = useState({
    fld_first_name: '',
    fld_last_name: '',
    fld_gender: '',
    fld_dob: '',
    fld_phone: '',
    fld_street: '',
    fld_zip: '',
    fld_city: '',
    fld_education: '',
    fld_self: '',
    fld_evaluation: '',
    fld_source: ''
  });

  const [bankForm, setBankForm] = useState({
    fld_bank_act: '',
    fld_bank_name: '',
    fld_bakk_rno: ''
  });

  const [mobilityForm, setMobilityForm] = useState({
    fld_t_mode: ''
  });

  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedLevelIds, setSelectedLevelIds] = useState<number[]>([]);

  const [unavailabilityForm, setUnavailabilityForm] = useState({
    fld_start_date: '',
    fld_end_date: '',
    fld_reason: ''
  });

  const [statusForm, setStatusForm] = useState({
    fld_status: '',
    fld_reason: ''
  });

  // Initialize forms when settings load
  React.useEffect(() => {
    if (settings) {
      setBasicForm({
        fld_first_name: settings.fld_first_name || '',
        fld_last_name: settings.fld_last_name || '',
        fld_gender: settings.fld_gender || '',
        fld_dob: settings.fld_dob || '',
        fld_phone: settings.fld_phone || '',
        fld_street: settings.fld_street || '',
        fld_zip: settings.fld_zip || '',
        fld_city: settings.fld_city || '',
        fld_education: settings.fld_education || '',
        fld_self: settings.fld_self || '',
        fld_evaluation: settings.fld_evaluation || '',
        fld_source: settings.fld_source || ''
      });
      setBankForm({
        fld_bank_act: settings.fld_bank_act || '',
        fld_bank_name: settings.fld_bank_name || '',
        fld_bakk_rno: settings.fld_bakk_rno || ''
      });
      setMobilityForm({
        fld_t_mode: settings.fld_t_mode || ''
      });
      setStatusForm({
        fld_status: settings.fld_status || '',
        fld_reason: settings.fld_reason || ''
      });
    }
  }, [settings]);

  // Handlers
  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId) return;
    updateBasicMutation.mutate({ teacherId, data: basicForm });
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId) return;
    updateBankMutation.mutate({ teacherId, data: bankForm });
  };

  const handleMobilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId) return;
    updateMobilityMutation.mutate({ teacherId, data: mobilityForm });
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId || !user?.fld_id) return;
    if (!selectedSubjectId || selectedLevelIds.length === 0) {
      alert('Bitte wählen Sie ein Fach und mindestens eine Klasse aus');
      return;
    }
    
    // Add all levels for the selected subject at once
    await addSubjectMutation.mutateAsync({
      teacherId,
      subjectIds: [selectedSubjectId],
      levelIds: selectedLevelIds,
      userId: user.fld_id
    });
    
    // Reset form
    setSelectedSubjectId(null);
    setSelectedLevelIds([]);
  };

  const handleDeleteSubject = (subjectId: number) => {
    if (!teacherId) return;
    if (confirm('Are you sure you want to delete this subject?')) {
      deleteSubjectMutation.mutate({ subjectId, teacherId });
    }
  };

  const handleUnavailabilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId || !user?.fld_id) return;
    addUnavailabilityMutation.mutate({
      teacherId,
      startDate: unavailabilityForm.fld_start_date,
      endDate: unavailabilityForm.fld_end_date,
      reason: unavailabilityForm.fld_reason,
      userId: user.fld_id
    }, {
      onSuccess: () => {
        setUnavailabilityForm({ fld_start_date: '', fld_end_date: '', fld_reason: '' });
      }
    });
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId) return;
    updateStatusMutation.mutate({
      teacherId,
      status: statusForm.fld_status,
      reason: statusForm.fld_reason
    });
  };

  if (settingsLoading || subjectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!settings) {
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
    <div className="space-y-4">
      {/* Personal Information Card */}
      <Card className="border border-gray-200 transition-shadow">
        <CardHeader className="border-b border-gray-200 bg-primary/5">
          <CardTitle className="text-xl font-bold text-primary flex items-center">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <User className="h-5 w-5 text-white" />
            </div>
            Persönliche Informationen
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleBasicSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fld_first_name" className="required">Vorname</Label>
                <Input
                  id="fld_first_name"
                  value={basicForm.fld_first_name}
                  onChange={(e) => setBasicForm({ ...basicForm, fld_first_name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fld_last_name" className="required">Nachname</Label>
                <Input
                  id="fld_last_name"
                  value={basicForm.fld_last_name}
                  onChange={(e) => setBasicForm({ ...basicForm, fld_last_name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fld_gender" className="required">Geschlecht</Label>
                <Select
                  value={basicForm.fld_gender}
                  onValueChange={(value) => setBasicForm({ ...basicForm, fld_gender: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Männlich">Männlich</SelectItem>
                    <SelectItem value="Weiblich">Weiblich</SelectItem>
                    <SelectItem value="Divers">Divers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fld_dob">Geburtsdatum</Label>
                <Input
                  id="fld_dob"
                  type="date"
                  value={basicForm.fld_dob}
                  onChange={(e) => setBasicForm({ ...basicForm, fld_dob: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fld_phone" className="required">Telefonnummer</Label>
                <Input
                  id="fld_phone"
                  value={basicForm.fld_phone}
                  onChange={(e) => setBasicForm({ ...basicForm, fld_phone: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fld_street">Straße, Nr</Label>
                <Input
                  id="fld_street"
                  value={basicForm.fld_street}
                  onChange={(e) => setBasicForm({ ...basicForm, fld_street: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fld_zip" className="required">Postleitzahl</Label>
                <Input
                  id="fld_zip"
                  value={basicForm.fld_zip}
                  onChange={(e) => setBasicForm({ ...basicForm, fld_zip: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fld_city" className="required">Stadt</Label>
                <Input
                  id="fld_city"
                  value={basicForm.fld_city}
                  onChange={(e) => setBasicForm({ ...basicForm, fld_city: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fld_latitude">Latitude</Label>
                <Input
                  id="fld_latitude"
                  value={settings.fld_latitude || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fld_longitude">Longitude</Label>
                <Input
                  id="fld_longitude"
                  value={settings.fld_longitude || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fld_education">Höchster Bildungsabschluss</Label>
              <Select
                value={basicForm.fld_education}
                onValueChange={(value) => setBasicForm({ ...basicForm, fld_education: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {educationalOptions.map((edu) => (
                    <SelectItem key={edu.fld_id} value={edu.fld_ename}>
                      {edu.fld_ename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fld_self">
                Bitte beschreiben Sie Ihre aktuelle Tätigkeit und erläutern Sie, warum Sie gerne Nachhilfe geben möchten.
              </Label>
              <Textarea
                id="fld_self"
                rows={3}
                value={basicForm.fld_self}
                onChange={(e) => setBasicForm({ ...basicForm, fld_self: e.target.value })}
              />
            </div>
            
            {isAdmin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fld_evaluation">Interne Bewertung</Label>
                  <Textarea
                    id="fld_evaluation"
                    rows={3}
                    value={basicForm.fld_evaluation}
                    onChange={(e) => setBasicForm({ ...basicForm, fld_evaluation: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fld_source">Wie haben Sie von uns erfahren?</Label>
                  <Select
                    value={basicForm.fld_source}
                    onValueChange={(value) => setBasicForm({ ...basicForm, fld_source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceOptions.map((source) => (
                        <SelectItem key={source.fld_id} value={source.fld_source}>
                          {source.fld_source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <div className="flex justify-end pt-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={updateBasicMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateBasicMutation.isPending ? 'Speichern...' : 'Änderung speichern'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Bank Details Card */}
      <Card className="border border-gray-200 transition-shadow">
        <CardHeader className="border-b border-gray-200 bg-primary/5">
          <CardTitle className="text-xl font-bold text-primary flex items-center">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            Kontodaten (Bank)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleBankSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fld_bank_act" className="required">
                  IBAN (Muss 22 Zeichen lang sein)
                </Label>
                <Input
                  id="fld_bank_act"
                  value={bankForm.fld_bank_act}
                  onChange={(e) => setBankForm({ ...bankForm, fld_bank_act: e.target.value })}
                  maxLength={22}
                  pattern="[a-zA-Z0-9]{22}"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fld_bank_name" className="required">Name Kreditinstitut</Label>
                <Input
                  id="fld_bank_name"
                  value={bankForm.fld_bank_name}
                  onChange={(e) => setBankForm({ ...bankForm, fld_bank_name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fld_bakk_rno">Steuer-Nr</Label>
                <Input
                  id="fld_bakk_rno"
                  value={bankForm.fld_bakk_rno}
                  onChange={(e) => setBankForm({ ...bankForm, fld_bakk_rno: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={updateBankMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateBankMutation.isPending ? 'Speichern...' : 'Änderung speichern'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Mobility Options Card */}
      <Card className="border border-gray-200 transition-shadow">
        <CardHeader className="border-b border-gray-200 bg-primary/5">
          <CardTitle className="text-xl font-bold text-primary flex items-center">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <Navigation className="h-5 w-5 text-white" />
            </div>
            Mobilitätsoptionen
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleMobilitySubmit} className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold mb-4 block">
                Wie sind Sie unterwegs?
              </Label>
              
              <RadioGroup
                value={mobilityForm.fld_t_mode}
                onValueChange={(value) => setMobilityForm({ fld_t_mode: value })}
                className="space-y-2"
              >
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="Öffentliche Verkehrsmittel" id="public" />
                  <div className="flex items-center space-x-3 flex-1">
                    <Bus className="h-6 w-6 text-gray-600" />
                    <Label htmlFor="public" className="text-base font-semibold cursor-pointer">
                    Öffentliche Verkehrsmittel
                    </Label>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="Fahrrad" id="bike" />
                  <div className="flex items-center space-x-3 flex-1">
                    <Bike className="h-6 w-6 text-gray-600" />
                    <Label htmlFor="bike" className="text-base font-semibold cursor-pointer">
                      Fahrrad
                    </Label>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="Auto" id="car" />
                  <div className="flex items-center space-x-3 flex-1">
                    <Car className="h-6 w-6 text-gray-600" />
                    <Label htmlFor="car" className="text-base font-semibold cursor-pointer">
                      Auto
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={updateMobilityMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateMobilityMutation.isPending ? 'Speichern...' : 'Änderung speichern'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Subjects Card */}
      <Card className="border border-gray-200 transition-shadow">
        <CardHeader className="border-b border-gray-200 bg-primary/5">
          <CardTitle className="text-xl font-bold text-primary flex items-center">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            Unterrichtsfächer
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubjectSubmit} className="space-y-4">
            {/* Step 1: Select Subject */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 required">
                1. Wählen Sie ein Fach aus
              </Label>
              {/* Filter out already assigned subjects */}
              {(() => {
                const assignedSubjectIds = new Set(teacherSubjects.map(ts => ts.fld_sid));
                const availableSubjects = subjects
                  .filter(subject => !assignedSubjectIds.has(subject.fld_id))
                  .sort((a, b) => {
                    // Move "Andere" to the end
                    if (a.fld_subject === 'Andere') return 1;
                    if (b.fld_subject === 'Andere') return -1;
                    return 0; // Keep other subjects in their original order
                  });
                
                return (
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {availableSubjects.map((subject) => {
                        const isSelected = selectedSubjectId === subject.fld_id;
                        return (
                          <button
                            key={subject.fld_id}
                            type="button"
                            onClick={() => {
                              setSelectedSubjectId(subject.fld_id);
                              setSelectedLevelIds([]); // Reset levels when subject changes
                            }}
                            className={`p-2 rounded-lg border-2 transition-all duration-200 hover:shadow-sm ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 bg-white hover:border-primary/50'
                            }`}
                          >
                            <div className="flex flex-col items-center text-center space-y-1">
                              <span className="text-xl">{subject.emoji || '📚'}</span>
                              <span className={`text-xs font-medium leading-tight ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                                {subject.fld_subject}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {availableSubjects.length === 0 && (
                      <div className="text-center py-6 text-sm text-gray-500">
                        Alle Fächer sind bereits zugewiesen
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Step 2: Select Levels (only shown when subject is selected) */}
            {selectedSubjectId && (
              <div className="space-y-2 pt-3 border-t border-gray-200">
                <Label className="text-sm font-semibold text-gray-700 required">
                  2. Wählen Sie die Klassen für{' '}
                  <span className="text-primary">
                    {subjects.find(s => s.fld_id === selectedSubjectId)?.emoji || ''}{' '}
                    {subjects.find(s => s.fld_id === selectedSubjectId)?.fld_subject}
                  </span>
                </Label>
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    {levels.map((level) => {
                      const isSelected = selectedLevelIds.includes(level.fld_id);
                      return (
                        <button
                          key={level.fld_id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedLevelIds(selectedLevelIds.filter(id => id !== level.fld_id));
                            } else {
                              setSelectedLevelIds([...selectedLevelIds, level.fld_id]);
                            }
                          }}
                          className={`p-2 rounded-lg border-2 transition-all duration-200 text-center text-xs hover:shadow-sm ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary font-semibold'
                              : 'border-gray-200 bg-white hover:border-primary/50 text-gray-700'
                          }`}
                        >
                          {level.fld_level}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {selectedSubjectId && selectedLevelIds.length > 0 && (
              <div className="flex justify-end pt-2 border-t border-gray-200">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white"
                  disabled={addSubjectMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {addSubjectMutation.isPending ? 'Speichern...' : 'Speichern'}
                </Button>
              </div>
            )}
            
            {/* Existing Subjects */}
            {teacherSubjects.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <Label className="text-sm font-semibold text-gray-700">
                  Ihre aktuellen Fächer
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {[...teacherSubjects].sort((a, b) => {
                    // Move "Andere" to the end
                    const aSubject = a.tbl_subjects?.fld_subject || '';
                    const bSubject = b.tbl_subjects?.fld_subject || '';
                    if (aSubject === 'Andere') return 1;
                    if (bSubject === 'Andere') return -1;
                    return 0; // Keep other subjects in their original order
                  }).map((ts) => {
                    const subjectEmoji = subjects.find(s => s.fld_id === ts.fld_sid)?.emoji || '📚';
                    return (
                      <Card key={ts.fld_id} className="border border-gray-200 hover:shadow-sm transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <span className="text-xl flex-shrink-0">{subjectEmoji}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                                  {ts.tbl_subjects?.fld_subject || 'Unbekannt'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {ts.tbl_levels?.fld_level || 'N/A'}
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSubject(ts.fld_id)}
                              disabled={deleteSubjectMutation.isPending}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2 flex-shrink-0 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Unavailability Card */}
      <Card className="border-2 border-orange-200 transition-shadow">
        <CardHeader className="border-b border-orange-200 bg-orange-50/50">
          <CardTitle className="text-xl font-bold text-orange-700 flex items-center">
            <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            Nichtverfügbarkeit
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleUnavailabilitySubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fld_start_date" className="required">Startdatum</Label>
                <Input
                  id="fld_start_date"
                  type="date"
                  value={unavailabilityForm.fld_start_date}
                  onChange={(e) => setUnavailabilityForm({ ...unavailabilityForm, fld_start_date: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fld_end_date" className="required">Endtermin</Label>
                <Input
                  id="fld_end_date"
                  type="date"
                  value={unavailabilityForm.fld_end_date}
                  onChange={(e) => setUnavailabilityForm({ ...unavailabilityForm, fld_end_date: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="fld_reason" className="required">Grund</Label>
                <Input
                  id="fld_reason"
                  value={unavailabilityForm.fld_reason}
                  onChange={(e) => setUnavailabilityForm({ ...unavailabilityForm, fld_reason: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={addUnavailabilityMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {addUnavailabilityMutation.isPending ? 'Speichern...' : 'Änderung speichern'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone Card - Admin Only */}
      {isAdmin && (
        <Card className="border-2 border-red-300 transition-shadow">
          <CardHeader className="border-b border-red-200 bg-red-50/50">
            <CardTitle className="text-xl font-bold text-red-700 flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              Gefahrenzone
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="fld_status" className="required">Status</Label>
                  <Select
                    value={statusForm.fld_status}
                    onValueChange={(value) => setStatusForm({ ...statusForm, fld_status: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Deleted">Deleted</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fld_reason" className="required">Grund</Label>
                  <Select
                    value={statusForm.fld_reason}
                    onValueChange={(value) => setStatusForm({ ...statusForm, fld_reason: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {deleteReasons.map((reason) => (
                        <SelectItem key={reason.fld_id} value={reason.fld_reason}>
                          {reason.fld_reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <Button type="submit" variant="destructive" disabled={updateStatusMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateStatusMutation.isPending ? 'Speichern...' : 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
