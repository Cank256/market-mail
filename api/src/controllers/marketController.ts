import { Request, Response } from 'express';
import { MarketPrice } from '../models/MarketPrice';
import { ObjectId } from 'mongodb';

class MarketController {
    // Create a new market price entry
    async createMarketPrice(req: Request, res: Response) {
        try {
            const marketPriceData = req.body;
            const marketPrice = await MarketPrice.create(marketPriceData);
            res.status(201).json(marketPrice);
        } catch (error) {
            res.status(500).json({ message: 'Error creating market price', error });
        }
    }

    // Retrieve all market prices
    async getAllMarketPrices(req: Request, res: Response) {
        try {
            // For now, we'll implement a basic find all method
            // You may want to add pagination in the future
            const collection = MarketPrice['getCollection']();
            const marketPrices = await collection.find({}).toArray();
            res.status(200).json(marketPrices);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving market prices', error });
        }
    }

    // Retrieve a market price by ID
    async getMarketPriceById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const collection = MarketPrice['getCollection']();
            const marketPrice = await collection.findOne({ _id: new ObjectId(id) });
            if (!marketPrice) {
                return res.status(404).json({ message: 'Market price not found' });
            }
            res.status(200).json(marketPrice);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving market price', error });
        }
    }

    // Update a market price by ID
    async updateMarketPrice(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updatedData = { ...req.body, updatedAt: new Date() };
            const collection = MarketPrice['getCollection']();
            const result = await collection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updatedData },
                { returnDocument: 'after' }
            );
            if (!result.value) {
                return res.status(404).json({ message: 'Market price not found' });
            }
            res.status(200).json(result.value);
        } catch (error) {
            res.status(500).json({ message: 'Error updating market price', error });
        }
    }

    // Delete a market price by ID
    async deleteMarketPrice(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const collection = MarketPrice['getCollection']();
            const result = await collection.deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Market price not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error deleting market price', error });
        }
    }
}

export default new MarketController();