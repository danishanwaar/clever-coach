import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStudentSettings } from '@/hooks/useStudentSettings';
import { useStudent } from '@/hooks/useStudents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  User, 
  GraduationCap,
  CreditCard,
  BookOpen,
  BarChart3,
  FileText,
  AlertTriangle,
  Trash2,
  AlertCircle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function StudentSettings() {
  const { id } = useParams<{ id: string }>();
  const studentId = parseInt(id || '0');
  
  const { data: student, isLoading: studentLoading } = useStudent(studentId);
  
  const {
    student: studentData,
    contract,
    levels,
    schoolTypes,
    reasons,
    lessonDurations,
    subjects,
    studentSubjects,
    sources,
    deleteReasons,
    hasActiveContracts,
    userData,
    isLoading,
    updateBasic,
    updateContract,
    updateBank,
    updateSubjects,
    deleteSubject,
    updateStatistics,
    updateNotes,
    updateStatus,
    isUpdating,
  } = useStudentSettings(studentId);

  // Form states
  const [basicForm, setBasicForm] = useState({
    fld_sal: studentData?.fld_sal || '',
    fld_first_name: studentData?.fld_first_name || '',
    fld_last_name: studentData?.fld_last_name || '',
    fld_sd: studentData?.fld_sd || '',
    fld_s_first_name: studentData?.fld_s_first_name || '',
    fld_s_last_name: studentData?.fld_s_last_name || '',
    fld_level: studentData?.fld_level?.toString() || '',
    fld_school: studentData?.fld_school || '',
    fld_reason: studentData?.fld_reason || '',
  });

  const [contactForm, setContactForm] = useState({
    fld_email: studentData?.fld_email || '',
    fld_mobile: studentData?.fld_mobile || '',
    fld_phone: studentData?.fld_phone || '',
    fld_city: studentData?.fld_city || '',
    fld_zip: studentData?.fld_zip || '',
    fld_address: studentData?.fld_address || '',
  });

  const [bankForm, setBankForm] = useState({
    fld_iban: contract?.fld_iban || '',
    fld_bi: contract?.fld_bi || '',
  });

  const [contractForm, setContractForm] = useState({
    fld_payer: studentData?.fld_payer || '',
    fld_ct: studentData?.fld_ct?.toString() || '',
    fld_wh: studentData?.fld_wh?.toString() || '',
    fld_ld: studentData?.fld_ld || '',
    fld_l_mode: studentData?.fld_l_mode || '',
    fld_price: studentData?.fld_price || '',
    fld_reg_fee: studentData?.fld_reg_fee || '',
  });

  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);

  const [statisticsForm, setStatisticsForm] = useState({
    fld_f_lead: studentData?.fld_f_lead || '',
    fld_uname: studentData?.fld_uname?.toString() || '',
  });

  const [notesForm, setNotesForm] = useState({
    fld_notes: studentData?.fld_notes || '',
  });

  const [statusForm, setStatusForm] = useState({
    fld_status: studentData?.fld_status || '',
    fld_reason: studentData?.fld_reason || '',
  });

  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBasic(basicForm);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBasic(contactForm);
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBank(bankForm);
  };

  const handleContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert form data to string format
    const formData = {
      ...contractForm,
      fld_price: contractForm.fld_price.toString(),
      fld_reg_fee: contractForm.fld_reg_fee.toString(),
    };
    updateContract(formData);
  };

  const handleSubjectsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSubjects(selectedSubjects);
  };

  const handleStatisticsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStatistics(statisticsForm);
  };

  const handleNotesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotes(notesForm);
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStatus(statusForm);
  };

  const handleDeleteSubject = (subjectId: number) => {
    deleteSubject(subjectId);
  };

  if (studentLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <span>Student not found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contact Person Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Ansprechpartner (Contact Person)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBasicSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fld_sal">Anrede (Salutation)</Label>
                <Select
                  value={basicForm.fld_sal}
                  onValueChange={(value) => setBasicForm(prev => ({ ...prev, fld_sal: value }))}
                >
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
                <Label htmlFor="fld_first_name">Vorname (First Name)</Label>
                <Input
                  id="fld_first_name"
                  value={basicForm.fld_first_name}
                  onChange={(e) => setBasicForm(prev => ({ ...prev, fld_first_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="fld_last_name">Nachname (Last Name)</Label>
                <Input
                  id="fld_last_name"
                  value={basicForm.fld_last_name}
                  onChange={(e) => setBasicForm(prev => ({ ...prev, fld_last_name: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Student Data Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Schülerdaten (Student Data)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBasicSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fld_sd">Sohn/Tochter (Son/Daughter)</Label>
                <Select
                  value={basicForm.fld_sd}
                  onValueChange={(value) => setBasicForm(prev => ({ ...prev, fld_sd: value }))}
                >
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
                <Label htmlFor="fld_s_first_name">Nachname (Last Name)</Label>
                <Input
                  id="fld_s_first_name"
                  value={basicForm.fld_s_first_name}
                  onChange={(e) => setBasicForm(prev => ({ ...prev, fld_s_first_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="fld_s_last_name">Vorname (First Name)</Label>
                <Input
                  id="fld_s_last_name"
                  value={basicForm.fld_s_last_name}
                  onChange={(e) => setBasicForm(prev => ({ ...prev, fld_s_last_name: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fld_level">Klasse (Class)</Label>
                <Select
                  value={basicForm.fld_level}
                  onValueChange={(value) => setBasicForm(prev => ({ ...prev, fld_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.fld_id} value={level.fld_id.toString()}>
                        {level.fld_level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fld_school">Schulform (School Form)</Label>
                <Select
                  value={basicForm.fld_school}
                  onValueChange={(value) => setBasicForm(prev => ({ ...prev, fld_school: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select school form" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolTypes.map((type) => (
                      <SelectItem key={type.fld_id} value={type.fld_name}>
                        {type.fld_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fld_reason">Grund (Reason)</Label>
                <Select
                  value={basicForm.fld_reason}
                  onValueChange={(value) => setBasicForm(prev => ({ ...prev, fld_reason: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasons.map((reason) => (
                      <SelectItem key={reason.fld_id} value={reason.fld_reason}>
                        {reason.fld_reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Customer Data Section */}
      <Card>
        <CardHeader>
          <CardTitle>Kundendaten (Customer Data)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fld_email">E-Mail-Adresse (Email)</Label>
                <Input
                  id="fld_email"
                  type="email"
                  value={contactForm.fld_email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, fld_email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="fld_mobile">Tel. Mobil (Mobile)</Label>
                <Input
                  id="fld_mobile"
                  value={contactForm.fld_mobile}
                  onChange={(e) => setContactForm(prev => ({ ...prev, fld_mobile: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="fld_phone">Tel. Festnetz (Landline)</Label>
                <Input
                  id="fld_phone"
                  value={contactForm.fld_phone}
                  onChange={(e) => setContactForm(prev => ({ ...prev, fld_phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fld_city">Stadt (City)</Label>
                <Input
                  id="fld_city"
                  value={contactForm.fld_city}
                  onChange={(e) => setContactForm(prev => ({ ...prev, fld_city: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="fld_zip">Postleitzahl (ZIP)</Label>
                <Input
                  id="fld_zip"
                  value={contactForm.fld_zip}
                  onChange={(e) => setContactForm(prev => ({ ...prev, fld_zip: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="fld_address">Straße, Nr (Street, Number)</Label>
              <Input
                id="fld_address"
                value={contactForm.fld_address}
                onChange={(e) => setContactForm(prev => ({ ...prev, fld_address: e.target.value }))}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Bank Account Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bankkonto Information (Bank Account)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBankSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fld_iban">IBAN (22 Zeichen)</Label>
                <Input
                  id="fld_iban"
                  value={bankForm.fld_iban}
                  onChange={(e) => setBankForm(prev => ({ ...prev, fld_iban: e.target.value }))}
                  pattern="[a-zA-Z0-9]{22}"
                  required
                />
              </div>
              <div>
                <Label htmlFor="fld_bi">Bankinstitut (Bank Institution)</Label>
                <Input
                  id="fld_bi"
                  value={bankForm.fld_bi}
                  onChange={(e) => setBankForm(prev => ({ ...prev, fld_bi: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lessons and Price Section */}
      <Card>
        <CardHeader>
          <CardTitle>Unterricht und Preis (Lessons and Price)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleContractSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fld_payer">Zahlungspflichtiger (Payer)</Label>
                <Input
                  id="fld_payer"
                  value={contractForm.fld_payer}
                  onChange={(e) => setContractForm(prev => ({ ...prev, fld_payer: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="fld_ct">Vertragslaufzeit (Contract Duration)</Label>
                <Select
                  value={contractForm.fld_ct}
                  onValueChange={(value) => setContractForm(prev => ({ ...prev, fld_ct: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {month} months
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fld_wh">Wochenstunden (Weekly Hours)</Label>
                <Select
                  value={contractForm.fld_wh}
                  onValueChange={(value) => setContractForm(prev => ({ ...prev, fld_wh: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hours" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((hour) => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {hour} hours
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fld_ld">Unterrichtsdauer (Lesson Duration)</Label>
                <Select
                  value={contractForm.fld_ld}
                  onValueChange={(value) => setContractForm(prev => ({ ...prev, fld_ld: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
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
              <div>
                <Label htmlFor="fld_l_mode">Unterrichtsort (Lesson Mode)</Label>
                <Select
                  value={contractForm.fld_l_mode}
                  onValueChange={(value) => setContractForm(prev => ({ ...prev, fld_l_mode: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Onsite">Onsite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fld_price">Preis (Price)</Label>
                <Input
                  id="fld_price"
                  value={contractForm.fld_price}
                  onChange={(e) => setContractForm(prev => ({ ...prev, fld_price: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="fld_reg_fee">Anmeldegebühr (Registration Fee)</Label>
                <Input
                  id="fld_reg_fee"
                  value={contractForm.fld_reg_fee}
                  onChange={(e) => setContractForm(prev => ({ ...prev, fld_reg_fee: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Subjects Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Fach/Fächer (Subjects)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubjectsSubmit} className="space-y-4">
            <div>
              <Label htmlFor="subjects">In welchem Fach benötigt Ihr Kind Nachhilfe?</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  const subjectId = parseInt(value);
                  if (!selectedSubjects.includes(subjectId)) {
                    setSelectedSubjects(prev => [...prev, subjectId]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subjects" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.fld_id} value={subject.fld_id.toString()}>
                      {subject.fld_subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedSubjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedSubjects.map((subjectId) => {
                  const subject = subjects.find(s => s.fld_id === subjectId);
                  return (
                    <Badge key={subjectId} variant="secondary" className="flex items-center gap-1">
                      {subject?.fld_subject}
                      <button
                        type="button"
                        onClick={() => setSelectedSubjects(prev => prev.filter(id => id !== subjectId))}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>

          {/* Enrolled Subjects */}
          {studentSubjects.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Enrolled Subjects</h4>
              <div className="space-y-2">
                {studentSubjects.map((studentSubject) => (
                  <div key={studentSubject.fld_id} className="flex items-center justify-between p-3 border rounded">
                    <span>{studentSubject.tbl_subjects?.fld_subject}</span>
                    {!hasActiveContracts && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              You want to delete this subject. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSubject(studentSubject.fld_id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistik (Statistics)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStatisticsSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fld_f_lead">Werbemittel (Marketing Source)</Label>
                <Select
                  value={statisticsForm.fld_f_lead}
                  onValueChange={(value) => setStatisticsForm(prev => ({ ...prev, fld_f_lead: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((source) => (
                      <SelectItem key={source.fld_id} value={source.fld_source}>
                        {source.fld_source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fld_uname">Kunde erfasst von (Recorded by)</Label>
                <Input
                  id="fld_uname"
                  value={userData?.fld_name || 'Loading...'}
                  readOnly
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notiz (Notes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNotesSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fld_notes">Notiz (Notes)</Label>
              <Input
                id="fld_notes"
                value={notesForm.fld_notes}
                onChange={(e) => setNotesForm(prev => ({ ...prev, fld_notes: e.target.value }))}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone Section */}
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Gefahrenzone (Danger Zone)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStatusSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fld_status">Status</Label>
                <Select
                  value={statusForm.fld_status}
                  onValueChange={(value) => setStatusForm(prev => ({ ...prev, fld_status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Appointment Call">Appointment Call</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Deleted">Deleted</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Unplaceable">Unplaceable</SelectItem>
                    <SelectItem value="Waiting List">Waiting List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fld_reason">Grund (Reason)</Label>
                <Select
                  value={statusForm.fld_reason}
                  onValueChange={(value) => setStatusForm(prev => ({ ...prev, fld_reason: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
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
            <div className="flex justify-end">
              <Button type="submit" variant="destructive" disabled={isUpdating}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
