import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { healthRouter } from './routes/health.routes.js';
import { gnaniRouter } from './routes/gnani.routes.js';
import { servicesRouter } from './routes/services.routes.js';

const app = express();

// CORS configuration for frontend dev & production
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for local dev
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key-ID'],
}));

// Body parsers with increased limits for audio/image base64
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Logging middleware in dev
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Route registration
app.use('/api', healthRouter);
app.use('/api/gnani', gnaniRouter);
app.use('/api', servicesRouter);

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'SAHAAYA Backend API',
    description: 'Assistive multi-modal AI backend supporting Gnani Prisma & Timbre',
    health: '/api/health',
    status: '/api/gnani/status',
    documentation: 'https://docs.gnani.ai',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message,
  });
});

// Start server
app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🚀 SAHAAYA Backend running on http://127.0.0.1:${env.PORT}`);
  console.log(`🔗 Health check: http://127.0.0.1:${env.PORT}/api/health`);
  console.log(`🎙️ Gnani STT Status: ${env.hasSTTKey() ? 'Configured (Live)' : 'Empty Key (Demo Fallback)'}`);
  console.log(`🔊 Gnani TTS Status: ${env.hasTTSKey() ? 'Configured (Live)' : 'Empty Key (Demo Fallback)'}`);
  console.log(`===============================================`);
});

export default app;
