import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config/index';
import { EmailService } from './services/emailService';
import publicRoutes from './routes/public';
import webhookRouter from './webhook';

const app = express();

// CORS configuration
app.use(cors({
    origin: [config.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-postmark-signature'],
    credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize email service
EmailService.initialize();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'MarketMail API'
    });
});

// Set up routes
app.use('/api', publicRoutes);
app.use('/webhook', webhookRouter);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI)
.then(() => {
    console.log('MongoDB connected successfully');
    console.log(`Database: ${config.MONGODB_URI}`);
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

export default app;