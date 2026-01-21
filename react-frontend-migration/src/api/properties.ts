import apiClient from './client';
import type {
  Property,
  PropertiesResponse,
  ApiResponse,
  PropertyFilters,
  PropertySort,
  PaginationCursors,
} from '@/types';

interface FetchPropertiesParams {
  sort?: PropertySort;
  filter?: PropertyFilters;
  search?: string;
  limit?: number;
  cursors?: PaginationCursors;
}

export async function fetchProperties(
  params: FetchPropertiesParams = {}
): Promise<ApiResponse<PropertiesResponse>> {
  const { sort, filter, search, limit = 10, cursors } = params;

  const queryParams = new URLSearchParams();

  if (sort) {
    queryParams.append('sort', `${sort.field}:${sort.direction}`);
  }
  if (filter?.type) {
    queryParams.append('filter[type]', filter.type);
  }
  if (filter?.transactionType) {
    queryParams.append('filter[transactionType]', filter.transactionType);
  }
  if (search) {
    queryParams.append('search', search);
  }
  if (limit) {
    queryParams.append('limit', limit.toString());
  }
  if (cursors?.lastCreatedAt) {
    queryParams.append('lastCreatedAt', cursors.lastCreatedAt);
  }
  if (cursors?.lastPrice !== undefined) {
    queryParams.append('lastPrice', cursors.lastPrice.toString());
  }
  if (cursors?.lastName) {
    queryParams.append('lastName', cursors.lastName);
  }

  const response = await apiClient.get<ApiResponse<PropertiesResponse>>(
    `/properties?${queryParams.toString()}`
  );
  return response.data;
}

export async function fetchProperty(id: string): Promise<ApiResponse<Property>> {
  const response = await apiClient.get<ApiResponse<Property>>(`/properties/${id}`);
  return response.data;
}

export async function fetchOwnedProperties(): Promise<ApiResponse<Property[]>> {
  const response = await apiClient.get<ApiResponse<Property[]>>('/properties/me');
  return response.data;
}

export async function createProperty(
  property: Omit<Property, 'property_id' | 'createdAt' | 'updatedAt' | 'user_id'>
): Promise<ApiResponse<Property>> {
  const response = await apiClient.post<ApiResponse<Property>>('/properties', property);
  return response.data;
}

export async function updateProperty(
  id: string,
  property: Partial<Property>
): Promise<ApiResponse<Property>> {
  const response = await apiClient.patch<ApiResponse<Property>>(`/properties/${id}`, property);
  return response.data;
}

export async function deleteProperty(id: string): Promise<ApiResponse<Property>> {
  const response = await apiClient.delete<ApiResponse<Property>>(`/properties/${id}`);
  return response.data;
}

export async function uploadPropertyImages(
  id: string,
  files: FormData
): Promise<ApiResponse<string[]>> {
  const response = await apiClient.post<ApiResponse<string[]>>(
    `/properties/upload/images/${id}`,
    files,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

export async function deletePropertyImages(
  id: string,
  images: string[]
): Promise<ApiResponse<string[]>> {
  const response = await apiClient.delete<ApiResponse<string[]>>(
    `/properties/upload/images/${id}`,
    { data: { images } }
  );
  return response.data;
}
