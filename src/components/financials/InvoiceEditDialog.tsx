import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  UpdateInvoiceParams, 
  UpdateInvoiceDetailParams, 
  CreateInvoiceDetailParams 
} from '@/hooks/useStudentFinancials';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Save, 
  X,
  Euro,
  Calendar,
  FileText
} from 'lucide-react';

interface InvoiceDetail {
  id: string;
  detail: string;
  lesson_count: number;
  lesson_duration: number;
  student_rate: number;
  lesson_date: string;
  month_year: string;
  student_subject_id: string;
  contract_id: string;
}

interface Invoice {
  id: string;
  invoice_type: string;
  invoice_total: number;
  invoice_hours: number;
  notes: string;
  entered_date: string;
  status: string;
  details: InvoiceDetail[];
}

interface StudentSubject {
  id: string;
  subjects: {
    name: string;
  };
}

interface Contract {
  id: string;
  lesson_package: string;
  per_lesson_rate: number;
}

interface InvoiceEditDialogProps {
  invoice: Invoice;
  studentId: string;
  onUpdateInvoice: (params: UpdateInvoiceParams) => void;
  onUpdateDetail: (params: UpdateInvoiceDetailParams) => void;
  onDeleteDetail: (detailId: string) => void;
  onCreateDetail: (params: CreateInvoiceDetailParams) => void;
  onClose: () => void;
  isUpdating?: boolean;
}

