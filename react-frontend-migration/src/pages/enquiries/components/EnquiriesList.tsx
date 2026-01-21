import { useMemo, type ReactElement } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { selectEnquiries, selectEnquiriesLoading } from '@/store/slices/enquiriesSlice';
import EnquiriesListItem from './EnquiriesListItem';
import type { Enquiry } from '@/types';

type SortOption = 'latest' | 'oldest' | 'title';

function sortEnquiriesBySubject(items: Enquiry[], asc = true): Enquiry[] {
  return [...items].sort((a, b) => {
    const aValue = (a.title || '').toLowerCase();
    const bValue = (b.title || '').toLowerCase();
    if (!asc) {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
  });
}

function sortEnquiriesByDate(items: Enquiry[], latest = true): Enquiry[] {
  return [...items].sort((a, b) => {
    const aDate = new Date(a.createdAt || 0).getTime();
    const bDate = new Date(b.createdAt || 0).getTime();
    if (!latest) {
      return aDate > bDate ? 1 : aDate < bDate ? -1 : 0;
    }
    return aDate < bDate ? 1 : aDate > bDate ? -1 : 0;
  });
}

function EnquiriesList(): ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const enquiries = useAppSelector(selectEnquiries);
  const isLoading = useAppSelector(selectEnquiriesLoading);
  const currentUserId = useAppSelector((state) => state.user.user?.user_id);

  const search = searchParams.get('search') || '';
  const sort = (searchParams.get('sort') as SortOption) || 'latest';
  const filter = searchParams.get('filter') || '';

  const searchEnquiries = (items: Enquiry[], searchText: string): Enquiry[] => {
    if (!searchText) {
      return items;
    }
    const textToFind = searchText.toLowerCase();
    return items.filter((item) => {
      const subject = (item.title || '').toLowerCase();
      const email = (item.users.from.email || '').toLowerCase();
      return subject.includes(textToFind) || email.includes(textToFind);
    });
  };

  const filterEnquiries = (items: Enquiry[], filterValue: string): Enquiry[] => {
    if (!filterValue) {
      return items;
    }

    const filters = filterValue.split(',');
    const isSent = filters.includes('sent');
    const isReceived = filters.includes('received');
    const otherFilters = filters.filter((f) => !['sent', 'received'].includes(f));

    return items.filter((item) => {
      if (isSent && currentUserId !== item.users.from.user_id) {
        return false;
      }
      if (isReceived && currentUserId === item.users.from.user_id) {
        return false;
      }
      if (otherFilters.length > 0 && !otherFilters.includes(item.topic)) {
        return false;
      }
      return true;
    });
  };

  const sortEnquiries = (items: Enquiry[], sortBy: SortOption): Enquiry[] => {
    switch (sortBy) {
      case 'title':
        return sortEnquiriesBySubject(items);
      case 'oldest':
        return sortEnquiriesByDate(items, false);
      default:
        return sortEnquiriesByDate(items);
    }
  };

  const enquiriesList = useMemo((): Enquiry[] => {
    let result = [...enquiries];
    result = searchEnquiries(result, search);
    result = filterEnquiries(result, filter);
    result = sortEnquiries(result, sort);
    return result;
  }, [enquiries, search, filter, sort, currentUserId]);

  const handleSelectEnquiry = (enquiry: Enquiry): void => {
    navigate(`/enquiries/${enquiry.enquiry_id}`);
  };

  if (isLoading) {
    return (
      <div className="px-3 md:px-5">
        <div className="flex flex-col gap-2 lg:gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-slate-800 p-4 animate-pulse"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 md:px-5">
      <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-slate-800 mb-3">
        <div className="p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Message <small className="text-gray-500">({enquiriesList.length})</small>
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-lg font-bold text-gray-800 dark:text-gray-200">Topic</span>
            </div>

            <div className="col-span-4 text-center">
              <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Email Address
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-lg font-bold text-gray-800 dark:text-gray-200">Date</span>
            </div>
          </div>
        </div>
      </div>

      {enquiriesList.length > 0 ? (
        <div className="flex flex-col gap-2 lg:gap-3">
          {enquiriesList.map((item) => (
            <EnquiriesListItem
              key={item.enquiry_id}
              enquiry={item}
              onClick={() => handleSelectEnquiry(item)}
            />
          ))}
        </div>
      ) : (
        <div className="font-semibold py-8 text-center text-2xl text-gray-600 dark:text-gray-300">
          Currently empty.
        </div>
      )}
    </div>
  );
}

export default EnquiriesList;
