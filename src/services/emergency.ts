/**
 * Emergency Service Interface
 * DEMO MODE: Simulates alert creation without real calls/SMS.
 * Future integration: SMS API, Emergency services
 */

import type { EmergencyContact } from '../types';

export interface EmergencyAlert {
  id: string;
  contact: EmergencyContact;
  message: string;
  timestamp: string;
  status: 'pending' | 'sent' | 'failed';
}

export interface EmergencyService {
  sendAlert(contact: EmergencyContact, message: string): Promise<EmergencyAlert>;
  callContact(contact: EmergencyContact): void;
  shareLocation(contact: EmergencyContact): Promise<void>;
}

export class DemoEmergencyService implements EmergencyService {
  async sendAlert(contact: EmergencyContact, message: string): Promise<EmergencyAlert> {
    await new Promise(r => setTimeout(r, 1500));
    return {
      id: `alert-${Date.now()}`,
      contact,
      message,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };
  }

  callContact(_contact: EmergencyContact) {
    // Demo: would initiate call
    console.log('[DEMO] Call initiated — no real call made in demo mode');
  }

  async shareLocation(_contact: EmergencyContact): Promise<void> {
    await new Promise(r => setTimeout(r, 800));
    console.log('[DEMO] Location shared — no real location data sent in demo mode');
  }
}

export const emergencyService: EmergencyService = new DemoEmergencyService();
