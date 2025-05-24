import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface for a single price item (product)
export interface IPriceItem {
  product: string;
  unit: string;
  price: number;
}

// Interface for the market price document
export interface IMarketPrice extends Document {
  market: string;
  date: Date;
  submitterEmail: string;
  priceItems: IPriceItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Static methods for the MarketPrice model
interface IMarketPriceModel extends Model<IMarketPrice> {
  findLatestForMarket(marketName: string): Promise<IMarketPrice | null>;
  findPriceHistory(marketName: string, productName: string, limit?: number): Promise<IMarketPrice[]>;
  findAllMarkets(): Promise<string[]>;
}

// Schema for a price item
const PriceItemSchema = new Schema({
  product: { type: String, required: true },
  unit: { type: String, required: true },
  price: { type: Number, required: true }
});

// Schema for market price
const MarketPriceSchema: Schema = new Schema({
  market: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  submitterEmail: { type: String, required: true },
  priceItems: [PriceItemSchema]
}, {
  timestamps: true
});

// Create indexes for efficient querying
MarketPriceSchema.index({ market: 1, date: -1 });
MarketPriceSchema.index({ "priceItems.product": 1 });

// Static method to find the latest price for a market
MarketPriceSchema.statics.findLatestForMarket = async function(marketName: string): Promise<IMarketPrice | null> {
  return this.findOne({ market: marketName })
    .sort({ date: -1 })
    .exec();
};

// Static method to find price history for a specific product in a market
MarketPriceSchema.statics.findPriceHistory = async function(marketName: string, productName: string, limit: number = 30): Promise<IMarketPrice[]> {
  return this.find({
    market: marketName,
    "priceItems.product": productName
  })
    .sort({ date: -1 })
    .limit(limit)
    .exec();
};

// Static method to find all unique markets
MarketPriceSchema.statics.findAllMarkets = async function(): Promise<string[]> {
  const results = await this.distinct('market').exec();
  return results;
};

export const MarketPrice = mongoose.model<IMarketPrice, IMarketPriceModel>('MarketPrice', MarketPriceSchema);