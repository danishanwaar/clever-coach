import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Level {
  fld_id: number;
  fld_level: string;
}

export const useLevels = () => {
  return useQuery({
    queryKey: ['levels'],
    queryFn: async (): Promise<Level[]> => {
      const { data, error } = await supabase
        .from('tbl_levels')
        .select('*')
        .order('fld_id', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch levels: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
