import { Globe } from 'lucide-react';
import type { Language } from '../../types';

interface LanguageSelectorProps {
  value: Language;
  onChange: (lang: Language) => void;
  label?: string;
}

const languages = [
  { code: 'en', label: 'English' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
];

export default function LanguageSelector({
  value,
  onChange,
  label = 'Language',
}: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="lang-select"
        className="text-sm font-medium"
        style={{ color: 'var(--color-secondary)' }}
      >
        <Globe size={15} className="inline mr-1" />
        {label}
      </label>

      <select
        id="lang-select"
        value={value}
        onChange={(e) => onChange(e.target.value as Language)}
        className="input-field py-1.5 text-sm w-auto min-w-0"
        style={{ minHeight: '36px' }}
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </div>
  );
}