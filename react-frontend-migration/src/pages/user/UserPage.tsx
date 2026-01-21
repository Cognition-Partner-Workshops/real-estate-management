import type { ReactElement } from 'react';

function UserPage(): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">User Profile</h1>
      <p className="text-gray-600">User profile and authentication - Coming soon</p>
    </div>
  );
}

export default UserPage;
