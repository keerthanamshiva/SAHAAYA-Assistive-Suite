import type {
  TranscriptionEntry,
  QuickMessage,
  EmergencyContact,
  PrescriptionEntry,
  PublicPlace,
  ActivityItem,
  MedicineReminder,
} from '../types';

export const DEMO_TRANSCRIPTIONS: TranscriptionEntry[] = [
  {
    id: '1',
    speaker: 'Receptionist',
    text: 'Please collect your registration token from counter number three.',
    timestamp: '10:32 AM',
    language: 'en',
  },
  {
    id: '2',
    speaker: 'You',
    text: 'Where should I wait?',
    timestamp: '10:32 AM',
    language: 'en',
  },
  {
    id: '3',
    speaker: 'Receptionist',
    text: 'Please wait near the blue seating area on your left.',
    timestamp: '10:33 AM',
    language: 'en',
  },
  {
    id: '4',
    speaker: 'Announcement',
    text: 'Token number 47, please proceed to Room 204 for consultation.',
    timestamp: '10:35 AM',
    language: 'en',
  },
];

export const DEMO_RAILWAY_ANNOUNCEMENTS: TranscriptionEntry[] = [
  {
    id: 'r1',
    speaker: 'Announcement',
    text: 'Attention passengers. The Rajdhani Express to New Delhi, train number 12431, will depart from Platform 3 at 14:30 hours.',
    timestamp: '14:15',
    language: 'en',
  },
  {
    id: 'r2',
    speaker: 'Announcement',
    text: 'The Bengaluru-Chennai Shatabdi Express is now arriving at Platform 2. Passengers are requested to stand behind the yellow line.',
    timestamp: '14:22',
    language: 'en',
  },
];

export const QUICK_MESSAGES: QuickMessage[] = [
  { id: 'h1', text: 'I need to register.', category: 'hospital', language: 'en' },
  { id: 'h2', text: 'Please call the doctor.', category: 'hospital', language: 'en' },
  { id: 'h3', text: 'I need water.', category: 'hospital', language: 'en' },
  { id: 'h4', text: 'I am experiencing pain.', category: 'hospital', language: 'en' },
  { id: 'h5', text: 'Please explain this again.', category: 'hospital', language: 'en' },
  { id: 'h6', text: 'Where is the pharmacy?', category: 'hospital', language: 'en' },
  { id: 'h7', text: 'I need assistance.', category: 'hospital', language: 'en' },
  { id: 'r1', text: 'Where is my platform?', category: 'railway', language: 'en' },
  { id: 'r2', text: 'Where can I buy a ticket?', category: 'railway', language: 'en' },
  { id: 'r3', text: 'Please help me find my train.', category: 'railway', language: 'en' },
  { id: 'b1', text: 'Where is this bus going?', category: 'bus', language: 'en' },
  { id: 'b2', text: 'I need help finding my bus.', category: 'bus', language: 'en' },
  { id: 'g1', text: 'Please wait.', category: 'general', language: 'en' },
  { id: 'g2', text: 'I need assistance.', category: 'general', language: 'en' },
  { id: 'g3', text: 'Thank you.', category: 'general', language: 'en' },
  { id: 'g4', text: 'Please speak slowly.', category: 'general', language: 'en' },
  { id: 'g5', text: 'I cannot speak. Please read my message.', category: 'general', language: 'en' },
];

export const DEMO_EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: 'e1', name: 'Priya Sharma', phone: '+91 98765 43210', relationship: 'Sister' },
  { id: 'e2', name: 'Dr. Ramesh Kumar', phone: '+91 87654 32109', relationship: 'Doctor' },
];

export const DEMO_PRESCRIPTIONS: PrescriptionEntry[] = [
  {
    id: 'p1',
    medicineName: 'Amoxicillin 500mg',
    dosage: '1 tablet',
    timing: 'Three times daily',
    instructions: 'Take 1 tablet three times daily after meals for 5 days',
    simplifiedExplanation: 'Take one tablet after breakfast, after lunch, and after dinner. Continue for 5 days.',
    duration: '5 days',
    foodInstruction: 'After meals',
  },
  {
    id: 'p2',
    medicineName: 'Pantoprazole 40mg',
    dosage: '1 tablet',
    timing: 'Once daily',
    instructions: 'Take 1 tablet before breakfast',
    simplifiedExplanation: 'Take one tablet every morning before you eat breakfast.',
    foodInstruction: 'Before meals',
  },
];

export const DEMO_MEDICINE_REMINDERS: MedicineReminder[] = [
  {
    id: 'mr1',
    medicineName: 'Amoxicillin 500mg',
    instructions: 'After meals, 3 times a day',
    reminderTime: '08:00',
    frequency: 'Three times daily',
    active: true,
  },
];

export const DEMO_PUBLIC_PLACES: PublicPlace[] = [
  {
    id: 'pl1',
    name: 'Victoria Hospital',
    category: 'hospital',
    address: 'K.R. Market, Bengaluru - 560002',
    distance: '1.2 km',
    destinations: ['Reception', 'Registration', 'Emergency', 'Pharmacy', 'Laboratory', 'Radiology', 'Consultation Rooms'],
  },
  {
    id: 'pl2',
    name: 'Bowring & Lady Curzon Hospital',
    category: 'hospital',
    address: 'Shivaji Nagar, Bengaluru - 560001',
    distance: '2.8 km',
    destinations: ['Reception', 'Emergency', 'Pharmacy', 'Wards', 'OPD'],
  },
  {
    id: 'pl3',
    name: 'KSR Bengaluru City Railway Station',
    category: 'railway',
    address: 'Gubbi Thotadappa Road, Bengaluru - 560023',
    distance: '3.1 km',
    destinations: ['Platform 1', 'Platform 2', 'Platform 3', 'Ticket Counter', 'Enquiry', 'Waiting Hall', 'Accessibility Help Desk'],
  },
  {
    id: 'pl4',
    name: 'Kempegowda Bus Station (Majestic)',
    category: 'bus',
    address: 'Gubbi Thotadappa Road, Bengaluru',
    distance: '3.4 km',
    destinations: ['KSRTC Booking', 'Platform Bay 1-5', 'Platform Bay 6-10', 'Information Desk', 'Waiting Lounge'],
  },
];

export const DEMO_ACTIVITY: ActivityItem[] = [
  {
    id: 'a1',
    type: 'hearing',
    description: 'Transcribed conversation at Victoria Hospital reception',
    timestamp: '2 hours ago',
    icon: 'Mic',
  },
  {
    id: 'a2',
    type: 'healthcare',
    description: 'Read prescription from Dr. Mehta',
    timestamp: 'Yesterday',
    icon: 'FileText',
  },
  {
    id: 'a3',
    type: 'speech',
    description: 'Used quick message: "I need to register"',
    timestamp: 'Yesterday',
    icon: 'MessageSquare',
  },
  {
    id: 'a4',
    type: 'navigation',
    description: 'Navigated to Bowring Hospital pharmacy',
    timestamp: '2 days ago',
    icon: 'MapPin',
  },
];

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
];

export const SAMPLE_SIGN_RECOGNITIONS = [
  { id: 's1', text: 'Hospital Registration Counter', confidence: 97, location: 'Main entrance' },
  { id: 's2', text: 'Department of Cardiology', confidence: 99, location: 'Second floor, Wing B' },
  { id: 's3', text: 'Room Number 204', confidence: 98, location: 'Second floor' },
  { id: 's4', text: 'Pharmacy — Open 24 Hours', confidence: 96, location: 'Ground floor' },
];
