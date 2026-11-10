import { useState } from 'react';
import {
  Pill,
  Clock,
  Volume2,
  Plus,
  CheckCircle,
  Calendar,
  Utensils,
  Bell,
  Check,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import DemoBanner from '../components/ui/DemoBanner';
import Disclaimer from '../components/ui/Disclaimer';
import Modal from '../components/ui/Modal';
import { DEMO_PRESCRIPTIONS, DEMO_MEDICINE_REMINDERS } from '../data/mockData';
import { ttsService } from '../services/textToSpeech';
import { useApp } from '../context/AppContext';
import type { PrescriptionEntry, MedicineReminder } from '../types';

export default function HealthcarePage() {
  const { preferences } = useApp();
  const [prescriptions] = useState<PrescriptionEntry[]>(DEMO_PRESCRIPTIONS);
  const [reminders, setReminders] = useState<MedicineReminder[]>(DEMO_MEDICINE_REMINDERS);
  const [readingId, setReadingId] = useState<string | null>(null);

  // New Reminder Modal
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('08:00');
  const [newMedFreq, setNewMedFreq] = useState('Once daily');
  const [newMedInst, setNewMedInst] = useState('Take with warm water');

  const handleSpeak = (text: string, id: string) => {
    if (readingId === id) {
      ttsService.stop();
      setReadingId(null);
      return;
    }
    setReadingId(id);
    ttsService
      .speak(text, {
        language: 'en-US',
        rate: preferences.speechSpeed || 1.0,
        volume: 1.0,
      })
      .finally(() => setReadingId(null));
  };

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const newReminder: MedicineReminder = {
      id: `rem-${Date.now()}`,
      medicineName: newMedName.trim(),
      instructions: newMedInst,
      reminderTime: newMedTime,
      frequency: newMedFreq,
      active: true,
    };

    setReminders((prev) => [...prev, newReminder]);
    setNewMedName('');
    setShowReminderModal(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Healthcare Assistant"
        subtitle="Understand doctor prescriptions, dosage instructions, and manage medication alarms."
        showBack
      />

      <DemoBanner message="Medical instructions and schedules are presented in Demo Mode based on sample clinical prescriptions." />

      {/* Active Prescriptions */}
      <section aria-labelledby="prescriptions-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="text-[#176B67]" size={20} />
            <h2 id="prescriptions-heading" className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
              Current Prescriptions
            </h2>
          </div>
          <span className="text-xs text-gray-500">Dr. Anand Mehta, MD</span>
        </div>

        <div className="space-y-4">
          {prescriptions.map((p) => {
            const isPlaying = readingId === p.id;
            return (
              <div
                key={p.id}
                className="card p-5 bg-white border space-y-3"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base" style={{ color: 'var(--color-teal-deep)' }}>
                      {p.medicineName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="badge bg-teal-50 text-teal-800">
                        Dosage: {p.dosage}
                      </span>
                      <span className="badge bg-amber-50 text-amber-800">
                        {p.timing}
                      </span>
                      {p.duration && (
                        <span className="badge bg-gray-100 text-gray-700">
                          <Calendar size={12} className="inline mr-1" />
                          {p.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleSpeak(
                        `${p.medicineName}. ${p.simplifiedExplanation}`,
                        p.id
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      isPlaying
                        ? 'bg-red-600 text-white'
                        : 'bg-[#176B67] text-white hover:bg-[#12534F]'
                    }`}
                  >
                    <Volume2 size={14} className={isPlaying ? 'animate-pulse' : ''} />
                    <span>{isPlaying ? 'Stop' : 'Listen'}</span>
                  </button>
                </div>

                {/* Prescription Details */}
                <div className="p-3.5 rounded-xl bg-gray-50 text-sm space-y-2 border border-gray-100">
                  <div className="flex items-start gap-2">
                    <Utensils size={15} className="text-amber-700 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">
                      <strong>Food Instruction:</strong> {p.foodInstruction || 'Follow normal meals'}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={15} className="text-teal-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Plain Language Explanation:
                      </p>
                      <p className="text-gray-900 mt-0.5 font-medium leading-relaxed">
                        {p.simplifiedExplanation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Medication Reminders */}
      <section aria-labelledby="reminders-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="text-[#176B67]" size={20} />
            <h2 id="reminders-heading" className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
              Medication Schedule
            </h2>
          </div>
          <button
            onClick={() => setShowReminderModal(true)}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Reminder</span>
          </button>
        </div>

        <div className="card divide-y bg-white border" style={{ borderColor: 'var(--color-border)' }}>
          {reminders.map((rem) => (
            <div key={rem.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock size={18} className="text-[#176B67]" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">{rem.medicineName}</h4>
                  <p className="text-xs text-gray-500">{rem.instructions}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                      {rem.reminderTime}
                    </span>
                    <span className="text-xs text-gray-400">{rem.frequency}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleReminder(rem.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                  rem.active
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-100 text-gray-500'
                }`}
                aria-label={`Toggle reminder for ${rem.medicineName}`}
              >
                {rem.active ? 'Active' : 'Off'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Hospital Visit Quick Steps */}
      <div className="card p-5 bg-white border space-y-3" style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
          Standard Hospital OPD Journey
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="font-bold text-[#176B67] block mb-1">Step 1: Token</span>
            <p className="text-gray-600">Collect registration token at reception Counter 3.</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="font-bold text-[#176B67] block mb-1">Step 2: Consultation</span>
            <p className="text-gray-600">Proceed to consultation room when token is announced.</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="font-bold text-[#176B67] block mb-1">Step 3: Pharmacy</span>
            <p className="text-gray-600">Show prescription slip at pharmacy on ground floor.</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="font-bold text-[#176B67] block mb-1">Step 4: Follow-up</span>
            <p className="text-gray-600">Schedule follow-up appointment within 5 business days.</p>
          </div>
        </div>
      </div>

      {/* Add Reminder Modal */}
      <Modal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        title="Schedule Medicine Reminder"
      >
        <form onSubmit={handleAddReminder} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Medicine Name & Dosage
            </label>
            <input
              type="text"
              required
              value={newMedName}
              onChange={(e) => setNewMedName(e.target.value)}
              placeholder="e.g. Paracetamol 650mg"
              className="input-field w-full p-2.5 text-sm"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Time
              </label>
              <input
                type="time"
                required
                value={newMedTime}
                onChange={(e) => setNewMedTime(e.target.value)}
                className="input-field w-full p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Frequency
              </label>
              <select
                value={newMedFreq}
                onChange={(e) => setNewMedFreq(e.target.value)}
                className="input-field w-full p-2 text-sm"
              >
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="As needed">As needed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Instructions
            </label>
            <input
              type="text"
              value={newMedInst}
              onChange={(e) => setNewMedInst(e.target.value)}
              placeholder="e.g. After breakfast with warm water"
              className="input-field w-full p-2.5 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setShowReminderModal(false)}
              className="btn-secondary text-xs py-2 px-4 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2 px-4 cursor-pointer flex items-center gap-1"
            >
              <Check size={14} />
              <span>Save Reminder</span>
            </button>
          </div>
        </form>
      </Modal>

      <Disclaimer message="SAHAAYA provides assistive simplification of medical documents. It is not a substitute for professional medical advice, diagnosis, or clinical evaluation." />
    </div>
  );
}
