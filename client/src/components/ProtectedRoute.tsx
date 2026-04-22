import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, user, initialized } = useAuthStore();
  const loc = useLocation();
  if (!initialized) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="skeleton h-8 w-48" />
      </div>
    );
  }
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />;
  }
  return <>{children}</>;
}
