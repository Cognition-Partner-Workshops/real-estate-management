import { useEffect, useCallback, useRef, type ReactElement, type ChangeEvent } from 'react';

import { useStorage } from '@/hooks/useStorage';
import { useAppDispatch, useAppSelector } from '@/store';
import { setDarkMode } from '@/store/slices/uiSlice';

const applyThemeToDOM = (dark: boolean): void => {
  if (dark) {
    document.documentElement.classList.add('ion-palette-dark');
    document.body.classList.add('dark');
  } else {
    document.documentElement.classList.remove('ion-palette-dark');
    document.body.classList.remove('dark');
  }
};

function SettingsTheme(): ReactElement {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.ui.isDarkMode);
  const { getDarkTheme, setDarkTheme } = useStorage();
  const isInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isInitializedRef.current) {
      const storedTheme = getDarkTheme();
      if (storedTheme !== null) {
        dispatch(setDarkMode(storedTheme));
        applyThemeToDOM(storedTheme);
      }
      isInitializedRef.current = true;
    }
  }, [dispatch, getDarkTheme]);

  const handleThemeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const checked = event.target.checked;
      dispatch(setDarkMode(checked));
      setDarkTheme(checked);
      applyThemeToDOM(checked);
    },
    [dispatch, setDarkTheme]
  );


  return (
    <div className="mt-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          Change Application Theme
        </h2>
      </div>
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center gap-3">
          {isDarkMode ? (
            <svg
              className="w-6 h-6 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span className="text-gray-700 dark:text-gray-200 font-medium">
            Theme Switcher
          </span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={handleThemeChange}
            className="sr-only peer"
            aria-label="Toggle dark mode"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
        </label>
      </div>
    </div>
  );
}

export default SettingsTheme;
