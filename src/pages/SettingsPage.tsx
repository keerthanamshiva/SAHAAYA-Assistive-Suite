import { useState } from 'react';
import {
  Eye,
  Sun,
  Moon,
  Volume2,
  RotateCcw,
  Check,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import DemoBanner from '../components/ui/DemoBanner';
import Disclaimer from '../components/ui/Disclaimer';
import LanguageSelector from '../components/ui/LanguageSelector';
import { useApp } from '../context/AppContext';
import type { FontSizePreference } from '../types';

export default function SettingsPage() {
  const { user, preferences, updatePreferences, setFontSize, setLanguage } = useApp();
  const [savedNotice, setSavedNotice] = useState(false);

  const fontSizes: { size: FontSizePreference; label: string; px: string }[] = [
    { size: 'sm', label: 'Small', px: '14px' },
    { size: 'md', label: 'Default', px: '16px' },
    { size: 'lg', label: 'Large', px: '18px' },
    { size: 'xl', label: 'Extra Large', px: '20px' },
  ];

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const resetDefaults = () => {
    updatePreferences({
      highContrast: false,
      reducedMotion: false,
      speechSpeed: 1.0,
      fontSizePreference: 'md',
      screenReaderOptimized: false,
    });
    handleSave();
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Settings & Accessibility"
        subtitle="Customize display contrast, reading font size, language, and voice synthesis."
        showBack
      >
        <button
          onClick={resetDefaults}
          className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>Reset Defaults</span>
        </button>
      </PageHeader>

      <DemoBanner message="Settings are persisted to browser local storage for consistent accessibility across visits." />

      {/* Profile Card */}
      {user && (
        <div className="card p-5 bg-white border flex items-center gap-4" style={{ borderColor: 'var(--color-border)' }}>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-sm"
            style={{ backgroundColor: 'var(--color-teal-secondary)' }}
          >
            {user.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-gray-900">{user.name}</h3>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <span className="badge bg-emerald-100 text-emerald-800 text-xs">
            Demo Active
          </span>
        </div>
      )}

      {/* Visual Accessibility */}
      <div className="card p-5 sm:p-6 bg-white border space-y-5" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 pb-3 border-b">
          <Eye size={18} className="text-[#176B67]" />
          <h2 className="font-bold text-base text-gray-900">Visual & Display Accessibility</h2>
        </div>

        {/* Font Size Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Text Font Size
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {fontSizes.map(({ size, label, px }) => {
              const isSelected = preferences.fontSizePreference === size;
              return (
                <button
                  key={size}
                  onClick={() => {
                    setFontSize(size);
                    handleSave();
                  }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#176B67] text-white font-bold ring-2 ring-[#176B67]'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="block text-xs font-semibold">{label}</span>
                  <span className="text-[11px] opacity-80">{px}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* High Contrast Mode */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">High Contrast Palette</h4>
            <p className="text-xs text-gray-500">
              Increases visual edges and background contrast for improved visibility
            </p>
          </div>
          <button
            onClick={() => {
              updatePreferences({ highContrast: !preferences.highContrast });
              handleSave();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
              preferences.highContrast
                ? 'bg-black text-yellow-300 border border-yellow-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-pressed={preferences.highContrast}
          >
            {preferences.highContrast ? <Sun size={15} /> : <Moon size={15} />}
            <span>{preferences.highContrast ? 'Enabled' : 'Disabled'}</span>
          </button>
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Reduced Motion</h4>
            <p className="text-xs text-gray-500">
              Disables sliding and pulse animations for vestibular sensitivity
            </p>
          </div>
          <button
            onClick={() => {
              updatePreferences({ reducedMotion: !preferences.reducedMotion });
              handleSave();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              preferences.reducedMotion
                ? 'bg-[#176B67] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-pressed={preferences.reducedMotion}
          >
            {preferences.reducedMotion ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Voice & Language Settings */}
      <div className="card p-5 sm:p-6 bg-white border space-y-5" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 pb-3 border-b">
          <Volume2 size={18} className="text-[#176B67]" />
          <h2 className="font-bold text-base text-gray-900">Speech & Language Configuration</h2>
        </div>

        {/* Language Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Preferred Language
          </label>
          <LanguageSelector
            value={user?.preferredLanguage || 'en'}
            onChange={(lang) => {
              setLanguage(lang);
              handleSave();
            }}
          />
        </div>

        {/* Speech Rate Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Text-to-Speech Speed</h4>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
              {preferences.speechSpeed.toFixed(1)}x
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">0.5x</span>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={preferences.speechSpeed}
              onChange={(e) => {
                updatePreferences({ speechSpeed: parseFloat(e.target.value) });
                handleSave();
              }}
              className="flex-1 accent-[#176B67] cursor-pointer"
              aria-label="Speech speed"
            />
            <span className="text-xs text-gray-400">2.0x</span>
          </div>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <Check size={16} />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      <Disclaimer message="Accessibility overrides operate locally within your current browser profile." />
    </div>
  );
}
