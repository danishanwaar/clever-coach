import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InvoiceDetail {
  fld_id: number;
  fld_iid: number;
  fld_detail: string;
  fld_lesson: number;
  fld_len_lesson: string;
  fld_s_rate: number;
  fld_t_rate: number;
  fld_my: string;
  fld_l_date: string;
  fld_ssid: number | null;
  fld_cid: number | null;
}

// Fetch student invoice with details
export function useStudentInvoice(invoiceId: number | null) {
  return useQuery({
    queryKey: ['student-invoice', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;

      // Fetch invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('tbl_students_invoices')
        .select(`
          *,
          tbl_students!fld_sid (
            fld_id,
            fld_first_name,
            fld_last_name,
            fld_address,
            fld_zip,
            fld_city,
            fld_email,
            fld_phone,
            fld_sal,
            fld_payer
          )
        `)
        .eq('fld_id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      // Fetch invoice details (grouped as in PHP)
      const { data: details, error: detailsError } = await supabase
        .from('tbl_students_invoices_detail')
        .select('*')
        .eq('fld_iid', invoiceId);

      if (detailsError) throw detailsError;

      // Fetch contract for payment method
      const { data: contract } = await supabase
        .from('tbl_contracts')
        .select('*')
        .eq('fld_sid', invoice.fld_sid)
        .order('fld_id', { ascending: false })
        .limit(1)
        .single();

      return {
        invoice,
        details: details || [],
        contract: contract || null,
      };
    },
    enabled: !!invoiceId,
  });
}

// Fetch teacher invoice with details
export function useTeacherInvoice(invoiceId: number | null) {
  return useQuery({
    queryKey: ['teacher-invoice', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;

      // Fetch invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('tbl_teachers_invoices')
        .select(`
          *,
          tbl_teachers!fld_tid (
            fld_id,
            fld_first_name,
            fld_last_name,
            fld_street,
            fld_zip,
            fld_city,
            fld_bakk_rno,
            fld_bank_act
          )
        `)
        .eq('fld_id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      // Fetch invoice details (grouped as in PHP)
      const { data: details, error: detailsError } = await supabase
        .from('tbl_teachers_invoices_detail')
        .select('*')
        .eq('fld_iid', invoiceId);

      if (detailsError) throw detailsError;

      return {
        invoice,
        details: details || [],
      };
    },
    enabled: !!invoiceId,
  });
}

// Update invoice detail
export function useUpdateInvoiceDetail(type: 'student' | 'teacher') {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      invoiceId,
      detailId,
      field,
      value,
    }: {
      invoiceId: number;
      detailId: number;
      field: string;
      value: any;
    }) => {
      const table = type === 'student' 
        ? 'tbl_students_invoices_detail'
        : 'tbl_teachers_invoices_detail';

      const { error } = await supabase
        .from(table)
        .update({ [field]: value })
        .eq('fld_id', detailId);

      if (error) throw error;

      // Recalculate invoice total
      await recalculateInvoiceTotal(type, invoiceId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [`${type}-invoice`, variables.invoiceId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`${type}-invoices`] 
      });
    },
    onError: (error) => {
      toast.error('Failed to update invoice detail: ' + error.message);
    },
  });
}

