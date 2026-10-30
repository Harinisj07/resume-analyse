import config from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode =
    err.status || err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  // Log error in development
  if (!config.isProduction) {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    code: err.code || 'SERVER_ERROR',
    message: err.message || 'Internal Server Error',
    stack: config.isProduction ? undefined : err.stack,
    errors: err.errors || undefined,
  });
};

export default errorHandler;
