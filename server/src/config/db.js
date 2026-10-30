import mongoose from 'mongoose';
import config from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: !config.isProduction,
    });

    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[Database] MongoDB connection error:`, err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(`[Database] MongoDB disconnected. Attempting reconnection...`);
      isConnected = false;
    });

    return conn.connection;
  } catch (error) {
    console.error(`[Database] Initial MongoDB connection failed: ${error.message}`);
    isConnected = false;
    // Don't crash immediately so health checks can still report DB status
    return null;
  }
};

export const getDBStatus = () => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const stateCode = mongoose.connection.readyState;
  return {
    state: stateMap[stateCode] || 'unknown',
    statusCode: stateCode,
    isConnected: stateCode === 1,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
};

export default connectDB;
