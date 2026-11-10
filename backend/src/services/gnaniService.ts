import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { env } from '../config/env.js';
const convertAudioToWav = (input: Buffer): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const executablePath: string =
  process.env.FFMPEG_PATH || (ffmpegPath as unknown as string) || 'ffmpeg';

    const ffmpeg = spawn(executablePath, [
      '-hide_banner',
      '-loglevel', 'error',
      '-i', 'pipe:0',
      '-ac', '1',
      '-ar', '16000',
      '-c:a', 'pcm_s16le',
      '-f', 'wav',
      'pipe:1',
    ]);

    const output: Buffer[] = [];
    const errors: Buffer[] = [];

    ffmpeg.stdout.on('data', (chunk: Buffer) => output.push(chunk));
    ffmpeg.stderr.on('data', (chunk: Buffer) => errors.push(chunk));

    ffmpeg.on('error', reject);

    ffmpeg.on('close', (code) => {
      if (code === 0 && output.length > 0) {
        resolve(Buffer.concat(output));
      } else {
        reject(new Error(Buffer.concat(errors).toString() || 'Audio conversion failed'));
      }
    });

    ffmpeg.stdin.on('error', reject);
    ffmpeg.stdin.end(input);
  });
};

export interface STTRequestOptions {
  audioBuffer?: Buffer;
  audioBase64?: string;
  languageCode?: string;
  model?: string;
  sampleRate?: number;
}

export interface STTResponse {
  success: boolean;
  configured: boolean;
  demo: boolean;
  message: string;
  transcript?: string;
  confidence?: number;
  language?: string;
  raw?: unknown;
}

export interface TTSRequestOptions {
  text: string;
  language?: string;
  voice?: string;
  model?: string;
  speed?: number;
}

export interface TTSResponse {
  success: boolean;
  configured: boolean;
  demo: boolean;
  message: string;
  audioContent?: string; // base64 encoded audio
  contentType?: string;
  useBrowserTTS?: boolean;
  raw?: unknown;
}

export class GnaniService {
  /**
   * Status check for Gnani API configuration
   */
  getStatus() {
    return {
      gnaniConfigured: env.hasSTTKey() || env.hasTTSKey(),
      stt: {
        provider: 'Gnani Prisma STT',
        configured: env.hasSTTKey(),
        model: 'prisma-v3.0',
        supportedLanguages: ['en-IN', 'hi-IN', 'kn-IN', 'ta-IN', 'te-IN', 'ml-IN', 'indic'],
      },
      tts: {
        provider: 'Gnani Timbre TTS',
        configured: env.hasTTSKey(),
        model: 'timbre-v2.5',
        voices: ['Nalini', 'Pooja', 'Priya', 'Kavya'],
        supportedLanguages: ['en-IN', 'hi-IN', 'kn-IN', 'ta-IN', 'te-IN', 'ml-IN'],
      },
    };
  }

