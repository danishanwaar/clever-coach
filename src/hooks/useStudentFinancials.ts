import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types
export interface StudentInvoice {
  fld_id: number;
  fld_i_type: 'Normal' | 'Negative';
  fld_sid: number;
  fld_lhid: string | null;
  fld_cid: string | null;
  fld_invoice_total: number;
  fld_invoice_hr: number;
  fld_min_lesson: number | null;
  fld_ch_hr: 'Y' | 'N';
  fld_notes: string | null;
  fld_edate: string;
  fld_uname: number;
  fld_status: 'Active' | 'Paid' | 'Suspended' | 'Deleted';
  created_at: string | null;
  updated_at: string | null;
}

export interface StudentFinancialStats {
  totalInvoices: number;
  totalPaid: number;
  totalUnpaid: number;
}

// Hook for fetching student financial data
export function useStudentFinancials(studentId: number) {
  // Fetch all invoices for the student
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['student-financials', studentId, 'invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_students_invoices')
        .select('*')
        .eq('fld_sid', studentId)
        .order('fld_edate', { ascending: false });

      if (error) throw error;
      return data as StudentInvoice[];
    },
  });

  // Calculate financial statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['student-financials', studentId, 'stats'],
    queryFn: async (): Promise<StudentFinancialStats> => {
      const { data, error } = await supabase
        .from('tbl_students_invoices')
        .select('fld_invoice_total, fld_status')
        .eq('fld_sid', studentId);

      if (error) throw error;

      const totalInvoices = data?.length || 0;
      const totalPaid = data
        ?.filter(invoice => invoice.fld_status === 'Paid')
        .reduce((sum, invoice) => sum + (invoice.fld_invoice_total || 0), 0) || 0;
      
      const totalUnpaid = data
        ?.filter(invoice => invoice.fld_status === 'Active')
        .reduce((sum, invoice) => sum + (invoice.fld_invoice_total || 0), 0) || 0;

      return {
        totalInvoices,
        totalPaid,
        totalUnpaid,
      };
    },
  });

  return {
    invoices,
    stats,
    isLoading: invoicesLoading || statsLoading,
  };
}




