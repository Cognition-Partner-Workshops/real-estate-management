import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactElement,
  type ChangeEvent,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '@/store';
import {
  fetchPropertiesThunk,
  setFilters,
  setSort,
  setSearch,
  resetState,
  selectProperties,
  selectPropertiesLoading,
  selectPropertiesLoadingMore,
  selectPropertiesHasMore,
} from '@/store/slices/propertiesSlice';
import { NotificationBell, PropertyBadge, Skeleton } from '@/components/ui';
import type { Property, PropertyType, TransactionType, PropertySort } from '@/types';
import { PropertiesDisplayOption } from '@/types';

interface FilterOption {
  value: string;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'residential', label: 'Residential type' },
  { value: 'commercial', label: 'Commercial type' },
  { value: 'industrial', label: 'Industrial type' },
  { value: 'land', label: 'Land type' },
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
];

const SORT_OPTIONS: FilterOption[] = [
  { value: 'latest', label: 'Latest' },
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
];

function formatCurrency(amount: number, currency = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface PropertyCardProps {
  property: Property;
  isOwned: boolean;
  onClick: () => void;
}

function PropertyCard({ property, isOwned, onClick }: PropertyCardProps): ReactElement {
  const imageUrl = property.images?.[0] || '/assets/images/no-image.jpeg';
  const isForRent = property.transactionType === 'rent';

  return (
    <div className="relative flex flex-col w-full max-w-[360px] h-full bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      <div
        className={`z-10 absolute rounded-br-lg py-1 px-3 font-bold bg-opacity-80 text-white ${
          isOwned ? 'bg-blue-500' : isForRent ? 'bg-yellow-500' : 'bg-green-500'
        }`}
      >
        {isOwned ? 'Owned' : `For ${property.transactionType}`}
      </div>

      <div
        className="h-[230px] overflow-hidden cursor-pointer group"
        onClick={onClick}
      >
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          src={imageUrl}
          alt={property.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/images/no-image.jpeg';
          }}
        />
      </div>

      <div className="py-2 px-3">
        <PropertyBadge type={property.type} />
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 truncate mt-1">
          {property.name}
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(property.createdAt)}
        </div>
      </div>

      <div className="flex flex-col px-3 pb-3 flex-grow">
        <div className="h-[60px] mb-3 overflow-hidden">
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            {property.description}
          </p>
        </div>

        <div className="font-bold text-lg text-gray-800 dark:text-gray-200 mt-auto">
          {formatCurrency(property.price, property.currency)}
          {isForRent && property.paymentFrequency && (
            <span className="text-base font-normal capitalize">
              {' '}
              | {property.paymentFrequency}
            </span>
          )}
        </div>

        <button
          onClick={onClick}
          className="mt-3 w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
        >
          View property
        </button>
      </div>
    </div>
  );
}

interface PropertyListItemProps {
  property: Property;
  isOwned: boolean;
  onClick: () => void;
}

