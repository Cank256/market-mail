// This file exports TypeScript types and interfaces used throughout the application.

export interface MarketPrice {
    market: string;
    date: Date;
    maize: number; // price per kg
    beans: number; // price per kg
    tomatoes: number; // price per crate
}

export interface MarketPriceResponse {
    success: boolean;
    data: MarketPrice[];
    message?: string;
}

export interface EmailPayload {
    market: string;
    date: string;
    maize: number;
    beans: number;
    tomatoes: number;
}

export interface ErrorResponse {
    success: boolean;
    message: string;
}