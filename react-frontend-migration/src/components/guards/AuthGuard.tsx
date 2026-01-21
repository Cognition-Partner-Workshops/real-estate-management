import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

interface AuthGuardProps {
  children: ReactElement;
}

/**
 * AuthGuard protects routes that should only be accessible to unauthenticated users.
 * If the user is authenticated, they are redirected to the map page.
 * This is typically used for login/register pages.
 */
function AuthGuard({ children }: AuthGuardProps): ReactElement {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/map" replace />;
  }

  return children;
}

export default AuthGuard;
