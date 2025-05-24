// This file exports configuration settings for the application, such as database connection strings and API keys.

import dotenv from 'dotenv';

dotenv.config();

export const config = {
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/marketmail',
    POSTMARK_SERVER_TOKEN: process.env.POSTMARK_SERVER_TOKEN || '',
    POSTMARK_ACCOUNT_TOKEN: process.env.POSTMARK_ACCOUNT_TOKEN || '',
    POSTMARK_INBOUND_SECRET: process.env.POSTMARK_INBOUND_SECRET || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    USE_OPENAI: process.env.USE_OPENAI === 'true',
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};