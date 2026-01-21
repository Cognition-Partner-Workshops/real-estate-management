import type { ReactElement } from 'react';
import { useParams } from 'react-router-dom';

function PropertyDetailPage(): ReactElement {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Property Detail</h1>
      <p className="text-gray-600">Property ID: {id}</p>
      <p className="text-gray-500 mt-2">Property details with enquiry form and mortgage calculator - Coming soon</p>
    </div>
  );
}

export default PropertyDetailPage;
