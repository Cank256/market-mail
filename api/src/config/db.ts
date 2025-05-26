import { MongoClient } from 'mongodb';
import { config } from '../config';

let client: MongoClient | null = null;
let isConnected = false;

export const connectMongoDB = async () => {
  if (isConnected && client) {
    console.log('MongoDB already connected.');
    return client;
  }

  try {
    client = new MongoClient(config.MONGODB_URI);
    await client.connect();
    isConnected = true;
    console.log('MongoDB connected successfully.');
    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const getMongoClient = () => {
  if (!client) {
    throw new Error('MongoDB client not initialized. Call connectMongoDB first.');
  }
  return client;
};

export const getDb = () => {
  const client = getMongoClient();
  return client.db(config.DB_NAME);  // Always uses the configured DB_NAME
};

export const connectDB = connectMongoDB;

export const disconnectDB = async () => {
  if (client) {
    await client.close();
    client = null;
    isConnected = false;
    console.log('MongoDB disconnected successfully.');
  }
};
