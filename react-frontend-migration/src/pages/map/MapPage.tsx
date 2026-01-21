import { useState, useEffect, useRef, useCallback, useMemo, type ReactElement } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useProperties } from '@/hooks/useProperties';
import { useStorage } from '@/hooks/useStorage';
import { useAppSelector } from '@/store/hooks';
import { PropertyBadge, Button, HorizontalSlide, Footer, ModalSearch } from '@/components/ui';
import type { Property, Coord, PropertyType } from '@/types';

import markerResidential from '@/assets/images/map/marker-residential.svg';
import markerCommercial from '@/assets/images/map/marker-commercial.svg';
import markerIndustrial from '@/assets/images/map/marker-industrial.svg';
import markerLand from '@/assets/images/map/marker-land.svg';
import markerShadow from '@/assets/images/map/marker-shadow.svg';

const PropertyTypeValues = {
  Residential: 'residential',
  Commercial: 'commercial',
  Industrial: 'industrial',
  Land: 'land',
} as const;

interface MarkerConfig {
  label: string;
  value: PropertyType;
  isChecked: boolean;
  icon: string;
}

interface CityItem {
  city: string;
  lat: string;
  lng: string;
}

const DEFAULT_CENTER: Coord = { lat: 8.947416086535465, lng: 125.5451552207221 };
const DEFAULT_ZOOM = 18;
const MIN_ZOOM = 16;
const FLY_TO_ZOOM = 19;

const MAP_TILES = {
  default: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
  dark: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
} as const;

const TILE_ATTRIBUTION = `&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors`;

function createMarkerIcon(iconUrl: string): L.Icon {
  return L.icon({
    iconUrl,
    shadowUrl: markerShadow,
    iconSize: [40, 45],
    shadowSize: [40, 55],
    iconAnchor: [22, 50],
    shadowAnchor: [5, 40],
    popupAnchor: [-3, -46],
  });
}

const markerIcons: Record<PropertyType, L.Icon> = {
  residential: createMarkerIcon(markerResidential),
  commercial: createMarkerIcon(markerCommercial),
  industrial: createMarkerIcon(markerIndustrial),
  land: createMarkerIcon(markerLand),
};

interface MapControllerProps {
  center: Coord;
  targetCoord: Coord | null;
  onFlyComplete: () => void;
}

function MapController({ center, targetCoord, onFlyComplete }: MapControllerProps): null {
  const map = useMap();
  const hasInitialized = useRef<boolean>(false);

  useEffect(() => {
    if (targetCoord) {
      map.flyTo([targetCoord.lat, targetCoord.lng], FLY_TO_ZOOM);
      onFlyComplete();
    }
  }, [map, targetCoord, onFlyComplete]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      map.setView([center.lat, center.lng], DEFAULT_ZOOM);
    }
  }, [map, center]);

  return null;
}

interface MapMarkersLegendProps {
  markers: MarkerConfig[];
  onToggle: (type: PropertyType, isChecked: boolean) => void;
}

