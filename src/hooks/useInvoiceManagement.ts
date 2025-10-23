import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

// Types
export interface StudentInvoice {
  fld_id: number;
  fld_sid: number;
  fld_i_type: string | null;
  fld_lhid: string | null;
  fld_invoice_total: number;
  fld_status: string;
  fld_edate: string;
  created_at: string | null;
  updated_at: string | null;
  // Joined data
  tbl_students?: {
    fld_id: number;
    fld_first_name: string;
    fld_last_name: string;
  };
}

export interface TeacherInvoice {
  fld_id: number;
  fld_tid: number;
  fld_lhid: string | null;
  fld_invoice_total: number;
  fld_status: string;
  fld_edate: string;
  created_at: string | null;
  updated_at: string | null;
  // Joined data
  tbl_teachers?: {
    fld_id: number;
    fld_first_name: string;
    fld_last_name: string;
  };
}

export interface InvoiceStats {
  totalAmount: number;
  pendingCount: number;
  paidCount: number;
  totalCount: number;
}

export interface GenerateInvoiceParams {
  type: 'receivables' | 'payables';
  period: 'current' | 'previous';
}

// Hook for managing student invoices (receivables)
export function useStudentInvoices() {
  const queryClient = useQueryClient();

  // Fetch student invoices with student data
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['student-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_students_invoices')
        .select(`
          *,
          tbl_students!fld_sid (
            fld_id,
            fld_first_name,
            fld_last_name
          )
        `)
        .order('fld_id', { ascending: false });

      if (error) throw error;
      return data as StudentInvoice[];
    },
  });

  // Fetch invoice statistics
  const { data: stats } = useQuery({
    queryKey: ['student-invoice-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_students_invoices')
        .select('fld_invoice_total, fld_status');

      if (error) throw error;

      const totalAmount = data?.reduce((sum, invoice) => sum + (invoice.fld_invoice_total || 0), 0) || 0;
      const pendingCount = data?.filter(invoice => invoice.fld_status === 'Active').length || 0;
      const paidCount = data?.filter(invoice => invoice.fld_status === 'Paid').length || 0;
      const totalCount = data?.length || 0;

      return {
        totalAmount,
        pendingCount,
        paidCount,
        totalCount,
      } as InvoiceStats;
    },
  });

  // Update invoice status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ invoiceId, status }: { invoiceId: number; status: string }) => {
      const { error } = await supabase
        .from('tbl_students_invoices')
        .update({ fld_status: status as Database["public"]["Enums"]["invoice_status"] })
        .eq('fld_id', invoiceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['student-invoice-stats'] });
      toast.success('Invoice status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update invoice status: ' + error.message);
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async ({ studentId, invoiceId, email }: { studentId: number; invoiceId: number; email: string }) => {
      // This would typically call an edge function or API endpoint
      // For now, we'll simulate the email sending
      const { error } = await supabase.functions.invoke('send-contract-email', {
        body: {
          studentId,
          invoiceId,
          email,
          type: 'invoice'
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Email sent successfully');
    },
    onError: (error) => {
      toast.error('Failed to send email: ' + error.message);
    },
  });

  // Generate invoices mutation
  const generateInvoicesMutation = useMutation({
    mutationFn: async ({ type, period }: GenerateInvoiceParams) => {
      const { data, error } = await supabase.functions.invoke('generate-invoices', {
        body: { type, period }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      const periodText = variables.period === 'current' ? 'current month' : 'previous month';
      const typeText = variables.type === 'receivables' ? 'student' : 'teacher';
      toast.success(`Generated ${typeText} invoices for ${periodText} successfully!`);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['student-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['student-invoice-stats'] });
    },
    onError: (error) => {
      console.error('Invoice generation error:', error);
      toast.error('Failed to generate invoices. Please try again.');
    },
  });

  return {
    invoices,
    stats,
    isLoading,
    updateStatus: updateStatusMutation.mutate,
    sendEmail: sendEmailMutation.mutate,
    generateInvoices: generateInvoicesMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
    isSendingEmail: sendEmailMutation.isPending,
    isGenerating: generateInvoicesMutation.isPending,
  };
}

// Hook for managing teacher invoices (payables)
export function useTeacherInvoices() {
  const queryClient = useQueryClient();

  // Fetch teacher invoices with teacher data
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['teacher-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_teachers_invoices')
        .select(`
          *,
          tbl_teachers!fld_tid (
            fld_id,
            fld_first_name,
            fld_last_name
          )
        `)
        .order('fld_id', { ascending: false });

      if (error) throw error;
      return data as TeacherInvoice[];
    },
  });

  // Fetch invoice statistics
  const { data: stats } = useQuery({
    queryKey: ['teacher-invoice-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_teachers_invoices')
        .select('fld_invoice_total, fld_status');

      if (error) throw error;

      const totalAmount = data?.reduce((sum, invoice) => sum + (invoice.fld_invoice_total || 0), 0) || 0;
      const pendingCount = data?.filter(invoice => invoice.fld_status === 'Active').length || 0;
      const paidCount = data?.filter(invoice => invoice.fld_status === 'Paid').length || 0;
      const totalCount = data?.length || 0;

      return {
        totalAmount,
        pendingCount,
        paidCount,
        totalCount,
      } as InvoiceStats;
    },
  });

  // Update invoice status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ invoiceId, status }: { invoiceId: number; status: string }) => {
      const { error } = await supabase
        .from('tbl_teachers_invoices')
        .update({ fld_status: status as Database["public"]["Enums"]["invoice_status"] })
        .eq('fld_id', invoiceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-invoice-stats'] });
      toast.success('Invoice status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update invoice status: ' + error.message);
    },
  });

  // Generate invoices mutation
  const generateInvoicesMutation = useMutation({
    mutationFn: async ({ type, period }: GenerateInvoiceParams) => {
      const { data, error } = await supabase.functions.invoke('generate-invoices', {
        body: { type, period }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      const periodText = variables.period === 'current' ? 'current month' : 'previous month';
      const typeText = variables.type === 'receivables' ? 'student' : 'teacher';
      toast.success(`Generated ${typeText} invoices for ${periodText} successfully!`);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['teacher-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-invoice-stats'] });
    },
    onError: (error) => {
      console.error('Invoice generation error:', error);
      toast.error('Failed to generate invoices. Please try again.');
    },
  });

  return {
    invoices,
    stats,
    isLoading,
    updateStatus: updateStatusMutation.mutate,
    generateInvoices: generateInvoicesMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
    isGenerating: generateInvoicesMutation.isPending,
  };
}

// Utility function to format date
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  });
}

// Utility function to format currency
export function formatCurrency(amount: number): string {
  return `€${amount.toFixed(2)}`;
}
