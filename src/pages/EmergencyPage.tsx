import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Plus,
  Trash2,
  CheckCircle,
  Radio,
  X,
  PhoneCall,
  ShieldAlert,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import DemoBanner from '../components/ui/DemoBanner';
import Disclaimer from '../components/ui/Disclaimer';
import Modal from '../components/ui/Modal';
import { DEMO_EMERGENCY_CONTACTS } from '../data/mockData';
import { emergencyService } from '../services/emergency';
import type { EmergencyContact, SOSStatus } from '../types';

const HELPLINES = [
  { name: 'National Emergency', number: '112', desc: 'Police, Fire, Ambulance' },
  { name: 'Ambulance Helpline', number: '108', desc: 'Medical emergency services' },
  { name: 'Women Helpline', number: '1091', desc: 'Emergency assistance' },
  { name: 'Railway Security', number: '139', desc: 'Train & station security' },
];

export default function EmergencyPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>(DEMO_EMERGENCY_CONTACTS);
  const [sosStatus, setSosStatus] = useState<SOSStatus>('ready');
  const [countdown, setCountdown] = useState<number>(5);
  const [alertLogs, setAlertLogs] = useState<{ id: string; name: string; time: string; status: string }[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelation, setNewRelation] = useState('Family');

  const triggerSOSAlert = useCallback(async () => {
    setSosStatus('sent');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Send demo alert for all trusted contacts
    for (const c of contacts) {
      await emergencyService.sendAlert(c, 'EMERGENCY: User has triggered an SOS alert via SAHAAYA.');
      setAlertLogs((prev) => [
        {
          id: `log-${Date.now()}-${c.id}`,
          name: c.name,
          time: timestamp,
          status: 'Simulated SMS Dispatched',
        },
        ...prev,
      ]);
    }
  }, [contacts]);

  // Handle countdown during 'confirming' state
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (sosStatus === 'confirming') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            triggerSOSAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sosStatus, triggerSOSAlert]);

  const startSOSCountdown = () => {
    setCountdown(5);
    setSosStatus('confirming');
  };

  const cancelSOS = () => {
    setSosStatus('ready');
    setCountdown(5);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newContact: EmergencyContact = {
      id: `c-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      relationship: newRelation,
    };

    setContacts((prev) => [...prev, newContact]);
    setNewName('');
    setNewPhone('');
    setShowAddContact(false);
  };

  const removeContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const simulateShareLocation = async () => {
    if (contacts.length > 0) {
      await emergencyService.shareLocation(contacts[0]);
      alert('Location (Bengaluru - 12.9716° N, 77.5946° E) simulated sharing with trusted contacts.');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Emergency Help (SOS)"
        subtitle="Quickly alert your designated emergency contacts and access public helplines."
        showBack
      />

      <DemoBanner message="Emergency SOS running in Demo Mode. No real SMS messages, phone calls, or emergency dispatches are sent." />

      {/* Main SOS Trigger Area */}
      <div className="card p-6 sm:p-8 bg-white border text-center flex flex-col items-center justify-center space-y-4" style={{ borderColor: 'var(--color-border)' }}>
        {sosStatus === 'ready' && (
          <>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Emergency Assistance Needed?
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                Press the SOS button below to alert your {contacts.length} trusted emergency contacts with your current location.
              </p>
            </div>

            <button
              onClick={startSOSCountdown}
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-2xl sm:text-3xl shadow-xl hover:shadow-2xl transition-all transform active:scale-95 flex flex-col items-center justify-center gap-2 cursor-pointer border-4 border-red-200"
              aria-label="Activate Emergency SOS"
            >
              <AlertTriangle size={36} />
              <span>SOS</span>
            </button>
            <span className="text-xs text-gray-400">Tap to start 5-second cancelable alert</span>
          </>
        )}

        {sosStatus === 'confirming' && (
          <div className="space-y-4 py-4">
            <ShieldAlert size={48} className="mx-auto text-red-600 animate-bounce" />
            <h2 className="text-2xl font-bold text-red-600">
              Sending SOS in {countdown} seconds...
            </h2>
            <p className="text-sm text-gray-600">
              Tap cancel below if this was an accidental press.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={cancelSOS}
                className="btn-secondary text-sm py-2.5 px-6 cursor-pointer flex items-center gap-1.5"
              >
                <X size={16} />
                <span>Cancel Alert</span>
              </button>
              <button
                onClick={triggerSOSAlert}
                className="btn-primary bg-red-600 hover:bg-red-700 text-sm py-2.5 px-6 cursor-pointer"
              >
                Send Now
              </button>
            </div>
          </div>
        )}

        {sosStatus === 'sent' && (
          <div className="space-y-3 py-4">
            <CheckCircle size={48} className="mx-auto text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Emergency SOS Dispatched (Demo)
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
              Simulated SOS signal sent to {contacts.length} contacts with simulated GPS coordinates (12.9716° N, 77.5946° E).
            </p>
            {alertLogs.length > 0 && (
              <div className="text-xs text-left max-w-sm mx-auto bg-gray-50 p-2.5 rounded-lg border border-gray-100 space-y-1">
                {alertLogs.map((log) => (
                  <div key={log.id} className="flex justify-between text-gray-700">
                    <span>{log.name}:</span>
                    <span className="text-emerald-700 font-medium">{log.status} ({log.time})</span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setSosStatus('ready')}
              className="btn-secondary text-xs py-2 px-4 cursor-pointer mt-2"
            >
              Reset SOS Status
            </button>
          </div>
        )}
      </div>

      {/* Location Sharing & Quick Contact Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={simulateShareLocation}
          className="card p-4 bg-white border hover:border-[#176B67] text-left flex items-center gap-3 transition-colors cursor-pointer"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
            <MapPin size={20} className="text-[#176B67]" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900">Share Current Location</h3>
            <p className="text-xs text-gray-500">Send simulated GPS marker to all contacts</p>
          </div>
        </button>

        <div
          className="card p-4 bg-white border flex items-center gap-3"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <Radio size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900">Medical ID Active</h3>
            <p className="text-xs text-gray-500">Includes blood group, allergies & emergency info</p>
          </div>
        </div>
      </div>

      {/* Trusted Contacts List */}
      <section aria-labelledby="contacts-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="contacts-heading" className="font-bold text-base" style={{ color: 'var(--color-text)' }}>
            Trusted Emergency Contacts ({contacts.length})
          </h2>
          <button
            onClick={() => setShowAddContact(true)}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Contact</span>
          </button>
        </div>

        <div className="card divide-y bg-white border" style={{ borderColor: 'var(--color-border)' }}>
          {contacts.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-50 text-red-700 flex items-center justify-center font-bold text-sm">
                  {c.name[0]}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">{c.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{c.relationship}</span>
                    <span>•</span>
                    <span className="font-mono">{c.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${c.phone}`}
                  onClick={(e) => {
                    e.preventDefault();
                    emergencyService.callContact(c);
                    alert(`Demo Mode: Simulated phone call dialed to ${c.name} (${c.phone}).`);
                  }}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer"
                  title="Simulate calling contact"
                  aria-label={`Call ${c.name}`}
                >
                  <Phone size={15} />
                </a>
                <button
                  onClick={() => removeContact(c.id)}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                  title="Remove contact"
                  aria-label={`Remove ${c.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency Helplines */}
      <section aria-labelledby="helplines-heading" className="space-y-3">
        <h2 id="helplines-heading" className="font-bold text-base" style={{ color: 'var(--color-text)' }}>
          Official Emergency Helplines (India)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HELPLINES.map((h) => (
            <div
              key={h.number}
              className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-gray-400 block">{h.name}</span>
                <span className="text-lg font-black text-gray-900 tracking-wider font-mono">{h.number}</span>
                <p className="text-[11px] text-gray-500">{h.desc}</p>
              </div>
              <a
                href={`tel:${h.number}`}
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Demo Mode: Dialing helpline ${h.number} (${h.name}). In a live emergency, dial directly.`);
                }}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1 cursor-pointer"
              >
                <PhoneCall size={13} />
                <span>Call {h.number}</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Add Contact Modal */}
      <Modal
        isOpen={showAddContact}
        onClose={() => setShowAddContact(false)}
        title="Add Trusted Emergency Contact"
      >
        <form onSubmit={handleAddContact} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Suresh Kumar"
              className="input-field w-full p-2.5 text-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="input-field w-full p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Relationship
            </label>
            <select
              value={newRelation}
              onChange={(e) => setNewRelation(e.target.value)}
              className="input-field w-full p-2.5 text-sm"
            >
              <option value="Family">Family / Spouse / Parent</option>
              <option value="Sibling">Sister / Brother</option>
              <option value="Friend">Trusted Friend</option>
              <option value="Doctor">Primary Doctor / Caretaker</option>
              <option value="Neighbor">Neighbor</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setShowAddContact(false)}
              className="btn-secondary text-xs py-2 px-4 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2 px-4 cursor-pointer"
            >
              Save Contact
            </button>
          </div>
        </form>
      </Modal>

      <Disclaimer message="In an immediate life-threatening emergency, always call 112 directly from any mobile handset without delay." />
    </div>
  );
}
