import { useAuthStore } from '@/stores/authStore';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const isAdmin = useAuthStore(state => state.isAdmin);
  const isTeacher = useAuthStore(state => state.isTeacher);
  const isStudent = useAuthStore(state => state.isStudent);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  // Redirect based on user role to their specific dashboard
  if (isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  } else if (isTeacher()) {
    return <Navigate to="/dashboard" replace />;
  } else if (isStudent()) {
    return <Navigate to="/dashboard" replace />;
  }

  // Fallback: show dashboard for authenticated users
  return <Navigate to="/dashboard" replace />;
};

export default Index;
