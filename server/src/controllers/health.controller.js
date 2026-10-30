import { getDBStatus } from '../config/db.js';
import aiService from '../services/ai.service.js';
import config from '../config/env.js';

/**
 * @desc Get overall server, database, and AI service health status
 * @route GET /api/v1/health
 * @access Public
 */
export const getSystemHealth = async (req, res, next) => {
  try {
    const dbStatus = getDBStatus();
    const aiHealth = await aiService.checkHealth();

    const isSystemHealthy = dbStatus.isConnected;

    res.status(isSystemHealthy ? 200 : 503).json({
      success: true,
      status: isSystemHealthy ? 'healthy' : 'degraded',
      service: 'resume-analyzer-backend',
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      system: {
        nodeVersion: process.version,
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
      services: {
        database: {
          type: 'mongodb',
          ...dbStatus,
        },
        aiService: {
          url: config.aiServiceUrl,
          ...aiHealth,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Ping test
 * @route GET /api/v1/health/ping
 * @access Public
 */
export const ping = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString(),
  });
};
