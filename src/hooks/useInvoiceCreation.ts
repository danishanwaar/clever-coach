import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface Teacher {
  fld_id: number;
  fld_first_name: string;
  fld_last_name: string;
  fld_status: string;
}

export interface Student {
  fld_id: number;
  fld_first_name: string;
  fld_last_name: string;
  fld_status: string;
}

export interface LessonDuration {
  fld_id: number;
  fld_l_duration: string;
}

export interface TempInvoiceDetail {
  fld_id: number;
  fld_tempid: string;
  fld_detail: string;
  fld_lesson: number;
  fld_s_rate: number;
  fld_len_lesson: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface InvoiceFormData {
  fld_id: number; // Teacher or Student ID
  fld_mn: string; // Month
  fld_yr: string; // Year
  fld_lp?: string; // Learning Preference (for student invoices)
  fld_i_type?: string; // Invoice Type (for student invoices)
  fld_uname: number; // User who created the invoice
}

export interface InvoiceDetailData {
  fld_detail: string;
  fld_lesson: number;
  fld_s_rate: number;
  fld_len_lesson: string;
}

// Hook for managing invoice creation
export function useInvoiceCreation() {
  const queryClient = useQueryClient();

  // Fetch teachers for teacher invoice
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers-for-invoice'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_teachers')
        .select('fld_id, fld_first_name, fld_last_name, fld_status')
        .not('fld_status', 'in', ['Deleted', 'Rejected'])
        .order('fld_first_name');

