import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoiceCreation, useTempInvoiceDetails } from '@/hooks/useInvoiceCreation';
import { useAuthStore } from '@/stores/authStore';
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
import { ArrowLeft, PlusCircle, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

const CreateStudentInvoice = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tempId] = useState(() => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const {
    students,
    lessonDurations,
    createTempDetail,
    deleteTempDetail,
    createStudentInvoice,
    isCreatingTemp,
    isDeletingTemp,
    isCreatingStudentInvoice,
  } = useInvoiceCreation();

  const { tempDetails, isLoading: tempDetailsLoading } = useTempInvoiceDetails(tempId);

  // Form states
  const [formData, setFormData] = useState({
    fld_i_type: '',
    fld_id: '',
    fld_lp: '',
    fld_mn: '',
    fld_yr: '',
  });

  const [detailForm, setDetailForm] = useState({
    fld_detail: '',
    fld_lesson: '',
    fld_s_rate: '',
    fld_len_lesson: '',
  });

  // Generate current year and next 10 years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDetailFormChange = (field: string, value: string) => {
    setDetailForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddDetail = async () => {
    if (!detailForm.fld_detail || !detailForm.fld_lesson || !detailForm.fld_s_rate || !detailForm.fld_len_lesson) {
      toast.error('All fields are required');
      return;
    }

    try {
      await createTempDetail({
        tempId,
        fld_detail: detailForm.fld_detail,
        fld_lesson: parseInt(detailForm.fld_lesson),
        fld_s_rate: parseFloat(detailForm.fld_s_rate),
        fld_len_lesson: detailForm.fld_len_lesson,
      });

      // Clear form
      setDetailForm({
        fld_detail: '',
        fld_lesson: '',
        fld_s_rate: '',
        fld_len_lesson: '',
      });
    } catch (error) {
      console.error('Failed to add detail:', error);
    }
  };

  const handleDeleteDetail = async (detailId: number) => {
    try {
      await deleteTempDetail(detailId);
    } catch (error) {
      console.error('Failed to delete detail:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fld_i_type || !formData.fld_id || !formData.fld_lp || !formData.fld_mn || !formData.fld_yr) {
      toast.error('All form fields are required');
      return;
    }

    if (tempDetails.length === 0) {
      toast.error('Please add at least one invoice detail');
      return;
    }

    try {
      await createStudentInvoice({
        ...formData,
        fld_id: parseInt(formData.fld_id),
        fld_uname: user?.fld_id || 1, // Use current user ID or default to 1
        tempId,
      });

      // Navigate to receivables page
      navigate('/receivables');
    } catch (error) {
      console.error('Failed to create invoice:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">Create Student Invoice</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fld_i_type" className="required">Invoice Type</Label>
                <Select
                  value={formData.fld_i_type}
                  onValueChange={(value) => handleFormChange('fld_i_type', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select invoice type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fld_id" className="required">Student</Label>
                <Select
                  value={formData.fld_id}
                  onValueChange={(value) => handleFormChange('fld_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.fld_id} value={student.fld_id.toString()}>
                        {student.fld_id} - {student.fld_first_name} {student.fld_last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fld_lp" className="required">Learning Preference</Label>
                <Select
                  value={formData.fld_lp}
                  onValueChange={(value) => handleFormChange('fld_lp', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select learning preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Onsite">Onsite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fld_mn" className="required">Month</Label>
                <Select
                  value={formData.fld_mn}
                  onValueChange={(value) => handleFormChange('fld_mn', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = (i + 1).toString().padStart(2, '0');
                      return (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fld_yr" className="required">Year</Label>
                <Select
                  value={formData.fld_yr}
                  onValueChange={(value) => handleFormChange('fld_yr', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div className="md:col-span-2">
                  <Label htmlFor="fld_detail" className="required">Description</Label>
                  <Input
                    id="fld_detail"
                    value={detailForm.fld_detail}
                    onChange={(e) => handleDetailFormChange('fld_detail', e.target.value)}
                    placeholder="Enter description"
                  />
                </div>

                <div>
                  <Label htmlFor="fld_lesson" className="required">No of Lessons</Label>
                  <Input
                    id="fld_lesson"
                    type="number"
                    value={detailForm.fld_lesson}
                    onChange={(e) => handleDetailFormChange('fld_lesson', e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="fld_s_rate" className="required">Lesson Rate</Label>
                  <Input
                    id="fld_s_rate"
                    type="number"
                    step="0.01"
                    value={detailForm.fld_s_rate}
                    onChange={(e) => handleDetailFormChange('fld_s_rate', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="fld_len_lesson" className="required">Lesson Duration</Label>
                  <Select
                    value={detailForm.fld_len_lesson}
                    onValueChange={(value) => handleDetailFormChange('fld_len_lesson', value)}
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
              </div>

              <Button
                type="button"
                onClick={handleAddDetail}
                disabled={isCreatingTemp}
                className="mb-4"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                {isCreatingTemp ? 'Adding...' : 'Add Detail'}
              </Button>

              {/* Temporary Invoice Details Table */}
              {tempDetails.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">No of Lessons</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Lesson Rate</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Lesson Duration</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tempDetails.map((detail) => (
                        <tr key={detail.fld_id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{detail.fld_detail}</td>
                          <td className="py-3 px-4">{detail.fld_lesson}</td>
                          <td className="py-3 px-4 text-center">{Math.round(detail.fld_s_rate)}</td>
                          <td className="py-3 px-4">{detail.fld_len_lesson}</td>
                          <td className="py-3 px-4">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  disabled={isDeletingTemp}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    You want to delete this invoice detail. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteDetail(detail.fld_id)}
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
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={isCreatingStudentInvoice || tempDetails.length === 0}
                className="min-w-[120px]"
              >
                <Save className="h-4 w-4 mr-2" />
                {isCreatingStudentInvoice ? 'Creating...' : 'Save Invoice'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateStudentInvoice;
