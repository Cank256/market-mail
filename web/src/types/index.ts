// This file exports TypeScript types and interfaces used in the web application.

export interface PriceItem {
  product: string;
  unit: string;
  price: number;
}

export interface MarketPrice {
  _id?: string;
  market: string;
  date: string;
  submitterEmail: string;
  priceItems: PriceItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketSummary {
  market: string;
  totalSubmissions: number;
  uniqueProducts: number;
  avgPricesCount: number;
  dateRange: {
    start: string;
    end: string;
  };
  topProducts: Array<{
    product: string;
    avgPrice: number;
    submissions: number;
  }>;
}

export interface ProductTrend {
  product: string;
  market: string;
  trend: Array<{
    date: string;
    price: number;
  }>;
  change: {
    absolute: number;
    percentage: number;
  };
}

export interface MultiProductTrend {
  [product: string]: Array<{
    market: string;
    date: string;
    price: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface MarketMapData {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  price: number;
}