      if (error) throw error;
      return data as Teacher[];
    },
  });

  // Fetch students for student invoice
  const { data: students = [] } = useQuery({
    queryKey: ['students-for-invoice'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_students')
        .select('fld_id, fld_first_name, fld_last_name, fld_status')
        .not('fld_status', 'eq', 'Deleted')
        .order('fld_first_name');

      if (error) throw error;
      return data as Student[];
    },
  });

  // Fetch lesson durations
  const { data: lessonDurations = [] } = useQuery({
    queryKey: ['lesson-durations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_lesson_durations')
        .select('*')
        .order('fld_l_duration');

      if (error) throw error;
      return data as LessonDuration[];
    },
  });

  // Create temporary invoice detail
  const createTempDetailMutation = useMutation({
    mutationFn: async (data: InvoiceDetailData & { tempId: string }) => {
      const { error } = await supabase
        .from('tbl_temp_students_invoices_detail')
        .insert({
          fld_tempid: data.tempId,
          fld_detail: data.fld_detail,
          fld_lesson: data.fld_lesson,
          fld_s_rate: data.fld_s_rate,
          fld_len_lesson: data.fld_len_lesson,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temp-invoice-details'] });
      toast.success('Invoice detail added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add invoice detail: ' + error.message);
    },
  });

  // Delete temporary invoice detail
  const deleteTempDetailMutation = useMutation({
    mutationFn: async (detailId: number) => {
      const { error } = await supabase
        .from('tbl_temp_students_invoices_detail')
        .delete()
        .eq('fld_id', detailId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temp-invoice-details'] });
      toast.success('Invoice detail deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete invoice detail: ' + error.message);
    },
  });

  // Create teacher invoice
  const createTeacherInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData & { tempId: string }) => {
      // First, get all temporary details
      const { data: tempDetails, error: tempError } = await supabase
        .from('tbl_temp_students_invoices_detail')
        .select('*')
        .eq('fld_tempid', data.tempId);

      if (tempError) throw tempError;

      if (!tempDetails || tempDetails.length === 0) {
        throw new Error('No invoice details found');
      }

      // Calculate total amount and hours from temp details
      let totalAmount = 0;
      let totalLessons = 0;
      tempDetails.forEach(detail => {
        totalAmount += detail.fld_lesson * detail.fld_s_rate;
        totalLessons += detail.fld_lesson;
      });

      // Create the main invoice record
      const { data: invoice, error: invoiceError } = await supabase
        .from('tbl_teachers_invoices')
        .insert({
          fld_tid: data.fld_id,
          fld_edate: new Date().toISOString(),
          fld_uname: data.fld_uname,
          fld_status: 'Active', // Default status
          fld_invoice_total: totalAmount,
          fld_invoice_hr: totalLessons,
          fld_min_lesson: totalLessons, // Assuming min_lesson is total lessons for now
          fld_ch_hr: 'N', // Default
          fld_cid: null, // Default
          fld_lhid: null, // Default
          fld_notes: null, // Default
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice details
      const invoiceDetails = tempDetails.map(detail => ({
        fld_iid: invoice.fld_id,
        fld_sid: data.fld_id, // Teacher ID becomes student ID in teacher invoice details
        fld_ssid: 0, // Default value - should be replaced with actual student subject ID
        fld_cid: 0, // Default value - should be replaced with actual contract ID
        fld_detail: detail.fld_detail,
        fld_len_lesson: detail.fld_len_lesson,
        fld_l_date: new Date().toISOString().split('T')[0], // Current date
        fld_lesson: detail.fld_lesson,
        fld_t_rate: detail.fld_s_rate, // Use student rate as teacher rate for now
        fld_my: `${data.fld_mn}.${data.fld_yr}`, // Month.Year format
      }));

      const { error: detailsError } = await supabase
        .from('tbl_teachers_invoices_detail')
        .insert(invoiceDetails);

      if (detailsError) throw detailsError;

      // Clean up temporary details
      await supabase
        .from('tbl_temp_students_invoices_detail')
        .delete()
        .eq('fld_tempid', data.tempId);

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temp-invoice-details'] });
      queryClient.invalidateQueries({ queryKey: ['teachers-invoices'] });
      toast.success('Teacher invoice created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create teacher invoice: ' + error.message);
    },
  });

  // Create student invoice
  const createStudentInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData & { tempId: string }) => {
      // First, get all temporary details
      const { data: tempDetails, error: tempError } = await supabase
        .from('tbl_temp_students_invoices_detail')
        .select('*')
        .eq('fld_tempid', data.tempId);

      if (tempError) throw tempError;

      if (!tempDetails || tempDetails.length === 0) {
        throw new Error('No invoice details found');
      }

      // Calculate total amount and hours from temp details
      let totalAmount = 0;
      let totalLessons = 0;
      tempDetails.forEach(detail => {
        totalAmount += detail.fld_lesson * detail.fld_s_rate;
        totalLessons += detail.fld_lesson;
      });

      // Create the main invoice record
      const { data: invoice, error: invoiceError } = await supabase
        .from('tbl_students_invoices')
        .insert({
          fld_sid: data.fld_id,
          fld_i_type: (data.fld_i_type as 'Normal' | 'Negative') || 'Normal',
          fld_edate: new Date().toISOString(),
          fld_uname: data.fld_uname,
          fld_status: 'Active', // Default status
          fld_invoice_total: totalAmount,
          fld_invoice_hr: totalLessons,
          fld_min_lesson: totalLessons, // Assuming min_lesson is total lessons for now
          fld_ch_hr: 'N', // Default
          fld_cid: null, // Default
          fld_lhid: null, // Default
          fld_notes: null, // Default
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice details
      const invoiceDetails = tempDetails.map(detail => ({
        fld_iid: invoice.fld_id,
        fld_ssid: 0, // Default value - should be replaced with actual student subject ID
        fld_cid: 0, // Default value - should be replaced with actual contract ID
        fld_detail: detail.fld_detail,
        fld_len_lesson: detail.fld_len_lesson,
        fld_l_date: new Date().toISOString().split('T')[0], // Current date
        fld_lesson: detail.fld_lesson,
        fld_s_rate: detail.fld_s_rate,
        fld_my: `${data.fld_mn}.${data.fld_yr}`, // Month.Year format
      }));

      const { error: detailsError } = await supabase
        .from('tbl_students_invoices_detail')
        .insert(invoiceDetails);

      if (detailsError) throw detailsError;

      // Clean up temporary details
      await supabase
        .from('tbl_temp_students_invoices_detail')
        .delete()
        .eq('fld_tempid', data.tempId);

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temp-invoice-details'] });
      queryClient.invalidateQueries({ queryKey: ['students-invoices'] });
      toast.success('Student invoice created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create student invoice: ' + error.message);
    },
  });

  return {
    teachers,
    students,
    lessonDurations,
    createTempDetail: createTempDetailMutation.mutate,
    deleteTempDetail: deleteTempDetailMutation.mutate,
    createTeacherInvoice: createTeacherInvoiceMutation.mutate,
    createStudentInvoice: createStudentInvoiceMutation.mutate,
    isCreatingTemp: createTempDetailMutation.isPending,
    isDeletingTemp: deleteTempDetailMutation.isPending,
    isCreatingTeacherInvoice: createTeacherInvoiceMutation.isPending,
    isCreatingStudentInvoice: createStudentInvoiceMutation.isPending,
  };
}

// Hook for managing temporary invoice details
export function useTempInvoiceDetails(tempId: string) {
  const { data: tempDetails = [], isLoading } = useQuery({
    queryKey: ['temp-invoice-details', tempId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_temp_students_invoices_detail')
        .select('fld_id, fld_tempid, fld_detail, fld_lesson, fld_s_rate, fld_len_lesson')
        .eq('fld_tempid', tempId)
        .order('fld_id');

      if (error) throw error;
      return data as TempInvoiceDetail[];
    },
    enabled: !!tempId,
  });

  return {
    tempDetails,
    isLoading,
  };
}
