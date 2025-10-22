import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Educational } from '@/types/auth';

export function useEducational() {
  return useQuery<Educational[], Error>({
    queryKey: ['educational'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_educational')
        .select('*')
        .eq('fld_status', 'Active')
        .order('fld_ename');

      if (error) throw error;
      return data || [];
    },
  });
}
