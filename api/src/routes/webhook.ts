import express, { Request, Response } from 'express';
// import { postmarkVerification } from '../middleware/postmarkVerification';
import { ParserService } from '../services/parserService';
import { EmailService } from '../services/emailService';
import { MarketPrice } from '../models/MarketPrice';

const router = express.Router();

// router.post('/inbound', postmarkVerification, async (req: Request, res: Response): Promise<void> => {
router.post('/inbound', async (req: Request, res: Response): Promise<void> => {
    try {
        // Parse the incoming email data
        const marketData = await ParserService.parse(req.body);
        
        // Save to database
        const savedMarketPrice = await MarketPrice.create(marketData);

        // Generate formatted response content
        const htmlContent = ParserService.formatToHtml(marketData);
        const textContent = ParserService.formatToText(marketData);
        
        // Send confirmation email
        const subject = `Market Price Data Processed - ${marketData.market}, ${marketData.country}`;
        await EmailService.sendConfirmation(
            marketData.submitterEmail,
            subject,
            htmlContent,
            textContent
        );

        console.log(`Successfully processed market data for ${marketData.market} in ${marketData.country} from ${marketData.submitterEmail}`);

        res.status(200).json({
            message: 'Market price data received and saved successfully.',
            data: {
                country: marketData.country,
                market: marketData.market,
                date: marketData.date,
                itemCount: marketData.priceItems.length
            },
        });
    } catch (error: any) {
        console.error('Error processing webhook:', error);
        
        // Try to send error notification if we have the sender's email
        try {
            if (req.body?.FromFull?.Email) {
                await EmailService.sendErrorNotification(
                    req.body.FromFull.Email,
                    error.message
                );
            }
        } catch (emailError) {
            console.error('Failed to send error notification:', emailError);
        }

        res.status(500).json({
            message: 'An error occurred while processing the webhook.',
            error: error.message,
        });
    }
});

export default router;