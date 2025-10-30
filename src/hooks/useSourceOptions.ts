import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SourceOption {
  fld_id: number;
  fld_source: string;
  fld_status: string;
}

export const useSourceOptions = () => {
  return useQuery<SourceOption[]>({
    queryKey: ['sourceOptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_source')
        .select('*')
        .eq('fld_status', 'Active')
        .order('fld_source');

      if (error) throw error;
      return data || [];
    },
  });
};

