import { useAuthStore } from './authStore';

// Basic selectors
export const useUser = () => useAuthStore(state => state.user);
export const useLoading = () => useAuthStore(state => state.loading);
export const useError = () => useAuthStore(state => state.error);
export const useInitialized = () => useAuthStore(state => state.initialized);

// Computed selectors
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated());
export const useIsAdmin = () => useAuthStore(state => state.isAdmin());
export const useIsTeacher = () => useAuthStore(state => state.isTeacher());
export const useIsStudent = () => useAuthStore(state => state.isStudent());

// User info selectors
export const useUserInitials = () => useAuthStore(state => {
  const user = state.user;
  if (!user) return 'U';
  const firstName = user.fld_name?.split(' ')[0] || '';
  const lastName = user.fld_name?.split(' ').slice(1).join(' ') || '';
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'U';
});

export const useUserDisplayName = () => useAuthStore(state => {
  const user = state.user;
  if (!user) return 'User';
  return user.fld_name || 'User';
});

export const useUserRole = () => useAuthStore(state => {
  const user = state.user;
  if (!user) return 'User';
  if (state.isAdmin()) return 'Administrator';
  if (state.isTeacher()) return 'Teacher';
  if (state.isStudent()) return 'Student';
  return 'User';
});

// Action selectors
export const useAuthActions = () => useAuthStore(state => ({
  initialize: state.initialize,
  signIn: state.signIn,
  signUp: state.signUp,
  signUpTeacher: state.signUpTeacher,
  signOut: state.signOut,
  resetPassword: state.resetPassword,
  updateUserProfile: state.updateUserProfile,
}));

// Combined selectors for common use cases
export const useAuthState = () => useAuthStore(state => ({
  user: state.user,
  loading: state.loading,
  error: state.error,
  initialized: state.initialized,
  isAuthenticated: state.isAuthenticated(),
  isAdmin: state.isAdmin(),
  isTeacher: state.isTeacher(),
  isStudent: state.isStudent(),
}));

// Navigation-specific selector
export const useNavigationData = () => useAuthStore(state => ({
  user: state.user,
  loading: state.loading,
  isAdmin: state.isAdmin(),
  isTeacher: state.isTeacher(),
  isStudent: state.isStudent(),
  userInitials: (() => {
    const user = state.user;
    if (!user) return 'U';
    const firstName = user.fld_name?.split(' ')[0] || '';
    const lastName = user.fld_name?.split(' ').slice(1).join(' ') || '';
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'U';
  })(),
  userDisplayName: (() => {
    const user = state.user;
    if (!user) return 'User';
    return user.fld_name || 'User';
  })(),
  userRole: (() => {
    const user = state.user;
    if (!user) return 'User';
    if (state.isAdmin()) return 'Administrator';
    if (state.isTeacher()) return 'Teacher';
    if (state.isStudent()) return 'Student';
    return 'User';
  })(),
}));
