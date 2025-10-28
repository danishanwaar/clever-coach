import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/hooks/use-toast";

// Student Status Types
export type StudentStatus =
  | "Leads"
  | "Mediation Open"
  | "Partially Mediated"
  | "Mediated"
  | "Specialist Consulting"
  | "Contracted Customers"
  | "Suspended"
  | "Deleted"
  | "Unplaceable"
  | "Waiting List"
  | "Appointment Call"
  | "Follow-up"
  | "Appl"
  | "Eng";

// Student Interface
export interface Student {
  fld_id: number;
  fld_first_name: string;
  fld_last_name: string;
  fld_s_first_name: string;
  fld_s_last_name: string;
  fld_sal: string;
  fld_gender: "Männlich" | "Weiblich" | "Divers";
  fld_email: string;
  fld_mobile: string;
  fld_city: string;
  fld_zip: string;
  fld_address: string | null;
  fld_level: string;
  fld_l_mode: string;
  fld_status: StudentStatus;
  fld_im_status: number | null;
  fld_notes: string | null;
  fld_edate: string;
  fld_uid: number;
  fld_nec: string;
  fld_reg_fee: number | null;
  fld_rf_flag: string | null;
  fld_f_lead: string | null;
  fld_per_l_rate: number | null;
  created_at: string | null;
  updated_at: string | null;
  // Joined data
  tbl_users?: {
    fld_id: number;
    fld_name: string;
  };
  contracts?: {
    fld_id: number;
    fld_status: string;
  }[];
  tbl_students_subjects?: StudentSubject[];
}

// Student Subject Interface
export interface StudentSubject {
  fld_id: number;
    fld_sid: number;
    fld_suid: number;
    fld_cid: number | null;
    fld_c_eid: number | null;
  fld_detail: string | null;
  fld_edate: string;
  fld_uname: number;
  created_at: string | null;
  updated_at: string | null;
  tbl_subjects?: {
    fld_id: number;
    fld_subject: string;
    fld_image: string;
  };
}

// Student Mediation Stage Interface
export interface StudentMediationStage {
  fld_id: number;
  fld_sid: number;
  fld_ssid: number;
  fld_tid: number;
  fld_m_type: number;
  fld_edate: string;
  fld_etime: string;
  fld_m_flag: string | null;
  fld_note: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Joined data
  tbl_teachers?: {
    fld_id: number;
    fld_first_name: string;
    fld_last_name: string;
    fld_phone: string;
    fld_uid: number;
  };
  tbl_mediation_types?: {
    fld_id: number;
    fld_stage_name: string;
  };
}

// Student Activity Interface
export interface StudentActivity {
  fld_id: number;
  fld_sid: number;
  fld_title: string;
  fld_content: string;
  fld_erdat: string;
  created_at: string | null;
  updated_at: string | null;
}

