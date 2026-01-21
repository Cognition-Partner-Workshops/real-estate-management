import { useState, useEffect, type ReactElement } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchPropertiesThunk,
  selectProperties,
  selectPropertiesLoading,
} from '@/store/slices/propertiesSlice';
import { PropertiesList } from './components';
import { PropertiesDisplayOption } from '@/types';
import Button from '@/components/ui/Button';

function PropertiesPage(): ReactElement {
  const dispatch = useAppDispatch();
  const properties = useAppSelector(selectProperties);
  const isLoading = useAppSelector(selectPropertiesLoading);
  const [displayOption, setDisplayOption] = useState<PropertiesDisplayOption>(
    PropertiesDisplayOption.CardView
  );

  useEffect(() => {
    if (properties.length === 0) {
      dispatch(fetchPropertiesThunk({}));
    }
  }, [dispatch, properties.length]);

  const toggleDisplayOption = (): void => {
    setDisplayOption((prev) =>
      prev === PropertiesDisplayOption.CardView
        ? PropertiesDisplayOption.ListView
        : PropertiesDisplayOption.CardView
    );
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Properties</h1>
          <Button onClick={toggleDisplayOption} variant="outline">
            {displayOption === PropertiesDisplayOption.CardView ? 'List View' : 'Card View'}
          </Button>
        </div>

        {isLoading && properties.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No properties found
          </div>
        ) : (
          <PropertiesList
            displayOption={displayOption}
            properties={properties}
            enableOwnedBadge={true}
            enablePopupOptions={true}
          />
        )}
      </div>
    </div>
  );
}

export default PropertiesPage;
