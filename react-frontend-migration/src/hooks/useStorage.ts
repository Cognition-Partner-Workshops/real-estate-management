import { useCallback } from 'react';

import type { Coord } from '@/types/property';
import type { UserSignedIn } from '@/types/user';

const STORAGE_KEYS = {
  IS_DARK: 'isDark',
  COORD: 'coord',
  USER: 'user',
} as const;

interface UseStorageReturn {
  set: <T>(key: string, value: T) => void;
  get: <T>(key: string) => T | null;
  remove: (key: string) => void;
  setDarkTheme: (value: boolean) => void;
  getDarkTheme: () => boolean | null;
  setCoord: (coord: Coord) => void;
  getCoord: () => Coord | null;
  setUser: (user: UserSignedIn) => void;
  getUser: () => UserSignedIn | null;
  removeUser: () => void;
}

export function useStorage(): UseStorageReturn {
  const set = useCallback(<T>(key: string, value: T): void => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, []);

  const get = useCallback(<T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error getting localStorage key "${key}":`, error);
      return null;
    }
  }, []);

  const remove = useCallback((key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, []);

  const setDarkTheme = useCallback((value: boolean): void => {
    set(STORAGE_KEYS.IS_DARK, value);
  }, [set]);

  const getDarkTheme = useCallback((): boolean | null => {
    return get<boolean>(STORAGE_KEYS.IS_DARK);
  }, [get]);

  const setCoord = useCallback((coord: Coord): void => {
    set(STORAGE_KEYS.COORD, coord);
  }, [set]);

  const getCoord = useCallback((): Coord | null => {
    return get<Coord>(STORAGE_KEYS.COORD);
  }, [get]);

  const setUser = useCallback((user: UserSignedIn): void => {
    set(STORAGE_KEYS.USER, user);
  }, [set]);

  const getUser = useCallback((): UserSignedIn | null => {
    return get<UserSignedIn>(STORAGE_KEYS.USER);
  }, [get]);

  const removeUser = useCallback((): void => {
    remove(STORAGE_KEYS.USER);
  }, [remove]);

  return {
    set,
    get,
    remove,
    setDarkTheme,
    getDarkTheme,
    setCoord,
    getCoord,
    setUser,
    getUser,
    removeUser,
  };
}
