import mongoose from 'mongoose';
import { logger } from './logger';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/veda-ai';
  
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);
    logger.info('Connected to MongoDB successfully.');
  } catch (error) {
    logger.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};
