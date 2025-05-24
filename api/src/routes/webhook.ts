import express, { Request, Response } from 'express';
import { postmarkVerification } from '../middleware/postmarkVerification';
import { ParserService } from '../services/parserService';
import { MarketPrice } from '../models/MarketPrice';

const router = express.Router();

router.post('/inbound', postmarkVerification, async (req: Request, res: Response): Promise<void> => {
    try {
        const marketData = ParserService.parse(req.body);
        const marketPrice = new MarketPrice(marketData);
        await marketPrice.save();

        res.status(200).json({ message: 'Market price data saved successfully.' });
    } catch (error: any) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

export default router;