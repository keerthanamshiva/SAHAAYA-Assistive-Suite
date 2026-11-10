/**
 * Text-to-Speech Service Architecture
 * Demo mode: Web Speech API (browser native) fallback.
 * Production target: Gnani Timbre TTS API via secure backend proxy (no client-side API keys).
 */

export interface TTSConfig {
  language: string;
  voice?: string;
  rate: number;
  pitch?: number;
  volume: number;
}

export interface TTSService {
  speak(text: string, config: TTSConfig): Promise<void>;
  stop(): void;
  pause(): void;
  resume(): void;
  isSupported(): boolean;
  getAvailableVoices(): SpeechSynthesisVoice[];
}

/**
 * Browser Web Speech API TTS — standard client-side fallback.
 */
export class BrowserTTSService implements TTSService {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) return [];
    return window.speechSynthesis.getVoices();
  }

  async speak(text: string, config: TTSConfig): Promise<void> {
    if (!this.isSupported() || !text.trim()) return;
    this.stop();

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = config.rate || 1.0;
      utterance.volume = config.volume ?? 1.0;
      utterance.lang = config.language || 'en-US';

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  }

  stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  pause(): void {
    if (this.isSupported()) {
      window.speechSynthesis.pause();
    }
  }

  resume(): void {
    if (this.isSupported()) {
      window.speechSynthesis.resume();
    }
  }
}

/**
 * Gnani Timbre TTS Service Interface
 * Proxies synthesis requests to a secure backend route (/api/speech/synthesize).
 * Note: Keeps all API secrets on backend.
 */
export class GnaniTimbreTTSService implements TTSService {
  public readonly backendProxyUrl: string;
  private audio: HTMLAudioElement | null = null;

  constructor(backendProxyUrl: string = '/api/gnani/tts') {
    this.backendProxyUrl = backendProxyUrl;
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Audio' in window;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return [];
  }

  async speak(_text: string, _config: TTSConfig): Promise<void> {
    // In production:
    // const res = await fetch(this.backendProxyUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ text, language: config.language, rate: config.rate })
    // });
    // const audioBlob = await res.blob();
    // this.audio = new Audio(URL.createObjectURL(audioBlob));
    // return this.audio.play();
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  pause(): void {
    if (this.audio) this.audio.pause();
  }

  resume(): void {
    if (this.audio) this.audio.play();
  }
}

// Active service instance: BrowserTTSService for preview, switchable via configuration
export const ttsService: TTSService = new BrowserTTSService();