  /**
   * Process Speech-to-Text via Gnani Prisma API
   * Endpoint: POST https://api.vachana.ai/stt/v3
   */
  async transcribe(options: STTRequestOptions): Promise<STTResponse> {
    const apiKey = env.GNANI_STT_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        configured: false,
        demo: true,
        message: 'Gnani STT API key not configured. Add GNANI_API_KEY in backend/.env to activate live Prisma AI recognition.',
        transcript: 'Please collect your token from counter three and proceed to the waiting area.',
        confidence: 0.95,
        language: options.languageCode || 'en-IN',
      };
    }

    try {
      const language = options.languageCode || 'indic';
      const model = options.model || 'prisma-v3.0';

      // Build multipart/form-data payload for Gnani Prisma STT
      const boundary = '----GnaniPrismaFormBoundary' + Math.random().toString(36).substring(2);
      const audioData = options.audioBuffer || (options.audioBase64 ? Buffer.from(options.audioBase64, 'base64') : null);

      if (!audioData) {
        return {
          success: false,
          configured: true,
          demo: false,
          message: 'Audio data is required for transcription (audio file or audioBase64).',
        };
      }

      const postDataParts: Buffer[] = [];
      const wavAudio = await convertAudioToWav(audioData);

      // Add model field
      postDataParts.push(Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\n${model}\r\n`
      ));

      // Add language_code field
      postDataParts.push(Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="language_code"\r\n\r\n${language}\r\n`
      ));

      // Add audio_file field
      postDataParts.push(Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="audio_file"; filename="input.wav"\r\nContent-Type: audio/wav\r\n\r\n`
      ));
      postDataParts.push(wavAudio);
      postDataParts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

      const payload = Buffer.concat(postDataParts);

      const response = await fetch(`${env.GNANI_BASE_URL}/stt/v3`, {
        method: 'POST',
        headers: {
          'X-API-Key-ID': apiKey,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': String(payload.length),
        },
        body: payload,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          configured: true,
          demo: false,
          message: `Gnani STT API returned status ${response.status}: ${errorText}`,
        };
      }

      const result = await response.json() as Record<string, unknown>;
      const transcript = (result.transcript || result.text || result.result || '') as string;

      return {
        success: true,
        configured: true,
        demo: false,
        message: 'Transcription completed successfully by Gnani Prisma.',
        transcript,
        confidence: typeof result.confidence === 'number' ? result.confidence : 0.98,
        language,
        raw: result,
      };
    } catch (error) {
      return {
        success: false,
        configured: true,
        demo: false,
        message: `Failed to connect to Gnani STT service: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Synthesize Text-to-Speech via Gnani Timbre API
   * Endpoint: POST https://api.vachana.ai/api/v1/tts/inference
   */
  async synthesize(options: TTSRequestOptions): Promise<TTSResponse> {
    const apiKey = env.GNANI_TTS_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        configured: false,
        demo: true,
        message: 'Gnani TTS API key not configured. Add GNANI_API_KEY in backend/.env to activate live Timbre voice synthesis.',
        useBrowserTTS: true,
      };
    }

    try {
      const language = options.language || 'en-IN';
      const voice = options.voice || 'Nalini';
      const model = options.model || 'timbre-v2.5';
      const speed = options.speed || 1.0;

      const response = await fetch(`${env.GNANI_BASE_URL}/api/v1/tts/inference`, {
        method: 'POST',
        headers: {
          'X-API-Key-ID': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: options.text,
          voice,
          model,
          language,
          speed,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          configured: true,
          demo: false,
          message: `Gnani TTS API returned status ${response.status}: ${errorText}`,
          useBrowserTTS: true,
        };
      }const contentType=
      response.headers.get('content-type')||'audio/wav';

const responseContentType = response.headers.get('content-type') || 'application/octet-stream';

let sourceAudioBuffer: Buffer;

if (responseContentType.includes('application/json')) {
  const jsonResult = await response.json() as Record<string, unknown>;

  const audioBase64 = (
    jsonResult.audio ||
    jsonResult.audio_base64 ||
    jsonResult.data
  ) as string;

  if (!audioBase64 || typeof audioBase64 !== 'string') {
    throw new Error('Gnani returned no audio data.');
  }

  const cleanBase64 = audioBase64.replace(
    /^data:audio\/[^;]+;base64,/,
    ''
  );

  sourceAudioBuffer = Buffer.from(cleanBase64, 'base64');
} else {
  sourceAudioBuffer = Buffer.from(await response.arrayBuffer());
}

if (sourceAudioBuffer.length === 0) {
  throw new Error('Gnani returned an empty audio file.');
}

const wavAudio = await convertAudioToWav(sourceAudioBuffer);

return {
  success: true,
  configured: true,
  demo: false,
  message: 'Voice synthesized successfully by Gnani Timbre.',
  audioContent:
  sourceAudioBuffer.toString('base64'),
  contentType: contentType,
  
};
} catch (error) {
  return {
    success: false,
    configured: true,
    demo: false,
    message: `Failed to connect to Gnani TTS service: ${
      error instanceof Error ? error.message : String(error)
    }`,
    useBrowserTTS: true,
  };
}
      
 
  }
}

export const gnaniService = new GnaniService();
