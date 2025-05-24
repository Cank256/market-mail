import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../config';

export const postmarkVerification = (req: Request, res: Response, next: NextFunction): void => {
    const signature = req.headers['x-postmark-signature'] as string;

    if (!signature) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized: No signature provided'
        });
        return;
    }

    if (!config.POSTMARK_INBOUND_SECRET) {
        console.warn('POSTMARK_INBOUND_SECRET not configured - skipping verification');
        next();
        return;
    }

    const hash = crypto.createHmac('sha256', config.POSTMARK_INBOUND_SECRET)
                       .update(JSON.stringify(req.body))
                       .digest('hex');

    if (hash !== signature) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid signature'
        });
        return;
    }

    next();
};