// Hook for fetching students by status with preloaded data
export const useStudents = (status: StudentStatus | "All" | "Eng", searchTerm: string = "") => {
  const { user } = useAuthStore();

  const studentsQuery = useQuery({
    queryKey: ["students", status, searchTerm],
    queryFn: async () => {
      // Build base query with all related data preloaded
      let query = supabase.from("tbl_students").select(`
          *,
          tbl_users!fk_students_user (
            fld_id,
            fld_name
          ),
          contracts:tbl_contracts (
            fld_id,
            fld_status
          ),
          tbl_students_subjects!fk_student_subjects_student (
            fld_id,
            fld_sid,
            fld_suid,
            fld_cid,
            fld_c_eid,
            fld_detail,
            fld_edate,
            fld_uname,
            created_at,
            updated_at,
            tbl_subjects:fld_suid (
              fld_id,
              fld_subject,
              fld_image
            )
          )
        `);

      // Apply status filter
      if (status !== "All" && status !== "Eng") {
        query = query.eq("fld_status", status as any);
      } else if (status === "Eng") {
        query = query.eq("fld_nec", "N");
      }

      // Apply search filter
      if (searchTerm) {
        query = query.or(`fld_first_name.ilike.%${searchTerm}%,fld_last_name.ilike.%${searchTerm}%,fld_s_first_name.ilike.%${searchTerm}%,fld_s_last_name.ilike.%${searchTerm}%,fld_email.ilike.%${searchTerm}%,fld_city.ilike.%${searchTerm}%,fld_zip.ilike.%${searchTerm}%`);
      }

      // Order by ID descending
      query = query.order("fld_id", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Get status-wise counts
      const statusCounts: Record<string, number> = {};
      const statuses = ["Leads", "Mediation Open", "Partially Mediated", "Mediated", "Specialist Consulting", "Contracted Customers", "Suspended", "Deleted", "Unplaceable", "Waiting List", "Appointment Call", "Follow-up", "Appl", "Eng"];
      
      for (const status of statuses) {
        let statusQuery = supabase.from("tbl_students").select("fld_id", { count: "exact", head: true });
        
        if (status === "Eng") {
          statusQuery = statusQuery.eq("fld_nec", "N");
        } else {
          statusQuery = statusQuery.eq("fld_status", status as any);
        }
        
        const { count } = await statusQuery;
        statusCounts[status] = count || 0;
      }
      
      // Get total count
      const { count: total } = await supabase.from("tbl_students").select("fld_id", { count: "exact", head: true });
      statusCounts["All"] = total || 0;

      return {
        data: data as unknown as Student[],
        statusCounts: statusCounts,
        totalCount: data?.length || 0
      };
    },
    enabled: !!user,
  });

  return studentsQuery;
};

// Get single student by ID
export const useStudent = (studentId: number) => {
  return useQuery({
    queryKey: ["student", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tbl_students")
        .select(
          `
            *,
            tbl_users!fk_students_user (
              fld_id,
              fld_name
            )
          `
        )
        .eq("fld_id", studentId)
        .single();

      if (error) throw error;
      return data as any;
    },
    enabled: !!studentId,
  });
};

// Get student contracts
export const useStudentContracts = (studentId: number) => {
  return useQuery({
    queryKey: ["student-contracts", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tbl_contracts")
        .select("*")
        .eq("fld_sid", studentId)
        .eq("fld_status", "Active");

      if (error) throw error;
      return data || [];
    },
    enabled: !!studentId,
  });
};

// Get student subjects with mediation stages
export const useStudentSubjectsWithMediation = (studentId: number) => {
  return useQuery({
    queryKey: ["student-subjects-mediation", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const { data, error } = await supabase
        .from("tbl_students_subjects")
        .select(`
          *,
          tbl_subjects (
            fld_id,
            fld_subject,
            fld_image
          )
        `)
        .eq("fld_sid", studentId);

      if (error) {
        console.error('Error fetching student subjects:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!studentId,
    retry: (failureCount, error) => {
      // Don't retry on 409 conflicts
      if (error?.message?.includes('409')) return false;
      return failureCount < 3;
    },
  });
};

// Get mediation stages for a specific subject
export const useStudentSubjectMediation = (studentId: number, subjectId: number) => {
  return useQuery({
    queryKey: ["student-subject-mediation", studentId, subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tbl_students_mediation_stages")
        .select(`
          *,
          tbl_mediation_types (
            fld_id,
            fld_stage_name
          )
        `)
        .eq("fld_sid", studentId)
        .eq("fld_ssid", subjectId)
        .order("fld_id", { ascending: false })
        .limit(1);

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!studentId && !!subjectId,
  });
};

// Get contract details for a subject
export const useStudentSubjectContract = (contractId: number) => {
  return useQuery({
    queryKey: ["student-subject-contract", contractId],
    queryFn: async () => {
      if (!contractId || contractId === 0) return null;
      
      const { data, error } = await supabase
        .from("tbl_contracts")
        .select(`
          *,
          tbl_contracts_engagement (
            fld_id,
            fld_tid,
            tbl_teachers (
              fld_id,
              fld_first_name,
              fld_last_name
            )
          )
        `)
        .eq("fld_id", contractId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!contractId && contractId !== 0,
  });
};

// Hook for fetching student subjects
export const useStudentSubjects = (studentId: number) => {
  const studentSubjectsQuery = useQuery({
    queryKey: ["student-subjects", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const { data, error } = await supabase
        .from("tbl_students_subjects")
        .select(
          `
          *,
          tbl_subjects:fld_suid (
            fld_id,
            fld_subject,
            fld_image
          )
        `
        )
        .eq("fld_sid", studentId);

      if (error) {
        console.error('Error fetching student subjects:', error);
        throw error;
      }
      return data as StudentSubject[];
    },
    enabled: !!studentId,
    retry: (failureCount, error) => {
      // Don't retry on 409 conflicts
      if (error?.message?.includes('409')) return false;
      return failureCount < 3;
    },
  });

  return studentSubjectsQuery;
};

// Hook for fetching student mediation stages
export const useStudentMediationStages = (studentId: number, subjectId?: number) => {
  const studentMediationStagesQuery = useQuery({
    queryKey: ["student-mediation-stages", studentId, subjectId],
    queryFn: async () => {
      let query = supabase
        .from("tbl_students_mediation_stages")
        .select(
          `
          *,
          tbl_teachers:fld_tid (
            fld_id,
            fld_first_name,
            fld_last_name,
            fld_phone,
            fld_uid
          ),
          tbl_mediation_types:fld_m_type (
            fld_id,
            fld_stage_name
          )
        `
        )
        .eq("fld_sid", studentId);

      if (subjectId) {
        query = query.eq("fld_ssid", subjectId);
      }

      const { data, error } = await query.order("fld_id", { ascending: false });

      if (error) throw error;
      return data as StudentMediationStage[];
    },
    enabled: !!studentId,
  });

  return studentMediationStagesQuery;
};

// Hook for fetching student activities
export const useStudentActivities = (studentId: number) => {
  const studentActivitiesQuery = useQuery({
    queryKey: ["student-activities", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tbl_activity_students")
        .select("*")
        .eq("fld_sid", studentId)
        .order("fld_erdat", { ascending: false });

      if (error) throw error;
      return data as StudentActivity[];
    },
    enabled: !!studentId,
  });

  return studentActivitiesQuery;
};

// Hook for fetching mediation types
export const useMediationTypes = () => {
  const mediationTypesQuery = useQuery({
    queryKey: ["mediation-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tbl_mediation_types")
        .select("*")
        .eq("fld_rid", 1)
        .eq("fld_status", "Active");

      if (error) throw error;
      return data;
    },
  });

  return mediationTypesQuery;
};

// Hook for student mutations
export const useStudentMutations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Update student status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: number; status: StudentStatus }) => {
      const { error } = await supabase
        .from("tbl_students")
        .update({ fld_status: status as any })
        .eq("fld_id", studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: "Status Updated",
        description: "Student status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update student notes
  const updateNotesMutation = useMutation({
    mutationFn: async ({ studentId, notes }: { studentId: number; notes: string }) => {
      const { error } = await supabase.from("tbl_students").update({ fld_notes: notes }).eq("fld_id", studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: "Notes Updated",
        description: "Student notes have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update IM status
  const updateIMStatusMutation = useMutation({
    mutationFn: async ({ studentId, imStatus }: { studentId: number; imStatus: number }) => {
      const { error } = await supabase.from("tbl_students").update({ fld_im_status: imStatus }).eq("fld_id", studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: "IM Status Updated",
        description: "IM status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Move lead to mediation open
  const moveToMediationOpenMutation = useMutation({
    mutationFn: async (studentId: number) => {
      const { error } = await supabase
        .from("tbl_students")
        .update({ fld_status: "Mediation Open" })
        .eq("fld_id", studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: "Status Updated",
        description: "Student moved to Mediation Open successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Record activity
  const recordActivityMutation = useMutation({
    mutationFn: async ({ studentId, title, content }: { studentId: number; title: string; content: string }) => {
      const { error } = await supabase.from("tbl_activity_students").insert({
        fld_sid: studentId,
        fld_title: title,
        fld_content: content,
        fld_erdat: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-activities"] });
      toast({
        title: "Activity Recorded",
        description: "Activity has been recorded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete student (soft delete by updating status)
  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      const { error } = await supabase
        .from("tbl_students")
        .update({
          fld_status: "Deleted",
        })
        .eq("fld_id", studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: "Student Deleted",
        description: "Student has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mediation
  const deleteMediationMutation = useMutation({
    mutationFn: async ({ studentId, subjectId }: { studentId: number; subjectId: number }) => {
      const { error } = await supabase
        .from("tbl_students_mediation_stages")
        .delete()
        .eq("fld_sid", studentId)
        .eq("fld_ssid", subjectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-mediation-stages"] });
      toast({
        title: "Mediation Deleted",
        description: "Mediation has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create student
  const createStudentMutation = useMutation({
    mutationFn: async (formData: any) => {
      // Prepare student data - following legacy system defaults
      const studentData = {
        fld_sal: formData.fld_sal,
        fld_first_name: formData.fld_first_name,
        fld_last_name: formData.fld_last_name,
        fld_sd: formData.fld_sd,
        fld_s_first_name: formData.fld_s_first_name,
        fld_s_last_name: formData.fld_s_last_name,
        fld_level: formData.fld_level,
        fld_school: formData.fld_school,
        fld_gender: formData.fld_gender,
        fld_email: formData.fld_email || "N/A", // Legacy default
        fld_phone: formData.fld_phone || "N/A", // Legacy default
        fld_mobile: formData.fld_mobile,
        fld_city: formData.fld_city || "N/A", // Legacy default
        fld_zip: formData.fld_zip,
        fld_address: formData.fld_address,
        fld_l_mode: formData.fld_l_mode,
        fld_reason: formData.fld_reason,
        fld_f_lead: formData.fld_f_lead,
        fld_notes: formData.fld_notes,
        fld_payer: formData.fld_payer,
        fld_ct: formData.fld_ct,
        fld_wh: formData.fld_wh,
        fld_ld: formData.fld_ld,
        fld_price: parseFloat(formData.fld_price) || 0, // Legacy default
        fld_reg_fee: parseFloat(formData.fld_reg_fee) || 0, // Legacy default
        fld_status: "Mediation Open",
        fld_uid: user?.fld_id || 1,
        fld_nec: "Y", // Needs contract
        fld_edate: new Date().toISOString(),
        fld_country: "Germany", // Legacy default
        fld_latitude: "", // Will be populated by geocoding if needed
        fld_longitude: "", // Will be populated by geocoding if needed
      };

      // Insert student
      const { data: student, error: studentError } = await supabase
        .from("tbl_students")
        .insert(studentData as any)
        .select()
        .single();

      if (studentError) throw studentError;

      // Insert student subjects if any are selected
      if (formData.fld_sid && formData.fld_sid.length > 0) {
        const subjectInserts = formData.fld_sid.map((subjectId: string) => ({
            fld_sid: student.fld_id,
            fld_suid: parseInt(subjectId),
            fld_cid: null, // No contract assigned yet
            fld_c_eid: null, // No engagement assigned yet
            fld_edate: new Date().toISOString(),
            fld_uname: user?.fld_id || 1,
        }));

        const { error: subjectsError } = await supabase.from("tbl_students_subjects").insert(subjectInserts);

        if (subjectsError) throw subjectsError;
      }

      return student;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: "Student Created",
        description: "Student has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create lead (simplified student creation)
  const createLeadMutation = useMutation({
    mutationFn: async (formData: any) => {
      // Prepare lead data - following legacy system defaults
      const leadData = {
        fld_sal: formData.fld_sal || "N/A", // Legacy default
        fld_first_name: formData.fld_first_name,
        fld_last_name: formData.fld_last_name,
        fld_sd: formData.fld_sd || "N/A", // Legacy default
        fld_s_first_name: formData.fld_s_first_name,
        fld_s_last_name: formData.fld_s_last_name,
        fld_level: formData.fld_level,
        fld_school: formData.fld_school,
        fld_gender: "Divers", // Default for leads
        fld_email: formData.fld_email || "N/A", // Legacy default
        fld_phone: formData.fld_phone || "N/A", // Legacy default
        fld_mobile: formData.fld_mobile,
        fld_city: formData.fld_city || "N/A", // Legacy default
        fld_zip: formData.fld_zip,
        fld_address: formData.fld_address,
        fld_f_lead: formData.fld_f_lead,
        fld_notes: formData.fld_notes,
        fld_status: "Leads", // Lead status
        fld_uid: user?.fld_id || 1,
        fld_nec: "Y", // Needs contract
        fld_edate: new Date().toISOString(),
        fld_country: "Germany", // Legacy default
        fld_latitude: "", // Will be populated by geocoding if needed
        fld_longitude: "", // Will be populated by geocoding if needed
      };

      // Insert lead
      const { data: lead, error: leadError } = await supabase
        .from("tbl_students")
        .insert(leadData as any)
        .select()
        .single();

      if (leadError) throw leadError;

      // Insert subjects if selected
      if (formData.fld_sid && formData.fld_sid.length > 0) {
        const subjectInserts = formData.fld_sid.map((subjectId: string) => ({
            fld_sid: lead.fld_id,
            fld_suid: parseInt(subjectId),
            fld_cid: null, // No contract assigned yet
            fld_c_eid: null, // No engagement assigned yet
            fld_edate: new Date().toISOString(),
            fld_uname: user?.fld_id || 1,
        }));

        const { error: subjectsError } = await supabase.from("tbl_students_subjects").insert(subjectInserts);

        if (subjectsError) throw subjectsError;
      }

      return lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: "Lead Created",
        description: "Lead has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete student subject
  const deleteStudentSubjectMutation = useMutation({
    mutationFn: async (subjectId: number) => {
      const { error } = await supabase
        .from('tbl_students_subjects')
        .delete()
        .eq('fld_id', subjectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-subjects-mediation'] });
      queryClient.invalidateQueries({ queryKey: ['student-subjects'] });
      toast({
        title: 'Subject Deleted',
        description: 'Subject has been removed from student.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    updateStatus: updateStatusMutation.mutate,
    updateNotes: updateNotesMutation.mutate,
    updateIMStatus: updateIMStatusMutation.mutate,
    moveToMediationOpen: moveToMediationOpenMutation.mutate,
    recordActivity: recordActivityMutation.mutate,
    deleteStudent: deleteStudentMutation.mutate,
    deleteMediation: deleteMediationMutation.mutate,
    createStudent: createStudentMutation.mutate,
    createLead: createLeadMutation.mutate,
    deleteStudentSubject: deleteStudentSubjectMutation.mutate,
    isUpdating: updateStatusMutation.isPending || updateNotesMutation.isPending || updateIMStatusMutation.isPending,
    isRecording: recordActivityMutation.isPending,
    isDeleting: deleteStudentMutation.isPending || deleteMediationMutation.isPending,
    isCreating: createStudentMutation.isPending,
    isCreatingLead: createLeadMutation.isPending,
  };
};
