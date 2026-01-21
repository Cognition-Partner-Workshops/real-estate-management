import {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  type ReactElement,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useMapService } from '@/hooks/useMapService';
import { useStorage } from '@/hooks/useStorage';
import { useProperties } from '@/hooks/useProperties';
import { PropertyType, type Coord, type Property } from '@/types';

import MapPopup from './MapPopup';

import markerResidential from '@/assets/images/map/marker-residential.svg';
import markerCommercial from '@/assets/images/map/marker-commercial.svg';
import markerIndustrial from '@/assets/images/map/marker-industrial.svg';
import markerLand from '@/assets/images/map/marker-land.svg';
import markerDefault from '@/assets/images/map/default-marker.svg';
import markerShadow from '@/assets/images/map/marker-shadow.svg';

interface MapLeafletProps {
  clickAddMarker?: boolean;
  showPropertyMarkers?: boolean;
  visibleMarkerTypes?: PropertyType[];
  onClickedAt?: (coord: Coord) => void;
}

const DEFAULT_CENTER: Coord = { lat: 8.947416086535465, lng: 125.5451552207221 };
const DEFAULT_ZOOM = 18;
const MIN_ZOOM = 16;
const FLY_TO_ZOOM = 19;

const MARKER_ICONS: Record<string, string> = {
  [PropertyType.Residential]: markerResidential,
  [PropertyType.Commercial]: markerCommercial,
  [PropertyType.Industrial]: markerIndustrial,
  [PropertyType.Land]: markerLand,
  default: markerDefault,
};

