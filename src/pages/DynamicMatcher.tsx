import React, { useState, useEffect } from 'react';
import { useDynamicMatcher } from '@/hooks/useDynamicMatcher';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Search, MapPin, Phone, Mail, MessageCircle, User, Users, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import TeacherMatchModal from '../components/TeacherMatchModal';
import ActivityModal from '../components/ActivityModal';

const DynamicMatcher = () => {
  const {
    students,
    subjects,
    mediationTypes,
    studentsLoading,
    subjectsLoading,
    searchTeachersMutation,
    getStudentDetails,
    getStudentSubjects,
    getTeacherDetails,
    matchTeacherMutation,
    recordActivityMutation,
    calculateDistance,
  } = useDynamicMatcher();

  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [teacherDetails, setTeacherDetails] = useState<any>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  const [formData, setFormData] = useState({
    fld_sid: '',
    fld_ts: 'Teacher',
    fld_suid: [] as number[],
    fld_radius: 0,
    fld_gender: 'any',
    fld_ss: 'OR',
    fld_lid: 0,
  });
  const [studentSubjects, setStudentSubjects] = useState<any[]>([]);

  // Load student details when student is selected
  useEffect(() => {
    if (selectedStudent) {
      const student = students.find(s => s.fld_id === selectedStudent);
      if (student) {
        setFormData(prev => ({
          ...prev,
          fld_sid: selectedStudent.toString(),
          fld_lid: parseInt(student.fld_level),
        }));
        
        // Load student subjects
        getStudentSubjects.mutate(selectedStudent, {
          onSuccess: (data) => {
            setStudentSubjects(data);
          }
        });
      }
    }
  }, [selectedStudent, students, getStudentSubjects]);

  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.fld_id === parseInt(studentId));
    if (student) {
      setSelectedStudent(parseInt(studentId));
      setFormData(prev => ({
        ...prev,
        fld_sid: studentId,
        fld_lid: parseInt(student.fld_level),
      }));
    }
  };

  const handleSubjectChange = (subjectIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      fld_suid: subjectIds,
    }));
  };

  const handleSearch = async () => {
    if (!formData.fld_sid) {
      toast.error('Please select a student');
      return;
    }

    if (formData.fld_suid.length === 0) {
      toast.error('Please select at least one subject');
      return;
    }

    try {
      const searchData = {
        ...formData,
        fld_sid: parseInt(formData.fld_sid),
      };

      const teachers = await searchTeachersMutation.mutateAsync(searchData);
      setSearchResults(teachers);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleTeacherClick = async (teacher: any) => {
    try {
      const details = await getTeacherDetails.mutateAsync({ 
        teacherId: teacher.fld_id, 
        studentId: parseInt(formData.fld_sid) 
      });
      setTeacherDetails(details);
    } catch (error) {
      console.error('Error fetching teacher details:', error);
    }
  };

  const handleMatchTeacher = (teacher: any) => {
    setSelectedTeacher(teacher);
    setShowMatchModal(true);
  };

  const handleRecordActivity = (teacher: any) => {
    setSelectedTeacher(teacher);
    setShowActivityModal(true);
  };

  const handleMatch = async (subjectIds: number[]) => {
    if (!selectedTeacher || !formData.fld_sid) return;

    try {
      await matchTeacherMutation.mutateAsync({
        studentId: parseInt(formData.fld_sid),
        teacherId: selectedTeacher.fld_id,
        subjectIds,
      });
      setShowMatchModal(false);
      setSearchResults([]); // Refresh results
    } catch (error) {
      console.error('Match error:', error);
    }
  };

  const handleRecordActivitySubmit = async (data: { subjectId: number; mediationTypeName: string }) => {
    if (!selectedTeacher || !formData.fld_sid) return;

    try {
      await recordActivityMutation.mutateAsync({
        teacherId: selectedTeacher.fld_id,
        studentId: parseInt(formData.fld_sid),
        subjectId: data.subjectId,
        mediationTypeName: data.mediationTypeName,
      });
      setShowActivityModal(false);
    } catch (error) {
      console.error('Activity error:', error);
    }
  };

  const getGoogleMapsUrl = (teacher: any, student: any) => {
    if (!teacher.fld_latitude || !teacher.fld_longitude || !student.fld_latitude || !student.fld_longitude) {
      return '#';
    }
    return `https://www.google.com/maps/dir/?api=1&origin=${teacher.fld_latitude},${teacher.fld_longitude}&destination=${student.fld_latitude},${student.fld_longitude}`;
  };

  const getDistance = (teacher: any, student: any) => {
    if (!teacher.fld_latitude || !teacher.fld_longitude || !student.fld_latitude || !student.fld_longitude) {
      return 0;
    }
    return calculateDistance(
      teacher.fld_latitude,
      teacher.fld_longitude,
      student.fld_latitude,
      student.fld_longitude
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dynamic Matcher</h1>
          <p className="text-muted-foreground">Match students with teachers based on criteria</p>
        </div>
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Criteria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Student Selection */}
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select value={formData.fld_sid} onValueChange={handleStudentChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.fld_id} value={student.fld_id.toString()}>
                      {student.fld_first_name} {student.fld_last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search By */}
            <div className="space-y-2">
              <Label htmlFor="searchBy">Search By</Label>
              <Select value={formData.fld_ts} onValueChange={(value) => setFormData(prev => ({ ...prev, fld_ts: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Teacher">Active Teachers</SelectItem>
                  <SelectItem value="Inactive">Inactive Teachers</SelectItem>
                  <SelectItem value="Applicant">Applicants</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subjects */}
            <div className="space-y-2">
              <Label htmlFor="subjects">Subjects</Label>
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <label key={subject.fld_id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.fld_suid.includes(subject.fld_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleSubjectChange([...formData.fld_suid, subject.fld_id]);
                        } else {
                          handleSubjectChange(formData.fld_suid.filter(id => id !== subject.fld_id));
                        }
                      }}
                    />
                    <span>{subject.fld_subject}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Radius */}
            <div className="space-y-2">
              <Label htmlFor="radius">Radius (Km)</Label>
              <Input
                type="number"
                value={formData.fld_radius}
                onChange={(e) => setFormData(prev => ({ ...prev, fld_radius: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.fld_gender} onValueChange={(value) => setFormData(prev => ({ ...prev, fld_gender: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="Männlich">Männlich</SelectItem>
                  <SelectItem value="Weiblich">Weiblich</SelectItem>
                  <SelectItem value="Divers">Divers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Level Search Criteria */}
            <div className="space-y-2">
              <Label htmlFor="levelCriteria">Level Search Criteria</Label>
              <Select value={formData.fld_ss} onValueChange={(value) => setFormData(prev => ({ ...prev, fld_ss: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">AND</SelectItem>
                  <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSearch} disabled={searchTeachersMutation.isPending}>
              <Search className="h-4 w-4 mr-2" />
              {searchTeachersMutation.isPending ? 'Searching...' : 'Search Teachers'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({searchResults.length} teachers found)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((teacher) => {
                const student = students.find(s => s.fld_id === parseInt(formData.fld_sid));
                const distance = student ? getDistance(teacher, student) : 0;
                const mapsUrl = student ? getGoogleMapsUrl(teacher, student) : '#';

                return (
                  <div key={teacher.fld_id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 items-center">
                      {/* Teacher Info */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{teacher.fld_gender}</p>
                            <p className="font-semibold">{teacher.fld_first_name} {teacher.fld_last_name}</p>
                            <p className="text-sm text-muted-foreground">Age: {teacher.age || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* About/Evaluation */}
                      <div className="lg:col-span-1">
                        <div className="space-y-1">
                          <p className="text-sm">
                            <a href="#" title={teacher.fld_self} className="text-blue-600 hover:underline">
                              About
                            </a>
                          </p>
                          <p className="text-sm">
                            <a href="#" title={teacher.fld_evaluation} className="text-blue-600 hover:underline">
                              Internal Evaluation
                            </a>
                          </p>
                        </div>
                      </div>

                      {/* Contact/Active Students */}
                      <div className="lg:col-span-1">
                        <div className="space-y-1">
                          <p className="text-sm">{teacher.fld_phone}</p>
                          <p className="text-sm">{teacher.active_students || 0} active students</p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="lg:col-span-1">
                        <div className="space-y-1">
                          <p className="text-sm">{teacher.fld_street}</p>
                          <p className="text-sm">{teacher.fld_zip}, {teacher.fld_city}</p>
                        </div>
                      </div>

                      {/* Subjects */}
                      <div className="lg:col-span-1">
                        <div className="space-y-1">
                          {teacher.subjects?.slice(0, 3).map((subject, index) => (
                            <div key={index} className="flex items-center space-x-1">
                              <BookOpen className="h-3 w-3" />
                              <span className={`text-xs ${subject.color}`}>
                                {subject.fld_subject} ({subject.fld_level_name})
                              </span>
                            </div>
                          ))}
                          {teacher.subjects && teacher.subjects.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{teacher.subjects.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Mobility */}
                      <div className="lg:col-span-1">
                        <Badge variant="outline">{teacher.fld_t_mode}</Badge>
                      </div>

                      {/* Distance */}
                      <div className="lg:col-span-1">
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {distance.toFixed(1)} Km
                        </a>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecordActivity(teacher)}
                      >
                        <User className="h-4 w-4 mr-1" />
                        Record Activity
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMatchTeacher(teacher)}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Match
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${teacher.fld_email}`}>
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://web.whatsapp.com/send?phone=${teacher.fld_phone}`} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          WhatsApp
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {searchResults.length === 0 && searchTeachersMutation.isSuccess && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Match Found!</h3>
              <p className="text-muted-foreground">Try some other combination.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <TeacherMatchModal
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        teacher={selectedTeacher}
        studentSubjects={studentSubjects}
        onMatch={handleMatch}
        isLoading={matchTeacherMutation.isPending}
      />

      <ActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        teacher={selectedTeacher}
        studentSubjects={studentSubjects}
        mediationTypes={mediationTypes}
        onSubmit={handleRecordActivitySubmit}
        isLoading={recordActivityMutation.isPending}
      />
    </div>
  );
};

export default DynamicMatcher;
