import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStudentActivity } from '@/hooks/useStudentActivity';
import { useStudent } from '@/hooks/useStudents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Plus, 
  Search,
  Activity, 
  User,
  Calendar,
  AlertCircle,
  FileText,
  Trash2
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
import { format } from 'date-fns';
import ActivityModal from '@/components/ActivityModal';

export default function StudentActivity() {
  const { id } = useParams<{ id: string }>();
  const studentId = parseInt(id || '0');
  
  const { data: student, isLoading: studentLoading } = useStudent(studentId);
  
  const {
    activities,
    activityTypes,
    isLoading,
    createActivity,
    deleteActivity,
    isCreating,
    isDeleting,
  } = useStudentActivity(studentId);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);

  // Filter activities based on search term
  const filteredActivities = activities.filter(activity =>
    activity.tbl_students?.fld_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.tbl_students?.fld_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.tbl_activities_types?.fld_activity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.fld_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.fld_notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleDeleteActivity = (activityId: number) => {
    deleteActivity(activityId);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd-MMM-yy');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-semibold text-primary">Activity Log</h2>
          <p className="text-xs sm:text-sm text-gray-600">Track and manage student activities</p>
        </div>
        <Button onClick={() => setIsAddActivityOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Record Activity
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-primary focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Activities Cards */}
      <div className="space-y-4">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <div 
              key={activity.fld_id}
              className="bg-white rounded-lg shadow-sm border-l-4 border-l-primary hover:shadow-md transition-all duration-200 group"
            >
              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  {/* Left Section - Activity Info */}
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    {/* Activity Icon */}
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm shadow-sm flex-shrink-0">
                      <Activity className="h-5 w-5" />
                    </div>
                    
                    {/* Activity Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                          {activity.tbl_activities_types?.fld_activity_name || 'Unknown Activity'}
                        </h3>
                        <Badge className="bg-blue-100 text-blue-800 text-xs font-medium self-start sm:self-auto">
                          {formatDate(activity.fld_edate)}
                        </Badge>
                      </div>
                      
                      {/* Activity Info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="truncate">
                            {activity.tbl_students?.fld_first_name} {activity.tbl_students?.fld_last_name}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{activity.fld_description || 'No description'}</span>
                        </div>
                        {activity.fld_notes && (
                          <div className="flex items-center">
                            <AlertCircle className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{activity.fld_notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex items-center justify-end sm:justify-start space-x-2 flex-shrink-0 sm:self-start">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            You want to delete this activity. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteActivity(activity.fld_id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'No activities match your search criteria.' : 'This student has no activities yet.'}
            </p>
            {!searchTerm && (
              <Button 
                className="bg-primary hover:bg-primary/90" 
                onClick={() => setIsAddActivityOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Record First Activity
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Activity Modal */}
      <ActivityModal
        student={student || null}
        isOpen={isAddActivityOpen}
        onClose={() => setIsAddActivityOpen(false)}
      />
    </div>
  );
}
