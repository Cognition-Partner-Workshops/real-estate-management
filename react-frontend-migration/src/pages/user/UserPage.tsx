import { useMemo, type ReactElement } from 'react';
import { Outlet, NavLink, useLocation, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store';

function UserPage(): ReactElement {
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const notifications = useAppSelector((state) => state.notifications.notifications);

  const unreadNotificationsCount = useMemo((): number => {
    return notifications.filter((notification) => !notification.read).length;
  }, [notifications]);

  const tabLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `flex items-center gap-2 px-4 py-3 text-sm md:text-base font-medium transition-colors border-b-2 ${
      isActive
        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-300'
    }`;

  if (!isAuthenticated) {
    return <Navigate to="/user/signin" replace />;
  }

  if (location.pathname === '/user' || location.pathname === '/user/') {
    return <Navigate to="/user/profile" replace />;
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200">
              Account Page
            </h1>
          </div>
        </div>
      </header>

      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 overflow-x-auto">
            <NavLink to="/user/profile" className={tabLinkClass}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-6 md:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Profile</span>
            </NavLink>

            <NavLink to="/user/change-password" className={tabLinkClass}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-6 md:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Change Password</span>
            </NavLink>

            <NavLink to="/user/notifications" className={tabLinkClass}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-6 md:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span>Notifications</span>
              {unreadNotificationsCount > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-600 rounded-full">
                  {unreadNotificationsCount}
                </span>
              )}
            </NavLink>
          </div>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default UserPage;
