import axios from 'axios';
import { MarketPrice, ApiResponse, MarketMapData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const fetchMarkets = async (): Promise<string[]> => {
  try {
    const response = await api.get<ApiResponse<string[]>>('/markets');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching markets:', error);
    throw error;
  }
};

export const fetchLatestMarketPrices = async (market: string): Promise<MarketPrice> => {
  try {
    const response = await api.get<ApiResponse<MarketPrice>>(`/markets/${market}/latest`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching latest market prices:', error);
    throw error;
  }
};

export const fetchMarketSummary = async (market: string, days: number = 30) => {
  try {
    const response = await api.get(`/markets/${market}/summary`, {
      params: { days }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching market summary:', error);
    throw error;
  }
};

export const fetchProductTrend = async (market: string, product: string, days: number = 30) => {
  try {
    const response = await api.get(`/markets/${market}/products/${product}/trend`, {
      params: { days }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching product trend:', error);
    throw error;
  }
};

export const fetchMultiProductTrends = async (products: string[], days: number = 30) => {
  try {
    const response = await api.get('/trends/products', {
      params: { 
        products: products.join(','),
        days 
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching multi-product trends:', error);
    throw error;
  }
};

export const fetchMarketHistory = async (
  market: string, 
  page: number = 1, 
  limit: number = 10,
  startDate?: Date,
  endDate?: Date
) => {
  try {
    const params: any = { page, limit };
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();
    
    const response = await api.get(`/markets/${market}/history`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching market history:', error);
    throw error;
  }
};

export const fetchMarketData = async (): Promise<MarketMapData[]> => {
  try {
    const response = await api.get<ApiResponse<MarketMapData[]>>('/markets/map-data');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching market data for map:', error);
    // Return mock data for development
    return [
      {
        id: 1,
        name: 'Nakawa Market',
        latitude: 0.3476,
        longitude: 32.6169,
        price: 3500
      },
      {
        id: 2,
        name: 'Kampala Central Market',
        latitude: 0.3136,
        longitude: 32.5811,
        price: 4200
      },
      {
        id: 3,
        name: 'Bugolobi Market',
        latitude: 0.3244,
        longitude: 32.6056,
        price: 3800
      },
      {
        id: 4,
        name: 'Ntinda Market',
        latitude: 0.3547,
        longitude: 32.6208,
        price: 4000
      }
    ];
  }
};