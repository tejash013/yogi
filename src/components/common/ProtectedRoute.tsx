import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  roles,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/error/403" replace />;
  }

  return <>{children}</>;
}

