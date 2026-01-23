import { apiClient } from './client';
import type {
  Property,
  PropertiesResponse,
  PropertyFilters,
  PropertySort,
  PaginationCursors,
  ApiResponse,
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
): Promise<PropertiesResponse> {
  const { sort = 'latest', filter, search, limit = 12, cursors } = params;

  const queryParams = new URLSearchParams();
  queryParams.append('limit', limit.toString());
  queryParams.append('sort', sort);

  if (search) {
    queryParams.append('search', search);
  }

  if (filter?.type) {
    queryParams.append('filter', filter.type);
  }

  if (filter?.transactionType) {
    queryParams.append('transactionType', filter.transactionType);
  }

  if (cursors?.lastCreatedAt) {
    queryParams.append('lastCreatedAt', cursors.lastCreatedAt);
  }

  if (cursors?.lastPrice) {
    queryParams.append('lastPrice', cursors.lastPrice.toString());
  }

  if (cursors?.lastName) {
    queryParams.append('lastName', cursors.lastName);
  }

  const response = await apiClient.get<ApiResponse<PropertiesResponse>>(
    `/properties?${queryParams.toString()}`
  );
  return response.data.data;
}

export async function fetchProperty(id: string): Promise<Property> {
  const response = await apiClient.get<ApiResponse<Property>>(
    `/properties/${id}`
  );
  return response.data.data;
}

export async function fetchOwnedProperties(): Promise<Property[]> {
  const response = await apiClient.get<ApiResponse<Property[]>>('/properties/me');
  return response.data.data;
}

export async function createProperty(
  property: Omit<Property, 'property_id' | 'createdAt' | 'updatedAt'>
): Promise<Property> {
  const response = await apiClient.post<ApiResponse<Property>>(
    '/properties',
    property
  );
  return response.data.data;
}

export async function updateProperty(
  id: string,
  property: Partial<Property>
): Promise<Property> {
  const response = await apiClient.patch<ApiResponse<Property>>(
    `/properties/${id}`,
    property
  );
  return response.data.data;
}

export async function deleteProperty(id: string): Promise<void> {
  await apiClient.delete(`/properties/${id}`);
}

export async function uploadPropertyImages(
  id: string,
  formData: FormData
): Promise<string[]> {
  const response = await apiClient.post<ApiResponse<string[]>>(
    `/properties/upload/images/${id}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
}

export async function deletePropertyImages(
  id: string,
  images: string[]
): Promise<string[]> {
  const response = await apiClient.delete<ApiResponse<string[]>>(
    `/properties/upload/images/${id}`,
    { data: { images } }
  );
  return response.data.data;
}
