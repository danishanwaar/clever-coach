import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DeleteReason {
  fld_id: number;
  fld_reason: string;
  fld_type: string;
  fld_status: string;
}

export const useDeleteReasons = (type: 'Teacher' | 'Student') => {
  return useQuery<DeleteReason[]>({
    queryKey: ['deleteReasons', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_delete_reasons')
        .select('*')
        .eq('fld_type', type)
        .eq('fld_status', 'Active')
        .order('fld_reason');

      if (error) throw error;
      return data || [];
    },
  });
};

