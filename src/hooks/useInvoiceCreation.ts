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
        .neq('fld_status', 'Deleted')
        .neq('fld_status', 'Rejected')
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
      // First, get all temporary details - following PHP logic exactly
      const { data: tempDetails, error: tempError } = await supabase
        .from('tbl_temp_students_invoices_detail')
        .select('*')
        .eq('fld_tempid', data.tempId);

      if (tempError) throw tempError;

      if (!tempDetails || tempDetails.length === 0) {
        throw new Error('No invoice details found');
      }

      // Calculate end date (last day of the month) - following PHP logic exactly
      // PHP: $l_date = $_POST['FLD_YR'].'-'.$_POST['FLD_MN'].'-01';
      // PHP: $FLD_EDATE = date("Y-m-t", strtotime($l_date));
      const lDate = `${data.fld_yr}-${data.fld_mn}-01`;
      const endDate = new Date(parseInt(data.fld_yr), parseInt(data.fld_mn), 0);
      const fldEdate = endDate.toISOString().split('T')[0];

      // PHP: $FLD_MY = $_POST['FLD_MN'].'.'.$_POST['FLD_YR'];
      const fldMy = `${data.fld_mn}.${data.fld_yr}`;

      // PHP: Insert invoice with FLD_INVOICE_TOTAL = '0' initially
      const { data: invoice, error: invoiceError } = await supabase
        .from('tbl_teachers_invoices')
        .insert({
          fld_tid: data.fld_id,
          fld_lhid: null, // PHP uses '0' but we use null as per user request
          fld_cid: null, // PHP uses '0' but we use null as per user request
          fld_invoice_total: 0, // PHP: '0' initially
          fld_edate: fldEdate,
          fld_uname: data.fld_uname,
          fld_status: 'Paid', // PHP sets status to 'Paid'
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // PHP: Loop through temp details and insert each one
      // PHP: Calculate total during loop: $FLD_INVOICE_TOTAL += ($invoice_d['FLD_S_RATE'] * $invoice_d['FLD_LESSON']);
      let fldInvoiceTotal = 0;
      const invoiceDetails: any[] = [];

      for (const invoice_d of tempDetails) {
        // PHP: $FLD_DETAIL = mysqli_real_escape_string($db,$invoice_d['FLD_DETAIL']);
        // PHP: $FLD_CID = 0;
        const fldCid = null; // PHP uses '0' but we use null as per user request

        // Ensure proper number conversion
        const lessonCount = Number(invoice_d.fld_lesson) || 0;
        const rate = Number(invoice_d.fld_s_rate) || 0;

        // PHP: Insert detail
        invoiceDetails.push({
          fld_iid: invoice.fld_id,
          fld_sid: null, // PHP uses '0' but we use null as per user request
          fld_ssid: null, // PHP uses '0'
          fld_cid: fldCid, // PHP uses '0' but we use null as per user request
          fld_detail: invoice_d.fld_detail,
          fld_len_lesson: invoice_d.fld_len_lesson,
          fld_l_date: fldEdate, // PHP: '".$FLD_EDATE."'
          fld_lesson: lessonCount,
          fld_t_rate: rate, // PHP: '".$invoice_d['FLD_S_RATE']."'
          fld_my: fldMy, // PHP: '".$FLD_MY."'
        });

        // PHP: $FLD_INVOICE_TOTAL=$FLD_INVOICE_TOTAL + ($invoice_d['FLD_S_RATE'] * $invoice_d['FLD_LESSON']);
        fldInvoiceTotal += lessonCount * rate;
      }

      // PHP: Insert all details (we batch insert for efficiency, but logic is same)
      const { error: detailsError } = await supabase
        .from('tbl_teachers_invoices_detail')
        .insert(invoiceDetails);

      if (detailsError) throw detailsError;

      // PHP: Update invoice total after all details are inserted
      // PHP: $update=mysqli_query($db,"update tbl_teachers_invoices set FLD_INVOICE_TOTAL='".$FLD_INVOICE_TOTAL."' where FLD_ID='".$invoice['FLD_ID']."'");
      const { data: updatedInvoice, error: updateError } = await supabase
        .from('tbl_teachers_invoices')
        .update({ fld_invoice_total: fldInvoiceTotal })
        .eq('fld_id', invoice.fld_id)
        .select()
        .single();

      if (updateError) throw updateError;

      // PHP: unset($_SESSION['FLD_TTEMPID']);
      // Clean up temporary details
      await supabase
        .from('tbl_temp_students_invoices_detail')
        .delete()
        .eq('fld_tempid', data.tempId);

      return updatedInvoice || invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temp-invoice-details'] });
      queryClient.invalidateQueries({ queryKey: ['teachers-invoices'] });
    },
    onError: (error) => {
      toast.error('Failed to create teacher invoice: ' + error.message);
    },
  });

  // Create student invoice
  const createStudentInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData & { tempId: string }) => {
      // First, get all temporary details - following PHP logic exactly
      const { data: tempDetails, error: tempError } = await supabase
        .from('tbl_temp_students_invoices_detail')
        .select('*')
        .eq('fld_tempid', data.tempId);

      if (tempError) throw tempError;

      if (!tempDetails || tempDetails.length === 0) {
        throw new Error('No invoice details found');
      }

      // Calculate end date (last day of the month) - following PHP logic exactly
      // PHP: $l_date = $_POST['FLD_YR'].'-'.$_POST['FLD_MN'].'-01';
      // PHP: $FLD_EDATE = date("Y-m-t", strtotime($l_date));
      const lDate = `${data.fld_yr}-${data.fld_mn}-01`;
      const endDate = new Date(parseInt(data.fld_yr), parseInt(data.fld_mn), 0);
      const fldEdate = endDate.toISOString().split('T')[0];

      // PHP: $FLD_MY = $_POST['FLD_MN'].'.'.$_POST['FLD_YR'];
      const fldMy = `${data.fld_mn}.${data.fld_yr}`;

      // PHP: Insert invoice with FLD_INVOICE_TOTAL = '0' initially
      const { data: invoice, error: invoiceError } = await supabase
        .from('tbl_students_invoices')
        .insert({
          fld_i_type: (data.fld_i_type as 'Normal' | 'Negative') || 'Normal',
          fld_sid: data.fld_id,
          fld_lhid: null, // PHP uses '0' but we use null as per user request
          fld_invoice_total: 0, // PHP: '0' initially
          fld_invoice_hr: 0, // PHP sets to '0'
          fld_min_lesson: 0, // PHP sets to '0'
          fld_ch_hr: 'N', // PHP sets to 'N'
          fld_notes: null, // PHP uses empty string '' but we use null as per user request
          fld_edate: fldEdate,
          fld_uname: data.fld_uname,
          fld_status: 'Paid', // PHP sets status to 'Paid'
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // PHP: Loop through temp details and insert each one
      // PHP: Calculate total during loop: $FLD_INVOICE_TOTAL += ($invoice_d['FLD_S_RATE'] * $invoice_d['FLD_LESSON']);
      let fldInvoiceTotal = 0;
      const invoiceDetails: any[] = [];

      for (const invoice_d of tempDetails) {
        // PHP: $FLD_DETAIL = mysqli_real_escape_string($db,$invoice_d['FLD_DETAIL']);
        // PHP: $FLD_CID = 0;
        const fldCid = null; // PHP uses '0' but we use null as per user request

        // Ensure proper number conversion
        const lessonCount = Number(invoice_d.fld_lesson) || 0;
        const rate = Number(invoice_d.fld_s_rate) || 0;

        // PHP: Insert detail
        invoiceDetails.push({
          fld_iid: invoice.fld_id,
          fld_ssid: null, // PHP uses '0'
          fld_cid: fldCid, // PHP uses '0' but we use null as per user request
          fld_detail: invoice_d.fld_detail,
          fld_len_lesson: invoice_d.fld_len_lesson,
          fld_l_date: fldEdate, // PHP: '".$FLD_EDATE."'
          fld_lesson: lessonCount,
          fld_s_rate: rate, // PHP: '".$invoice_d['FLD_S_RATE']."'
          fld_my: fldMy, // PHP: '".$FLD_MY."'
        });

        // PHP: $FLD_INVOICE_TOTAL=$FLD_INVOICE_TOTAL + ($invoice_d['FLD_S_RATE'] * $invoice_d['FLD_LESSON']);
        fldInvoiceTotal += lessonCount * rate;
      }

      // PHP: Insert all details (we batch insert for efficiency, but logic is same)
      const { error: detailsError } = await supabase
        .from('tbl_students_invoices_detail')
        .insert(invoiceDetails);

      if (detailsError) throw detailsError;

      // PHP: Update invoice total after all details are inserted
      // PHP: $update=mysqli_query($db,"update tbl_students_invoices set FLD_INVOICE_TOTAL='".$FLD_INVOICE_TOTAL."' where FLD_ID='".$invoice['FLD_ID']."'");
      const { data: updatedInvoice, error: updateError } = await supabase
        .from('tbl_students_invoices')
        .update({ fld_invoice_total: fldInvoiceTotal })
        .eq('fld_id', invoice.fld_id)
        .select()
        .single();

      if (updateError) throw updateError;

      // PHP: unset($_SESSION['FLD_TEMPID']);
      // Clean up temporary details
      await supabase
        .from('tbl_temp_students_invoices_detail')
        .delete()
        .eq('fld_tempid', data.tempId);

      return updatedInvoice || invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temp-invoice-details'] });
      queryClient.invalidateQueries({ queryKey: ['students-invoices'] });
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