export default function InvoiceEditDialog({
  invoice,
  studentId,
  onUpdateInvoice,
  onUpdateDetail,
  onDeleteDetail,
  onCreateDetail,
  onClose,
  isUpdating = false
}: InvoiceEditDialogProps) {
  const [editingDetail, setEditingDetail] = useState<string | null>(null);
  const [showAddDetail, setShowAddDetail] = useState(false);
  const [studentSubjects, setStudentSubjects] = useState<StudentSubject[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<UpdateInvoiceParams>({
    defaultValues: {
      invoice_id: invoice.id,
      notes: invoice.notes,
      status: invoice.status as any
    }
  });

  const { register: registerDetail, handleSubmit: handleSubmitDetail, setValue: setDetailValue, formState: { errors: detailErrors } } = useForm<CreateInvoiceDetailParams>({
    defaultValues: {
      invoice_id: invoice.id,
      lesson_duration: 60,
      lesson_date: new Date().toISOString().split('T')[0]
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch student subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('student_subjects')
          .select('id, subjects(name)')
          .eq('student_id', studentId);

        if (subjectsError) throw subjectsError;

        // Fetch contracts
        const { data: contractsData, error: contractsError } = await supabase
          .from('contracts')
          .select('id, lesson_package, per_lesson_rate')
          .eq('student_id', studentId)
          .eq('status', 'Active');

        if (contractsError) throw contractsError;

        setStudentSubjects(subjectsData || []);
        setContracts(contractsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [studentId]);

  const onInvoiceSubmit = (data: UpdateInvoiceParams) => {
    onUpdateInvoice(data);
  };

  const onDetailSubmit = (data: CreateInvoiceDetailParams) => {
    onCreateDetail(data);
    setShowAddDetail(false);
  };

  const handleEditDetail = (detail: InvoiceDetail) => {
    const newCount = prompt('Enter new lesson count:', detail.lesson_count.toString());
    const newRate = prompt('Enter new student rate:', detail.student_rate.toString());
    
    if (newCount && newRate) {
      onUpdateDetail({
        detail_id: detail.id,
        lesson_count: parseInt(newCount),
        student_rate: parseFloat(newRate)
      });
    }
  };

  const handleDeleteDetail = (detailId: string) => {
    if (confirm('Are you sure you want to delete this invoice detail?')) {
      onDeleteDetail(detailId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Edit Invoice #{invoice.id}
                </CardTitle>
                <CardDescription>
                  Modify invoice details and line items
                </CardDescription>
              </div>
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Invoice Header */}
            <form onSubmit={handleSubmit(onInvoiceSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={watch('status')}
                    onValueChange={(value) => setValue('status', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Deleted">Deleted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Invoice Type</Label>
                  <Badge className={`${invoice.invoice_type === 'Negative' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {invoice.invoice_type}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Additional notes for this invoice"
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Updating...' : 'Update Invoice'}
                </Button>
              </div>
            </form>

            {/* Invoice Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Invoice Details</h3>
                <Button 
                  onClick={() => setShowAddDetail(true)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Detail
                </Button>
              </div>

              {/* Add Detail Form */}
              {showAddDetail && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Add Invoice Detail</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitDetail(onDetailSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="student_subject_id">Subject *</Label>
                          <Select
                            onValueChange={(value) => setDetailValue('student_subject_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {studentSubjects.map((subject) => (
                                <SelectItem key={subject.id} value={subject.id}>
                                  {subject.subjects.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {detailErrors.student_subject_id && (
                            <p className="text-sm text-red-600">{detailErrors.student_subject_id.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contract_id">Contract *</Label>
                          <Select
                            onValueChange={(value) => setDetailValue('contract_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select contract" />
                            </SelectTrigger>
                            <SelectContent>
                              {contracts.map((contract) => (
                                <SelectItem key={contract.id} value={contract.id}>
                                  Contract #{contract.id} - {contract.lesson_package}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {detailErrors.contract_id && (
                            <p className="text-sm text-red-600">{detailErrors.contract_id.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="detail">Description *</Label>
                          <Input
                            id="detail"
                            {...registerDetail('detail', { required: 'Description is required' })}
                            placeholder="e.g., Math Tutoring Package A"
                          />
                          {detailErrors.detail && (
                            <p className="text-sm text-red-600">{detailErrors.detail.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lesson_count">Lesson Count *</Label>
                          <Input
                            id="lesson_count"
                            type="number"
                            min="1"
                            {...registerDetail('lesson_count', { 
                              required: 'Lesson count is required',
                              min: { value: 1, message: 'Must be at least 1' }
                            })}
                          />
                          {detailErrors.lesson_count && (
                            <p className="text-sm text-red-600">{detailErrors.lesson_count.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lesson_duration">Duration (minutes) *</Label>
                          <Select
                            onValueChange={(value) => setDetailValue('lesson_duration', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="45">45 minutes</SelectItem>
                              <SelectItem value="60">60 minutes</SelectItem>
                              <SelectItem value="90">90 minutes</SelectItem>
                              <SelectItem value="120">120 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="student_rate">Student Rate (€) *</Label>
                          <Input
                            id="student_rate"
                            type="number"
                            step="0.01"
                            min="0"
                            {...registerDetail('student_rate', { 
                              required: 'Student rate is required',
                              min: { value: 0, message: 'Rate must be positive' }
                            })}
                          />
                          {detailErrors.student_rate && (
                            <p className="text-sm text-red-600">{detailErrors.student_rate.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lesson_date">Lesson Date *</Label>
                          <Input
                            id="lesson_date"
                            type="date"
                            {...registerDetail('lesson_date', { required: 'Lesson date is required' })}
                          />
                          {detailErrors.lesson_date && (
                            <p className="text-sm text-red-600">{detailErrors.lesson_date.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="month_year">Month/Year *</Label>
                          <Input
                            id="month_year"
                            {...registerDetail('month_year', { 
                              required: 'Month/Year is required',
                              pattern: {
                                value: /^\d{2}\.\d{4}$/,
                                message: 'Format: MM.YYYY (e.g., 01.2024)'
                              }
                            })}
                            placeholder="MM.YYYY"
                          />
                          {detailErrors.month_year && (
                            <p className="text-sm text-red-600">{detailErrors.month_year.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowAddDetail(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isUpdating}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Detail
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Invoice Details Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Description
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">
                        Count
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">
                        Duration
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">
                        Rate
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">
                        Total
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.details.map((detail, index) => (
                      <tr key={detail.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                          {detail.detail}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-700">
                          {detail.lesson_count}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-700">
                          {detail.lesson_duration} min
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-sm text-gray-700">
                          €{detail.student_rate.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-sm text-gray-700">
                          €{(detail.student_rate * detail.lesson_count).toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-700">
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditDetail(detail)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDetail(detail.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invoice Total */}
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>€{Math.abs(invoice.invoice_total).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span className="flex items-center">
                          <Euro className="h-4 w-4 mr-1" />
                          {Math.abs(invoice.invoice_total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
