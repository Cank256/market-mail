import { Request, Response } from 'express';
import { MarketPrice } from '../models/MarketPrice';

class MarketController {
    // Create a new market price entry
    async createMarketPrice(req: Request, res: Response) {
        try {
            const marketPriceData = req.body;
            const marketPrice = new MarketPrice(marketPriceData);
            await marketPrice.save();
            res.status(201).json(marketPrice);
        } catch (error) {
            res.status(500).json({ message: 'Error creating market price', error });
        }
    }

    // Retrieve all market prices
    async getAllMarketPrices(req: Request, res: Response) {
        try {
            const marketPrices = await MarketPrice.find();
            res.status(200).json(marketPrices);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving market prices', error });
        }
    }

    // Retrieve a market price by ID
    async getMarketPriceById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const marketPrice = await MarketPrice.findById(id);
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
            const updatedData = req.body;
            const marketPrice = await MarketPrice.findByIdAndUpdate(id, updatedData, { new: true });
            if (!marketPrice) {
                return res.status(404).json({ message: 'Market price not found' });
            }
            res.status(200).json(marketPrice);
        } catch (error) {
            res.status(500).json({ message: 'Error updating market price', error });
        }
    }

    // Delete a market price by ID
    async deleteMarketPrice(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const marketPrice = await MarketPrice.findByIdAndDelete(id);
            if (!marketPrice) {
                return res.status(404).json({ message: 'Market price not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error deleting market price', error });
        }
    }
}

export default new MarketController();