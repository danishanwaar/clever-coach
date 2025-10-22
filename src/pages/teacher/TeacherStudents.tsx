import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Users, Search, Filter, Plus, Eye, MessageSquare, Calendar, BookOpen } from 'lucide-react';

interface Student {
  fld_id: number;
  fld_first_name: string;
  fld_last_name: string;
  fld_email: string;
  fld_phone: string;
  fld_city: string;
  fld_status: string;
  subjects: Array<{
    fld_subject: string;
    fld_level: string;
    fld_status: string;
  }>;
  last_lesson?: string;
  total_lessons: number;
}

export default function TeacherStudents() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Fetch teacher's students
  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ['teacherStudents', user?.fld_id],
    queryFn: async () => {
      if (!user?.fld_id) throw new Error('User not authenticated');

      // Get teacher ID
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select('fld_id')
        .eq('fld_uid', user.fld_id)
        .single();

      if (teacherError) throw teacherError;

      // Get students through mediation stages
      const { data: mediationStages, error: mediationError } = await supabase
        .from('tbl_students_mediation_stages')
        .select(`
          fld_sid,
          tbl_students(
            fld_id,
            fld_first_name,
            fld_last_name,
            fld_email,
            fld_phone,
            fld_city,
            fld_status
          )
        `)
        .eq('fld_tid', teacher.fld_id);

      if (mediationError) throw mediationError;

      // Get unique students
      const uniqueStudents = new Map();
      mediationStages?.forEach(stage => {
        if (stage.tbl_students && !uniqueStudents.has(stage.tbl_students.fld_id)) {
          uniqueStudents.set(stage.tbl_students.fld_id, stage.tbl_students);
        }
      });

      // Get student subjects and lesson history
      const studentsWithDetails = await Promise.all(
        Array.from(uniqueStudents.values()).map(async (student) => {
          // Get student subjects
          const { data: subjects } = await supabase
            .from('tbl_students_subjects')
            .select(`
              fld_suid,
              tbl_subjects(fld_subject)
            `)
            .eq('fld_sid', student.fld_id);

          // Get lesson history
          const { data: lessons } = await supabase
            .from('tbl_teachers_lessons_history')
            .select('fld_edate')
            .eq('fld_sid', student.fld_id)
            .eq('fld_tid', teacher.fld_id)
            .order('fld_edate', { ascending: false })
            .limit(1);

          return {
            ...student,
            subjects: subjects?.map(s => ({
              fld_subject: s.tbl_subjects?.fld_subject || '',
              fld_level: 'N/A', // Level not available in this table
              fld_status: 'Active' // Default status since it's not in the table
            })) || [],
            last_lesson: lessons?.[0]?.fld_edate,
            total_lessons: lessons?.length || 0
          };
        })
      );

      return studentsWithDetails;
    },
    enabled: !!user?.fld_id
  });

  const filteredStudents = students?.filter(student => {
    const matchesSearch = 
      student.fld_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.fld_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.fld_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || student.fld_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Mediated':
        return 'default';
      case 'Partially Mediated':
        return 'secondary';
      case 'Mediation Open':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Students</h1>
        <p className="text-muted-foreground">
          Manage and view information about your assigned students
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Mediated">Mediated</SelectItem>
            <SelectItem value="Partially Mediated">Partially Mediated</SelectItem>
            <SelectItem value="Mediation Open">Mediation Open</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents?.map((student) => (
          <Card key={student.fld_id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {student.fld_first_name} {student.fld_last_name}
                </CardTitle>
                <Badge variant={getStatusColor(student.fld_status)}>
                  {student.fld_status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MessageSquare className="h-4 w-4" />
                  <span>{student.fld_email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{student.fld_city}</span>
                </div>
                {student.last_lesson && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Last lesson: {new Date(student.last_lesson).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>{student.total_lessons} lessons</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Subjects:</h4>
                <div className="flex flex-wrap gap-1">
                  {student.subjects.map((subject, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {subject.fld_subject} ({subject.fld_level})
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedStudent?.fld_first_name} {selectedStudent?.fld_last_name}
                      </DialogTitle>
                    </DialogHeader>
                    {selectedStudent && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-semibold">Email</Label>
                            <p className="text-sm text-gray-600">{selectedStudent.fld_email}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-semibold">Phone</Label>
                            <p className="text-sm text-gray-600">{selectedStudent.fld_phone}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-semibold">City</Label>
                            <p className="text-sm text-gray-600">{selectedStudent.fld_city}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-semibold">Status</Label>
                            <Badge variant={getStatusColor(selectedStudent.fld_status)}>
                              {selectedStudent.fld_status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-semibold">Subjects</Label>
                          <div className="mt-2 space-y-2">
                            {selectedStudent.subjects.map((subject, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border rounded">
                                <span className="font-medium">{subject.fld_subject}</span>
                                <div className="flex gap-2">
                                  <Badge variant="outline">{subject.fld_level}</Badge>
                                  <Badge variant={subject.fld_status === 'Active' ? 'default' : 'secondary'}>
                                    {subject.fld_status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-semibold">Total Lessons</Label>
                            <p className="text-sm text-gray-600">{selectedStudent.total_lessons}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-semibold">Last Lesson</Label>
                            <p className="text-sm text-gray-600">
                              {selectedStudent.last_lesson 
                                ? new Date(selectedStudent.last_lesson).toLocaleDateString()
                                : 'No lessons yet'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents?.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'You don\'t have any assigned students yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
}
