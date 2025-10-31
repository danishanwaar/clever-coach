import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLoaded, setUserLoaded] = useState(false);
  const [isSigningUpTeacher, setIsSigningUpTeacher] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Ignore auth state changes during teacher signup to prevent redirect
      if (isSigningUpTeacher) {
        console.log("useAuth: Ignoring auth state change during teacher signup");
        return;
      }

      if (session?.user) {
        // Only fetch if we don't have user data or if it's a different user
        if (!userLoaded || user?.auth_user_id !== session.user.id) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserLoaded(false);
        setLoading(false);
      }
    });

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Only fetch if we don't have user data
        if (!userLoaded) {
          fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoaded, user?.auth_user_id, isSigningUpTeacher]);

  const fetchUserProfile = useCallback(async (authUserId: string) => {
    try {
      const { data, error } = await supabase
        .from("tbl_users")
        .select(
          `
          *,
          tbl_roles (
            fld_id,
            fld_role,
            fld_edate,
            fld_status,
            created_at,
            updated_at
          )
        `
        )
        .eq("auth_user_id", authUserId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        throw error;
      }

      if (data) {
        setUser({
          fld_id: data.fld_id,
          auth_user_id: data.auth_user_id,
          fld_rid: data.fld_rid,
          fld_name: data.fld_name,
          fld_email: data.fld_email,
          fld_passcode: "", // Not returned for security
          fld_is_verify: data.fld_is_verify,
          fld_is_form_fill: data.fld_is_form_fill,
          fld_last_login: data.fld_last_login,
          fld_otp: data.fld_otp,
          fld_f_time_login: data.fld_f_time_login,
          fld_status: data.fld_status,
          created_at: data.created_at,
          updated_at: data.updated_at,
          role: data.tbl_roles,
        });
        setUserLoaded(true);
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user profile.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Signed in successfully!",
      });

      return { success: true, user: data.user };
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign in.",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, roleId: number = 1) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
            role_id: roleId,
          },
        },
      });

      if (error) throw error;

      // No need to manually create profile - the trigger will handle it

      toast({
        title: "Success",
        description: "Account created successfully! Please check your email to verify your account.",
      });

      return { success: true, user: data.user };
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create account.",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUpTeacher = async (formData: any) => {
    setLoading(true);
    setIsSigningUpTeacher(true); // Block local auth state changes
    useAuthStore.setState({ isSigningUpTeacher: true }); // Also block global authStore listener

    try {
      // Generate a temporary password for the teacher
      const tempPassword = `TempPass${Math.random().toString(36).slice(-8)}`;

      // Create Supabase auth user without auto-confirming to prevent auto-login
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            role_id: 2, // Teacher role
            temp_password: tempPassword, // Store password in user metadata
          },
        },
      });

      if (authError) throw authError;

      // Immediately sign out to prevent AuthGuard redirect
      await supabase.auth.signOut({ scope: "local" });

      // Force clear user state to prevent AuthGuard redirect
      setUser(null);
      setUserLoaded(false);

      // Small delay to ensure profile trigger has completed
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get the created user profile
      const { data: profile, error: profileError } = await supabase
        .from("tbl_users")
        .select("fld_id, auth_user_id")
        .eq("auth_user_id", authData.user?.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) throw new Error("Profile not created. Please try again.");
      console.log("Profile:", profile);
      console.log("Form data:", formData);
      // Create teacher record
      const { data: teacherData, error: teacherError } = await supabase
        .from("tbl_teachers")
        .insert({
          fld_first_name: formData.firstName,
          fld_last_name: formData.lastName,
          fld_gender: formData.gender,
          fld_dob: formData.birthDate,
          fld_email: formData.email,
          fld_phone: formData.phone,
          fld_street: formData.street,
          fld_city: formData.city,
          fld_zip: formData.postalCode,
          fld_country: "Germany",
          fld_education: formData.education,
          fld_t_mode: formData.transport,
          fld_l_mode: "In-Person",
          fld_self: formData.description,
          fld_source: formData.howFound,
          fld_uid: profile.fld_id,
          fld_status: "New",
          fld_edate: new Date().toISOString(),
          fld_uname: profile.fld_id,
          fld_onboard_uid: profile.fld_id,
          fld_per_l_rate: "0.00",
        })
        .select("fld_id")
        .single();

      if (teacherError) throw teacherError;

      // Create teacher-subject relationships
      if (formData.selectedSubjects && formData.selectedSubjects.length > 0) {
        // Get all level IDs for the selected subjects
        const levelNames = formData.selectedSubjects.map((s: any) => s.class || "All Levels");
        console.log(levelNames)
        const { data: levels } = await supabase
          .from("tbl_levels")
          .select("fld_id, fld_level")
          .in("fld_level", levelNames);
        const subjectInserts = formData.selectedSubjects
          .map((subject: any) => {
            const level_id = subject.class;
            return {
              fld_tid: teacherData.fld_id,
              fld_sid: parseInt(subject.id),
              fld_level: parseInt(level_id),
              fld_experience: 0,
              fld_edate: new Date().toISOString(),
              fld_uname: profile.fld_id,
            };
          })
          .filter((s) => s.fld_sid && s.fld_level); // Only insert if we found a valid subject_id and level_id

        if (subjectInserts.length > 0) {
          const { error: subjectsError } = await supabase
            .from("tbl_teachers_subjects_expertise")
            .insert(subjectInserts);

          if (subjectsError) {
            console.error("Error inserting teacher subjects:", subjectsError);
            throw subjectsError;
          }
        }
      }

      // Send thank you email to teacher
      try {
        await supabase.functions.invoke("send-email", {
          body: {
            to: formData.email,
            subject: "Application Confirmation - CleverCoach",
            template_type: "teacher_application_thankyou",
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
            },
          },
        });
      } catch (emailError) {
        console.error("Error sending thank you email:", emailError);
        // Don't fail registration if email fails
      }

      toast({
        title: "Success! 🎉",
        description: "Teacher registration submitted successfully! We'll review your application and contact you soon.",
      });

      return {
        success: true,
        user: authData.user,
        teacherId: teacherData.fld_id,
        tempPassword, // Return password for potential use
      };
    } catch (error: any) {
      console.error("Teacher sign up error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create teacher account.",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
      setIsSigningUpTeacher(false); // Always reset local flag
      useAuthStore.setState({ isSigningUpTeacher: false }); // Always reset global flag
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Reset user state
      setUser(null);
      setUserLoaded(false);
      setLoading(false);

      toast({
        title: "Success",
        description: "Signed out successfully!",
      });
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign out.",
      });
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password reset email sent! Please check your inbox.",
      });

      return { success: true };
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send reset email.",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return { success: false, error: "No user logged in" };

    try {
      const { error } = await supabase
        .from("tbl_users")
        .update({
          fld_name: updates.fld_name,
          fld_email: updates.fld_email,
          fld_is_form_fill: updates.fld_is_form_fill,
          fld_f_time_login: updates.fld_f_time_login,
        })
        .eq("fld_id", user.fld_id);

      if (error) throw error;

      setUser((prev) => (prev ? { ...prev, ...updates } : null));

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      return { success: true };
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile.",
      });
      return { success: false, error: error.message };
    }
  };

  const isAdmin = useCallback(() => user?.fld_rid === 1, [user]);
  const isTeacher = useCallback(() => user?.fld_rid === 2, [user]);
  const isStudent = useCallback(() => user?.fld_rid === 3, [user]);

  return {
    user,
    loading,
    signIn,
    signUp,
    signUpTeacher,
    signOut,
    resetPassword,
    updateUserProfile,
    isAdmin,
    isTeacher,
    isStudent,
  };
}
