import { useCallback, useMemo } from 'react';
import L from 'leaflet';

import type { Coord } from '@/types/property';

const MAP_TILES = {
  default: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=',
  dark: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=',
} as const;

const TILE_ATTRIBUTION = `
  '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>,
  &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a>
  &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
`;

const MAX_ZOOM = 20;
const FLY_TO_ZOOM = 19;

interface MarkerOptions {
  icon?: L.Icon | L.DivIcon | null;
  popup?: HTMLElement | string | null;
}

interface UseMapServiceReturn {
  addTiles: (map: L.Map, isDark?: boolean) => L.TileLayer;
  addMarker: (map: L.Map, coord: Coord, options?: MarkerOptions) => L.Marker;
  createIcon: (iconUrl: string, iconSize?: [number, number]) => L.Icon;
  removeMarker: (marker: L.Marker) => void;
  MAP_TILES: typeof MAP_TILES;
}

export function useMapService(): UseMapServiceReturn {
  const addTiles = useCallback((map: L.Map, isDark = false): L.TileLayer => {
    const tileUrl = isDark ? MAP_TILES.dark : MAP_TILES.default;
    const tiles = L.tileLayer(tileUrl, {
      maxZoom: MAX_ZOOM,
      attribution: TILE_ATTRIBUTION,
    });
    tiles.addTo(map);
    return tiles;
  }, []);

  const addMarker = useCallback(
    (map: L.Map, coord: Coord, options: MarkerOptions = {}): L.Marker => {
      const markerOptions: L.MarkerOptions = {};

      if (options.icon) {
        markerOptions.icon = options.icon;
      }

      const marker = L.marker([coord.lat, coord.lng], markerOptions);

      if (options.popup) {
        if (typeof options.popup === 'string') {
          marker.bindPopup(options.popup);
        } else {
          marker.bindPopup(options.popup);
        }
      }

      marker.on('click', () => {
        map.flyTo([coord.lat, coord.lng], FLY_TO_ZOOM);
      });

      return marker;
    },
    []
  );

  const createIcon = useCallback(
    (iconUrl: string, iconSize: [number, number] = [25, 41]): L.Icon => {
      return L.icon({
        iconUrl,
        iconSize,
        iconAnchor: [iconSize[0] / 2, iconSize[1]],
        popupAnchor: [0, -iconSize[1]],
      });
    },
    []
  );

  const removeMarker = useCallback((marker: L.Marker): void => {
    marker.remove();
  }, []);

  const mapTiles = useMemo(() => MAP_TILES, []);

  return {
    addTiles,
    addMarker,
    createIcon,
    removeMarker,
    MAP_TILES: mapTiles,
  };
}
