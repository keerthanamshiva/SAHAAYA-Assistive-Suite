// User and Auth types
export interface User {
  id: string;
  name: string;
  email: string;
  preferredLanguage: Language;
  accessibilityPreferences: AccessibilityPreferences;
  profileImage?: string;
  createdAt: string;
}

export type Language = 'en' | 'kn' | 'hi' | 'ta' | 'te' | 'ml';

export interface AccessibilityPreferences {
  assistanceModes: AssistanceMode[];
  displayPreference: DisplayPreference;
  fontSizePreference: FontSizePreference;
  highContrast: boolean;
  reducedMotion: boolean;
  speechSpeed: number;
  defaultAssistanceMode?: AssistanceMode;
  screenReaderOptimized: boolean;
}

export type AssistanceMode =
  | 'hearing'
  | 'speech'
  | 'visual'
  | 'healthcare'
  | 'general';

export type DisplayPreference = 'standard' | 'large' | 'extra-large';
export type FontSizePreference = 'sm' | 'md' | 'lg' | 'xl';

// Transcription types
export interface TranscriptionEntry {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
  language: Language;
}

export interface TranscriptionSession {
  id: string;
  startedAt: string;
  entries: TranscriptionEntry[];
  mode: 'conversation' | 'announcement';
}

// Quick Messages
export interface QuickMessage {
  id: string;
  text: string;
  category: QuickMessageCategory;
  language: Language;
}

export type QuickMessageCategory = 'hospital' | 'railway' | 'bus' | 'general';

// Emergency
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export type SOSStatus = 'ready' | 'confirming' | 'sent' | 'failed';

// Healthcare
export interface PrescriptionEntry {
  id: string;
  medicineName: string;
  dosage: string;
  timing: string;
  instructions: string;
  simplifiedExplanation: string;
  duration?: string;
  foodInstruction?: string;
}

export interface MedicineReminder {
  id: string;
  medicineName: string;
  instructions: string;
  reminderTime: string;
  frequency: string;
  active: boolean;
}

// Navigation / Places
export interface PublicPlace {
  id: string;
  name: string;
  category: PlaceCategory;
  address: string;
  distance?: string;
  destinations: string[];
}

export type PlaceCategory = 'hospital' | 'railway' | 'bus' | 'government' | 'bank';

// Activity
export interface ActivityItem {
  id: string;
  type: AssistanceMode | 'navigation' | 'emergency';
  description: string;
  timestamp: string;
  icon: string;
}

// Settings / Notifications
export interface NotificationPreferences {
  reminders: boolean;
  emergencyAlerts: boolean;
  systemUpdates: boolean;
}
