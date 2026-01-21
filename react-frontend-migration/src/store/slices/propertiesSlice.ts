import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  Property,
  PaginationCursors,
  PropertyFilters,
  PropertySort,
  ApiError,
} from '@/types';
import * as propertiesApi from '@/api/properties';

interface PropertiesState {
  properties: Property[];
  ownedProperties: Property[];
  selectedProperty: Property | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  cursors: PaginationCursors;
  filters: PropertyFilters;
  sort: PropertySort;
  search: string;
  error: string | null;
}

const initialState: PropertiesState = {
  properties: [],
  ownedProperties: [],
  selectedProperty: null,
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  cursors: {},
  filters: {},
  sort: { field: 'createdAt', direction: 'desc' },
  search: '',
  error: null,
};

interface FetchPropertiesParams {
  sort?: PropertySort;
  filter?: PropertyFilters;
  search?: string;
  limit?: number;
  append?: boolean;
}

export const fetchPropertiesThunk = createAsyncThunk<
  {
    items: Property[];
    lastCreatedAt?: string;
    lastPrice?: number;
    lastName?: string;
    hasMore?: boolean;
    append: boolean;
  },
  FetchPropertiesParams,
  { rejectValue: string; state: { properties: PropertiesState } }
>('properties/fetchProperties', async (params, { rejectWithValue, getState }) => {
  try {
    const state = getState().properties;
    const cursors = params.append ? state.cursors : {};
    
    const response = await propertiesApi.fetchProperties({
      sort: params.sort ?? state.sort,
      filter: params.filter ?? state.filters,
      search: params.search ?? state.search,
      limit: params.limit ?? 12,
      cursors,
    });
    
    if (response.success && response.data) {
      return {
        items: response.data.items,
        lastCreatedAt: response.data.lastCreatedAt,
        lastPrice: response.data.lastPrice,
        lastName: response.data.lastName,
        hasMore: response.data.hasMore ?? false,
        append: params.append ?? false,
      };
    }
    return rejectWithValue(response.error || response.message || 'Failed to fetch properties');
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to fetch properties');
  }
});

export const fetchPropertyThunk = createAsyncThunk<
  Property,
  string,
  { rejectValue: string }
>('properties/fetchProperty', async (id, { rejectWithValue }) => {
  try {
    const response = await propertiesApi.fetchProperty(id);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error || response.message || 'Failed to fetch property');
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to fetch property');
  }
});

export const fetchOwnedPropertiesThunk = createAsyncThunk<
  Property[],
  void,
  { rejectValue: string }
>('properties/fetchOwnedProperties', async (_, { rejectWithValue }) => {
  try {
    const response = await propertiesApi.fetchOwnedProperties();
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error || response.message || 'Failed to fetch owned properties');
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to fetch owned properties');
  }
});

export const createPropertyThunk = createAsyncThunk<
  Property,
  Omit<Property, 'property_id' | 'createdAt' | 'updatedAt' | 'user_id'>,
  { rejectValue: string }
>('properties/createProperty', async (property, { rejectWithValue }) => {
  try {
    const response = await propertiesApi.createProperty(property);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error || response.message || 'Failed to create property');
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to create property');
  }
});

export const updatePropertyThunk = createAsyncThunk<
  Property,
  { id: string; property: Partial<Property> },
  { rejectValue: string }
>('properties/updateProperty', async ({ id, property }, { rejectWithValue }) => {
  try {
    const response = await propertiesApi.updateProperty(id, property);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.error || response.message || 'Failed to update property');
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to update property');
  }
});

export const deletePropertyThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('properties/deleteProperty', async (id, { rejectWithValue }) => {
  try {
    const response = await propertiesApi.deleteProperty(id);
    if (response.success) {
      return id;
    }
    return rejectWithValue(response.error || response.message || 'Failed to delete property');
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to delete property');
  }
});

export const uploadPropertyImagesThunk = createAsyncThunk<
  { propertyId: string; images: string[] },
  { id: string; files: File[] },
  { rejectValue: string }
>('properties/uploadImages', async ({ id, files }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file, file.name);
    });
    
    const response = await propertiesApi.uploadPropertyImages(id, formData);
    if (response.success && response.data) {
      return { propertyId: id, images: response.data };
    }
    return rejectWithValue(response.error || response.message || 'Failed to upload images');
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to upload images');
  }
});

export const deletePropertyImagesThunk = createAsyncThunk<
  { propertyId: string; remainingImages: string[] },
  { id: string; images: string[] },
  { rejectValue: string }
