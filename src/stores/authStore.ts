import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

interface AuthState {
  // State
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  isSigningUpTeacher: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, roleId?: number) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  
  // Getters
  isAdmin: () => boolean;
  isTeacher: () => boolean;
  isStudent: () => boolean;
  isAuthenticated: () => boolean;
  
  // Internal actions
  _setUser: (user: User | null) => void;
  _setLoading: (loading: boolean) => void;
  _setError: (error: string | null) => void;
  _clearError: () => void;
  _fetchUserProfile: (authUserId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    loading: true,
    initialized: false,
    error: null,
    isSigningUpTeacher: false,

    // Stub implementations for internal setters
    _setUser: (user) => set({ user }),
    _setLoading: (loading) => set({ loading }),
    _setError: (error) => set({ error }),
    _clearError: () => set({ error: null }),

    // Initialize auth state
    initialize: async () => {
      try {
        set({ loading: true });
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          set({ user: null, loading: false, initialized: true });
          return;
        }

        if (session?.user) {
          await get()._fetchUserProfile(session.user.id);
        } else {
          set({ user: null, loading: false, initialized: true });
        }

        // Set up auth state listener
        supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state change:', event, session?.user?.id);
            
            // Ignore auth state changes during teacher signup to prevent redirect
            if (get().isSigningUpTeacher) {
              console.log('AuthStore: Ignoring auth state change during teacher signup');
              return;
            }
            
            if (session?.user) {
              // Only fetch if we don't have user data or if it's a different user
              const currentUser = get().user;
              if (!currentUser || currentUser.auth_user_id !== session.user.id) {
                await get()._fetchUserProfile(session.user.id);
              } else {
                set({ loading: false });
              }
            } else {
              set({ user: null, loading: false });
            }
          }
        );
      } catch (error) {
        console.error('Error initializing auth:', error);
        set({ user: null, loading: false, initialized: true });
      }
    },

    // Sign in
    signIn: async (email: string, password: string) => {
      try {
        set({ loading: true, error: null });
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        return { success: true };
      } catch (error: any) {
        console.error('Sign in error:', error);
        set({ error: error.message || 'Failed to sign in' });
        return { success: false, error: error.message };
      } finally {
        set({ loading: false });
      }
    },

    // Sign up
    signUp: async (email: string, password: string, firstName: string, lastName: string, roleId: number = 1) => {
      try {
        set({ loading: true, error: null });
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: firstName,
              last_name: lastName,
              role_id: roleId
            }
          }
        });

        if (error) throw error;

        return { success: true };
      } catch (error: any) {
        console.error('Sign up error:', error);
        set({ error: error.message || 'Failed to create account' });
        return { success: false, error: error.message };
      } finally {
        set({ loading: false });
      }
    },


    // Sign out
    signOut: async () => {
      try {
        set({ loading: true, error: null });
        
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        set({ user: null });
      } catch (error: any) {
        console.error('Sign out error:', error);
        set({ error: error.message || 'Failed to sign out' });
      } finally {
        set({ loading: false });
      }
    },

    // Reset password
    resetPassword: async (email: string) => {
      try {
        set({ loading: true, error: null });
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) throw error;

        return { success: true };
      } catch (error: any) {
        console.error('Reset password error:', error);
        set({ error: error.message || 'Failed to send reset email' });
        return { success: false, error: error.message };
      } finally {
        set({ loading: false });
      }
    },

    // Update user profile
    updateUserProfile: async (updates: Partial<User>) => {
      const { user } = get();
      
      if (!user) {
        set({ error: 'No user logged in' });
        return { success: false, error: 'No user logged in' };
      }

      try {
        set({ loading: true, error: null });
        
        const { error } = await supabase
          .from('tbl_users')
          .update({
            fld_name: updates.fld_name,
            fld_email: updates.fld_email,
          })
          .eq('auth_user_id', user.auth_user_id);

        if (error) throw error;

        // Update local state
        set({ user: { ...user, ...updates } });

        return { success: true };
      } catch (error: any) {
        console.error('Update profile error:', error);
        set({ error: error.message || 'Failed to update profile' });
        return { success: false, error: error.message };
      } finally {
        set({ loading: false });
      }
    },

    // Role checking functions
    isAdmin: () => {
      const user = get().user;
      return user?.fld_rid === 1;
    },

    isTeacher: () => {
      const user = get().user;
      return user?.fld_rid === 2;
    },

    isStudent: () => {
      const user = get().user;
      return user?.fld_rid === 3;
    },

    isAuthenticated: () => {
      return get().user !== null;
    },


    // Internal fetch user profile
    _fetchUserProfile: async (authUserId: string) => {
      try {
        set({ loading: true, error: null });
        
        const { data, error } = await supabase
          .from('tbl_users')
          .select(`
            *,
            tbl_roles (
              fld_id,
              fld_role,
              fld_edate,
              fld_status,
              created_at,
              updated_at
            )
          `)
          .eq('auth_user_id', authUserId)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          throw error;
        }

        if (data) {
          const user: User = {
            fld_id: data.fld_id,
            auth_user_id: data.auth_user_id,
            fld_rid: data.fld_rid,
            fld_name: data.fld_name,
            fld_email: data.fld_email,
            fld_passcode: '', // Not returned for security
            fld_is_verify: data.fld_is_verify,
            fld_is_form_fill: data.fld_is_form_fill,
            fld_last_login: data.fld_last_login,
            fld_otp: data.fld_otp,
            fld_f_time_login: data.fld_f_time_login,
            fld_status: data.fld_status,
            created_at: data.created_at,
            updated_at: data.updated_at,
            role: data.tbl_roles
          };
          
          set({ user });
          console.log('User profile loaded and cached');
        }
      } catch (error) {
        console.error('Error in _fetchUserProfile:', error);
        set({ error: 'Failed to load user profile', user: null });
      } finally {
        set({ loading: false, initialized: true });
      }
    },
  }))
);

