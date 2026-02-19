import mongoose from 'mongoose';
import { config } from './index.js';

export const connectDb = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
