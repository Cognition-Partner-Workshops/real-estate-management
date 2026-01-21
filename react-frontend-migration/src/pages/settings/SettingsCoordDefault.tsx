import { useState, type ReactElement, type ChangeEvent } from 'react';

import { Button, Input, Modal } from '@/components/ui';
import { useStorage } from '@/hooks/useStorage';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import type { Coord } from '@/types/property';

const DEFAULT_COORD: Coord = { lat: 8.947416086535465, lng: 125.5451552207221 };

function getInitialCoord(getCoord: () => Coord | null): Coord {
  const storedCoord = getCoord();
  return storedCoord ?? DEFAULT_COORD;
}

function SettingsCoordDefault(): ReactElement {
  const dispatch = useAppDispatch();
  const { getCoord, setCoord: saveCoord } = useStorage();
  const [coord, setCoord] = useState<Coord>(() => getInitialCoord(getCoord));
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);

  const handleLatChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      setCoord((prev) => ({ ...prev, lat: value }));
    }
  };

  const handleLngChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      setCoord((prev) => ({ ...prev, lng: value }));
    }
  };

  const handleSetCoord = (): void => {
    saveCoord(coord);
    dispatch(
      addNotification({
        type: 'success',
        message: 'Your settings have been saved.',
      })
    );
  };

  const handleResetCoord = (): void => {
    setCoord(DEFAULT_COORD);
    saveCoord(DEFAULT_COORD);
    dispatch(
      addNotification({
        type: 'success',
        message: 'Your settings have been reset.',
      })
    );
  };

  const handleOpenMap = (): void => {
    setIsMapModalOpen(true);
  };

  const handleCloseMap = (): void => {
    setIsMapModalOpen(false);
  };

  const handleSelectLocation = (newCoord: Coord): void => {
    setCoord(newCoord);
    setIsMapModalOpen(false);
  };


  return (
    <div className="mt-4 xl:mt-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          Change Default Coordinates
        </h2>
        <Button
          variant="primary"
          onClick={handleOpenMap}
          className="flex items-center gap-2 w-fit"
        >
          <span className="capitalize">Open Map</span>
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Input
          label="Latitude:"
          type="number"
          step="any"
          value={coord.lat}
          onChange={handleLatChange}
        />
        <Input
          label="Longitude:"
          type="number"
          step="any"
          value={coord.lng}
          onChange={handleLngChange}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <Button variant="primary" onClick={handleSetCoord} className="w-full md:w-auto">
          Set Coordinates
        </Button>
        <Button variant="secondary" onClick={handleResetCoord} className="w-full md:w-auto">
          Reset Coordinates
        </Button>
      </div>

      <Modal
        isOpen={isMapModalOpen}
        onClose={handleCloseMap}
        title="Select Desired Location"
        size="lg"
      >
        <CoordinateSelector
          initialCoord={coord}
          onSelect={handleSelectLocation}
          onCancel={handleCloseMap}
        />
      </Modal>
    </div>
  );
}

interface CoordinateSelectorProps {
  initialCoord: Coord;
  onSelect: (coord: Coord) => void;
  onCancel: () => void;
}

function CoordinateSelector({
  initialCoord,
  onSelect,
  onCancel,
}: CoordinateSelectorProps): ReactElement {
  const [tempCoord, setTempCoord] = useState<Coord>(initialCoord);

  const handleLatChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      setTempCoord((prev) => ({ ...prev, lat: value }));
    }
  };

  const handleLngChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      setTempCoord((prev) => ({ ...prev, lng: value }));
    }
  };

  const handleConfirm = (): void => {
    onSelect(tempCoord);
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600 dark:text-gray-400">
        Enter the coordinates for your default map location. This location will be used as the
        initial center point when viewing the map.
      </p>

      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Interactive map selection coming soon
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          For now, please enter coordinates manually below
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Latitude"
          type="number"
          step="any"
          value={tempCoord.lat}
          onChange={handleLatChange}
          helperText="Range: -90 to 90"
        />
        <Input
          label="Longitude"
          type="number"
          step="any"
          value={tempCoord.lng}
          onChange={handleLngChange}
          helperText="Range: -180 to 180"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Select Location
        </Button>
      </div>
    </div>
  );
}

export default SettingsCoordDefault;
