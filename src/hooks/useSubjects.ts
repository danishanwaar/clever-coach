import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Subject {
  fld_id: number;
  fld_subject: string;
  fld_image?: string;
  fld_status: 'Active' | 'Inactive';
  emoji?: string;
  category?: string;
  isHot?: boolean;
}

// Subject categorization - keeping original categories
const SUBJECT_CATEGORIES = {
  'Deutsch': 'Languages',
  'Englisch': 'Languages', 
  'Französisch': 'Languages',
  'Spanisch': 'Languages',
  'Latein': 'Languages',
  'Mathematik': 'STEM',
  'Physik': 'STEM',
  'Chemie': 'STEM',
  'Biologie': 'STEM',
  'Geschichte': 'Humanities',
  'Geografie': 'Humanities',
  'Informatik': 'STEM',
  'Wirtschaft': 'Business',
  'Recht': 'Business',
  'Philosophie': 'Humanities',
  'Psychologie': 'Humanities',
  'Kunst': 'Arts',
  'Musik': 'Arts',
  'BWL': 'Business',
  'Andere': 'Miscellaneous'
};

// Subject emojis mapping
const SUBJECT_EMOJIS = {
  'Deutsch': '🇩🇪',
  'Englisch': '🇬🇧',
  'Französisch': '🇫🇷',
  'Spanisch': '🇪🇸',
  'Latein': '🏛️',
  'Mathematik': '🔢',
  'Physik': '⚛️',
  'Chemie': '🧪',
  'Biologie': '🧬',
  'Geschichte': '📚',
  'Geografie': '🌍',
  'Informatik': '💻',
  'Wirtschaft': '📊',
  'Recht': '⚖️',
  'Philosophie': '🧠',
  'Psychologie': '🧠',
  'Kunst': '🎨',
  'Musik': '🎵',
  'BWL': '💼',
  'Andere': '➕'
};

// Hot subjects - just the names for identification
const HOT_SUBJECT_NAMES = ['Deutsch', 'Englisch', 'Mathematik'];

export const useSubjects = () => {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async (): Promise<Subject[]> => {
      const { data, error } = await supabase
        .from('tbl_subjects')
        .select('*')
        .eq('fld_status', 'Active')
        .order('fld_subject', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch subjects: ${error.message}`);
      }

      // Transform data to include emojis and categories
      const transformedData = (data || []).map(subject => {
        const subjectName = subject.fld_subject;
        const emoji = SUBJECT_EMOJIS[subjectName as keyof typeof SUBJECT_EMOJIS] || '📚';
        const category = SUBJECT_CATEGORIES[subjectName as keyof typeof SUBJECT_CATEGORIES] || 'Miscellaneous';
        const isHot = HOT_SUBJECT_NAMES.includes(subjectName);
        
        return {
          ...subject,
          emoji,
          category,
          isHot
        };
      });

      return transformedData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
