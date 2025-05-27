import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../config/db';

// Interface for a single price item (product)
export interface IPriceItem {
  product: string;
  unit: string;
  price: number;
}

// Interface for the market price document
export interface IMarketPrice {
  _id?: ObjectId;
  country: string;
  market: string;
  date: Date;
  submitterEmail: string;
  priceItems: IPriceItem[];
  createdAt: Date;
  updatedAt: Date;
}

class MarketPriceModel {
  private collection!: Collection<IMarketPrice>;
  
  constructor() {
    // Defer actual collection initialization until first use
  }

  private getCollection(): Collection<IMarketPrice> {
    if (!this.collection) {
      this.collection = getDb().collection<IMarketPrice>('marketprices');
    }
    return this.collection;
  }

  // Method to create a new market price entry
  async create(marketPrice: Omit<IMarketPrice, '_id' | 'createdAt' | 'updatedAt'>): Promise<IMarketPrice> {
    const now = new Date();
    const newMarketPrice: IMarketPrice = {
      ...marketPrice,
      createdAt: now,
      updatedAt: now
    };
    
    const result = await this.getCollection().insertOne(newMarketPrice as any);
    return { ...newMarketPrice, _id: result.insertedId };
  }

  // Method to find the latest price for a market
  async findLatestForMarket(marketName: string): Promise<IMarketPrice | null> {
    return this.getCollection().findOne(
      { market: marketName },
      { sort: { date: -1 } }
    );
  }

  // Method to find price history for a specific product in a market
  async findPriceHistory(marketName: string, productName: string, limit: number = 30): Promise<IMarketPrice[]> {
    return this.getCollection()
      .find({
        market: marketName,
        "priceItems.product": productName
      })
      .sort({ date: -1 })
      .limit(limit)
      .toArray();
  }

  // Method to find all unique markets
  async findAllMarkets(): Promise<string[]> {
    return this.getCollection().distinct('market');
  }

  // Method to find all unique countries
  async findAllCountries(): Promise<string[]> {
    return this.getCollection().distinct('country');
  }

  // Method to find documents with options (sort, skip, limit)
  async findWithOptions(query: any, options: { sort?: any; skip?: number; limit?: number } = {}): Promise<IMarketPrice[]> {
    let cursor = this.getCollection().find(query);
    
    if (options.sort) {
      cursor = cursor.sort(options.sort);
    }
    if (options.skip) {
      cursor = cursor.skip(options.skip);
    }
    if (options.limit) {
      cursor = cursor.limit(options.limit);
    }
    
    return cursor.toArray();
  }

  // Method to count documents matching a query
  async countDocuments(query: any = {}): Promise<number> {
    return this.getCollection().countDocuments(query);
  }

  // Method to delete all documents
  async deleteAll(): Promise<void> {
    await this.getCollection().deleteMany({});
  }

  // Method to insert multiple documents
  async insertMany(documents: Omit<IMarketPrice, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<IMarketPrice[]> {
    const now = new Date();
    const documentsWithTimestamps = documents.map(doc => ({
      ...doc,
      createdAt: now,
      updatedAt: now
    }));
    
    const result = await this.getCollection().insertMany(documentsWithTimestamps as any);
    return documentsWithTimestamps.map((doc, index) => ({
      ...doc,
      _id: result.insertedIds[index]
    }));
  }

  // Create indexes method to be called during app initialization
  async createIndexes(): Promise<void> {
    await this.getCollection().createIndex({ market: 1, date: -1 });
    await this.getCollection().createIndex({ "priceItems.product": 1 });
    await this.getCollection().createIndex({ market: 1 });
    await this.getCollection().createIndex({ date: -1 });
  }
}

// Export a singleton instance of the model
export const MarketPrice = new MarketPriceModel();