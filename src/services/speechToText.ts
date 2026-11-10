/**
 * Speech-to-Text Service Architecture
 * Demo mode: Uses mock data simulation.
 * Production target: Gnani Prisma STT API via secure backend proxy (no client-side API keys).
 */

export interface STTConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
}

export interface STTResult {
  text: string;
  confidence: number;
  isFinal: boolean;
  speaker?: string;
}

export type STTEventHandler = (result: STTResult) => void;
export type STTErrorHandler = (error: Error) => void;

export interface STTService {
  start(config: STTConfig, onResult: STTEventHandler, onError: STTErrorHandler): Promise<void>;
  stop(): void;
  isSupported(): boolean;
}

/**
 * Demo implementation — simulates transcription with realistic multi-speaker dialogues.
 */
export class DemoSTTService implements STTService {
  private isRunning = false;
  private interval: ReturnType<typeof setInterval> | null = null;

  isSupported() {
    return true;
  }

  async start(_config: STTConfig, onResult: STTEventHandler, _onError: STTErrorHandler) {
    this.isRunning = true;
    const demoLines = [
      'Please collect your token from counter three.',
      'Where should I wait for the doctor?',
      'You may wait near the blue seating area.',
      'Token number 47, please proceed to Room 204.',
      'Doctor has verified your blood reports.',
      'Next patient for ECG please step into Room 102.',
    ];
    let i = 0;
    this.interval = setInterval(() => {
      if (!this.isRunning) return;
      onResult({
        text: demoLines[i % demoLines.length],
        confidence: 0.95,
        isFinal: true,
        speaker: i % 2 === 0 ? 'Receptionist' : 'You',
      });
      i++;
    }, 3500);
  }

  stop() {
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

/**
 * Gnani Prisma STT Service Interface
 * Routes audio streams through a secured backend proxy endpoint (/api/speech/transcribe).
 * Note: Never store Gnani API keys or tokens in frontend client code.
 */
export class GnaniPrismaSTTService implements STTService {
  public running = false;
  public readonly backendProxyUrl: string;

  constructor(backendProxyUrl: string = '/api/gnani/stt') {
    this.backendProxyUrl = backendProxyUrl;
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
  }

  async start(_config: STTConfig, _onResult: STTEventHandler, onError: STTErrorHandler): Promise<void> {
    try {
      this.running = true;
      // In production, instantiate WebSocket connection to backendProxyUrl:
      // const ws = new WebSocket(`${this.backendProxyUrl}?lang=${config.language}`);
      // ws.onmessage = (event) => onResult(JSON.parse(event.data));
    } catch (err) {
      this.running = false;
      onError(err instanceof Error ? err : new Error('STT initialization error'));
    }
  }

  stop(): void {
    this.running = false;
  }
}

// Active service instance: DemoSTTService for preview, switchable via configuration
export const sttService: STTService = new DemoSTTService();
