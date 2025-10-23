import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LessonDuration {
  fld_id: number;
  fld_l_duration: string;
}

export function useLessonDurations() {
  return useQuery({
    queryKey: ['lesson-durations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_lesson_durations')
        .select('*')
        .order('fld_id');

      if (error) throw error;
      return data as LessonDuration[];
    },
  });
}