// Add invoice detail
export function useAddInvoiceDetail(type: 'student' | 'teacher') {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      invoiceId,
      detail,
    }: {
      invoiceId: number;
      detail: Partial<InvoiceDetail>;
    }) => {
      const table = type === 'student' 
        ? 'tbl_students_invoices_detail'
        : 'tbl_teachers_invoices_detail';

      const invoiceField = type === 'student' ? 'fld_sid' : 'fld_tid';
      
      // Get invoice to get student/teacher ID
      const invoiceTable = type === 'student' 
        ? 'tbl_students_invoices'
        : 'tbl_teachers_invoices';
      
      const { data: invoice } = await supabase
        .from(invoiceTable)
        .select('*')
        .eq('fld_id', invoiceId)
        .single();

      if (!invoice) throw new Error('Invoice not found');

      // Get end date from invoice
      const endDate = invoice.fld_edate;

      // Build insert payload with only valid columns for the target table
      const insertPayload: any = {
        fld_iid: invoiceId,
        fld_detail: detail.fld_detail || '',
        fld_lesson: detail.fld_lesson || 0,
        fld_len_lesson: detail.fld_len_lesson || '',
        fld_my: detail.fld_my || '',
        fld_l_date: endDate,
        fld_ssid: detail.fld_ssid || null,
        fld_cid: detail.fld_cid || null,
      };
      if (type === 'student') insertPayload.fld_s_rate = detail.fld_s_rate || 0;
      else insertPayload.fld_t_rate = detail.fld_t_rate || 0;

      const { error } = await supabase
        .from(table)
        .insert(insertPayload);

      if (error) throw error;

      // Recalculate invoice total
      await recalculateInvoiceTotal(type, invoiceId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [`${type}-invoice`, variables.invoiceId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`${type}-invoices`] 
      });
      toast.success('Invoice detail added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add invoice detail: ' + error.message);
    },
  });
}

// Delete invoice detail
export function useDeleteInvoiceDetail(type: 'student' | 'teacher') {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      invoiceId,
      detailId,
    }: {
      invoiceId: number;
      detailId: number;
    }) => {
      const table = type === 'student' 
        ? 'tbl_students_invoices_detail'
        : 'tbl_teachers_invoices_detail';

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('fld_id', detailId);

      if (error) throw error;

      // Recalculate invoice total
      await recalculateInvoiceTotal(type, invoiceId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [`${type}-invoice`, variables.invoiceId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`${type}-invoices`] 
      });
      toast.success('Invoice detail deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete invoice detail: ' + error.message);
    },
  });
}

// Update invoice date
export function useUpdateInvoiceDate(type: 'student' | 'teacher') {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      invoiceId,
      date,
    }: {
      invoiceId: number;
      date: string;
    }) => {
      const table = type === 'student' 
        ? 'tbl_students_invoices'
        : 'tbl_teachers_invoices';

      const { error } = await supabase
        .from(table)
        .update({ fld_edate: date })
        .eq('fld_id', invoiceId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [`${type}-invoice`, variables.invoiceId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`${type}-invoices`] 
      });
      toast.success('Invoice date updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update invoice date: ' + error.message);
    },
  });
}

// Recalculate invoice total
async function recalculateInvoiceTotal(
  type: 'student' | 'teacher',
  invoiceId: number
) {
  const detailTable = type === 'student' 
    ? 'tbl_students_invoices_detail'
    : 'tbl_teachers_invoices_detail';
  
  const invoiceTable = type === 'student' 
    ? 'tbl_students_invoices'
    : 'tbl_teachers_invoices';

  // Get invoice to check for minimum lesson logic
  const { data: invoice } = await supabase
    .from(invoiceTable)
    .select('*')
    .eq('fld_id', invoiceId)
    .single();

  if (!invoice) return;

  // Get all details
  const { data: details } = await supabase
    .from(detailTable)
    .select('*')
    .eq('fld_iid', invoiceId);

  if (!details) return;

  let total = 0;

  for (const detail of details) {
    let lessonCount = detail.fld_lesson || 0;
    
    // Apply minimum lesson logic for student invoices
    if (type === 'student' && detail.fld_detail !== 'Anmeldegebühr') {
      if (invoice.fld_ch_hr === 'Y' && invoice.fld_min_lesson) {
        if (lessonCount < invoice.fld_min_lesson) {
          lessonCount = invoice.fld_min_lesson;
        }
      }
    }

    const rate = type === 'student' 
      ? detail.fld_s_rate || 0
      : detail.fld_t_rate || 0;

    total += lessonCount * rate;
  }

  // Update invoice total
  await supabase
    .from(invoiceTable)
    .update({ fld_invoice_total: total })
    .eq('fld_id', invoiceId);
}

