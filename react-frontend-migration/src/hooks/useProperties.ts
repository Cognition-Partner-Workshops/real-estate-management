import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import type { Property, PropertyFilters, PropertySort, PaginationCursors } from '@/types';

export const PROPERTIES_QUERY_KEY = 'properties';
export const PROPERTY_QUERY_KEY = 'property';
export const OWNED_PROPERTIES_QUERY_KEY = 'ownedProperties';

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
    queryKey: [PROPERTIES_QUERY_KEY, queryParams],
    queryFn: () => fetchProperties(queryParams),
    enabled,
  });
}

export function useProperty(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: [PROPERTY_QUERY_KEY, id],
    queryFn: () => fetchProperty(id!),
    enabled: enabled && !!id,
  });
}

export function useOwnedProperties(enabled = true) {
  return useQuery({
    queryKey: [OWNED_PROPERTIES_QUERY_KEY],
    queryFn: fetchOwnedProperties,
    enabled,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROPERTIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [OWNED_PROPERTIES_QUERY_KEY] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, property }: { id: string; property: Partial<Property> }) =>
      updateProperty(id, property),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PROPERTIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROPERTY_QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [OWNED_PROPERTIES_QUERY_KEY] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROPERTIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [OWNED_PROPERTIES_QUERY_KEY] });
    },
  });
}

export function useUploadPropertyImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, files }: { id: string; files: FormData }) =>
      uploadPropertyImages(id, files),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PROPERTY_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeletePropertyImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, images }: { id: string; images: string[] }) =>
      deletePropertyImages(id, images),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PROPERTY_QUERY_KEY, variables.id] });
    },
  });
}
