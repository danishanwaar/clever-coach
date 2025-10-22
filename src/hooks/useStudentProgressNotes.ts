import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface ProgressNote {
  fld_id: number;
  fld_tid: number;
  fld_sid: number;
  fld_subject: string;
  fld_body: string;
  fld_edate: string;
  fld_uname: number;
  created_at: string | null;
  updated_at: string | null;
  // Joined data
  tbl_students?: {
    fld_id: number;
    fld_first_name: string;
    fld_last_name: string;
  };
  tbl_users?: {
    fld_id: number;
    fld_name: string;
  };
}

export interface CreateProgressNoteData {
  fld_sid: number;
  fld_subject: string;
  fld_body: string;
  fld_tid?: number;
}

// Hook for managing student progress notes
export function useStudentProgressNotes(studentId: number) {
  const queryClient = useQueryClient();

  // Fetch progress notes for the student
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['student-progress-notes', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_teachers_students_notes')
        .select(`
          *,
          tbl_students!fld_sid (
            fld_id,
            fld_first_name,
            fld_last_name
          ),
          tbl_users!fld_uname (
            fld_id,
            fld_name
          )
        `)
        .eq('fld_sid', studentId)
        .order('fld_id', { ascending: false });

      if (error) throw error;
      return data as ProgressNote[];
    },
  });

  // Create new progress note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (noteData: CreateProgressNoteData) => {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) throw new Error('User not authenticated');

      // Get user ID from auth context
      const { data: userData, error: userError } = await supabase
        .from('tbl_users')
        .select('fld_id')
        .eq('auth_user_id', authUser.user.id)
        .single();

      if (userError || !userData) throw new Error('User not found');

      const { error } = await supabase
        .from('tbl_teachers_students_notes')
        .insert({
          fld_sid: noteData.fld_sid,
          fld_subject: noteData.fld_subject,
          fld_body: noteData.fld_body,
          fld_edate: new Date().toISOString(),
          fld_uname: userData.fld_id,
          fld_tid: noteData.fld_tid || 0, // Default to 0 if not provided
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-progress-notes', studentId] });
      toast.success('Progress note added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add progress note: ' + error.message);
    },
  });

  // Delete progress note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      const { error } = await supabase
        .from('tbl_teachers_students_notes')
        .delete()
        .eq('fld_id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-progress-notes', studentId] });
      toast.success('Progress note deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete progress note: ' + error.message);
    },
  });

  return {
    notes,
    isLoading,
    createNote: createNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,
    isCreating: createNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
  };
}




