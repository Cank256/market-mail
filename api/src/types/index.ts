// This file exports TypeScript types and interfaces used throughout the application.

export interface PriceItem {
    product: string;
    unit: string;
    price: number;
}

export interface MarketPrice {
    _id?: string;
    country: string;
    market: string;
    date: Date;
    submitterEmail: string;
    priceItems: PriceItem[];
    messageId?: string;
    originalRecipient?: string;
    subject?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface MarketPriceResponse {
    success: boolean;
    data: MarketPrice[];
    message?: string;
}

export interface EmailPayload {
    country: string;
    market: string;
    date: string;
    priceItems: PriceItem[];
}

export interface ErrorResponse {
    success: boolean;
    message: string;
}