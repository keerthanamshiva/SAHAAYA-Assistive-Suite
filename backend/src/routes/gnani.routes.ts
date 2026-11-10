import { Router, Request, Response } from 'express';
import multer from 'multer';
import { gnaniService } from '../services/gnaniService.js';

export const gnaniRouter = Router();

// Configure multer memory storage for audio uploads up to 10MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

/**
 * GET /api/gnani/status
 * Returns API configuration status for Gnani Prisma STT & Timbre TTS
 */
gnaniRouter.get('/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    ...gnaniService.getStatus(),
  });
});

/**
 * POST /api/gnani/stt
 * Speech to Text via Gnani Prisma API
 * Accepts JSON with audioBase64 OR multipart/form-data with audio_file
 */
gnaniRouter.post('/stt', upload.single('audio_file'), async (req: Request, res: Response) => {
  try {
    const audioBuffer = req.file?.buffer;
    const audioBase64 = req.body?.audioBase64 || req.body?.audio;
    const languageCode = req.body?.languageCode || req.body?.language || 'indic';
    const model = req.body?.model || 'prisma-v3.0';

    // Call Gnani service (automatically handles missing key with demo fallback)
    const result = await gnaniService.transcribe({
      audioBuffer,
      audioBase64,
      languageCode,
      model,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      configured: false,
      demo: true,
      message: `Error processing STT request: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
});

/**
 * POST /api/gnani/tts
 * Text to Speech via Gnani Timbre API
 * Request body: { text, language, voice, speed }
 */
gnaniRouter.post('/tts', async (req: Request, res: Response) => {
  try {
    const { text, language, voice, speed, model } = req.body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({
        success: false,
        configured: false,
        demo: false,
        message: 'Invalid request: "text" field must be a non-empty string.',
      });
      return;
    }

    // Call Gnani service (automatically handles missing key with fallback)
    const result = await gnaniService.synthesize({
      text: text.trim(),
      language: language || 'en-IN',
      voice: voice || 'Nalini',
      model: model || 'timbre-v2.5',
      speed: typeof speed === 'number' ? speed : 1.0,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      configured: false,
      demo: true,
      message: `Error processing TTS request: ${error instanceof Error ? error.message : String(error)}`,
      useBrowserTTS: true,
    });
  }
});
