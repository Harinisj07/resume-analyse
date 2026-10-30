import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import config from './config/env.js';
import apiRouter from './routes/index.js';
import authRouter from './routes/auth.routes.js';
import resumeRouter from './routes/resume.routes.js';
import roleRouter from './routes/role.routes.js';
import userRouter from './routes/user.routes.js';
import skillGapRouter from './routes/skillGap.routes.js';
import careerReadinessRouter from './routes/careerReadiness.routes.js';
import roadmapRouter from './routes/roadmap.routes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// CORS setup
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for local dev foundation
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging & Body parsing
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root Information Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'AI Resume Analyzer & Career Guidance Platform API',
    version: '1.0.0',
    documentation: '/api/v1/health',
    status: 'online',
    endpoints: {
      health: '/api/v1/health',
      aiHealth: '/api/v1/ai/health',
      aiAnalyze: '/api/v1/ai/analyze',
      authRegister: '/api/v1/auth/register',
      authLogin: '/api/v1/auth/login',
    },
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/roles', roleRouter);
app.use('/api/users', userRouter);
app.use('/api/skill-gap', skillGapRouter);
app.use('/api/career-readiness', careerReadinessRouter);
app.use('/api/roadmap', roadmapRouter);
app.use('/api/v1', apiRouter);

// 404 & Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