function MapLeaflet({
  clickAddMarker = false,
  showPropertyMarkers = true,
  visibleMarkerTypes = [
    PropertyType.Residential,
    PropertyType.Commercial,
    PropertyType.Industrial,
    PropertyType.Land,
  ],
  onClickedAt,
}: MapLeafletProps): ReactElement {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const pendingMarkersRef = useRef<L.Marker[]>([]);
  const layerGroupsRef = useRef<Record<PropertyType, L.LayerGroup | null>>({
    [PropertyType.Residential]: null,
    [PropertyType.Commercial]: null,
    [PropertyType.Industrial]: null,
    [PropertyType.Land]: null,
  });

  const [isMapReady, setIsMapReady] = useState<boolean>(false);

  const [searchParams] = useSearchParams();
  const { addTiles } = useMapService();
  const { getCoord, getDarkTheme } = useStorage();
  const { data: propertiesData } = useProperties({ enabled: showPropertyMarkers });

  const properties = useMemo(
    () => propertiesData?.data?.items ?? [],
    [propertiesData]
  );

  const createMarkerIcon = useCallback((type?: PropertyType): L.Icon => {
    const iconUrl = type ? MARKER_ICONS[type] ?? MARKER_ICONS.default : MARKER_ICONS.default;

    return L.icon({
      iconUrl,
      shadowUrl: markerShadow,
      iconSize: [40, 45],
      shadowSize: [40, 55],
      iconAnchor: [22, 50],
      shadowAnchor: [5, 40],
      popupAnchor: [-3, -46],
    });
  }, []);

  const createPropertyMarker = useCallback(
    (property: Property): L.Marker | null => {
      if (!property.position || !mapRef.current) return null;

      const icon = createMarkerIcon(property.type);
      const popupContent = renderToString(<MapPopup property={property} />);

      const marker = L.marker([property.position.lat, property.position.lng], { icon });
      marker.bindPopup(popupContent, { maxWidth: 300 });

      marker.on('click', () => {
        mapRef.current?.flyTo([property.position.lat, property.position.lng], FLY_TO_ZOOM);
      });

      markersRef.current.push(marker);
      return marker;
    },
    [createMarkerIcon]
  );

  const setMapMarkers = useCallback((): void => {
    if (!mapRef.current || !properties.length) return;

    const grouped = properties.reduce<Record<PropertyType, Property[]>>(
      (acc, property) => {
        if (property.type && acc[property.type]) {
          acc[property.type].push(property);
        }
        return acc;
      },
      {
        [PropertyType.Residential]: [],
        [PropertyType.Commercial]: [],
        [PropertyType.Industrial]: [],
        [PropertyType.Land]: [],
      }
    );

    Object.values(PropertyType).forEach((type) => {
      const existingLayer = layerGroupsRef.current[type];
      if (existingLayer && mapRef.current) {
        mapRef.current.removeLayer(existingLayer);
      }

      const markers = grouped[type]
        .map((property) => createPropertyMarker(property))
        .filter((marker): marker is L.Marker => marker !== null);

      layerGroupsRef.current[type] = L.layerGroup(markers);
    });
  }, [properties, createPropertyMarker]);

  const updateVisibleLayers = useCallback((): void => {
    if (!mapRef.current) return;

    Object.values(PropertyType).forEach((type) => {
      const layer = layerGroupsRef.current[type];
      if (!layer) return;

      if (visibleMarkerTypes.includes(type)) {
        if (!mapRef.current!.hasLayer(layer)) {
          mapRef.current!.addLayer(layer);
        }
      } else {
        if (mapRef.current!.hasLayer(layer)) {
          mapRef.current!.removeLayer(layer);
        }
      }
    });
  }, [visibleMarkerTypes]);

  const findMarker = useCallback((lat: number, lng: number): void => {
    const foundMarker = markersRef.current.find((marker) => {
      const latLng = marker.getLatLng();
      return latLng.lat === lat && latLng.lng === lng;
    });

    if (foundMarker && mapRef.current) {
      mapRef.current.flyTo(foundMarker.getLatLng(), FLY_TO_ZOOM);
      setTimeout(() => {
        foundMarker.openPopup();
      }, 1000);
    }
  }, []);

  const pinMarker = useCallback(
    (coord: Coord): void => {
      if (!mapRef.current) return;

      pendingMarkersRef.current.forEach((marker) => {
        mapRef.current?.removeLayer(marker);
      });
      pendingMarkersRef.current = [];

      const icon = createMarkerIcon();
      const marker = L.marker([coord.lat, coord.lng], { icon });
      marker.addTo(mapRef.current);
      pendingMarkersRef.current.push(marker);
    },
    [createMarkerIcon]
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const storedCoord = getCoord();
    const center = storedCoord ?? DEFAULT_CENTER;

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: DEFAULT_ZOOM,
      minZoom: MIN_ZOOM,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    map.whenReady(() => {
      setTimeout(() => {
        map.invalidateSize();
        setIsMapReady(true);
      }, 100);
    });

    const isDark = getDarkTheme() ?? false;
    addTiles(map, isDark);

    if (clickAddMarker) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const coord: Coord = { lat: e.latlng.lat, lng: e.latlng.lng };
        pinMarker(coord);
        onClickedAt?.(coord);
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
      pendingMarkersRef.current = [];
    };
  }, [addTiles, clickAddMarker, getCoord, getDarkTheme, onClickedAt, pinMarker]);

  useEffect(() => {
    if (!isMapReady || !showPropertyMarkers) return;
    setMapMarkers();
    updateVisibleLayers();
  }, [isMapReady, showPropertyMarkers, setMapMarkers, updateVisibleLayers]);

  useEffect(() => {
    if (!isMapReady) return;
    updateVisibleLayers();
  }, [isMapReady, visibleMarkerTypes, updateVisibleLayers]);

  useEffect(() => {
    if (!isMapReady) return;

    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (lat && lng) {
      findMarker(Number(lat), Number(lng));
    }
  }, [isMapReady, searchParams, findMarker]);

  return (
    <div className="map-container relative w-full h-full">
      <div
        ref={mapContainerRef}
        id="mapId"
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}

export { MapLeaflet };
export default MapLeaflet;
