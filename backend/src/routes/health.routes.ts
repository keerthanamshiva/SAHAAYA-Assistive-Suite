import { Router, Request, Response } from 'express';
import { gnaniService } from '../services/gnaniService.js';

export const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  const status = gnaniService.getStatus();

  res.status(200).json({
    status: 'healthy',
    service: 'SAHAAYA Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    gnani: {
      configured: status.gnaniConfigured,
      sttConfigured: status.stt.configured,
      ttsConfigured: status.tts.configured,
      mode: status.gnaniConfigured ? 'live-api' : 'demo-fallback',
    },
  });
});
