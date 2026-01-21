import { useState, useMemo, useCallback, useRef, useEffect, type ReactElement, type ChangeEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { useAppSelector } from '@/store';
import { useEnquiries, useDeleteEnquiry } from '@/hooks';
import { NeedSigninContinue, Footer, EnquiryBadge, ActionPopup, Card, Badge } from '@/components/ui';
import type { Enquiry, EnquiryTopic } from '@/types';

interface FilterOption {
  value: string;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'info', label: 'Information' },
  { value: 'sales', label: 'Sales' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'payment', label: 'Payment' },
  { value: 'sent', label: 'Sent' },
  { value: 'received', label: 'Received' },
];

const SORT_OPTIONS: FilterOption[] = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title', label: 'Title' },
];

function sortByDate<T extends { createdAt?: string }>(
  items: T[],
  latest = true
): T[] {
  return [...items].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return latest ? dateB - dateA : dateA - dateB;
  });
}

function sortByName<T extends { subject?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const nameA = (a.subject || '').toLowerCase();
    const nameB = (b.subject || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

interface EnquiriesListItemProps {
  enquiry: Enquiry;
  isSent: boolean;
  onSelect: (enquiry: Enquiry) => void;
  onDelete: (enquiryId: string) => void;
  onReply: (enquiry: Enquiry) => void;
}

function EnquiriesListItem({
  enquiry,
  isSent,
  onSelect,
  onDelete,
  onReply,
}: EnquiriesListItemProps): ReactElement {
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false);
      }
    }

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  const handleActionClick = (event: React.MouseEvent): void => {
    event.stopPropagation();
    setShowPopup((prev) => !prev);
  };

  const handleAction = (action: string): void => {
    setShowPopup(false);
    if (action === 'delete') {
      onDelete(enquiry.enquiry_id);
    } else if (action === 'message') {
      onReply(enquiry);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card
      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 shadow-none border border-slate-200 dark:border-slate-700 relative"
      onClick={() => onSelect(enquiry)}
    >
      <Card.Header className="border-b-0 pb-0">
        <div className="flex items-center gap-2">
          <Badge variant={isSent ? 'default' : 'secondary'} className="capitalize">
            {isSent ? 'sent' : 'received'}
          </Badge>

          {!isSent && !enquiry.read && (
            <Badge variant="warning" className="capitalize">
              Unread
            </Badge>
          )}
        </div>

        <div className="absolute top-2 right-3">
          <button
            ref={buttonRef}
            onClick={handleActionClick}
            className="bg-gray-300 dark:bg-gray-600 rounded-full w-[30px] h-[30px] xl:w-[40px] xl:h-[40px] p-2 flex justify-center items-center hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            <svg
              className="w-4 h-4 text-gray-700 dark:text-gray-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          {showPopup && (
            <div
              ref={popupRef}
              className="absolute right-0 top-full mt-1 z-50"
            >
              <ActionPopup
                showEdit={false}
                showReport={!isSent}
                showMessage={!isSent}
                onAction={handleAction}
                onClose={() => setShowPopup(false)}
              />
            </div>
          )}
        </div>
      </Card.Header>

      <Card.Body className="pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4">
          <div className="lg:col-span-4 text-base font-medium text-gray-800 dark:text-gray-200">
            {enquiry.subject || 'None'}
          </div>

          <div className="lg:col-span-2">
            <EnquiryBadge topic={enquiry.topic as EnquiryTopic} />
          </div>

          <div className="lg:col-span-4 lg:text-center text-gray-600 dark:text-gray-400">
            {enquiry.users.from.email}
          </div>

          <div className="lg:col-span-2 text-gray-600 dark:text-gray-400">
            {formatDate(enquiry.createdAt)}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

interface MultiSelectProps {
  options: FilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
}

