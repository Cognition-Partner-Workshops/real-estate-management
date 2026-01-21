import type { ReactElement } from 'react';

import { PropertyBadge } from '@/components/ui';
import type { Property } from '@/types';

interface MapPopupProps {
  property: Property;
  onViewMore?: (propertyId: string) => void;
}

function MapPopup({ property, onViewMore }: MapPopupProps): ReactElement {
  const handleViewMore = (): void => {
    if (onViewMore) {
      onViewMore(property.property_id);
    } else {
      window.location.href = `/properties/${property.property_id}`;
    }
  };

  return (
    <div className="popup-container min-w-[200px] p-2">
      <div className="name font-semibold text-gray-800 mb-1">{property.name}</div>
      <div className="type mb-2">
        <PropertyBadge type={property.type} />
      </div>
      <div className="address text-sm text-gray-600 mb-3">{property.address}</div>
      <button
        onClick={handleViewMore}
        className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
      >
        View More
      </button>
    </div>
  );
}

export { MapPopup };
export default MapPopup;
