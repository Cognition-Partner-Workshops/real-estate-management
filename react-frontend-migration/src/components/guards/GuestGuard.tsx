import { type ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

interface GuestGuardProps {
  children: React.ReactNode;
}

/**
 * GuestGuard protects routes that should only be accessible to unauthenticated users.
 * If a user is already authenticated, they will be redirected to the map page.
 * Use this guard for routes like login, register, etc.
 */
function GuestGuard({ children }: GuestGuardProps): ReactElement {
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname || '/map';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

export default GuestGuard;
