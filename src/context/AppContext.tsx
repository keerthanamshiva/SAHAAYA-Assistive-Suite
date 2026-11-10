import { type ReactNode, createContext, useContext, useState, useEffect } from 'react';
import type { User, AccessibilityPreferences, Language, FontSizePreference } from '../types';

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, name: string) => void;
  logout: () => void;
  preferences: AccessibilityPreferences;
  updatePreferences: (prefs: Partial<AccessibilityPreferences>) => void;
  setFontSize: (size: FontSizePreference) => void;
  setLanguage: (lang: Language) => void;
  isOnboarded: boolean;
  setOnboarded: (v: boolean) => void;
}

const defaultPreferences: AccessibilityPreferences = {
  assistanceModes: ['general'],
  displayPreference: 'standard',
  fontSizePreference: 'md',
  highContrast: false,
  reducedMotion: false,
  speechSpeed: 1.0,
  screenReaderOptimized: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('sahaaya_user');
    return stored ? JSON.parse(stored) : {
      id: 'demo-user-1',
      name: 'Ravi Kumar',
      email: 'ravi.kumar@example.com',
      preferredLanguage: 'en',
      accessibilityPreferences: defaultPreferences,
      createdAt: new Date().toISOString(),
    };
  });

  const [isOnboarded, setOnboardedState] = useState<boolean>(() => {
    return localStorage.getItem('sahaaya_onboarded') === 'true';
  });

  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    const stored = localStorage.getItem('sahaaya_prefs');
    return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
  });

  // Apply preferences to document
  useEffect(() => {
    const root = document.documentElement;
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    if (preferences.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    // Font size
    root.style.fontSize = {
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
    }[preferences.fontSizePreference];
  }, [preferences]);

  const login = (email: string, name: string) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      preferredLanguage: 'en',
      accessibilityPreferences: preferences,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem('sahaaya_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setOnboardedState(false);
    localStorage.removeItem('sahaaya_user');
    localStorage.removeItem('sahaaya_onboarded');
  };

  const updatePreferences = (prefs: Partial<AccessibilityPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...prefs };
      localStorage.setItem('sahaaya_prefs', JSON.stringify(updated));
      return updated;
    });
  };

  const setFontSize = (size: FontSizePreference) => updatePreferences({ fontSizePreference: size });
  
  const setLanguage = (lang: Language) => {
    if (user) {
      const updated = { ...user, preferredLanguage: lang };
      setUser(updated);
      localStorage.setItem('sahaaya_user', JSON.stringify(updated));
    }
  };

  const setOnboarded = (v: boolean) => {
    setOnboardedState(v);
    localStorage.setItem('sahaaya_onboarded', String(v));
  };

  return (
    <AppContext.Provider value={{
      user, isAuthenticated: !!user,
      login, logout,
      preferences, updatePreferences,
      setFontSize, setLanguage,
      isOnboarded, setOnboarded,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
