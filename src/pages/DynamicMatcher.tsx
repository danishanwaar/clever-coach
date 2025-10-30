import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { ArrowLeft, Search, Mail, MessageCircle, User, Users, BookOpen, X, Check, ChevronsUpDown, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import TeacherMatchModal from '../components/TeacherMatchModal';
import ActivityModal from '../components/ActivityModal';

const DynamicMatcher = () => {
  const [searchParams] = useSearchParams();
  const studentIdFromUrl = searchParams.get('studentId');

  const {
    students,
    searchTeachersMutation,
    getStudentSubjects,
    matchTeacherMutation,
    recordActivityMutation,
    calculateDistance,
  } = useDynamicMatcher();

  const [formData, setFormData] = useState({
    fld_sid: studentIdFromUrl || '',
    fld_ts: 'Teacher',
    fld_suid: [] as number[],
    fld_radius: 0,
    fld_gender: '',
    fld_ss: 'OR',
    fld_lid: 0,
  });
  
  const [studentSubjects, setStudentSubjects] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const hasSearched = useRef(false);

  // Initialize student from URL
  useEffect(() => {
    if (studentIdFromUrl && students.length > 0) {
      const student = students.find(s => s.fld_id === parseInt(studentIdFromUrl));
      if (student) {
        setFormData(prev => ({
          ...prev,
          fld_sid: studentIdFromUrl,
          fld_lid: parseInt(student.fld_level || '0'),
        }));
        
        // Load and pre-select student subjects
        getStudentSubjects.mutate(parseInt(studentIdFromUrl), {
          onSuccess: (data) => {
            setStudentSubjects(data);
            const subjectIds = data.map((s: any) => s.fld_suid);
            setFormData(prev => ({ ...prev, fld_suid: subjectIds }));
          }
        });
      }
    }
  }, [studentIdFromUrl, students]);

  // Auto-search when student or subjects change
  useEffect(() => {
    if (formData.fld_sid && formData.fld_suid.length > 0) {
      handleSearch();
    }
  }, [formData.fld_sid, formData.fld_suid, formData.fld_ts, formData.fld_radius, formData.fld_gender, formData.fld_ss]);

  const handleSearch = async () => {
    if (!formData.fld_sid || formData.fld_suid.length === 0) return;

    try {
      const searchData = {
        ...formData,
        fld_sid: parseInt(formData.fld_sid),
      };

      const teachers = await searchTeachersMutation.mutateAsync(searchData);
      setSearchResults(teachers);
      hasSearched.current = true;
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.fld_id === parseInt(studentId));
    if (student) {
      setFormData(prev => ({
        ...prev,
        fld_sid: studentId,
        fld_lid: parseInt(student.fld_level || '0'),
      }));
      
      // Load student subjects
      getStudentSubjects.mutate(parseInt(studentId), {
        onSuccess: (data) => {
          setStudentSubjects(data);
          const subjectIds = data.map((s: any) => s.fld_suid);
          setFormData(prev => ({ ...prev, fld_suid: subjectIds }));
        }
      });
    }
  };

  const handleSubjectChange = (subjectIds: number[]) => {
    setFormData(prev => ({ ...prev, fld_suid: subjectIds }));
  };

  const handleMatch = async (studentSubjectIds: number[]) => {
    if (!selectedTeacher || !formData.fld_sid) return;

    try {
      await matchTeacherMutation.mutateAsync({
        studentId: parseInt(formData.fld_sid),
        teacherId: selectedTeacher.fld_id,
        subjectIds: studentSubjectIds, // These are actually student subject IDs (fld_id from tbl_students_subjects)
      });
      setShowMatchModal(false);
      // Refresh search results
      handleSearch();
    } catch (error) {
      console.error('Match error:', error);
    }
  };

  const handleRecordActivity = (teacher: any) => {
    setSelectedTeacher(teacher);
    setShowActivityModal(true);
  };

  const handleMatchTeacher = (teacher: any) => {
    setSelectedTeacher(teacher);
    setShowMatchModal(true);
  };

  const getGoogleMapsUrl = (teacher: any, student: any) => {
    if (!teacher.fld_latitude || !teacher.fld_longitude || !student?.fld_latitude || !student?.fld_longitude) {
      return 'javascript:';
    }
    return `https://www.google.com/maps/dir/?api=1&origin=${teacher.fld_latitude},${teacher.fld_longitude}&destination=${student.fld_latitude},${student.fld_longitude}`;
  };

  const getDistance = (teacher: any, student: any) => {
    if (!teacher.fld_latitude || !teacher.fld_longitude || !student?.fld_latitude || !student?.fld_longitude) {
      return 0;
    }
    return calculateDistance(
      teacher.fld_latitude,
      teacher.fld_longitude,
      student.fld_latitude,
      student.fld_longitude
    );
  };

  const selectedStudent = students.find(s => s.fld_id === parseInt(formData.fld_sid));

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Dynamic Matcher</h1>
            <p className="text-gray-600">Match students with teachers based on criteria</p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Search Form */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

              {/* Subjects - Only show student subjects */}
              <div className="space-y-2">
                <Label htmlFor="subjects">Subjects</Label>
                <Popover open={subjectsOpen} onOpenChange={setSubjectsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={subjectsOpen}
                      className="w-full justify-between min-h-[42px] h-auto py-2"
                    >
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {formData.fld_suid.length > 0 ? (
                          studentSubjects
                            .filter(s => formData.fld_suid.includes(s.fld_suid))
                            .map((studentSubject) => (
                              <Badge key={studentSubject.fld_id} variant="secondary" className="text-xs px-2 py-0.5">
                                {studentSubject.fld_subject}
                                <X
                                  className="ml-1 h-3 w-3 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSubjectChange(formData.fld_suid.filter(id => id !== studentSubject.fld_suid));
                                  }}
                                />
                              </Badge>
                            ))
                        ) : (
                          <span className="text-muted-foreground">Select subjects</span>
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search subjects..." />
                      <CommandEmpty>No subject found.</CommandEmpty>
                      <CommandGroup className="max-h-60 overflow-y-auto">
                        {studentSubjects.map((studentSubject) => {
                          const isSelected = formData.fld_suid.includes(studentSubject.fld_suid);
                          return (
                            <CommandItem
                              key={studentSubject.fld_id}
                              value={studentSubject.fld_subject}
                              onSelect={() => {
                                if (isSelected) {
                                  handleSubjectChange(formData.fld_suid.filter(id => id !== studentSubject.fld_suid));
                                } else {
                                  handleSubjectChange([...formData.fld_suid, studentSubject.fld_suid]);
                                }
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  isSelected ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {studentSubject.fld_subject}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <Select value={formData.fld_gender || "any"} onValueChange={(value) => setFormData(prev => ({ ...prev, fld_gender: value === "any" ? "" : value }))}>
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

              {/* Level (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Input
                  value={selectedStudent?.fld_level || ''}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results - Cards */}
        {hasSearched.current && (
          <>
            {searchResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Search Results ({searchResults.length} found)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchResults.map((teacher) => {
                      const distance = selectedStudent ? getDistance(teacher, selectedStudent) : 0;
                      const mapsUrl = selectedStudent ? getGoogleMapsUrl(teacher, selectedStudent) : 'javascript:';
                      const initials = `${teacher.fld_first_name?.[0] || ""}${teacher.fld_last_name?.[0] || ""}`.toUpperCase();

                      // Display only first 3 subjects
                      const displaySubjects = teacher.subjects?.slice(0, 3) || [];
                      const remainingCount = (teacher.subjects?.length || 0) - 3;

                      return (
                        <div
                          key={teacher.fld_id}
                          className="bg-white rounded-lg shadow-sm border-l-4 border-l-primary hover:shadow-md transition-all duration-200 group"
                        >
                          <div className="p-2.5 sm:p-3">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                              {/* Left Section - Teacher Info */}
                              <div className="flex items-start space-x-2 flex-1 min-w-0">
                                {/* Avatar */}
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs shadow-sm flex-shrink-0">
                                  {initials}
                                </div>

                                {/* Basic Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="mb-1.5">
                                    <h3 className="font-semibold text-sm text-gray-900">
                                      {teacher.fld_gender && (
                                        <span className="text-gray-500 font-normal mr-1">{teacher.fld_gender}</span>
                                      )}
                                      {teacher.fld_first_name || ""} {teacher.fld_last_name || ""} 
                                      {teacher.age && <span className="text-gray-400 font-normal ml-1">({teacher.age})</span>}
                                    </h3>
                                  </div>

                                  {/* Contact Info - Compact */}
                                  <div className="space-y-0.5 mb-2">
                                    <div className="flex items-center text-xs text-gray-600">
                                      <Phone className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                                      <span className="truncate">{teacher.fld_phone || ""}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-600">
                                      <Mail className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                                      <span className="truncate">{teacher.fld_email || ""}</span>
                                    </div>
                                  </div>

                                  {/* Location */}
                                  <div className="mb-2 text-xs text-gray-600">
                                    <p>{teacher.fld_street}</p>
                                    <p>{teacher.fld_zip}, {teacher.fld_city}</p>
                                  </div>

                                  {/* About / Evaluation */}
                                  <div className="mb-2 text-xs">
                                    <span>
                                      <a href="#" title={teacher.fld_self} className="text-blue-600 hover:underline">
                                        About
                                      </a>
                                      {' | '}
                                      <a href="#" title={teacher.fld_evaluation} className="text-blue-600 hover:underline">
                                        Internal Evaluation
                                      </a>
                                    </span>
                                  </div>

                                  {/* Subjects & Levels */}
                                  <div className="border-t border-gray-100 pt-2">
                                    <div className="flex flex-wrap gap-1">
                                      {displaySubjects.length > 0 ? (
                                        <>
                                          {displaySubjects.map((subject: any, index: number) => {
                                            const studentSubject = studentSubjects.find(ss => ss.fld_suid === subject.fld_id);
                                            const isMatching = !!studentSubject;
                                            const isMediated = false;
                                            const levelMatch = subject.fld_level >= (formData.fld_lid || 0);
                                            
                                            const subjectClass = isMatching && !isMediated ? 'border-green-500 text-green-700 bg-green-50' : '';
                                            const levelColor = levelMatch && isMatching ? '#18C754' : '#666';

                                            return (
                                              <div
                                                key={index}
                                                className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium border ${subjectClass || 'bg-gray-100 border-gray-200 text-gray-700'}`}
                                              >
                                                <span className="font-semibold">{subject.fld_subject}</span>
                                                <span style={{ color: levelColor }}>({subject.fld_level_name})</span>
                                              </div>
                                            );
                                          })}
                                          {remainingCount > 0 && (
                                            <div className="inline-flex items-center gap-1 bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5 text-xs font-medium border border-gray-300">
                                              <span>+{remainingCount}</span>
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                        <div className="text-xs text-gray-500 italic">No subjects assigned</div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Mobility & Distance */}
                                  <div className="mt-2 flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs px-1.5 py-0">{teacher.fld_t_mode}</Badge>
                                    <a
                                      href={mapsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:underline"
                                    >
                                      {distance.toFixed(1)} Km
                                    </a>
                                  </div>
                                </div>
                              </div>

                              {/* Right Section - Contact Actions */}
                              <div className="flex items-center justify-end sm:justify-start space-x-0.5 flex-shrink-0 sm:self-start border-t sm:border-t-0 pt-2 sm:pt-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRecordActivity(teacher)}
                                  title="Record Activity"
                                  className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                >
                                  <User className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMatchTeacher(teacher)}
                                  title="Match"
                                  className="h-7 w-7 p-0 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                                >
                                  <Users className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  title="Email"
                                  className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                >
                                  <a href={`mailto:${teacher.fld_email}`}>
                                    <Mail className="h-3.5 w-3.5" />
                                  </a>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  title="WhatsApp"
                                  className="h-7 w-7 p-0 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                                >
                                  <a
                                    href={`https://web.whatsapp.com/send?phone=${teacher.fld_phone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                  </a>
                                </Button>
                              </div>
                            </div>
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
                    <Search className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                    <h4 className="font-semibold text-lg mb-2">No Match Found!</h4>
                    <span className="text-gray-600">Try some other combination.</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
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
        />
      </div>
    </div>
  );
};

export default DynamicMatcher;
