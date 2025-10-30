import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ==================== Teacher Settings ====================

export interface TeacherSettingsData {
  fld_id: number;
  fld_first_name: string;
  fld_last_name: string;
  fld_gender: string;
  fld_dob: string;
  fld_phone: string;
  fld_street: string;
  fld_zip: string;
  fld_city: string;
  fld_latitude: string;
  fld_longitude: string;
  fld_education: string;
  fld_self: string;
  fld_evaluation: string;
  fld_source: string;
  fld_bank_act: string;
  fld_bank_name: string;
  fld_bakk_rno: string;
  fld_t_mode: string;
  fld_status: string;
  fld_reason: string;
}

export const useTeacherSettings = (teacherId: number | undefined) => {
  return useQuery<TeacherSettingsData>({
    queryKey: ["teacherSettings", teacherId],
    queryFn: async () => {
      if (!teacherId) throw new Error("Teacher ID required");

      const { data, error } = await supabase
        .from("tbl_teachers")
        .select(
          `
          fld_id,
          fld_first_name,
          fld_last_name,
          fld_gender,
          fld_dob,
          fld_phone,
          fld_street,
          fld_zip,
          fld_city,
          fld_latitude,
          fld_longitude,
          fld_education,
          fld_self,
          fld_evaluation,
          fld_source,
          fld_bank_act,
          fld_bank_name,
          fld_bakk_rno,
          fld_t_mode,
          fld_status,
          fld_reason
        `
        )
        .eq("fld_id", teacherId)
        .single();

      if (error) throw error;
      return data as TeacherSettingsData;
    },
    enabled: !!teacherId,
  });
};

export const useTeacherSettingsMutations = () => {
  const queryClient = useQueryClient();

  const updateBasicMutation = useMutation({
    mutationFn: async ({ teacherId, data }: { teacherId: number; data: Partial<TeacherSettingsData> }) => {
      const { error } = await supabase
        .from("tbl_teachers")
        .update({
          fld_first_name: data.fld_first_name,
          fld_last_name: data.fld_last_name,
          fld_gender: data.fld_gender as any,
          fld_dob: data.fld_dob,
          fld_phone: data.fld_phone,
          fld_street: data.fld_street,
          fld_zip: data.fld_zip,
          fld_city: data.fld_city,
          fld_education: data.fld_education,
          fld_self: data.fld_self,
          fld_evaluation: data.fld_evaluation,
          fld_source: data.fld_source,
        })
        .eq("fld_id", teacherId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherSettings"] });
      toast.success("Record has been updated!");
    },
    onError: (error: any) => {
      toast.error("Failed to update: " + error.message);
    },
  });

  const updateBankMutation = useMutation({
    mutationFn: async ({ teacherId, data }: { teacherId: number; data: Partial<TeacherSettingsData> }) => {
      const { error } = await supabase
        .from("tbl_teachers")
        .update({
          fld_bank_act: data.fld_bank_act,
          fld_bank_name: data.fld_bank_name,
          fld_bakk_rno: data.fld_bakk_rno,
        })
        .eq("fld_id", teacherId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherSettings"] });
      toast.success("Record has been updated!");
    },
    onError: (error: any) => {
      toast.error("Failed to update: " + error.message);
    },
  });

  const updateMobilityMutation = useMutation({
    mutationFn: async ({ teacherId, data }: { teacherId: number; data: Partial<TeacherSettingsData> }) => {
      const { error } = await supabase
        .from("tbl_teachers")
        .update({
          fld_t_mode: data.fld_t_mode,
        })
        .eq("fld_id", teacherId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherSettings"] });
      toast.success("Record has been updated!");
    },
    onError: (error: any) => {
      toast.error("Failed to update: " + error.message);
    },
  });

  const addSubjectMutation = useMutation({
    mutationFn: async ({
      teacherId,
      subjectIds,
      levelIds,
      userId,
    }: {
      teacherId: number;
      subjectIds: number[];
      levelIds: number[];
      userId: number;
    }) => {
      // Insert teacher subjects (following PHP: insert for each subject-level combination)
      const insertPromises = subjectIds.flatMap((subjectId) =>
        levelIds.map((levelId) => ({
          fld_tid: teacherId,
          fld_sid: subjectId,
          fld_level: levelId,
          fld_experience: 0, // 1-10 years
          fld_uname: userId,
          fld_edate: new Date().toISOString().split("T")[0]
        }))
      );

      const { error } = await supabase.from("tbl_teachers_subjects_expertise").insert(insertPromises);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherSubjects"] });
      queryClient.invalidateQueries({ queryKey: ["teacherSettings"] });
      toast.success("Subjects added successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to add subjects: " + error.message);
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async ({ subjectId, teacherId }: { subjectId: number; teacherId: number }) => {
      const { error } = await supabase
        .from("tbl_teachers_subjects_expertise")
        .delete()
        .eq("fld_id", subjectId)
        .eq("fld_tid", teacherId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherSubjects"] });
      queryClient.invalidateQueries({ queryKey: ["teacherSettings"] });
      toast.success("Subject deleted successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to delete subject: " + error.message);
    },
  });

  const addUnavailabilityMutation = useMutation({
    mutationFn: async ({
      teacherId,
      startDate,
      endDate,
      reason,
      userId,
    }: {
      teacherId: number;
      startDate: string;
      endDate: string;
      reason: string;
      userId: number;
    }) => {
      const { error } = await supabase.from("tbl_teachers_unavailability_history").insert({
        fld_tid: teacherId,
        fld_start_date: startDate,
        fld_end_date: endDate,
        fld_reason: reason,
        fld_edate: new Date().toISOString(),
        fld_uname: userId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherSettings"] });
      toast.success("Record has been updated!");
    },
    onError: (error: any) => {
      toast.error("Failed to update: " + error.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ teacherId, status, reason }: { teacherId: number; status: string; reason: string }) => {
      const { error } = await supabase
        .from("tbl_teachers")
        .update({
          fld_status: status as any,
          fld_reason: reason,
        })
        .eq("fld_id", teacherId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherSettings"] });
      toast.success("Record has been updated!");
    },
    onError: (error: any) => {
      toast.error("Failed to update: " + error.message);
    },
  });

  return {
    updateBasicMutation,
    updateBankMutation,
    updateMobilityMutation,
    addSubjectMutation,
    deleteSubjectMutation,
    addUnavailabilityMutation,
    updateStatusMutation,
  };
};
