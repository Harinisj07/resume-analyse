import app from './src/app.js';
import config from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { seedRoles } from './src/config/seedRoles.js';
import mongoose from 'mongoose';

let server;

const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log('[Server] Connecting to MongoDB...');
    await connectDB();

    // Ensure predefined configurable target roles exist in database
    await seedRoles();

    // Start HTTP Server
    server = app.listen(config.port, () => {
      console.log(`
============================================================
  AI Resume Analyzer & Career Guidance Platform - Backend
  Running in ${config.nodeEnv.toUpperCase()} mode
  API URL:        http://localhost:${config.port}
  Health Check:   http://localhost:${config.port}/api/v1/health
  AI Microservice: ${config.aiServiceUrl}
============================================================
      `);
    });
  } catch (error) {
    console.error(`[Server] Failed to initialize: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      try {
        await mongoose.connection.close(false);
        console.log('[Database] MongoDB connection closed.');
        process.exit(0);
      } catch (err) {
        console.error('[Database] Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught Exception:', error);
  process.exit(1);
});

startServer();