function MultiSelect({ options, value, onChange, label }: MultiSelectProps): ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (optionValue: string): void => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="text-gray-500 dark:text-gray-400 mr-2">{label}</span>
        <span className="text-gray-800 dark:text-gray-200">
          {value.length > 0 ? `${value.length} selected` : 'All'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => handleToggle(option.value)}
                className="mr-2 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-gray-800 dark:text-gray-200">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function EnquiriesPage(): ReactElement {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState<string>('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const user = useAppSelector((state) => state.user.user);
  const { data: enquiriesResponse, isLoading } = useEnquiries(!!user);
  const deleteEnquiryMutation = useDeleteEnquiry();

  const search = searchParams.get('search') || '';
  const filterParam = searchParams.get('filter') || '';
  const sortBy = searchParams.get('sort') || 'latest';

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const filterBy = useMemo((): string[] => {
    return filterParam ? filterParam.split(',') : [];
  }, [filterParam]);

  const enquiries = useMemo((): Enquiry[] => {
    if (!enquiriesResponse?.data) return [];
    return enquiriesResponse.data;
  }, [enquiriesResponse]);

  const filteredEnquiries = useMemo((): Enquiry[] => {
    let result = [...enquiries];

    if (search) {
      const textToFind = search.toLowerCase();
      result = result.filter((item) => {
        const subject = (item.subject || '').toLowerCase();
        const email = (item.users.from.email || '').toLowerCase();
        return subject.includes(textToFind) || email.includes(textToFind);
      });
    }

    if (filterBy.length > 0) {
      const isSentFilter = filterBy.includes('sent');
      const isReceivedFilter = filterBy.includes('received');
      const otherFilters = filterBy.filter((f) => !['sent', 'received'].includes(f));

      result = result.filter((item) => {
        if (isSentFilter && user?.user_id !== item.users.from.user_id) return false;
        if (isReceivedFilter && user?.user_id === item.users.from.user_id) return false;
        if (otherFilters.length > 0 && !otherFilters.includes(item.topic)) return false;
        return true;
      });
    }

    switch (sortBy) {
      case 'title':
        return sortByName(result);
      case 'oldest':
        return sortByDate(result, false);
      default:
        return sortByDate(result, true);
    }
  }, [enquiries, search, filterBy, sortBy, user?.user_id]);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const value = event.target.value;
      setSearchInput(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (value) {
            newParams.set('search', value);
          } else {
            newParams.delete('search');
          }
          return newParams;
        });
      }, 1300);
    },
    [setSearchParams]
  );

  const handleFilterChange = useCallback(
    (value: string[]): void => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (value && value.length > 0) {
          newParams.set('filter', value.join(','));
        } else {
          newParams.delete('filter');
        }
        return newParams;
      });
    },
    [setSearchParams]
  );

  const handleSortChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>): void => {
      const value = event.target.value;
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (value && value !== 'latest') {
          newParams.set('sort', value);
        } else {
          newParams.delete('sort');
        }
        return newParams;
      });
    },
    [setSearchParams]
  );

  const handleSelectEnquiry = useCallback(
    (enquiry: Enquiry): void => {
      navigate(`/enquiries/${enquiry.enquiry_id}`);
    },
    [navigate]
  );

  const handleDeleteEnquiry = useCallback(
    (enquiryId: string): void => {
      if (window.confirm('Are you sure you want to delete this enquiry?')) {
        deleteEnquiryMutation.mutate(enquiryId);
      }
    },
    [deleteEnquiryMutation]
  );

  const handleReplyEnquiry = useCallback(
    (enquiry: Enquiry): void => {
      navigate(`/enquiries/${enquiry.enquiry_id}?reply=true`);
    },
    [navigate]
  );

  const isSent = useCallback(
    (enquiry: Enquiry): boolean => {
      return user?.user_id === enquiry.users.from.user_id;
    },
    [user?.user_id]
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-3 xl:px-4 py-3">
          <h1 className="text-[16px] md:text-[18px] font-semibold text-gray-800 dark:text-gray-200">
            Enquiries Page
          </h1>
        </div>

        <div className="max-w-screen-2xl mx-auto px-3 xl:px-4 pb-3">
          <div className="relative mb-3">
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search Enquiry"
              className="w-full px-4 py-2 pl-10 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MultiSelect
              options={FILTER_OPTIONS}
              value={filterBy}
              onChange={handleFilterChange}
              label="Filter:"
            />

            <div>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200"
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

      <main className="flex-1">
        {!user ? (
          <NeedSigninContinue />
        ) : (
          <div className="max-w-screen-2xl mx-auto h-full pt-4 xl:pt-8">
            {isLoading && (
              <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div className="h-full bg-blue-500 animate-pulse w-full" />
              </div>
            )}

            <div className="px-3 md:px-5">
              <Card className="hidden lg:block mb-3 shadow-none border border-slate-200 dark:border-slate-700">
                <Card.Body>
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                      <span className="text-[19px] font-bold text-gray-800 dark:text-gray-200">
                        Message <small className="text-gray-500">({filteredEnquiries.length})</small>
                      </span>
                    </div>

                    <div className="col-span-2">
                      <span className="text-[19px] font-bold text-gray-800 dark:text-gray-200">Topic</span>
                    </div>

                    <div className="col-span-4 text-center">
                      <span className="text-[19px] font-bold text-gray-800 dark:text-gray-200">
                        Email Address
                      </span>
                    </div>

                    <div className="col-span-2">
                      <span className="text-[19px] font-bold text-gray-800 dark:text-gray-200">Date</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {filteredEnquiries.length > 0 ? (
                <div className="flex flex-col gap-2 lg:gap-3">
                  {filteredEnquiries.map((enquiry) => (
                    <EnquiriesListItem
                      key={enquiry.enquiry_id}
                      enquiry={enquiry}
                      isSent={isSent(enquiry)}
                      onSelect={handleSelectEnquiry}
                      onDelete={handleDeleteEnquiry}
                      onReply={handleReplyEnquiry}
                    />
                  ))}
                </div>
              ) : (
                <div className="font-semibold py-8 text-center text-[24px] text-gray-600 dark:text-gray-300">
                  Currently empty.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default EnquiriesPage;
