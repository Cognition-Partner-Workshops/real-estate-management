import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactElement,
} from 'react';
import { createPortal } from 'react-dom';

interface ModalSearchProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: T) => void;
  title?: string;
  placeholder?: string;
  items?: T[];
  displayProperty?: keyof T;
  searchFunction?: (text: string) => Promise<T[]>;
  debounceMs?: number;
}

function ModalSearch<T>({
  isOpen,
  onClose,
  onSelect,
  title = 'Search',
  placeholder = 'Search...',
  items = [],
  displayProperty,
  searchFunction,
  debounceMs = 1000,
}: ModalSearchProps<T>): ReactElement | null {
  const [itemsDisplayed, setItemsDisplayed] = useState<T[]>(items);
  const [progress, setProgress] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setItemsDisplayed(items);
  }, [items]);

  useEffect(() => {
    if (isOpen) {
      const focusTimer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => clearTimeout(focusTimer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const performSearch = useCallback(
    async (text: string): Promise<void> => {
      setItemsDisplayed([]);
      setProgress(true);

      if (searchFunction && text.length > 3) {
        const results = await searchFunction(text);
        setItemsDisplayed(results);
        setProgress(false);
      } else {
        const results = items.filter((item) => {
          const valueToSearch = displayProperty
            ? String(item[displayProperty])
            : String(item);
          return valueToSearch.toLowerCase().includes(text.toLowerCase());
        });

        setTimeout(() => {
          setItemsDisplayed(results);
          setProgress(false);
        }, 500);
      }
    },
    [items, displayProperty, searchFunction]
  );

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const text = event.target.value;
    setSearchText(text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (text.length === 0) {
      setItemsDisplayed(items);
      setProgress(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      void performSearch(text);
    }, debounceMs);
  };

  const handleSelect = (item: T): void => {
    onSelect(item);
  };

  const handleClose = (): void => {
    setSearchText('');
    setItemsDisplayed(items);
    setProgress(false);
    onClose();
  };

  const getDisplayValue = (item: T): string => {
    if (displayProperty) {
      return String(item[displayProperty]);
    }
    return String(item);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      <div className="relative flex flex-col bg-white w-full h-full md:max-w-lg md:max-h-[80vh] md:m-auto md:rounded-lg md:h-auto overflow-hidden">
        <div className="bg-blue-600 text-white">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="px-4 pb-3 border-t border-blue-500">
            <input
              ref={inputRef}
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              placeholder={placeholder}
              className="w-full mt-3 px-4 py-2 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50">
          {progress && (
            <div className="w-full h-1 bg-gray-200 overflow-hidden">
              <div className="h-full bg-blue-600 animate-pulse w-full" />
            </div>
          )}

          {!progress && itemsDisplayed.length === 0 && searchText.length > 0 && (
            <div className="p-4 text-center text-gray-500">
              No results found
            </div>
          )}

          {!progress && (
            <ul className="divide-y divide-gray-200">
              {itemsDisplayed.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleSelect(item)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100"
                  >
                    <span className="text-gray-800">
                      {getDisplayValue(item)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ModalSearch;
