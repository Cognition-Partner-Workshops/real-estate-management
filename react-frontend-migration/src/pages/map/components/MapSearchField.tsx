import { useState, useCallback, type ReactElement } from 'react';
import { OpenStreetMapProvider } from 'leaflet-geosearch';

import ModalSearch from '@/components/ui/ModalSearch';
import type { Coord } from '@/types';

interface CityItem {
  city: string;
  lat: string;
  lng: string;
}

interface MapSearchFieldProps {
  onLocationSelect: (coord: Coord) => void;
}

const defaultCities: CityItem[] = [
  { city: 'Manila', lat: '14.6000', lng: '120.9833' },
  { city: 'Quezon City', lat: '14.6333', lng: '121.0333' },
  { city: 'Davao', lat: '7.0667', lng: '125.6000' },
  { city: 'Cebu City', lat: '10.3000', lng: '123.9000' },
  { city: 'Makati City', lat: '14.5500', lng: '121.0333' },
  { city: 'Taguig City', lat: '14.5167', lng: '121.0500' },
  { city: 'Pasig City', lat: '14.5750', lng: '121.0833' },
  { city: 'Cagayan de Oro', lat: '8.4833', lng: '124.6500' },
  { city: 'Bacolod', lat: '10.6765', lng: '122.9509' },
  { city: 'Iloilo', lat: '10.7167', lng: '122.5667' },
];

function MapSearchField({ onLocationSelect }: MapSearchFieldProps): ReactElement {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOpenModal = (): void => {
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
  };

  const handleSelect = (item: CityItem): void => {
    const coord: Coord = {
      lat: Number(item.lat),
      lng: Number(item.lng),
    };
    onLocationSelect(coord);
    setIsModalOpen(false);
  };

  const searchFunction = useCallback(async (text: string): Promise<CityItem[]> => {
    const provider = new OpenStreetMapProvider();
    const results = await provider.search({ query: text });

    if (!results || results.length === 0) {
      return [];
    }

    return results.map((item: { label: string; y: number; x: number }) => ({
      city: item.label,
      lat: String(item.y),
      lng: String(item.x),
    }));
  }, []);

  return (
    <>
      <div className="search-container relative">
        <div className="flex items-center bg-white rounded-lg shadow-md overflow-hidden">
          <div className="icon-container flex items-center justify-center px-3 py-2 bg-gray-100">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search Cities..."
            onFocus={handleOpenModal}
            readOnly
            className="flex-1 px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      <ModalSearch<CityItem>
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelect={handleSelect}
        title="Search Location"
        placeholder="Search Cities..."
        items={defaultCities}
        displayProperty="city"
        searchFunction={searchFunction}
      />
    </>
  );
}

export { MapSearchField };
export default MapSearchField;
