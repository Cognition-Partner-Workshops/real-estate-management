import { type ReactElement } from 'react';

import { PropertyType } from '@/types';

interface MapMarkersLegendProps {
  visibleTypes: PropertyType[];
  onToggleType: (type: PropertyType) => void;
}

const PROPERTY_TYPE_CONFIG: Record<
  PropertyType,
  { label: string; color: string; bgColor: string }
> = {
  [PropertyType.Residential]: {
    label: 'Residential',
    color: 'bg-red-500',
    bgColor: 'bg-red-100',
  },
  [PropertyType.Commercial]: {
    label: 'Commercial',
    color: 'bg-cyan-500',
    bgColor: 'bg-cyan-100',
  },
  [PropertyType.Industrial]: {
    label: 'Industrial',
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-100',
  },
  [PropertyType.Land]: {
    label: 'Land',
    color: 'bg-green-500',
    bgColor: 'bg-green-100',
  },
};

function MapMarkersLegend({
  visibleTypes,
  onToggleType,
}: MapMarkersLegendProps): ReactElement {
  const allTypes = Object.values(PropertyType);

  return (
    <div className="map-markers-legend bg-white rounded-lg shadow-md p-3">
      <div className="text-sm font-semibold text-gray-700 mb-2">Property Types</div>
      <div className="flex flex-wrap gap-2">
        {allTypes.map((type) => {
          const config = PROPERTY_TYPE_CONFIG[type];
          const isVisible = visibleTypes.includes(type);

          return (
            <button
              key={type}
              onClick={() => onToggleType(type)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isVisible
                  ? `${config.bgColor} text-gray-800 ring-2 ring-offset-1 ring-gray-400`
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full ${
                  isVisible ? config.color : 'bg-gray-300'
                }`}
              />
              {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { MapMarkersLegend };
export default MapMarkersLegend;