function PropertyListItem({ property, isOwned, onClick }: PropertyListItemProps): ReactElement {
  const imageUrl = property.images?.[0] || '/assets/images/no-image.jpeg';
  const isForRent = property.transactionType === 'rent';

  return (
    <div
      className="flex flex-col sm:flex-row gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="relative w-full sm:w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg">
        <img
          className="w-full h-full object-cover"
          src={imageUrl}
          alt={property.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/images/no-image.jpeg';
          }}
        />
        <div
          className={`absolute top-0 left-0 rounded-br-lg py-1 px-2 text-xs font-bold text-white ${
            isOwned ? 'bg-blue-500' : isForRent ? 'bg-yellow-500' : 'bg-green-500'
          }`}
        >
          {isOwned ? 'Owned' : `For ${property.transactionType}`}
        </div>
      </div>

      <div className="flex flex-col flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <PropertyBadge type={property.type} />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(property.createdAt)}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
          {property.name}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
          {property.description}
        </p>

        <div className="font-bold text-lg text-gray-800 dark:text-gray-200 mt-auto pt-2">
          {formatCurrency(property.price, property.currency)}
          {isForRent && property.paymentFrequency && (
            <span className="text-base font-normal capitalize">
              {' '}
              | {property.paymentFrequency}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PropertiesPage(): ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const properties = useAppSelector(selectProperties);
  const isLoading = useAppSelector(selectPropertiesLoading);
  const isLoadingMore = useAppSelector(selectPropertiesLoadingMore);
  const hasMore = useAppSelector(selectPropertiesHasMore);
  const currentUser = useAppSelector((state) => state.user.user);

  const [searchText, setSearchText] = useState<string>(searchParams.get('search') || '');
  const [selectedFilters, setSelectedFilters] = useState<string[]>(() => {
    const filterParam = searchParams.get('filter');
    return filterParam ? filterParam.split(',') : [];
  });
  const [selectedSort, setSelectedSort] = useState<string>(searchParams.get('sort') || 'latest');
  const [displayOption, setDisplayOption] = useState<PropertiesDisplayOption>(
    PropertiesDisplayOption.CardView
  );
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState<boolean>(false);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const initialFetchDone = useRef<boolean>(false);

  const sortMapping: Record<string, PropertySort> = useMemo(
    () => ({
      latest: { field: 'createdAt', direction: 'desc' },
      name: { field: 'name', direction: 'asc' },
      price: { field: 'price', direction: 'asc' },
    }),
    []
  );

  const fetchProperties = useCallback(
    (append = false): void => {
      const typeFilters = selectedFilters.filter((f) =>
        ['residential', 'commercial', 'industrial', 'land'].includes(f)
      );
      const transactionFilters = selectedFilters.filter((f) => ['sale', 'rent'].includes(f));

      const filter: { type?: PropertyType; transactionType?: TransactionType } = {};
      if (typeFilters.length === 1) {
        filter.type = typeFilters[0] as PropertyType;
      }
      if (transactionFilters.length === 1) {
        filter.transactionType = transactionFilters[0] as TransactionType;
      }

      dispatch(setFilters(filter));
      dispatch(setSort(sortMapping[selectedSort] || sortMapping.latest));
      dispatch(setSearch(searchText));

      dispatch(
        fetchPropertiesThunk({
          filter,
          sort: sortMapping[selectedSort] || sortMapping.latest,
          search: searchText,
          append,
        })
      );
    },
    [dispatch, selectedFilters, selectedSort, searchText, sortMapping]
  );

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      dispatch(resetState());
      fetchProperties(false);
    }
  }, [dispatch, fetchProperties]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchText) params.set('search', searchText);
    if (selectedFilters.length > 0) params.set('filter', selectedFilters.join(','));
    if (selectedSort !== 'latest') params.set('sort', selectedSort);
    setSearchParams(params, { replace: true });
  }, [searchText, selectedFilters, selectedSort, setSearchParams]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
    }

    if (isFilterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          fetchProperties(true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, isLoadingMore, fetchProperties]);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const value = event.target.value;
      setSearchText(value);

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }

      searchDebounceRef.current = setTimeout(() => {
        dispatch(resetState());
        fetchProperties(false);
      }, 700);
    },
    [dispatch, fetchProperties]
  );

  const handleFilterChange = useCallback((filterValue: string): void => {
    setSelectedFilters((prev) => {
      const newFilters = prev.includes(filterValue)
        ? prev.filter((f) => f !== filterValue)
        : [...prev, filterValue];
      return newFilters;
    });
  }, []);

  const applyFilters = useCallback((): void => {
    setIsFilterDropdownOpen(false);
    dispatch(resetState());
    fetchProperties(false);
  }, [dispatch, fetchProperties]);

  const handleSortChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>): void => {
      const value = event.target.value;
      setSelectedSort(value);
      dispatch(resetState());
      setTimeout(() => fetchProperties(false), 0);
    },
    [dispatch, fetchProperties]
  );

  const handlePropertyClick = useCallback(
    (propertyId: string): void => {
      navigate(`/properties/${propertyId}`);
    },
    [navigate]
  );

  const handleNewProperty = useCallback((): void => {
    if (!currentUser) {
      navigate('/user/signin');
      return;
    }
    navigate('/properties/new');
  }, [currentUser, navigate]);

  const isPropertyOwned = useCallback(
    (property: Property): boolean => {
      return currentUser?.user_id === property.user_id;
    },
    [currentUser]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto px-3 xl:px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200">
            Properties Page
          </h1>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg lg:hidden"
              aria-label="Menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-3 xl:px-4 pb-4">
          <div className="relative mb-3">
            <input
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              placeholder="Search Property"
              className="w-full px-4 py-3 pl-10 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="w-full px-4 py-2 text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between text-gray-800 dark:text-gray-200"
              >
                <span>
                  Filter:{' '}
                  {selectedFilters.length > 0
                    ? `${selectedFilters.length} selected`
                    : 'None'}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isFilterDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-30">
                  <div className="p-3 space-y-2">
                    {FILTER_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer text-gray-800 dark:text-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(option.value)}
                          onChange={() => handleFilterChange(option.value)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 p-3 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedFilters([]);
                        setIsFilterDropdownOpen(false);
                        dispatch(resetState());
                        fetchProperties(false);
                      }}
                      className="flex-1 py-2 px-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      Clear
                    </button>
                    <button
                      onClick={applyFilters}
                      className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <select
                value={selectedSort}
                onChange={handleSortChange}
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort by: {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <button
        onClick={handleNewProperty}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center lg:hidden"
        aria-label="Add new property"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      <main className="max-w-screen-2xl mx-auto px-3 xl:px-4 py-6 xl:py-8">
        {isLoading && properties.length === 0 && (
          <div className="w-full">
            <div className="h-1 bg-blue-500 animate-pulse rounded-full mb-4" />
          </div>
        )}

        <div className="hidden lg:flex items-center justify-between mb-4 lg:mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xl lg:text-2xl font-medium text-gray-800 dark:text-gray-200">
              List of Properties
            </span>

            <button
              onClick={() => setDisplayOption(PropertiesDisplayOption.CardView)}
              disabled={displayOption === PropertiesDisplayOption.CardView}
              className={`p-2 rounded-lg ${
                displayOption === PropertiesDisplayOption.CardView
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label="Card view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>

            <button
              onClick={() => setDisplayOption(PropertiesDisplayOption.ListView)}
              disabled={displayOption === PropertiesDisplayOption.ListView}
              className={`p-2 rounded-lg ${
                displayOption === PropertiesDisplayOption.ListView
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label="List view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          <button
            onClick={handleNewProperty}
            className="py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg flex items-center gap-2"
          >
            New Property
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>

        {displayOption === PropertiesDisplayOption.CardView ? (
          <section className="flex justify-center py-4 md:py-3">
            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {properties.map((property) => (
                <li key={property.property_id} className="col-span-1 flex justify-center">
                  <PropertyCard
                    property={property}
                    isOwned={isPropertyOwned(property)}
                    onClick={() => handlePropertyClick(property.property_id)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="flex flex-col gap-2 lg:gap-3">
            {properties.map((property) => (
              <PropertyListItem
                key={property.property_id}
                property={property}
                isOwned={isPropertyOwned(property)}
                onClick={() => handlePropertyClick(property.property_id)}
              />
            ))}
          </section>
        )}

        {properties.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <p className="text-lg">No properties found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}

        <div ref={loadMoreRef} className="py-8 flex justify-center">
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Skeleton className="w-8 h-8 rounded-full" />
              <span>Loading more properties...</span>
            </div>
          )}
          {!hasMore && properties.length > 0 && (
            <p className="text-gray-500 dark:text-gray-400">No more properties to load</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default PropertiesPage;
