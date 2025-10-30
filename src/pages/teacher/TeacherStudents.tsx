import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, User, Mail, Phone, MapPin, BookOpen } from 'lucide-react';
import { useTeacher, useTeacherStudents } from '@/hooks/useTeacherProfile';

export default function TeacherStudents() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Get teacher ID
  const { data: teacher } = useTeacher(user?.fld_id);
  
  // Fetch students using hooks (following PHP: students from mediation stages where FLD_M_FLAG='X')
  const { data: students = [], isLoading } = useTeacherStudents(teacher?.fld_id);

  // Filter students by search term (following PHP: search by student name)
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      `${student.fld_first_name} ${student.fld_last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.fld_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.fld_mobile.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar - Following PHP layout */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Schüler*in suchen"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Student Cards - Matching admin StudentCard design */}
      <div className="space-y-2">
        {filteredStudents.map((student) => {
          const initials = `${student.fld_first_name?.[0] || ''}${student.fld_last_name?.[0] || ''}`.toUpperCase();
          const studentName = `${student.fld_first_name || ''} ${student.fld_last_name || ''}`.trim();
          const subjects = student.subjects || [];
          
          return (
            <div 
              key={student.fld_id}
              className="bg-white rounded-lg shadow-sm border-l-4 border-l-primary hover:shadow-md transition-all duration-200 group cursor-pointer"
            >
              <div className="p-2 sm:p-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                  {/* Left Section - Student Info */}
                  <div className="flex items-start space-x-2 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs shadow-sm flex-shrink-0">
                      {initials}
                    </div>
                    
                    {/* Basic Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">
                          {studentName}
                        </h3>
                      </div>
                      
                      {/* Email */}
                      <div className="flex items-center text-xs text-gray-600 mb-1">
                        <Mail className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{student.fld_email || ''}</span>
                      </div>
                      
                      {/* Contact Info - Compact */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600 mb-2">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{student.fld_city || ''}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{student.fld_mobile || ''}</span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{student.fld_level || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Subjects */}
                      {subjects.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mb-2">
                          <span className="text-xs text-gray-500 font-medium">Fächer:</span>
                          {subjects.slice(0, 3).map((subject: any) => (
                            <span 
                              key={subject.fld_id} 
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {subject.fld_subject}
                            </span>
                          ))}
                          {subjects.length > 3 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                              +{subjects.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No students found</h3>
            <p className="text-sm text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria.' : 'You don\'t have any assigned students yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
