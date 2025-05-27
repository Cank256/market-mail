import { Router, Request, Response } from 'express';
import { getDb } from '../config/db';

const router = Router();

// Utility: get collection reference
const getCollection = () => getDb().collection('marketprices');

// Get all available countries
router.get('/countries', async (req: Request, res: Response): Promise<void> => {
  try {
    const collection = getCollection();
    // Distinct country names
    const countries = await collection.distinct('country');

    res.json({
      success: true,
      data: countries
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch countries',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get all available markets
router.get('/markets', async (req: Request, res: Response): Promise<void> => {
  try {
    const { country } = req.query;
    const collection = getCollection();
    
    // Build filter based on query parameters
    const filter: any = {};
    if (country) {
      filter.country = country;
    }
    
    // Distinct market names with optional country filter
    const markets = await collection.distinct('market', filter);

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

// Get latest activity across all markets
router.get('/markets/latest', async (req: Request, res: Response): Promise<void> => {
  try {
    const collection = getCollection();
    
    // Get the most recent submission from each market
    const pipeline = [
      {
        $sort: { date: -1 }
      },
      {
        $group: {
          _id: '$market',
          lastReportedAt: { $first: '$date' },
          latestData: { $first: '$$ROOT' }
        }
      },
      {
        $project: {
          market: '$_id',
          lastReportedAt: '$lastReportedAt',
          _id: 0
        }
      },
      {
        $sort: { lastReportedAt: -1 }
      }
    ];

    const latestActivity = await collection.aggregate(pipeline).toArray();

    res.json({
      success: true,
      data: latestActivity
    });
  } catch (error) {
    console.error('Error fetching latest markets activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest markets activity',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get latest prices for a specific market
router.get('/markets/:market/latest', async (req: Request, res: Response): Promise<void> => {
  try {
    const { market } = req.params;
    const collection = getCollection();

    // Find latest date for the market
    const latestRecord = await collection.find({ market })
      .sort({ date: -1 })
      .limit(1)
      .toArray();

    if (latestRecord.length === 0) {
      res.status(404).json({
        success: false,
        message: `No data found for market: ${market}`
      });
      return;
    }

    res.json({
      success: true,
      data: latestRecord[0]
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

// Get summary across all markets
router.get('/markets/all/summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const collection = getCollection();

    // Aggregate statistics across all markets
    const pipeline = [
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$priceItems' },
      {
        $group: {
          _id: '$priceItems.product',
          averagePrice: { $avg: '$priceItems.price' },
          minPrice: { $min: '$priceItems.price' },
          maxPrice: { $max: '$priceItems.price' },
          count: { $sum: 1 },
          markets: { $addToSet: '$market' }
        }
      },
      {
        $project: {
          product: '$_id',
          averagePrice: { $round: ['$averagePrice', 0] },
          minPrice: 1,
          maxPrice: 1,
          count: 1,
          marketCount: { $size: '$markets' },
          _id: 0
        }
      },
      { $sort: { product: 1 } }
    ];

    const summary = await collection.aggregate(pipeline).toArray();

    // Get total markets and submissions count
    const totalMarkets = await collection.distinct('market').then(markets => markets.length);
    const totalSubmissions = await collection.countDocuments({ date: { $gte: startDate, $lte: endDate } });

    res.json({
      success: true,
      data: {
        summary,
        totalMarkets,
        totalSubmissions,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
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

// Get market summary with statistics (average price per product over time range)
router.get('/markets/:market/summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const { market } = req.params;
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const collection = getCollection();

    // Aggregate average price per product in given date range and market
    const pipeline = [
      { $match: { market, date: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$priceItems' },
      {
        $group: {
          _id: '$priceItems.product',
          averagePrice: { $avg: '$priceItems.price' },
          minPrice: { $min: '$priceItems.price' },
          maxPrice: { $max: '$priceItems.price' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          product: '$_id',
          averagePrice: 1,
          minPrice: 1,
          maxPrice: 1,
          count: 1,
          _id: 0
        }
      },
      { $sort: { product: 1 } }
    ];

    const summary = await collection.aggregate(pipeline).toArray();

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
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const collection = getCollection();

    // Aggregate daily average price for the product in market over time
    const pipeline = [
      { $match: { market, date: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$priceItems' },
      { $match: { 'priceItems.product': product } },
      {
        $group: {
          _id: '$date',
          averagePrice: { $avg: '$priceItems.price' }
        }
      },
      {
        $project: {
          date: '$_id',
          averagePrice: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ];

    const trend = await collection.aggregate(pipeline).toArray();

    if (trend.length === 0) {
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
    const productsParam = req.query.products;
    if (!productsParam) {
      res.status(400).json({
        success: false,
        message: 'Products parameter is required'
      });
      return;
    }

    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const productList = (productsParam as string).split(',').map(p => p.trim());
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const collection = getCollection();

    // Aggregate daily average price per product (multiple products)
    const pipeline = [
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$priceItems' },
      { $match: { 'priceItems.product': { $in: productList } } },
      {
        $group: {
          _id: { product: '$priceItems.product', date: '$date' },
          averagePrice: { $avg: '$priceItems.price' }
        }
      },
      {
        $project: {
          product: '$_id.product',
          date: '$_id.date',
          averagePrice: 1,
          _id: 0
        }
      },
      { $sort: { product: 1, date: 1 } }
    ];

    const trends = await collection.aggregate(pipeline).toArray();

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
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const startDateStr = req.query.startDate as string | undefined;
    const endDateStr = req.query.endDate as string | undefined;

    const query: any = { market };

    if (startDateStr || endDateStr) {
      query.date = {};
      if (startDateStr) query.date.$gte = new Date(startDateStr);
      if (endDateStr) query.date.$lte = new Date(endDateStr);
    }

    const skip = (page - 1) * limit;

    const collection = getCollection();

    const [data, total] = await Promise.all([
      collection.find(query).sort({ date: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query)
    ]);

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
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

    const collection = getCollection();

    await collection.deleteMany({});
    const insertResult = await collection.insertMany(sampleData);

    res.json({
      success: true,
      message: 'Sample data seeded successfully',
      insertedCount: insertResult.insertedCount
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