>('properties/deleteImages', async ({ id, images }, { rejectWithValue }) => {
  try {
    const response = await propertiesApi.deletePropertyImages(id, images);
    if (response.success && response.data) {
      return { propertyId: id, remainingImages: response.data };
    }
    return rejectWithValue(response.error || response.message || 'Failed to delete images');
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Failed to delete images');
  }
});

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
    updatePropertyImages: (
      state,
      action: PayloadAction<{ propertyId: string; images: string[] }>
    ) => {
      const { propertyId, images } = action.payload;
      const property = state.properties.find((p) => p.property_id === propertyId);
      if (property) {
        property.images = images;
      }
      const ownedProperty = state.ownedProperties.find(
        (p) => p.property_id === propertyId
      );
      if (ownedProperty) {
        ownedProperty.images = images;
      }
      if (state.selectedProperty?.property_id === propertyId) {
        state.selectedProperty.images = images;
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
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.properties = [];
      state.hasMore = true;
      state.cursors = {};
      state.error = null;
    },
    resetFullState: (state) => {
      state.properties = [];
      state.ownedProperties = [];
      state.selectedProperty = null;
      state.isLoading = false;
      state.isLoadingMore = false;
      state.hasMore = true;
      state.cursors = {};
      state.filters = {};
      state.sort = { field: 'createdAt', direction: 'desc' };
      state.search = '';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPropertiesThunk.pending, (state, action) => {
        if (action.meta.arg.append) {
          state.isLoadingMore = true;
        } else {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchPropertiesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        
        if (action.payload.append) {
          state.properties = [...state.properties, ...action.payload.items];
        } else {
          state.properties = action.payload.items;
        }
        
        state.cursors = {
          lastCreatedAt: action.payload.lastCreatedAt,
          lastPrice: action.payload.lastPrice,
          lastName: action.payload.lastName,
        };
        state.hasMore = action.payload.hasMore ?? false;
        state.error = null;
      })
      .addCase(fetchPropertiesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = action.payload || 'Failed to fetch properties';
      })
      .addCase(fetchPropertyThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPropertyThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProperty = action.payload;
        state.error = null;
      })
      .addCase(fetchPropertyThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch property';
      })
      .addCase(fetchOwnedPropertiesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOwnedPropertiesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ownedProperties = action.payload;
        state.error = null;
      })
      .addCase(fetchOwnedPropertiesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch owned properties';
      })
      .addCase(createPropertyThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPropertyThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.properties = [action.payload, ...state.properties];
        state.ownedProperties = [action.payload, ...state.ownedProperties];
        state.error = null;
      })
      .addCase(createPropertyThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create property';
      })
      .addCase(updatePropertyThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePropertyThunk.fulfilled, (state, action) => {
        state.isLoading = false;
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
        state.error = null;
      })
      .addCase(updatePropertyThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update property';
      })
      .addCase(deletePropertyThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePropertyThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.properties = state.properties.filter(
          (p) => p.property_id !== action.payload
        );
        state.ownedProperties = state.ownedProperties.filter(
          (p) => p.property_id !== action.payload
        );
        if (state.selectedProperty?.property_id === action.payload) {
          state.selectedProperty = null;
        }
        state.error = null;
      })
      .addCase(deletePropertyThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete property';
      })
      .addCase(uploadPropertyImagesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadPropertyImagesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const { propertyId, images } = action.payload;
        const property = state.properties.find((p) => p.property_id === propertyId);
        if (property) {
          property.images = [...(property.images || []), ...images];
        }
        const ownedProperty = state.ownedProperties.find(
          (p) => p.property_id === propertyId
        );
        if (ownedProperty) {
          ownedProperty.images = [...(ownedProperty.images || []), ...images];
        }
        if (state.selectedProperty?.property_id === propertyId) {
          state.selectedProperty.images = [
            ...(state.selectedProperty.images || []),
            ...images,
          ];
        }
        state.error = null;
      })
      .addCase(uploadPropertyImagesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to upload images';
      })
      .addCase(deletePropertyImagesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePropertyImagesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const { propertyId, remainingImages } = action.payload;
        const property = state.properties.find((p) => p.property_id === propertyId);
        if (property) {
          property.images = remainingImages;
        }
        const ownedProperty = state.ownedProperties.find(
          (p) => p.property_id === propertyId
        );
        if (ownedProperty) {
          ownedProperty.images = remainingImages;
        }
        if (state.selectedProperty?.property_id === propertyId) {
          state.selectedProperty.images = remainingImages;
        }
        state.error = null;
      })
      .addCase(deletePropertyImagesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete images';
      });
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
  updatePropertyImages,
  setLoading,
  setHasMore,
  setCursors,
  setFilters,
  setSort,
  setSearch,
  setError,
  clearError,
  resetState,
  resetFullState,
} = propertiesSlice.actions;

export const selectProperties = (state: { properties: PropertiesState }): Property[] =>
  state.properties.properties;
export const selectOwnedProperties = (state: { properties: PropertiesState }): Property[] =>
  state.properties.ownedProperties;
export const selectSelectedProperty = (state: { properties: PropertiesState }): Property | null =>
  state.properties.selectedProperty;
export const selectPropertiesLoading = (state: { properties: PropertiesState }): boolean =>
  state.properties.isLoading;
export const selectPropertiesLoadingMore = (state: { properties: PropertiesState }): boolean =>
  state.properties.isLoadingMore;
export const selectPropertiesHasMore = (state: { properties: PropertiesState }): boolean =>
  state.properties.hasMore;
export const selectPropertiesCursors = (state: { properties: PropertiesState }): PaginationCursors =>
  state.properties.cursors;
export const selectPropertiesFilters = (state: { properties: PropertiesState }): PropertyFilters =>
  state.properties.filters;
export const selectPropertiesSort = (state: { properties: PropertiesState }): PropertySort =>
  state.properties.sort;
export const selectPropertiesSearch = (state: { properties: PropertiesState }): string =>
  state.properties.search;
export const selectPropertiesError = (state: { properties: PropertiesState }): string | null =>
  state.properties.error;

export default propertiesSlice.reducer;
