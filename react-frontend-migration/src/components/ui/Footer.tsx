import type { ReactElement } from 'react';

function Footer(): ReactElement {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-transparent">
      <div className="flex flex-col justify-center items-center py-3">
        <div className="font-medium text-gray-900 dark:text-gray-100">
          Real Estate Management System
        </div>
        <div className="text-sm">
          <a
            href="https://github.com/eevan7a9/real-estate-management"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://github.com/eevan7a9/real-estate-management
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
