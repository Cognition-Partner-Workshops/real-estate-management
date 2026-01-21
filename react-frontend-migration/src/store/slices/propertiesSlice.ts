import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Property, PaginationCursors, PropertyFilters, PropertySort } from '@/types';

interface PropertiesState {
  properties: Property[];
  ownedProperties: Property[];
  selectedProperty: Property | null;
  isLoading: boolean;
  hasMore: boolean;
  cursors: PaginationCursors;
  filters: PropertyFilters;
  sort: PropertySort;
  search: string;
}

const initialState: PropertiesState = {
  properties: [],
  ownedProperties: [],
  selectedProperty: null,
  isLoading: false,
  hasMore: true,
  cursors: {},
  filters: {},
  sort: { field: 'createdAt', direction: 'desc' },
  search: '',
};

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setProperties: (state, action: PayloadAction<Property[]>) => {
      state.properties = action.payload;
    },
    appendProperties: (state, action: PayloadAction<Property[]>) => {
      state.properties = [...state.properties, ...action.payload];
    },
    setOwnedProperties: (state, action: PayloadAction<Property[]>) => {
      state.ownedProperties = action.payload;
    },
    setSelectedProperty: (state, action: PayloadAction<Property | null>) => {
      state.selectedProperty = action.payload;
    },
    addProperty: (state, action: PayloadAction<Property>) => {
      state.properties = [action.payload, ...state.properties];
      state.ownedProperties = [action.payload, ...state.ownedProperties];
    },
    updateProperty: (state, action: PayloadAction<Property>) => {
      const index = state.properties.findIndex(
        (p) => p.property_id === action.payload.property_id
      );
      if (index !== -1) {
        state.properties[index] = action.payload;
      }
      const ownedIndex = state.ownedProperties.findIndex(
        (p) => p.property_id === action.payload.property_id
      );
      if (ownedIndex !== -1) {
        state.ownedProperties[ownedIndex] = action.payload;
      }
      if (state.selectedProperty?.property_id === action.payload.property_id) {
        state.selectedProperty = action.payload;
      }
    },
    removeProperty: (state, action: PayloadAction<string>) => {
      state.properties = state.properties.filter(
        (p) => p.property_id !== action.payload
      );
      state.ownedProperties = state.ownedProperties.filter(
        (p) => p.property_id !== action.payload
      );
      if (state.selectedProperty?.property_id === action.payload) {
        state.selectedProperty = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    setCursors: (state, action: PayloadAction<PaginationCursors>) => {
      state.cursors = action.payload;
    },
    setFilters: (state, action: PayloadAction<PropertyFilters>) => {
      state.filters = action.payload;
    },
    setSort: (state, action: PayloadAction<PropertySort>) => {
      state.sort = action.payload;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    resetState: (state) => {
      state.properties = [];
      state.hasMore = true;
      state.cursors = {};
    },
  },
});

export const {
  setProperties,
  appendProperties,
  setOwnedProperties,
  setSelectedProperty,
  addProperty,
  updateProperty,
  removeProperty,
  setLoading,
  setHasMore,
  setCursors,
  setFilters,
  setSort,
  setSearch,
  resetState,
} = propertiesSlice.actions;

export default propertiesSlice.reducer;
