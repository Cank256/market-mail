import express, { Request, Response } from 'express';
import { postmarkVerification } from '../middleware/postmarkVerification';
import { ParserService } from '../services/parserService';
import { getDb } from '../config/db';

const router = express.Router();

// router.post('/inbound', postmarkVerification, async (req: Request, res: Response): Promise<void> => {
router.post('/inbound', async (req: Request, res: Response): Promise<void> => {
  try {
    const marketData = await ParserService.parse(req.body);

    const collection = getDb().collection('marketprices');

    // Insert the parsed market data document
    await collection.insertOne(marketData);

    res.status(200).json({ message: 'Market price data saved successfully.' });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
