/**
 * SAHAAYA Backend API Client
 * Secure communication layer with the Node.js Express backend.
 * Secrets and API keys are strictly kept on the backend.
 */

const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');

export interface GnaniStatusResponse {
  success: boolean;
  gnaniConfigured: boolean;
  stt: {
    provider: string;
    configured: boolean;
    model: string;
    supportedLanguages: string[];
  };
  tts: {
    provider: string;
    configured: boolean;
    model: string;
    voices: string[];
    supportedLanguages: string[];
  };
}

export interface STTBackendResult {
  success: boolean;
  configured: boolean;
  demo: boolean;
  message: string;
  transcript?: string;
  confidence?: number;
  language?: string;
}

export interface TTSBackendResult {
  success: boolean;
  configured: boolean;
  demo: boolean;
  message: string;
  audioContent?: string; // base64
  contentType?: string;
  useBrowserTTS?: boolean;
}

export class ApiClient {
  private baseUrl = API_BASE_URL;

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`);
      return res.ok;
    } catch {
      return false;
    }
  }

  async getGnaniStatus(): Promise<GnaniStatusResponse | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/gnani/status`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
async transcribe(
  audioBlob: Blob,
  languageCode: string = 'en-IN'
): Promise<STTBackendResult> {
  try {
    const formData = new FormData();

    const extension = audioBlob.type.includes('ogg') ? 'ogg' : 'webm';

    formData.append(
      'audio_file',
      audioBlob,
      `recording.${extension}`
    );

    formData.append('languageCode', languageCode);
    formData.append('model', 'prisma-v3.0');

    const res = await fetch(`${this.baseUrl}/api/gnani/stt`, {
      method: 'POST',
      body: formData,
    });

    return await res.json();
  } catch (err) {
    return {
      success: false,
      configured: false,
      demo: true,
      message: `Network error connecting to backend: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
}

  async synthesize(
    text: string,
    options: { language?: string; voice?: string; speed?: number } = {}
  ): Promise<TTSBackendResult> {
    try {
      const res = await fetch(`${this.baseUrl}/api/gnani/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: options.language || 'en-IN',
          voice: options.voice || 'Nalini',
          speed: options.speed ?? 1.0,
        }),
      });
      return await res.json();
    } catch (err) {
      return {
        success: false,
        configured: false,
        demo: true,
        useBrowserTTS: true,
        message: `Network error connecting to backend: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }
}

export const apiClient = new ApiClient();
