import { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Square,
  Plus,
  Sliders,
  Check,
  Key,
  AlertCircle,
  Activity,
  CheckCircle2,
  Sparkles,
  Clock,
  Trash2,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Disclaimer from '../components/ui/Disclaimer';
import Modal from '../components/ui/Modal';
import { QUICK_MESSAGES } from '../data/mockData';
import { ttsService } from '../services/textToSpeech';
import { apiClient, type GnaniStatusResponse } from '../services/apiClient';
import { useApp } from '../context/AppContext';
import type { QuickMessage, QuickMessageCategory } from '../types';

export type TTSEngineState =
  | 'Ready'
  | 'Connecting'
  | 'Recording'
  | 'Processing'
  | 'Success'
  | 'API key required'
  | 'Error'
  | 'Demo fallback';

interface SpeakHistoryEntry {
  id: string;
  text: string;
  createdAt: number;
}

export default function SpeakPage() {
  const { preferences, updatePreferences, user } = useApp();
  const [messages, setMessages] = useState<QuickMessage[]>(QUICK_MESSAGES);
  const [customText, setCustomText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QuickMessageCategory | 'all'>('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPhraseText, setNewPhraseText] = useState('');
  const [newPhraseCategory, setNewPhraseCategory] = useState<QuickMessageCategory>('general');
  const [showControls, setShowControls] = useState(false);
  const [speakHistory, setSpeakHistory] = useState<SpeakHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('sahaaya-speak-history-v1');
      return saved ? JSON.parse(saved) as SpeakHistoryEntry[] : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sahaaya-speak-history-v1', JSON.stringify(speakHistory));
  }, [speakHistory]);

  // Engine States
  const [engineState, setEngineState] = useState<TTSEngineState>('Ready');
  const [gnaniStatus, setGnaniStatus] = useState<GnaniStatusResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Voice synthesis engine ready');
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Check backend Gnani TTS configuration on mount
  useEffect(() => {
    let isMounted = true;
    async function checkBackend() {
      setEngineState('Connecting');
      setStatusMessage('Checking backend voice engine...');
      const status = await apiClient.getGnaniStatus();
      if (!isMounted) return;

      if (status) {
        setGnaniStatus(status);
        if (status.tts.configured) {
          setEngineState('Ready');
          setStatusMessage('Gnani Timbre TTS live engine connected & ready');
        } else {
          setEngineState('API key required');
          setStatusMessage('Gnani TTS API Key not set in backend/.env. Browser speech synthesis active as demo fallback.');
        }
      } else {
        setEngineState('Demo fallback');
        setStatusMessage('Backend offline. Browser speech synthesis active as fallback.');
      }
    }
    checkBackend();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories: { key: QuickMessageCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All Messages' },
    { key: 'hospital', label: 'Hospital' },
    { key: 'railway', label: 'Railway' },
    { key: 'bus', label: 'Bus Stand' },
    { key: 'general', label: 'General' },
  ];

  const filteredMessages = selectedCategory === 'all'
    ? messages
    : messages.filter((m) => m.category === selectedCategory);

  const handleSpeak = async (text: string, id?: string, saveHistory = true) => {
    if (!text.trim()) return;

    if (saveHistory) {
      setSpeakHistory((previous) => [
        {
          id: `${Date.now()}-${Math.random()}`,
          text: text.trim(),
          createdAt: Date.now(),
        },
        ...previous,
      ].slice(0, 20));
    }

    handleStop();
    setIsPlaying(true);
    if (id) setActiveMessageId(id);

    setEngineState('Processing');
    setStatusMessage(`Synthesizing: "${text.substring(0, 30)}..."`);

    try {
      // 1. Send to backend Gnani Timbre endpoint
      const res = await apiClient.synthesize(text, {
        language: user?.preferredLanguage || 'en-IN',
      speed: Math.min(1.15, Math.max(0.85, preferences.speechSpeed || 1.0))
      });

      // 2. If real Gnani Timbre audio returned
      if (res.success && res.audioContent) {
        setEngineState('Success');
        setStatusMessage('Playing voice audio (Synthesized by Gnani Timbre AI)');
        const audio = new Audio(`data:${res.contentType || 'audio/wav'};base64,${res.audioContent}`);
        currentAudioRef.current = audio;
        audio.onended = () => {
          setIsPlaying(false);
          setActiveMessageId(null);
          setEngineState('Ready');
          setStatusMessage('Voice synthesis engine ready');
        };
        audio.onerror = () => {
          setIsPlaying(false);
          setActiveMessageId(null);
          setEngineState('Error');
          setStatusMessage('Audio playback failed.');
        };
        await audio.play();
      } else {
        // 3. Fallback to Browser Speech Synthesis
        setEngineState('Demo fallback');
        setStatusMessage(res.message || 'Gnani key missing. Playing via Browser Web Speech fallback.');

        await ttsService.speak(text, {
          language: 'en-US',
          rate: preferences.speechSpeed || 1.0,
          volume: 1.0,
        });

        setIsPlaying(false);
        setActiveMessageId(null);
      }
    } catch (err) {
      console.error('Speech synthesis error', err);
      setEngineState('Error');
      setStatusMessage('Voice synthesis request failed. Using browser fallback.');

      await ttsService.speak(text, {
        language: 'en-US',
        rate: preferences.speechSpeed || 1.0,
        volume: 1.0,
      });
      setIsPlaying(false);
      setActiveMessageId(null);
    }
  };

  const handleStop = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    ttsService.stop();
    setIsPlaying(false);
    setActiveMessageId(null);
    if (gnaniStatus?.tts.configured) {
      setEngineState('Ready');
    } else {
      setEngineState('API key required');
    }
  };

  const handleAddPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhraseText.trim()) return;

    const newMsg: QuickMessage = {
      id: `custom-${Date.now()}`,
      text: newPhraseText.trim(),
      category: newPhraseCategory,
      language: 'en',
    };

    setMessages((prev) => [newMsg, ...prev]);
    setNewPhraseText('');
    setShowAddModal(false);
  };

  // Badge styling for the 8 engine states
  const getStateBadge = (state: TTSEngineState) => {
    switch (state) {
      case 'Ready':
        return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CheckCircle2 };
      case 'Connecting':
        return { bg: 'bg-blue-50 text-blue-800 border-blue-200', icon: Activity };
      case 'Recording':
        return { bg: 'bg-red-50 text-red-700 border-red-300 animate-pulse', icon: Volume2 };
      case 'Processing':
        return { bg: 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse', icon: Activity };
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
        title="Speak for Me"
        subtitle="Text-to-speech synthesis supporting Gnani Timbre AI with browser fallback."
        showBack
      >
        <button
          onClick={() => setShowControls(!showControls)}
          className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
            showControls ? 'bg-teal-50 border-teal-300 text-teal-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
          aria-expanded={showControls}
          aria-label="Voice rate and audio settings"
        >
          <Sliders size={15} />
          <span>Voice Settings</span>
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
              {!gnaniStatus?.tts.configured && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 border border-current">
                  Browser Fallback
                </span>
              )}
            </div>
            <p className="text-xs opacity-90 mt-0.5">{statusMessage}</p>
          </div>
        </div>

        <div className="text-right flex-shrink-0 text-[11px] font-mono">
          <span>Target: Gnani Timbre (/api/gnani/tts)</span>
        </div>
      </div>

      {/* Voice Speed Controls */}
      {showControls && (
        <div className="card p-4 bg-white border space-y-3" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              Speech Rate & Speed
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700">
              {preferences.speechSpeed.toFixed(1)}x
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">0.5x Slow</span>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={preferences.speechSpeed}
              onChange={(e) => updatePreferences({ speechSpeed: parseFloat(e.target.value) })}
              className="flex-1 accent-[#176B67] cursor-pointer"
              aria-label="Speech rate slider"
            />
            <span className="text-xs text-gray-400">2.0x Fast</span>
          </div>
        </div>
      )}

      {/* Custom Text-to-Speech Input */}
      <div className="card p-4 sm:p-6 bg-white border" style={{ borderColor: 'var(--color-border)' }}>
        <label htmlFor="custom-speech-input" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
          Type any message to speak aloud:
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <textarea
            id="custom-speech-input"
            rows={3}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="e.g. Excuse me, I am looking for counter 4."
            className="input-field w-full p-3 resize-none text-base"
            aria-label="Custom message to speak"
          />
        </div>
        <div className="flex items-center justify-between mt-3 gap-2">
          <span className="text-xs text-gray-400">
            {customText.length} characters
          </span>
          <div className="flex items-center gap-2">
            {isPlaying && (
              <button
                onClick={handleStop}
                className="px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Square size={14} />
                <span>Stop</span>
              </button>
            )}
            <button
              onClick={() => handleSpeak(customText)}
              disabled={!customText.trim() || isPlaying}
              className="btn-primary text-sm py-2 px-5 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Volume2 size={16} />
              <span>Speak Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* Speak History */}
      <section className="card p-4 sm:p-5 bg-white border space-y-3" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock size={18} style={{ color: 'var(--color-teal-deep)' }} />
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              Recent Messages
            </h3>
            <span className="text-xs text-gray-400">({speakHistory.length}/20)</span>
          </div>
          {speakHistory.length > 0 && (
            <button onClick={() => setSpeakHistory([])} className="text-xs text-red-500 hover:underline">
              Clear History
            </button>
          )}
        </div>

        {speakHistory.length === 0 ? (
          <p className="text-sm text-gray-400">Your spoken messages will appear here.</p>
        ) : (
          <div className="space-y-2">
            {speakHistory.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 rounded-lg border p-3" style={{ borderColor: 'var(--color-border)' }}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm break-words" style={{ color: 'var(--color-text)' }}>{entry.text}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(entry.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSpeak(entry.text, undefined, false)}
                    disabled={isPlaying}
                    aria-label="Speak this message again"
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Volume2 size={18} />
                  </button>
                  <button
                    onClick={() => setSpeakHistory(previous => previous.filter(item => item.id !== entry.id))}
                    aria-label="Delete this message"
                    className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Category Pills & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c.key
                  ? 'bg-[#176B67] text-white font-semibold'
                  : 'bg-white border text-gray-600 hover:bg-gray-100'
              }`}
              style={{ borderColor: 'var(--color-border)' }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} />
          <span>Add Quick Phrase</span>
        </button>
      </div>

      {/* Quick Messages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredMessages.map((msg) => {
          const isThisPlaying = isPlaying && activeMessageId === msg.id;
          return (
            <div
              key={msg.id}
              onClick={() => handleSpeak(msg.text, msg.id)}
              className={`p-4 rounded-2xl border text-left cursor-pointer transition-all hover:shadow-md flex flex-col justify-between min-h-[90px] ${
                isThisPlaying
                  ? 'bg-[#DCECE7] border-[#176B67] ring-2 ring-[#176B67]'
                  : 'bg-white hover:border-[#176B67]'
              }`}
              style={{ borderColor: isThisPlaying ? '#176B67' : 'var(--color-border)' }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSpeak(msg.text, msg.id);
                }
              }}
              aria-label={`Speak phrase: ${msg.text}`}
            >
              <p className="text-sm font-medium leading-snug" style={{ color: 'var(--color-text)' }}>
                "{msg.text}"
              </p>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {msg.category}
                </span>
                <span
                  className="text-xs font-semibold flex items-center gap-1"
                  style={{ color: 'var(--color-teal-deep)' }}
                >
                  <Volume2 size={14} className={isThisPlaying ? 'animate-pulse' : ''} />
                  <span>{isThisPlaying ? 'Playing' : 'Tap to speak'}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Phrase Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Quick Message"
      >
        <form onSubmit={handleAddPhrase} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Phrase Text
            </label>
            <input
              type="text"
              required
              value={newPhraseText}
              onChange={(e) => setNewPhraseText(e.target.value)}
              placeholder="e.g. Please help me locate my baggage."
              className="input-field w-full p-2.5 text-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Category
            </label>
            <select
              value={newPhraseCategory}
              onChange={(e) => setNewPhraseCategory(e.target.value as QuickMessageCategory)}
              className="input-field w-full p-2.5 text-sm"
            >
              <option value="general">General</option>
              <option value="hospital">Hospital</option>
              <option value="railway">Railway</option>
              <option value="bus">Bus Stand</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="btn-secondary text-xs py-2 px-4 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2 px-4 cursor-pointer flex items-center gap-1"
            >
              <Check size={14} />
              <span>Save Phrase</span>
            </button>
          </div>
        </form>
      </Modal>

      <Disclaimer message="Audio is synthesized via Gnani Timbre when configured in backend/.env, or natively through your browser's speech synthesis engine." />
    </div>
  );
}
