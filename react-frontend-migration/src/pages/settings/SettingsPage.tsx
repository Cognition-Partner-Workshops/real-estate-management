import type { ReactElement } from 'react';

import { Card } from '@/components/ui';
import { NotificationBell } from '@/components/ui';

import SettingsCoordDefault from './SettingsCoordDefault';
import SettingsTheme from './SettingsTheme';

function SettingsPage(): ReactElement {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-screen-2xl mx-auto px-3 xl:px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200">
            Settings Page
          </h1>
          <NotificationBell />
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-3 xl:px-4 py-3 xl:py-5 flex flex-col gap-3">
        <Card className="border border-gray-200 dark:border-gray-700 shadow-none">
          <Card.Body>
            <SettingsTheme />
          </Card.Body>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-700 shadow-none">
          <Card.Body>
            <SettingsCoordDefault />
          </Card.Body>
        </Card>
      </main>
    </div>
  );
}

export default SettingsPage;
