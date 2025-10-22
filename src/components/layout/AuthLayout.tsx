import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Loader2 } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: string[];
}

export function AuthLayout({ 
  children, 
  requireAuth = true, 
  redirectTo = "/auth/signin",
  allowedRoles = []
}: AuthLayoutProps) {
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requireAuth && user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.roleId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}