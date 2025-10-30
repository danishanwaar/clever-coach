import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStudentTimeLogs } from '@/hooks/useStudentTimeLogs';
import { useStudent } from '@/hooks/useStudents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Search, 
  Clock, 
  BookOpen,
  User,
  Calendar,
  AlertCircle,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

export default function StudentTimeLogs() {
  const { id } = useParams<{ id: string }>();
  const studentId = parseInt(id || '0');
  const { data: student, isLoading: studentLoading } = useStudent(studentId);
  
  const {
    timeLogs,
    studentSubjects,
    isLoading,
  } = useStudentTimeLogs(studentId);

  const [searchTerm, setSearchTerm] = useState('');

  // Filter time logs based on search term
  const filteredTimeLogs = timeLogs.filter(log => 
    log.tbl_students?.fld_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.tbl_students?.fld_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.tbl_students_subjects?.tbl_subjects?.fld_subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.fld_notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.tbl_users?.fld_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd-MMM-yy');
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Suspended':
        return 'bg-red-100 text-red-800';
      case 'Deleted':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg sm:text-xl font-semibold text-primary">Time Logs</h2>
        <p className="text-xs sm:text-sm text-gray-600">Track and manage student lesson time logs</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search time logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-primary focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Time Logs Cards */}
      <div className="space-y-4">
        {filteredTimeLogs.length > 0 ? (
          filteredTimeLogs.map((log) => (
            <div 
              key={log.fld_id}
              className="bg-white rounded-lg shadow-sm border-l-4 border-l-primary hover:shadow-md transition-all duration-200 group"
            >
              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  {/* Left Section - Time Log Info */}
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    {/* Time Log Icon */}
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm shadow-sm flex-shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    
                    {/* Time Log Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                          {log.tbl_students_subjects?.tbl_subjects?.fld_subject || 'Unknown Subject'}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800 text-xs font-medium">
                            {Math.round(log.fld_lesson)} lessons
                          </Badge>
                          <Badge className={`${getStatusColor(log.fld_status)} text-xs font-medium`}>
                            {log.fld_status || 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Time Log Info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="truncate">
                            {log.tbl_students?.fld_first_name} {log.tbl_students?.fld_last_name}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{formatDate(log.fld_edate)}</span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="truncate">By: {log.tbl_users?.fld_name}</span>
                        </div>
                      </div>

                      {/* Remarks */}
                      {log.fld_notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Remarks:</span> {log.fld_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No time logs found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'No time logs match your search criteria.' : 'This student has no time logs yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}




