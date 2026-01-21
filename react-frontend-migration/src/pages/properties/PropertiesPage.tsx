import type { ReactElement } from 'react';

function PropertiesPage(): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Properties</h1>
      <p className="text-gray-600">Property listings with search, filter, and sort - Coming soon</p>
    </div>
  );
}

export default PropertiesPage;
