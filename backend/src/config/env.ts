import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),

  FRONTEND_URL:
    process.env.FRONTEND_URL || 'http://localhost:5173',

  GNANI_API_KEY:
    (process.env.GNANI_API_KEY || '').trim(),

  GEMINI_API_KEY:
    (process.env.GEMINI_API_KEY || '').trim(),

  get GNANI_STT_API_KEY(): string {
    return (
      process.env.GNANI_STT_API_KEY || ''
    ).trim() || this.GNANI_API_KEY;
  },

  get GNANI_TTS_API_KEY(): string {
    return (
      process.env.GNANI_TTS_API_KEY || ''
    ).trim() || this.GNANI_API_KEY;
  },

  hasSTTKey(): boolean {
    return !!this.GNANI_STT_API_KEY;
  },

  hasTTSKey(): boolean {
    return !!this.GNANI_TTS_API_KEY;
  },

  hasGeminiKey(): boolean {
    return !!this.GEMINI_API_KEY;
  },

  GNANI_BASE_URL: 'https://api.vachana.ai',
};