function MapMarkersLegend({ markers, onToggle }: MapMarkersLegendProps): ReactElement {
  return (
    <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-2">
      <ul className="space-y-1">
        {markers.map((marker) => (
          <li
            key={marker.value}
            className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 rounded"
            onClick={() => onToggle(marker.value, !marker.isChecked)}
          >
            <img src={marker.icon} alt={marker.label} className="w-6 h-8" />
            <input
              type="checkbox"
              checked={marker.isChecked}
              onChange={(e) => onToggle(marker.value, e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{marker.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface MapSearchFieldProps {
  onLocationSelect: (coord: Coord) => void;
}

function MapSearchField({ onLocationSelect }: MapSearchFieldProps): ReactElement {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const searchFunction = useCallback(async (text: string): Promise<CityItem[]> => {
    if (text.length < 3) return [];
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}`
      );
      const results = await response.json() as Array<{ display_name: string; lat: string; lon: string }>;
      return results.map((item) => ({
        city: item.display_name,
        lat: item.lat,
        lng: item.lon,
      }));
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }, []);

  const handleSelect = useCallback((item: CityItem): void => {
    onLocationSelect({ lat: Number(item.lat), lng: Number(item.lng) });
    setIsModalOpen(false);
  }, [onLocationSelect]);

  return (
    <>
      <div className="absolute top-4 left-4 z-[1000]">
        <div
          className="flex items-center bg-white rounded-lg shadow-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
          onClick={() => setIsModalOpen(true)}
        >
          <svg
            className="w-5 h-5 text-gray-500 mr-2"
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
          <span className="text-gray-500">Search Cities...</span>
        </div>
      </div>
      <ModalSearch<CityItem>
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelect}
        title="Search Location"
        placeholder="Search Cities..."
        searchFunction={searchFunction}
        displayProperty="city"
        debounceMs={500}
      />
    </>
  );
}

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
  isOwned: boolean;
}

function PropertyCard({ property, onClick, isOwned }: PropertyCardProps): ReactElement {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(price);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="relative flex flex-col w-full max-w-[360px] h-full bg-white rounded-lg shadow-md overflow-hidden border border-slate-200">
      <div
        className={`z-10 absolute rounded-br-lg py-1 px-3 font-bold bg-opacity-80 text-white ${
          isOwned
            ? 'bg-blue-500'
            : property.transactionType === 'rent'
            ? 'bg-yellow-500'
            : 'bg-green-500'
        }`}
      >
        {isOwned ? 'Owned' : `For ${property.transactionType}`}
      </div>

      <div
        className="h-[230px] overflow-hidden cursor-pointer group"
        onClick={onClick}
      >
        {!property.images || property.images.length === 0 ? (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        ) : (
          <img
            className="w-full h-full object-cover group-hover:scale-125 transition-all ease-in-out duration-300"
            src={property.images[0]}
            alt={property.name}
          />
        )}
      </div>

      <div className="py-2 px-3">
        <PropertyBadge type={property.type} />
        <h3 className="text-[16px] sm:text-[20px] font-semibold truncate mt-1">
          {property.name}
        </h3>
        <div className="text-sm text-gray-500">{formatDate(property.createdAt)}</div>
      </div>

      <div className="flex flex-col px-3 pb-3 flex-grow">
        <div className="line-clamp-3 text-ellipsis overflow-hidden h-[60px] mb-3 text-gray-600">
          {property.description}
        </div>

        <div className="font-bold sm:text-[18px] mt-auto">
          {formatPrice(property.price)}
          {property.transactionType === 'rent' && property.paymentFrequency && (
            <span className="capitalize text-[16px] font-normal">
              {' '}
              | {property.paymentFrequency}
            </span>
          )}
        </div>

        <Button onClick={onClick} className="mt-3" fullWidth>
          View property
        </Button>
      </div>
    </div>
  );
}

interface MapPopupContentProps {
  property: Property;
  onViewMore: () => void;
}

function MapPopupContent({ property, onViewMore }: MapPopupContentProps): ReactElement {
  return (
    <div className="min-w-[200px]">
      <div className="font-semibold text-gray-800 mb-1">{property.name}</div>
      <div className="mb-2">
        <PropertyBadge type={property.type} />
      </div>
      <div className="text-sm text-gray-600 mb-3">{property.address}</div>
      <Button onClick={onViewMore} size="sm" fullWidth>
        View More
      </Button>
    </div>
  );
}

function MapPage(): ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getCoord, getDarkTheme } = useStorage();
  const user = useAppSelector((state) => state.user.user);
  const { data: propertiesData } = useProperties();
  
  const properties = useMemo(() => {
    return propertiesData?.data?.items ?? [];
  }, [propertiesData?.data?.items]);

  const initialCenter = useMemo((): Coord => {
    const storedCoord = getCoord();
    return storedCoord ?? DEFAULT_CENTER;
  }, [getCoord]);

  const initialDark = useMemo((): boolean => {
    const storedDark = getDarkTheme();
    return storedDark ?? false;
  }, [getDarkTheme]);

  const initialTargetCoord = useMemo((): Coord | null => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat && lng) {
      return { lat: Number(lat), lng: Number(lng) };
    }
    return null;
  }, [searchParams]);
  
  const [center] = useState<Coord>(initialCenter);
  const [targetCoord, setTargetCoord] = useState<Coord | null>(initialTargetCoord);
  const [isDark] = useState<boolean>(initialDark);
  const [visibleTypes, setVisibleTypes] = useState<Set<PropertyType>>(
    new Set([
      PropertyTypeValues.Residential,
      PropertyTypeValues.Commercial,
      PropertyTypeValues.Industrial,
      PropertyTypeValues.Land,
    ])
  );
  
  const mapRef = useRef<L.Map | null>(null);

  const markerConfigs: MarkerConfig[] = useMemo(() => [
    {
      label: 'Residential',
      value: PropertyTypeValues.Residential,
      isChecked: visibleTypes.has(PropertyTypeValues.Residential),
      icon: markerResidential,
    },
    {
      label: 'Commercial',
      value: PropertyTypeValues.Commercial,
      isChecked: visibleTypes.has(PropertyTypeValues.Commercial),
      icon: markerCommercial,
    },
    {
      label: 'Industrial',
      value: PropertyTypeValues.Industrial,
      isChecked: visibleTypes.has(PropertyTypeValues.Industrial),
      icon: markerIndustrial,
    },
    {
      label: 'Land',
      value: PropertyTypeValues.Land,
      isChecked: visibleTypes.has(PropertyTypeValues.Land),
      icon: markerLand,
    },
  ], [visibleTypes]);

  const handleToggleMarker = useCallback((type: PropertyType, isChecked: boolean): void => {
    setVisibleTypes((prev) => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(type);
      } else {
        newSet.delete(type);
      }
      return newSet;
    });
  }, []);

  const handleLocationSelect = useCallback((coord: Coord): void => {
    setTargetCoord(coord);
  }, []);

  const handleFlyComplete = useCallback((): void => {
    setTargetCoord(null);
  }, []);

  const handlePropertyClick = useCallback((propertyId: string): void => {
    navigate(`/properties/${propertyId}`);
  }, [navigate]);

  const filteredProperties = useMemo(() => {
    return properties.filter(
      (property) => property.position && visibleTypes.has(property.type)
    );
  }, [properties, visibleTypes]);

  const displayedProperties = useMemo(() => {
    return properties.slice(0, 6);
  }, [properties]);

  const isPropertyOwned = useCallback((property: Property): boolean => {
    return user?.user_id === property.user_id;
  }, [user]);

  const tileUrl = isDark ? MAP_TILES.dark : MAP_TILES.default;

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg md:text-xl font-semibold text-gray-800">Map Page</h1>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="relative flex-1 min-h-[500px] lg:min-h-0">
          <MapContainer
            center={[center.lat, center.lng]}
            zoom={DEFAULT_ZOOM}
            minZoom={MIN_ZOOM}
            zoomControl={false}
            className="w-full h-full"
            ref={mapRef}
          >
            <TileLayer url={tileUrl} attribution={TILE_ATTRIBUTION} />
            <MapController
              center={center}
              targetCoord={targetCoord}
              onFlyComplete={handleFlyComplete}
            />
            
            {filteredProperties.map((property) => (
              <Marker
                key={property.property_id}
                position={[property.position.lat, property.position.lng]}
                icon={markerIcons[property.type]}
              >
                <Popup>
                  <MapPopupContent
                    property={property}
                    onViewMore={() => handlePropertyClick(property.property_id)}
                  />
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <MapSearchField onLocationSelect={handleLocationSelect} />
          <MapMarkersLegend markers={markerConfigs} onToggle={handleToggleMarker} />
        </div>

        <div className="hidden lg:block w-full max-w-[380px] overflow-y-auto p-2 bg-gray-50">
          <div className="space-y-4">
            {properties.slice(0, 4).map((property) => (
              <PropertyCard
                key={property.property_id}
                property={property}
                onClick={() => handlePropertyClick(property.property_id)}
                isOwned={isPropertyOwned(property)}
              />
            ))}
          </div>

          <div className="pt-4">
            <div className="border border-slate-200 rounded-lg h-[200px] flex items-center justify-center bg-white">
              <Button variant="outline" onClick={() => navigate('/properties')}>
                View All
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden w-full py-3 pr-3 mb-[60px]">
        <HorizontalSlide>
          {displayedProperties.map((property) => (
            <div key={property.property_id} className="min-w-[320px] px-2">
              <PropertyCard
                property={property}
                onClick={() => handlePropertyClick(property.property_id)}
                isOwned={isPropertyOwned(property)}
              />
            </div>
          ))}
          <div className="min-w-[300px] px-2">
            <div className="border border-blue-500 rounded-lg h-full min-h-[400px] flex items-center justify-center">
              <Button variant="outline" onClick={() => navigate('/properties')}>
                View All
              </Button>
            </div>
          </div>
        </HorizontalSlide>
      </div>

      <div className="lg:hidden">
        <Footer />
      </div>
    </div>
  );
}

export default MapPage;
