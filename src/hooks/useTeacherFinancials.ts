import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ==================== Teacher Financials ====================

export interface TeacherInvoice {
  fld_id: number;
  fld_lhid: string;
  fld_invoice_total: number;
  fld_edate: string;
}

export interface TeacherFinancialsStats {
  totalInvoices: number;
  totalReceived: number;
  totalPending: number;
}

export const useTeacherFinancials = (teacherId: number | undefined) => {
  return useQuery<TeacherInvoice[]>({
    queryKey: ['teacherFinancials', teacherId],
    queryFn: async () => {
      if (!teacherId) throw new Error('Teacher ID required');

      const { data, error } = await supabase
        .from('tbl_teachers_invoices')
        .select(`
          fld_id,
          fld_lhid,
          fld_invoice_total,
          fld_edate
        `)
        .eq('fld_tid', teacherId)
        .order('fld_id', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!teacherId
  });
};

export const useTeacherFinancialsStats = (teacherId: number | undefined) => {
  return useQuery<TeacherFinancialsStats>({
    queryKey: ['teacherFinancialsStats', teacherId],
    queryFn: async () => {
      if (!teacherId) throw new Error('Teacher ID required');

      const { data, error } = await supabase
        .from('tbl_teachers_invoices')
        .select('fld_invoice_total')
        .eq('fld_tid', teacherId);

      if (error) throw error;

      const totalInvoices = data?.length || 0;
      const totalReceived = data?.reduce((sum, inv) => sum + (Number(inv.fld_invoice_total) || 0), 0) || 0;
      const totalPending = 0; // PHP shows 0 for pending

      return {
        totalInvoices,
        totalReceived: Math.round(totalReceived),
        totalPending
      };
    },
    enabled: !!teacherId
  });
};

