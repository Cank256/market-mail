import { Router, Express } from 'express';
import marketRoutes from './public';
import webhookRoutes from './webhook';

const router = Router();

export const setRoutes = (app: Express) => {
    app.use('/api', router);
    router.use('/market', marketRoutes);
    router.use('/webhook', webhookRoutes);
};