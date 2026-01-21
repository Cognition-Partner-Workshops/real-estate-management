import { useState, useEffect, useRef, useCallback, type ReactElement } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Button, Modal } from '@/components/ui';
import { useMapService } from '@/hooks';
import type { Coord } from '@/types';

interface PropertyCoordinatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (coord: Coord) => void;
  title?: string;
  initialCoord?: Coord;
}

const DEFAULT_CENTER: Coord = { lat: 14.5995, lng: 120.9842 };
const DEFAULT_ZOOM = 13;

function PropertyCoordinatesModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Set Property Marker',
  initialCoord,
}: PropertyCoordinatesModalProps): ReactElement {
  const [coord, setCoord] = useState<Coord | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const { addTiles, addMarker, removeMarker } = useMapService();

  const handleMapClick = useCallback((e: L.LeafletMouseEvent): void => {
    const newCoord: Coord = { lat: e.latlng.lat, lng: e.latlng.lng };
    setCoord(newCoord);

    if (mapRef.current) {
      if (markerRef.current) {
        removeMarker(markerRef.current);
      }
      markerRef.current = addMarker(mapRef.current, newCoord);
      markerRef.current.addTo(mapRef.current);
    }
  }, [addMarker, removeMarker]);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      const center = initialCoord || DEFAULT_CENTER;
      const map = L.map(mapContainerRef.current).setView(
        [center.lat, center.lng],
        DEFAULT_ZOOM
      );

      mapRef.current = map;
      tileLayerRef.current = addTiles(map);

      map.on('click', handleMapClick);

      if (initialCoord) {
        setCoord(initialCoord);
        markerRef.current = addMarker(map, initialCoord);
        markerRef.current.addTo(map);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, initialCoord, addTiles, addMarker, handleMapClick]);

  useEffect(() => {
    if (!isOpen && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
      tileLayerRef.current = null;
    }
  }, [isOpen]);
  

  const handleConfirm = (): void => {
    if (coord) {
      onConfirm(coord);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <div className="relative">
        <div
          ref={mapContainerRef}
          className="w-full h-[400px] rounded-lg overflow-hidden"
        />

        <div className="absolute top-2 right-2 z-[1000]">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="bg-blue-500 text-white w-10 h-10 rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {showHelp && (
            <div className="absolute top-12 right-0 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap">
              Click/Tap at the map to place the marker.
            </div>
          )}
        </div>

        {coord && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Selected coordinates:</span>
            </p>
            <p className="text-sm text-gray-800">
              Lat: {coord.lat.toFixed(6)}, Lng: {coord.lng.toFixed(6)}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleConfirm}
            disabled={!coord}
          >
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default PropertyCoordinatesModal;
