import mongoose from 'mongoose';
import { config } from '../config';

let isConnected = false;

export const connectMongoDB = async () => {
  if (isConnected) {
    console.log('MongoDB already connected.');
    return;
  }

  await mongoose.connect(config.MONGODB_URI);
  isConnected = true;
  console.log('MongoDB connected successfully.');
};
