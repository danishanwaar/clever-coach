import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { CreateManualInvoiceParams } from '@/hooks/useStudentFinancials';

interface ManualInvoiceFormProps {
  studentId: string;
  onSubmit: (data: CreateManualInvoiceParams) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface Contract {
  id: string;
  lesson_package: string;
  per_lesson_rate: number;
}

interface StudentSubject {
  id: string;
  subjects: {
    name: string;
  };
}

export default function ManualInvoiceForm({ studentId, onSubmit, onCancel, isLoading }: ManualInvoiceFormProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [studentSubjects, setStudentSubjects] = useState<StudentSubject[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateManualInvoiceParams>({
    defaultValues: {
      invoice_type: 'Normal',
      lesson_duration: 60,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    }
  });

  const invoiceType = watch('invoice_type');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active contracts for the student
        const { data: contractsData, error: contractsError } = await supabase
          .from('contracts')
          .select('id, lesson_package, per_lesson_rate')
          .eq('student_id', studentId)
          .eq('status', 'Active');

        if (contractsError) throw contractsError;

        // Fetch student subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('student_subjects')
          .select('id, subjects(name)')
          .eq('student_id', studentId);

        if (subjectsError) throw subjectsError;

        setContracts(contractsData || []);
        setStudentSubjects(subjectsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [studentId]);

  const onFormSubmit = (data: CreateManualInvoiceParams) => {
    onSubmit(data);
  };

  if (loadingData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading form data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Manual Invoice</CardTitle>
        <CardDescription>
          Create a new invoice manually for this student
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Invoice Type */}
            <div className="space-y-2">
              <Label htmlFor="invoice_type">Invoice Type *</Label>
              <Select
                value={invoiceType}
                onValueChange={(value: 'Normal' | 'Negative') => setValue('invoice_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select invoice type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Negative">Negative (Credit Note)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Original Invoice Reference (for negative invoices) */}
            {invoiceType === 'Negative' && (
              <div className="space-y-2">
                <Label htmlFor="original_invoice_reference">Original Invoice Reference *</Label>
                <Input
                  id="original_invoice_reference"
                  {...register('original_invoice_reference', { 
                    required: invoiceType === 'Negative' ? 'Original invoice reference is required for negative invoices' : false 
                  })}
                  placeholder="Enter original invoice ID"
                />
                {errors.original_invoice_reference && (
                  <p className="text-sm text-red-600">{errors.original_invoice_reference.message}</p>
                )}
              </div>
            )}

            {/* Contract Selection */}
            <div className="space-y-2">
              <Label htmlFor="contract_id">Contract *</Label>
              <Select
                onValueChange={(value) => setValue('contract_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contract" />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map((contract) => (
                    <SelectItem key={contract.id} value={contract.id}>
                      Contract #{contract.id} - €{contract.per_lesson_rate}/lesson - {contract.lesson_package}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.contract_id && (
                <p className="text-sm text-red-600">{errors.contract_id.message}</p>
              )}
            </div>

            {/* Subject Selection */}
            <div className="space-y-2">
              <Label htmlFor="student_subject_id">Subject *</Label>
              <Select
                onValueChange={(value) => setValue('student_subject_id', value)}
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
              {errors.student_subject_id && (
                <p className="text-sm text-red-600">{errors.student_subject_id.message}</p>
              )}
            </div>

            {/* Lesson Count */}
            <div className="space-y-2">
              <Label htmlFor="lesson_count">Lesson Count *</Label>
              <Input
                id="lesson_count"
                type="number"
                min="1"
                {...register('lesson_count', { 
                  required: 'Lesson count is required',
                  min: { value: 1, message: 'Lesson count must be at least 1' }
                })}
                placeholder="Number of lessons"
              />
              {errors.lesson_count && (
                <p className="text-sm text-red-600">{errors.lesson_count.message}</p>
              )}
            </div>

            {/* Lesson Duration */}
            <div className="space-y-2">
              <Label htmlFor="lesson_duration">Lesson Duration (minutes) *</Label>
              <Select
                onValueChange={(value) => setValue('lesson_duration', parseInt(value))}
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

            {/* Student Rate */}
            <div className="space-y-2">
              <Label htmlFor="student_rate">Student Rate (€) *</Label>
              <Input
                id="student_rate"
                type="number"
                step="0.01"
                min="0"
                {...register('student_rate', { 
                  required: 'Student rate is required',
                  min: { value: 0, message: 'Rate must be positive' }
                })}
                placeholder="Rate per lesson"
              />
              {errors.student_rate && (
                <p className="text-sm text-red-600">{errors.student_rate.message}</p>
              )}
            </div>

            {/* Month */}
            <div className="space-y-2">
              <Label htmlFor="month">Month *</Label>
              <Select
                onValueChange={(value) => setValue('month', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                min="2020"
                max="2030"
                {...register('year', { 
                  required: 'Year is required',
                  min: { value: 2020, message: 'Year must be 2020 or later' },
                  max: { value: 2030, message: 'Year must be 2030 or earlier' }
                })}
                placeholder="Year"
              />
              {errors.year && (
                <p className="text-sm text-red-600">{errors.year.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes for this invoice"
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
