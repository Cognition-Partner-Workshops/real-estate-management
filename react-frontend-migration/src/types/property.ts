export const PropertyType = {
  Residential: 'residential',
  Commercial: 'commercial',
  Industrial: 'industrial',
  Land: 'land',
} as const;

export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];

export const TransactionType = {
  ForSale: 'sale',
  ForRent: 'rent',
} as const;

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const PaymentFrequency = {
  Yearly: 'yearly',
  Quarterly: 'quarterly',
  Monthly: 'monthly',
  BiWeekly: 'bi-weekly',
  Weekly: 'weekly',
  Daily: 'daily',
} as const;

export type PaymentFrequency = (typeof PaymentFrequency)[keyof typeof PaymentFrequency];

export const PropertiesDisplayOption = {
  CardView: 'cards',
  ListView: 'list',
} as const;

export type PropertiesDisplayOption = (typeof PropertiesDisplayOption)[keyof typeof PropertiesDisplayOption];

export interface Coord {
  lat: number;
  lng: number;
}

export interface Property {
  property_id: string;
  name: string;
  address: string;
  description?: string;
  type: PropertyType;
  transactionType: TransactionType;
  position: Coord;
  price: number;
  paymentFrequency?: PaymentFrequency;
  enquiries?: string[];
  features?: string[];
  images?: string[];
  currency?: string;
  contactNumber?: string;
  contactEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  user_id: string;
}

export interface PropertyFilters {
  type?: PropertyType;
  transactionType?: TransactionType;
  minPrice?: number;
  maxPrice?: number;
}

export interface PropertySort {
  field: 'createdAt' | 'price' | 'name';
  direction: 'asc' | 'desc';
}

export interface PaginationCursors {
  lastCreatedAt?: string;
  lastPrice?: number;
  lastName?: string;
}

export interface PropertiesResponse {
  items: Property[];
  lastCreatedAt?: string;
  lastPrice?: number;
  lastName?: string;
  hasMore?: boolean;
}
