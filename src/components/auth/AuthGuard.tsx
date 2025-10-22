import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const AuthGuard = ({ children, redirectTo }: AuthGuardProps) => {
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && redirectTo) {
      // If user is already authenticated and on auth pages, redirect them
      const from = (location.state as any)?.from?.pathname || redirectTo;
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, redirectTo, location]);

  return <>{children}</>;
};