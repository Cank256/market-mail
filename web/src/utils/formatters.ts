// This file contains utility functions for formatting data.

export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
};

export const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

export const formatMarketData = (data: { market: string; date: string; prices: Record<string, number> }): string => {
    const formattedDate = formatDate(data.date);
    const formattedPrices = Object.entries(data.prices)
        .map(([item, price]) => `${item}: ${formatPrice(price)}`)
        .join(', ');

    return `Market: ${data.market}, Date: ${formattedDate}, Prices: ${formattedPrices}`;
};