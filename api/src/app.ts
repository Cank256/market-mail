import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config';
import { EmailService } from './services/emailService';
import publicRoutes from './routes/public';
import webhookRouter from './webhook';
import { connectMongoDB } from './config/db';

const app = express();

app.use(cors({
    origin: [config.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-postmark-signature'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

EmailService.initialize();

app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Welcome to the MarketMail API',
        version: '1.0.0'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'MarketMail API'
    });
});

app.use('/api', publicRoutes);
app.use('/webhook', webhookRouter);

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl
    });
});

app.use(errorHandler);

// Connect to MongoDB once per cold start
connectMongoDB().then(async () => {
    console.log('MongoDB connection established.');
    // Create indexes for all collections
    try {
        const { MarketPrice } = await import('./models/MarketPrice');
        await MarketPrice.createIndexes();
        console.log('Database indexes created successfully.');
    } catch (err) {
        console.error('Error creating database indexes:', err);
    }
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
});

export default app;
