import { useCallback, useMemo, type ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IonInfiniteScroll, IonInfiniteScrollContent, IonRow } from '@ionic/react';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  fetchPropertiesThunk,
  selectProperties,
  selectPropertiesHasMore,
  selectPropertiesLoadingMore,
} from '@/store/slices/propertiesSlice';
import type { Property, PropertyFilters, PropertySort } from '@/types';
import { PropertiesDisplayOption } from '@/types';
import PropertiesCard from './PropertiesCard';
import PropertiesListItem from './PropertiesListItem';

interface PropertiesListProps {
  displayOption?: PropertiesDisplayOption;
  singleCol?: boolean;
  horizontalSlide?: boolean;
  limit?: number;
  enableOwnedBadge?: boolean;
  enablePopupOptions?: boolean;
  properties?: Property[];
  disableInfiniteScroll?: boolean;
}

function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

function searchProperties(search: string, properties: Property[]): Property[] {
  const searchLower = search.toLowerCase();
  return properties.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower) ||
      p.address?.toLowerCase().includes(searchLower)
  );
}

function filterProperties(filter: string, properties: Property[]): Property[] {
  const filters = filter.split(',');
  return properties.filter((p) => {
    for (const f of filters) {
      const [key, value] = f.split(':');
      if (key === 'type' && p.type !== value) return false;
      if (key === 'transactionType' && p.transactionType !== value) return false;
    }
    return true;
  });
}

function sortProperties(sort: string, properties: Property[]): Property[] {
  const sorted = [...properties];
  switch (sort) {
    case 'latest':
      return sorted.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    case 'oldest':
      return sorted.sort(
        (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      );
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    case 'name-desc':
      return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    default:
      return sorted;
  }
}

function PropertiesList({
  displayOption = PropertiesDisplayOption.CardView,
  singleCol = false,
  limit = 0,
  enableOwnedBadge = false,
  enablePopupOptions = false,
  properties: externalProperties,
  disableInfiniteScroll = false,
}: PropertiesListProps): ReactElement {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const storeProperties = useAppSelector(selectProperties);
  const hasMore = useAppSelector(selectPropertiesHasMore);
  const isLoadingMore = useAppSelector(selectPropertiesLoadingMore);

  const sort = searchParams.get('sort') || 'latest';
  const search = searchParams.get('search') || '';
  const filter = searchParams.get('filter') || '';

  const properties = externalProperties ?? storeProperties;

  const propertiesList = useMemo((): Property[] => {
    if (!properties || properties.length === 0) {
      return [];
    }

    let temp = limit > 0 ? properties.slice(0, limit) : properties;

    if (search) {
      temp = searchProperties(search, temp);
    }
    if (filter) {
      temp = filterProperties(filter, temp);
    }

    temp = sortProperties(sort, temp);

    return temp;
  }, [properties, limit, search, filter, sort]);

  const loadMoreProperties = useCallback(async (): Promise<void> => {
    const sortParam: PropertySort = {
      field: sort === 'price-asc' || sort === 'price-desc' ? 'price' :
             sort === 'name-asc' || sort === 'name-desc' ? 'name' : 'createdAt',
      direction: sort.includes('asc') || sort === 'oldest' ? 'asc' : 'desc',
    };

    const filterParam: PropertyFilters = {};
    if (filter) {
      const filters = filter.split(',');
      for (const f of filters) {
        const [key, value] = f.split(':');
        if (key === 'type') {
          filterParam.type = value as PropertyFilters['type'];
        }
        if (key === 'transactionType') {
          filterParam.transactionType = value as PropertyFilters['transactionType'];
        }
      }
    }

    await dispatch(
      fetchPropertiesThunk({
        sort: sortParam,
        filter: filterParam,
        search,
        append: true,
      })
    );
  }, [dispatch, sort, filter, search]);

  const debouncedLoadMore = useMemo(
    () => debounce(loadMoreProperties, 1000),
    [loadMoreProperties]
  );

  const handleInfiniteScroll = async (event: CustomEvent<void>): Promise<void> => {
    debouncedLoadMore();
    const target = event.target as HTMLIonInfiniteScrollElement;
    setTimeout(() => {
      target.complete();
    }, 1000);
  };

  const isInfiniteScrollDisabled = disableInfiniteScroll || !hasMore;

  return (
    <>
      {displayOption === PropertiesDisplayOption.CardView && (
        <section className="flex justify-center items-center py-4 md:py-3 px-3">
          <ul
            className={`grid grid-cols-1 gap-4 ${
              !singleCol ? 'md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : ''
            }`}
          >
            {propertiesList.map((item) => (
              <li key={item.property_id} className="col-span-1">
                <PropertiesCard property={item} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {displayOption === PropertiesDisplayOption.ListView && (
        <section className="flex flex-col gap-2 lg:gap-3 px-3">
          {propertiesList.map((item) => (
            <PropertiesListItem
              key={item.property_id}
              property={item}
              enableOwnedBadge={enableOwnedBadge}
              enablePopupOptions={enablePopupOptions}
            />
          ))}
        </section>
      )}

      <IonRow>
        <IonInfiniteScroll
          threshold="80px"
          onIonInfinite={handleInfiniteScroll}
          disabled={isInfiniteScrollDisabled}
        >
          <IonInfiniteScrollContent
            className={!isInfiniteScrollDisabled && isLoadingMore ? 'py-12' : ''}
            loadingSpinner="bubbles"
            loadingText="Loading data..."
          />
        </IonInfiniteScroll>
      </IonRow>
    </>
  );
}

export { PropertiesList };
export default PropertiesList;
