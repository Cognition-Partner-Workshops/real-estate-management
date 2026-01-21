import type { ReactElement } from 'react';

function SettingsPage(): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Settings</h1>
      <p className="text-gray-600">Application settings and preferences - Coming soon</p>
    </div>
  );
}

export default SettingsPage;
