import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'teacher' | 'student';
  requiresAuth?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  requiresAuth = true 
}: ProtectedRouteProps) => {
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const isAdmin = useAuthStore(state => state.isAdmin);
  const isTeacher = useAuthStore(state => state.isTeacher);
  const isStudent = useAuthStore(state => state.isStudent);
  const location = useLocation();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requiresAuth && !user) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // If specific role is required, check if user has that role
  if (requiredRole && user) {
    let hasRequiredRole = false;
    
    switch (requiredRole) {
      case 'admin':
        hasRequiredRole = isAdmin();
        break;
      case 'teacher':
        hasRequiredRole = isTeacher();
        break;
      case 'student':
        hasRequiredRole = isStudent();
        break;
    }

    if (!hasRequiredRole) {
      // Redirect to dashboard - role-based content is handled by Dashboard component
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};