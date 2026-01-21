import { useState, useCallback, type ReactElement } from 'react';

import { PropertyType, type Coord } from '@/types';

import { MapLeaflet, MapSearchField, MapMarkersLegend } from './components';

function MapPage(): ReactElement {
  const [visibleMarkerTypes, setVisibleMarkerTypes] = useState<PropertyType[]>([
    PropertyType.Residential,
    PropertyType.Commercial,
    PropertyType.Industrial,
    PropertyType.Land,
  ]);

  const [mapKey, setMapKey] = useState<number>(0);

  const handleToggleType = useCallback((type: PropertyType): void => {
    setVisibleMarkerTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      }
      return [...prev, type];
    });
  }, []);

  const handleLocationSelect = useCallback((coord: Coord): void => {
    const url = new URL(window.location.href);
    url.searchParams.set('lat', String(coord.lat));
    url.searchParams.set('lng', String(coord.lng));
    window.history.pushState({}, '', url.toString());
    setMapKey((prev) => prev + 1);
  }, []);

  return (
    <div className="map-page flex flex-col h-screen">
      <div className="map-controls absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="w-full md:w-80">
          <MapSearchField onLocationSelect={handleLocationSelect} />
        </div>
        <div className="w-full md:w-auto">
          <MapMarkersLegend
            visibleTypes={visibleMarkerTypes}
            onToggleType={handleToggleType}
          />
        </div>
      </div>

      <div className="flex-1 relative">
        <MapLeaflet
          key={mapKey}
          showPropertyMarkers={true}
          visibleMarkerTypes={visibleMarkerTypes}
        />
      </div>
    </div>
  );
}

export default MapPage;
