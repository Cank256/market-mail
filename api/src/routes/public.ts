import { Router, Request, Response } from 'express';
import { ReportService } from '../services/report';
import { MarketPrice } from '../models/MarketPrice';

const router = Router();

// Get all available markets
router.get('/markets', async (req: Request, res: Response): Promise<void> => {
    try {
        const markets = await ReportService.getAllMarkets();
        res.json({
            success: true,
            data: markets
        });
    } catch (error) {
        console.error('Error fetching markets:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch markets',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

// Get latest prices for a specific market
router.get('/markets/:market/latest', async (req: Request, res: Response): Promise<void> => {
    try {
        const { market } = req.params;
        const latestData = await ReportService.getLatestMarketPrices(market);
        
        if (!latestData) {
            res.status(404).json({
                success: false,
                message: `No data found for market: ${market}`
            });
            return;
        }

        res.json({
            success: true,
            data: latestData
        });
    } catch (error) {
        console.error('Error fetching latest market prices:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch latest market prices',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

// Get market summary with statistics
router.get('/markets/:market/summary', async (req: Request, res: Response): Promise<void> => {
    try {
        const { market } = req.params;
        const { days = 30 } = req.query;
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(days as string));

        const summary = await ReportService.generateMarketSummary(market, startDate, endDate);
        
        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Error generating market summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate market summary',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

// Get price trend for a specific product
router.get('/markets/:market/products/:product/trend', async (req: Request, res: Response): Promise<void> => {
    try {
        const { market, product } = req.params;
        const { days = 30 } = req.query;

        const trend = await ReportService.generateProductTrend(
            market,
            product,
            parseInt(days as string)
        );

        if (!trend) {
            res.status(404).json({
                success: false,
                message: `No trend data found for product ${product} in market ${market}`
            });
            return;
        }

        res.json({
            success: true,
            data: trend
        });
    } catch (error) {
        console.error('Error generating product trend:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate product trend',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

// Get multi-product trend data across markets
router.get('/trends/products', async (req: Request, res: Response): Promise<void> => {
    try {
        const { products, days = 30 } = req.query;
        
        if (!products) {
            res.status(400).json({
                success: false,
                message: 'Products parameter is required'
            });
            return;
        }

        const productList = (products as string).split(',').map(p => p.trim());
        const trends = await ReportService.generateMultiProductTrend(
            productList,
            parseInt(days as string)
        );

        res.json({
            success: true,
            data: trends
        });
    } catch (error) {
        console.error('Error generating multi-product trends:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate multi-product trends',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

// Get historical data for a market with pagination
router.get('/markets/:market/history', async (req: Request, res: Response): Promise<void> => {
    try {
        const { market } = req.params;
        const { page = 1, limit = 10, startDate, endDate } = req.query;
        
        const query: any = { market };
        
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate as string);
            if (endDate) query.date.$lte = new Date(endDate as string);
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        
        const [data, total] = await Promise.all([
            MarketPrice.find(query)
                .sort({ date: -1 })
                .skip(skip)
                .limit(parseInt(limit as string))
                .exec(),
            MarketPrice.countDocuments(query)
        ]);

        res.json({
            success: true,
            data,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total,
                pages: Math.ceil(total / parseInt(limit as string))
            }
        });
    } catch (error) {
        console.error('Error fetching market history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch market history',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

// Add sample data for testing (development only)
router.post('/seed-sample-data', async (req: Request, res: Response): Promise<void> => {
    try {
        // Only allow in development
        if (process.env.NODE_ENV === 'production') {
            res.status(403).json({
                success: false,
                message: 'Sample data seeding not allowed in production'
            });
            return;
        }

        const sampleData = [
            {
                market: 'Nakasero Market',
                date: new Date('2025-05-24'),
                submitterEmail: 'test@example.com',
                priceItems: [
                    { product: 'Tomatoes', unit: 'kg', price: 3000 },
                    { product: 'Onions', unit: 'kg', price: 2500 },
                    { product: 'Irish Potatoes', unit: 'kg', price: 4000 },
                    { product: 'Cabbage', unit: 'head', price: 1500 }
                ]
            },
            {
                market: 'Owino Market',
                date: new Date('2025-05-24'),
                submitterEmail: 'test@example.com',
                priceItems: [
                    { product: 'Tomatoes', unit: 'kg', price: 2800 },
                    { product: 'Onions', unit: 'kg', price: 2300 },
                    { product: 'Irish Potatoes', unit: 'kg', price: 3800 },
                    { product: 'Carrots', unit: 'kg', price: 3500 }
                ]
            },
            {
                market: 'Kalerwe Market',
                date: new Date('2025-05-23'),
                submitterEmail: 'test@example.com',
                priceItems: [
                    { product: 'Tomatoes', unit: 'kg', price: 3200 },
                    { product: 'Onions', unit: 'kg', price: 2600 },
                    { product: 'Irish Potatoes', unit: 'kg', price: 4200 },
                    { product: 'Green Peppers', unit: 'kg', price: 5000 }
                ]
            }
        ];

        // Clear existing data
        await MarketPrice.deleteMany({});
        
        // Insert sample data
        await MarketPrice.insertMany(sampleData);

        res.json({
            success: true,
            message: 'Sample data seeded successfully',
            count: sampleData.length
        });
    } catch (error) {
        console.error('Error seeding sample data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to seed sample data',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

export default router;