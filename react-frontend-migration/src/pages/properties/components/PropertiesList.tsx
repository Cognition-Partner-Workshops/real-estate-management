import { useCallback, useMemo, useEffect, useRef, useState, type ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  fetchPropertiesThunk,
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
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasMore = useAppSelector(selectPropertiesHasMore);
  const isLoadingMore = useAppSelector(selectPropertiesLoadingMore);

  const sort = searchParams.get('sort') || 'latest';
  const search = searchParams.get('search') || '';
  const filter = searchParams.get('filter') || '';

  const properties = externalProperties ?? [];

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
    if (isLoadingLocal || isLoadingMore || !hasMore || disableInfiniteScroll) {
      return;
    }

    setIsLoadingLocal(true);

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

    try {
      await dispatch(
        fetchPropertiesThunk({
          sort: sortParam,
          filter: filterParam,
          search,
          append: true,
        })
      );
    } finally {
      setIsLoadingLocal(false);
    }
  }, [dispatch, sort, filter, search, hasMore, isLoadingLocal, isLoadingMore, disableInfiniteScroll]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoadingLocal && !isLoadingMore && !disableInfiniteScroll) {
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
          debounceTimerRef.current = setTimeout(() => {
            loadMoreProperties();
          }, 500);
        }
      },
      {
        root: null,
        rootMargin: '80px',
        threshold: 0.1,
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return (): void => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [loadMoreProperties, hasMore, isLoadingLocal, isLoadingMore, disableInfiniteScroll]);

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

      {!isInfiniteScrollDisabled && (
        <div ref={loadMoreRef} className="py-8 flex justify-center items-center">
          {(isLoadingLocal || isLoadingMore) && (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-500">Loading data...</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export { PropertiesList };
export default PropertiesList;
