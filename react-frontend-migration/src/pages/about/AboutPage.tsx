import type { ReactElement } from 'react';

function AboutPage(): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">About</h1>
      <p className="text-gray-600">About the Real Estate Management application</p>
    </div>
  );
}

export default AboutPage;
