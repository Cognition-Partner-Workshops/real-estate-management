import { type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOwnedProperties } from '@/hooks';
import type { Property } from '@/types';

function PropertyCard({ property }: { property: Property }): ReactElement {
  const navigate = useNavigate();

  const handleClick = (): void => {
    navigate(`/properties/${property.property_id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex flex-row gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
    >
      <div className="w-24 h-24 flex-shrink-0">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.name}
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {property.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {property.type} - {property.transactionType === 'sale' ? 'For Sale' : 'For Rent'}
        </p>
        <p className="text-primary font-bold">
          ${property.price?.toLocaleString()}
          {property.transactionType === 'rent' && property.paymentFrequency && (
            <span className="text-sm font-normal text-gray-500">
              /{property.paymentFrequency}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function UserProperties(): ReactElement {
  const { data, isLoading } = useOwnedProperties();
  const properties = data?.data || [];

  if (isLoading) {
    return (
      <div className="h-[100px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="h-[100px] flex items-center justify-center">
        <h1 className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
          EMPTY
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {properties.map((property) => (
        <PropertyCard key={property.property_id} property={property} />
      ))}
    </div>
  );
}

export default UserProperties;
