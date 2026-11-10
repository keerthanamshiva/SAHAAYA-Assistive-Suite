import { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Trash2,
  Copy,
  Check,
  Radio,
  Pause,
  Play,
  RotateCcw,
  Key,
  AlertCircle,
  Activity,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Disclaimer from '../components/ui/Disclaimer';
import { DEMO_TRANSCRIPTIONS, DEMO_RAILWAY_ANNOUNCEMENTS } from '../data/mockData';
import { sttService } from '../services/speechToText';
import { ttsService } from '../services/textToSpeech';
import { apiClient, type GnaniStatusResponse } from '../services/apiClient';
import { useApp } from '../context/AppContext';
import type { TranscriptionEntry } from '../types';

export type EngineState =
  | 'Ready'
  | 'Connecting'
  | 'Recording'
  | 'Processing'
  | 'Success'
  | 'API key required'
  | 'Error'
  | 'Demo fallback';

export default function HearPage() {
  const { preferences, user } = useApp();
  const [activeTab, setActiveTab] = useState<'live' | 'announcements'>('live');
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [liveEntries, setLiveEntries] = useState<TranscriptionEntry[]>(() => {
    try {
      const savedHistory = localStorage.getItem('sahaaya-hear-history-v1');
      return savedHistory
        ? JSON.parse(savedHistory) as TranscriptionEntry[]
        : DEMO_TRANSCRIPTIONS;
    } catch {
      return DEMO_TRANSCRIPTIONS;
    }
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [announcements] = useState<TranscriptionEntry[]>(DEMO_RAILWAY_ANNOUNCEMENTS);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Gnani Backend Engine Status
  const [engineState, setEngineState] = useState<EngineState>('Ready');
  const [gnaniStatus, setGnaniStatus] = useState<GnaniStatusResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Ready to capture conversation');

  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-scroll to bottom of transcripts
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [liveEntries]);

  // Save conversation history so it survives page changes and browser restarts.
  useEffect(() => {
    try {
      localStorage.setItem(
        'sahaaya-hear-history-v1',
        JSON.stringify(liveEntries)
      );
    } catch (error) {
      console.error('Could not save transcription history:', error);
    }
  }, [liveEntries]);

  // Check backend Gnani STT API configuration on mount
  useEffect(() => {
    let isMounted = true;
    async function checkBackend() {
      setEngineState('Connecting');
      setStatusMessage('Connecting to SAHAAYA backend API...');
      const status = await apiClient.getGnaniStatus();
      if (!isMounted) return;

      if (status) {
        setGnaniStatus(status);
        if (status.stt.configured) {
          setEngineState('Ready');
          setStatusMessage('Gnani Prisma STT live engine connected & ready');
        } else {
          setEngineState('API key required');
          setStatusMessage('Gnani STT API Key not configured in backend/.env. Using demo fallback.');
        }
      } else {
        setEngineState('Demo fallback');
        setStatusMessage('Backend not reachable or running in offline demo mode.');
      }
    }
    checkBackend();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle live transcription
  useEffect(() => {
    if (isListening && !isPaused) {
      // If live Gnani STT key is configured, record real audio chunks
      if (gnaniStatus?.stt.configured) {
        setEngineState('Recording');
        setStatusMessage('Listening & recording audio via microphone...');

        if (navigator.mediaDevices?.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
              if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            
          recorder.onstop = async () => {
  setEngineState('Processing');
  setStatusMessage('Sending audio to Gnani Prisma API...');

  const audioBlob = new Blob(audioChunksRef.current, {
    type: recorder.mimeType || 'audio/webm',
  });

  if (audioBlob.size === 0) {
    setEngineState('Error');
    setStatusMessage('No audio recorded. Please try again.');
    return;
  }

  const result = await apiClient.transcribe(audioBlob, 'en-IN');

  if (result.success && result.transcript) {
    setEngineState('Success');
    setStatusMessage('Transcription successful (Gnani Prisma AI)');

    setLiveEntries((prev) => [
   ...prev,
      {
        id: `entry-${Date.now()}`,
        speaker: 'Speaker',
        text: result.transcript || '',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        language:user?.preferredLanguage || 'en',
      },
    ]);
  } else {
    setEngineState('Error');
    setStatusMessage(result.message || 'STT transcription failed.');
  }
};    
               
               
              
            recorder.start(4000); // chunk every 4s
          }).catch(() => {
            setEngineState('Error');
            setStatusMessage('Microphone access denied. Using demo fallback.');
          });
        }
      } else {
        // Gnani key not configured — run clearly labeled simulated conversation
        setEngineState('Demo fallback');
        setStatusMessage('Demo fallback active — simulated dialogues with realistic public transit lines.');

        sttService.start(
          {
            language: user?.preferredLanguage || 'en',
            continuous: true,
            interimResults: true,
          },
          (result) => {
            const newEntry: TranscriptionEntry = {
              id: `entry-${Date.now()}-${Math.random()}`,
              speaker: result.speaker || 'Speaker',
              text: result.text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              language: user?.preferredLanguage || 'en',
            };
            setLiveEntries((prev) => [...prev, newEntry]);
          },
          (error) => {
            console.error('STT error', error);
            setEngineState('Error');
          }
        );
      }
    } else {
      sttService.stop();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (!isListening) {
        if (gnaniStatus?.stt.configured) {
          setEngineState('Ready');
          setStatusMessage('Microphone ready');
        } else {
          setEngineState('API key required');
          setStatusMessage('Gnani STT API Key not configured in backend/.env. Using demo fallback.');
        }
      }
    }

    return () => {
      sttService.stop();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isListening, isPaused, gnaniStatus, user?.preferredLanguage]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      setIsPaused(false);
    } else {
      setIsListening(true);
      setIsPaused(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const speakText = (text: string, id: string) => {
    if (speakingId === id) {
      ttsService.stop();
      setSpeakingId(null);
      return;
    }
    setSpeakingId(id);
    ttsService
      .speak(text, {
        language: 'en-US',
        rate: preferences.speechSpeed || 1.0,
        volume: 1.0,
      })
      .finally(() => setSpeakingId(null));
  };

  const clearTranscripts = () => setLiveEntries([]);
  const resetToSample = () => setLiveEntries(DEMO_TRANSCRIPTIONS);

  // Badge styling for the 8 engine states
  const getStateBadge = (state: EngineState) => {
    switch (state) {
      case 'Ready':
        return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CheckCircle2 };
      case 'Connecting':
        return { bg: 'bg-blue-50 text-blue-800 border-blue-200', icon: Activity };
      case 'Recording':
        return { bg: 'bg-red-50 text-red-700 border-red-300 animate-pulse', icon: Mic };
      case 'Processing':
        return { bg: 'bg-amber-50 text-amber-800 border-amber-300', icon: Activity };
      case 'Success':
        return { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: CheckCircle2 };
      case 'API key required':
        return { bg: 'bg-amber-100 text-amber-900 border-amber-300', icon: Key };
      case 'Error':
        return { bg: 'bg-red-100 text-red-900 border-red-300', icon: AlertCircle };
      case 'Demo fallback':
      default:
        return { bg: 'bg-purple-50 text-purple-800 border-purple-200', icon: Sparkles };
    }
  };

  const currentBadge = getStateBadge(engineState);
  const BadgeIcon = currentBadge.icon;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Hear to Text"
        subtitle="Real-time speech recognition powered by Gnani Prisma AI with offline demo fallback."
        showBack
      >
        <button
          onClick={resetToSample}
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-medium flex items-center gap-1 cursor-pointer"
          title="Reset to sample transcriptions"
        >
          <RotateCcw size={14} />
          <span className="hidden sm:inline">Reset Sample</span>
        </button>
      </PageHeader>

      {/* Engine Status Banner with 8 Dedicated States */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${currentBadge.bg}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2.5">
          <BadgeIcon size={18} className="flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider">
                Engine State: {engineState}
              </span>
              {!gnaniStatus?.stt.configured && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 border border-current">
                  Simulated Demo
                </span>
              )}
            </div>
            <p className="text-xs opacity-90 mt-0.5">{statusMessage}</p>
          </div>
        </div>

        <div className="text-right flex-shrink-0 text-[11px] font-mono">
          <span>Backend: http://127.0.0.1:5000</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
            activeTab === 'live'
              ? 'border-[#176B67] text-[#176B67] font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          aria-selected={activeTab === 'live'}
          role="tab"
        >
          <Radio size={16} />
          <span>Live Conversation</span>
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
            activeTab === 'announcements'
              ? 'border-[#176B67] text-[#176B67] font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          aria-selected={activeTab === 'announcements'}
          role="tab"
        >
          <Volume2 size={16} />
          <span>Station Announcements</span>
        </button>
      </div>

      {activeTab === 'live' ? (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={toggleListening}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-sm ${
                  isListening
                    ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                    : 'bg-[#176B67] text-white hover:bg-[#12534F]'
                }`}
                aria-pressed={isListening}
                aria-label={isListening ? 'Stop Listening' : 'Start Listening'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                <span>{isListening ? 'Stop Listening' : 'Start Listening'}</span>
              </button>

              {isListening && (
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer"
                  title={isPaused ? 'Resume listening' : 'Pause listening'}
                  aria-label={isPaused ? 'Resume listening' : 'Pause listening'}
                >
                  {isPaused ? <Play size={18} /> : <Pause size={18} />}
                </button>
              )}

              <span className="text-xs font-medium text-gray-500">
                {isListening ? (isPaused ? 'Paused' : 'Transcribing live...') : 'Microphone ready'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearTranscripts}
                disabled={liveEntries.length === 0}
                className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-40 cursor-pointer transition-colors"
                title="Clear transcriptions"
                aria-label="Clear transcriptions"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>

          {/* Transcript Log Window */}
          <div
            ref={scrollRef}
            className="card p-4 sm:p-6 min-h-[360px] max-h-[500px] overflow-y-auto space-y-4 border bg-white"
            style={{ borderColor: 'var(--color-border)' }}
            role="log"
            aria-live="polite"
            aria-label="Live Transcription stream"
          >
            {liveEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400">
                <Mic size={36} className="mb-2 opacity-30" />
                <p className="text-sm">No speech captured yet.</p>
                <p className="text-xs mt-1">Tap "Start Listening" to begin live speech-to-text.</p>
              </div>
            ) : (
              liveEntries.map((entry) => {
                const isUser = entry.speaker.toLowerCase() === 'you';
                return (
                  <div
                    key={entry.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-semibold" style={{ color: isUser ? '#176B67' : '#2E8580' }}>
                        {entry.speaker}
                      </span>
                      <span className="text-[11px] text-gray-400">{entry.timestamp}</span>
                      {!gnaniStatus?.stt.configured && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 uppercase font-semibold">
                          Simulated
                        </span>
                      )}
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-xs relative group ${
                        isUser
                          ? 'bg-[#E8F4F3] text-gray-900 rounded-tr-none'
                          : 'bg-gray-100 text-gray-900 rounded-tl-none'
                      }`}
                    >
                      <p>{entry.text}</p>
                      <div className="flex items-center gap-2 mt-2 pt-1 border-t border-black/5">
                        <button
                          onClick={() => copyText(entry.text, entry.id)}
                          className="text-[11px] text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
                          aria-label="Copy transcript text"
                        >
                          {copiedId === entry.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>{copiedId === entry.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={() => speakText(entry.text, entry.id)}
                          className="text-[11px] text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
                          aria-label="Speak text aloud"
                        >
                          <Volume2 size={12} className={speakingId === entry.id ? 'text-teal-600 animate-pulse' : ''} />
                          <span>{speakingId === entry.id ? 'Playing...' : 'Play'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Announcements Tab */
        <div className="space-y-4">
          <div className="card p-5 bg-white border" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                  Public Transit Feed
                </h3>
                <p className="text-xs text-gray-500">
                  Transcribed train, bus station, and hospital public address broadcasts
                </p>
              </div>
              <span className="badge">Auto-detect</span>
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {announcements.map((ann) => (
                <div key={ann.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-wider">
                        {ann.speaker}
                      </span>
                      <span className="text-xs text-gray-400">{ann.timestamp}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 font-medium">
                        Simulated
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--color-text)' }}>
                      {ann.text}
                    </p>
                  </div>
                  <button
                    onClick={() => speakText(ann.text, ann.id)}
                    className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 flex-shrink-0 cursor-pointer"
                    title="Read announcement aloud"
                    aria-label={`Read announcement: ${ann.text}`}
                  >
                    <Volume2 size={18} className={speakingId === ann.id ? 'text-teal-600 animate-pulse' : ''} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Disclaimer message="Transcriptions are generated in demo mode when GNANI_API_KEY is not set. Real Gnani AI models require active credentials in backend/.env." />
    </div>
  );
}
