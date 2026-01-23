import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import {
  fetchProperties,
  fetchProperty,
  fetchOwnedProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
  deletePropertyImages,
} from '@/api';
import { queryKeys } from '@/api/queryClient';
import { usePropertiesStore, useUIStore } from '@/store';
import type { Property, PropertyFilters, PropertySort, PaginationCursors } from '@/types';

interface UsePropertiesParams {
  sort?: PropertySort;
  filter?: PropertyFilters;
  search?: string;
  limit?: number;
  cursors?: PaginationCursors;
  enabled?: boolean;
}

export function useProperties(params: UsePropertiesParams = {}) {
  const { enabled = true, ...queryParams } = params;

  return useQuery({
    queryKey: queryKeys.properties.list(queryParams),
    queryFn: () => fetchProperties(queryParams),
    enabled,
  });
}

export function useInfiniteProperties(params: Omit<UsePropertiesParams, 'cursors'> = {}) {
  const { enabled = true, ...queryParams } = params;

  return useInfiniteQuery({
    queryKey: queryKeys.properties.list(queryParams),
    queryFn: ({ pageParam }) =>
      fetchProperties({
        ...queryParams,
        cursors: pageParam,
      }),
    initialPageParam: undefined as PaginationCursors | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return {
        lastCreatedAt: lastPage.lastCreatedAt,
        lastPrice: lastPage.lastPrice,
        lastName: lastPage.lastName,
      };
    },
    enabled,
  });
}

export function useProperty(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.properties.detail(id!),
    queryFn: () => fetchProperty(id!),
    enabled: enabled && !!id,
  });
}

export function useOwnedProperties(enabled = true) {
  return useQuery({
    queryKey: queryKeys.properties.owned(),
    queryFn: fetchOwnedProperties,
    enabled,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  const addProperty = usePropertiesStore((state) => state.addProperty);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: createProperty,
    onSuccess: (newProperty) => {
      addProperty(newProperty);
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      addToast({ type: 'success', message: 'Property created successfully' });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  const updatePropertyInStore = usePropertiesStore((state) => state.updateProperty);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({ id, property }: { id: string; property: Partial<Property> }) =>
      updateProperty(id, property),
    onSuccess: (updatedProperty, variables) => {
      updatePropertyInStore(variables.id, updatedProperty);
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.detail(variables.id),
      });
      addToast({ type: 'success', message: 'Property updated successfully' });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  const removeProperty = usePropertiesStore((state) => state.removeProperty);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: deleteProperty,
    onMutate: async (propertyId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.properties.all });
      const previousProperties = queryClient.getQueryData(
        queryKeys.properties.lists()
      );
      removeProperty(propertyId);
      return { previousProperties };
    },
    onError: (_err, _propertyId, context) => {
      if (context?.previousProperties) {
        queryClient.setQueryData(
          queryKeys.properties.lists(),
          context.previousProperties
        );
      }
      addToast({ type: 'error', message: 'Failed to delete property' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    },
    onSuccess: () => {
      addToast({ type: 'success', message: 'Property deleted successfully' });
    },
  });
}

export function useUploadPropertyImages() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      uploadPropertyImages(id, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.detail(variables.id),
      });
      addToast({ type: 'success', message: 'Images uploaded successfully' });
    },
  });
}

export function useDeletePropertyImages() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({ id, images }: { id: string; images: string[] }) =>
      deletePropertyImages(id, images),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.detail(variables.id),
      });
      addToast({ type: 'success', message: 'Images deleted successfully' });
    },
  });
}
