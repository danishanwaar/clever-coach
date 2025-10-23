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
      <div className="flex items-center justify-end">
        <Button onClick={() => setIsAddActivityOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Record Activity
        </Button>
      </div>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activities</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredActivities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-5 font-medium text-gray-600">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Activity Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Notes</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.map((activity) => (
                    <tr key={activity.fld_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 font-semibold text-xs">
                              {getInitials(
                                activity.tbl_students?.fld_first_name || '',
                                activity.tbl_students?.fld_last_name || ''
                              )}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {activity.tbl_students?.fld_first_name} {activity.tbl_students?.fld_last_name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {activity.tbl_activities_types?.fld_activity_name}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-700 max-w-xs">
                        <p className="text-sm truncate" title={activity.fld_description || ''}>
                          {activity.fld_description || '-'}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs">
                        <p className="text-sm truncate" title={activity.fld_notes || ''}>
                          {activity.fld_notes || '-'}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <p className="text-sm">
                          {formatDate(activity.fld_edate)}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No activities match your search criteria.' : 'This student has no activities yet.'}
              </p>
              {!searchTerm && (
                <Button 
                  className="mt-4" 
                  onClick={() => setIsAddActivityOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Record First Activity
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Modal */}
      <ActivityModal
        student={student || null}
        isOpen={isAddActivityOpen}
        onClose={() => setIsAddActivityOpen(false)}
      />
    </div>
  );
}
