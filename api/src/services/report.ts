// This file exports functions to generate reports based on market price data.

import { MarketPrice, IMarketPrice } from '../models/MarketPrice';

interface PriceTrend {
  date: string;
  averagePrice: number;
  count: number;
}

interface ProductTrend {
  product: string;
  unit: string;
  trends: PriceTrend[];
}

interface MarketSummary {
  market: string;
  totalSubmissions: number;
  uniqueProducts: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  products: {
    product: string;
    unit: string;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    count: number;
  }[];
}

export class ReportService {
  /**
   * Generate a comprehensive summary report for a market
   * @param market Market name
   * @param startDate Start date for the report
   * @param endDate End date for the report
   * @returns Market summary with product statistics
   */
  static async generateMarketSummary(
    market: string,
    startDate: Date,
    endDate: Date
  ): Promise<MarketSummary> {
    const marketData = await MarketPrice.find({
      market,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    if (marketData.length === 0) {
      throw new Error(`No data found for market ${market} in the specified date range`);
    }

    // Aggregate product statistics
    const productStats = new Map<string, {
      unit: string;
      prices: number[];
    }>();

    marketData.forEach(entry => {
      entry.priceItems.forEach(item => {
        const key = item.product;
        if (!productStats.has(key)) {
          productStats.set(key, { unit: item.unit, prices: [] });
        }
        productStats.get(key)!.prices.push(item.price);
      });
    });

    const products = Array.from(productStats.entries()).map(([product, data]) => {
      const prices = data.prices;
      return {
        product,
        unit: data.unit,
        averagePrice: Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length),
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        count: prices.length
      };
    });

    return {
      market,
      totalSubmissions: marketData.length,
      uniqueProducts: productStats.size,
      dateRange: {
        start: marketData[0].date,
        end: marketData[marketData.length - 1].date
      },
      products
    };
  }

  /**
   * Generate price trends for a specific product in a market
   * @param market Market name
   * @param product Product name
   * @param days Number of days to look back
   * @returns Product trend data
   */
  static async generateProductTrend(
    market: string,
    product: string,
    days: number = 30
  ): Promise<ProductTrend | null> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const marketData = await MarketPrice.find({
      market,
      date: { $gte: startDate, $lte: endDate },
      "priceItems.product": product
    }).sort({ date: 1 });

    if (marketData.length === 0) {
      return null;
    }

    // Group by date and calculate daily averages
    const dailyPrices = new Map<string, { prices: number[]; unit: string }>();

    marketData.forEach(entry => {
      const dateKey = entry.date.toISOString().split('T')[0];
      entry.priceItems.forEach(item => {
        if (item.product === product) {
          if (!dailyPrices.has(dateKey)) {
            dailyPrices.set(dateKey, { prices: [], unit: item.unit });
          }
          dailyPrices.get(dateKey)!.prices.push(item.price);
        }
      });
    });

    const trends: PriceTrend[] = Array.from(dailyPrices.entries()).map(([date, data]) => ({
      date,
      averagePrice: Math.round(data.prices.reduce((sum, price) => sum + price, 0) / data.prices.length),
      count: data.prices.length
    }));

    const firstEntry = dailyPrices.values().next().value;
    return {
      product,
      unit: firstEntry?.unit || '',
      trends: trends.sort((a, b) => a.date.localeCompare(b.date))
    };
  }

  /**
   * Get the latest prices for all products in a market
   * @param market Market name
   * @returns Latest market data entry
   */
  static async getLatestMarketPrices(market: string): Promise<IMarketPrice | null> {
    return await MarketPrice.findLatestForMarket(market);
  }

  /**
   * Get all available markets
   * @returns Array of market names
   */
  static async getAllMarkets(): Promise<string[]> {
    return await MarketPrice.findAllMarkets();
  }

  /**
   * Generate trend report for multiple products across markets
   * @param products Array of product names to track
   * @param days Number of days to look back
   * @returns Trend data for multiple products
   */
  static async generateMultiProductTrend(
    products: string[],
    days: number = 30
  ): Promise<{ market: string; trends: ProductTrend[] }[]> {
    const markets = await ReportService.getAllMarkets();
    const results = [];

    for (const market of markets) {
      const trends = [];
      for (const product of products) {
        const trend = await ReportService.generateProductTrend(market, product, days);
        if (trend) {
          trends.push(trend);
        }
      }
      if (trends.length > 0) {
        results.push({ market, trends });
      }
    }

    return results;
  }
}