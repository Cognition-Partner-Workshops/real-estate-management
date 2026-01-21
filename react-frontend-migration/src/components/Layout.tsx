import type { ReactElement } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Footer } from '@/components/ui';

function Layout(): ReactElement {
  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-blue-500 text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Real Estate Management</h1>
            </div>
            <nav className="flex space-x-2">
              <NavLink to="/map" className={navLinkClass}>
                Map
              </NavLink>
              <NavLink to="/properties" className={navLinkClass}>
                Properties
              </NavLink>
              <NavLink to="/enquiries" className={navLinkClass}>
                Enquiries
              </NavLink>
              <NavLink to="/mortgage-calc" className={navLinkClass}>
                Calculator
              </NavLink>
              <NavLink to="/settings" className={navLinkClass}>
                Settings
              </NavLink>
              <NavLink to="/user" className={navLinkClass}>
                Profile
              </NavLink>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
