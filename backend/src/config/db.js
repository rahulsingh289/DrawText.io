import mongoose from 'mongoose';
import { config } from './environment.js';

let isConnected = false;
let memoryServer = null;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    const opts = {
      serverSelectionTimeoutMS: 2000,
      autoIndex: true
    };
    await mongoose.connect(config.mongoUri, opts);
    isConnected = true;
    console.log('✅ Connected to MongoDB at:', config.mongoUri);
  } catch (err) {
    console.warn('⚠️ Could not connect to local MongoDB. Attempting fallback memory DB for development...');
    try {
      // Dynamic import to avoid hard requirement if not installed
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      await mongoose.connect(uri);
      isConnected = true;
      console.log('🚀 Running with Embedded In-Memory MongoDB at:', uri);
    } catch (memErr) {
      console.error('❌ Failed to launch in-memory MongoDB fallback:', memErr.message);
      console.warn('⚡ Running server in state-isolated memory mode.');
    }
  }
};
