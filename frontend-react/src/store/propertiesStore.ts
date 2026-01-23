import { create } from 'zustand';
import type { Property, PaginationCursors } from '@/types';

interface PropertiesState {
  properties: Property[];
  ownedProperties: Property[];
  cursors: PaginationCursors;
  hasMore: boolean;
  isLoading: boolean;
  setProperties: (properties: Property[]) => void;
  appendProperties: (properties: Property[]) => void;
  setOwnedProperties: (properties: Property[]) => void;
  addProperty: (property: Property) => void;
  updateProperty: (propertyId: string, updates: Partial<Property>) => void;
  removeProperty: (propertyId: string) => void;
  setCursors: (cursors: PaginationCursors) => void;
  setHasMore: (hasMore: boolean) => void;
  setLoading: (loading: boolean) => void;
  resetState: (options?: { skipOwned?: boolean }) => void;
}

export const usePropertiesStore = create<PropertiesState>((set) => ({
  properties: [],
  ownedProperties: [],
  cursors: {},
  hasMore: true,
  isLoading: false,

  setProperties: (properties) => set({ properties }),

  appendProperties: (newProperties) =>
    set((state) => ({
      properties: [...state.properties, ...newProperties],
    })),

  setOwnedProperties: (ownedProperties) => set({ ownedProperties }),

  addProperty: (property) =>
    set((state) => ({
      properties: [...state.properties, property],
      ownedProperties: [...state.ownedProperties, property],
    })),

  updateProperty: (propertyId, updates) =>
    set((state) => ({
      properties: state.properties.map((p) =>
        p.property_id === propertyId ? { ...p, ...updates } : p
      ),
      ownedProperties: state.ownedProperties.map((p) =>
        p.property_id === propertyId ? { ...p, ...updates } : p
      ),
    })),

  removeProperty: (propertyId) =>
    set((state) => ({
      properties: state.properties.filter((p) => p.property_id !== propertyId),
      ownedProperties: state.ownedProperties.filter(
        (p) => p.property_id !== propertyId
      ),
    })),

  setCursors: (cursors) => set({ cursors }),

  setHasMore: (hasMore) => set({ hasMore }),

  setLoading: (loading) => set({ isLoading: loading }),

  resetState: (options) =>
    set((state) => ({
      properties: [],
      cursors: {},
      hasMore: true,
      isLoading: false,
      ownedProperties: options?.skipOwned ? state.ownedProperties : [],
    })),
}));
