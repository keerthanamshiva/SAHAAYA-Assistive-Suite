import { useState, type ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MessageSquare,
  Eye,
  Heart,
  MapPin,
  AlertTriangle,
  Clock,
  ChevronRight,
  Zap,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEMO_ACTIVITY } from '../data/mockData';
import Modal from '../components/ui/Modal';
import DemoBanner from '../components/ui/DemoBanner';

const featureCards = [
  {
    to: '/hear',
    icon: Mic,
    label: 'HEAR',
    title: 'Hear to Text',
    desc: 'Convert spoken conversations and announcements into readable text.',
    color: '#176B67',
    bg: '#DCECE7',
  },
  {
    to: '/speak',
    icon: MessageSquare,
    label: 'SPEAK',
    title: 'Speak for Me',
    desc: 'Communicate through typed messages and speech synthesis.',
    color: '#2E8580',
    bg: '#E8F4F3',
  },
  {
    to: '/see',
    icon: Eye,
    label: 'SEE',
    title: 'Understand My Surroundings',
    desc: 'Read signs, recognize information, and hear descriptions.',
    color: '#176B67',
    bg: '#DCECE7',
  },
  {
    to: '/healthcare',
    icon: Heart,
    label: 'HEALTHCARE',
    title: 'Healthcare Assistant',
    desc: 'Understand prescriptions, medical reports, and written instructions.',
    color: '#E8B86D',
    bg: '#FEF3C7',
  },
  {
    to: '/navigate',
    icon: MapPin,
    label: 'NAVIGATE',
    title: 'Find My Way',
    desc: 'Find public service locations and destinations with ease.',
    color: '#2E8580',
    bg: '#E8F4F3',
  },
  {
    to: '/emergency',
    icon: AlertTriangle,
    label: 'EMERGENCY',
    title: 'Emergency Help',
    desc: 'Reach trusted contacts when you need immediate assistance.',
    color: '#DC2626',
    bg: '#FEE2E2',
  },
];

const quickActions = [
  { icon: Mic, label: 'Live captions', to: '/hear', color: '#176B67' },
  { icon: MessageSquare, label: 'Type message', to: '/speak', color: '#2E8580' },
  { icon: FileText, label: 'Read document', to: '/see', color: '#176B67' },
  { icon: Heart, label: 'Prescriptions', to: '/healthcare', color: '#E8B86D' },
  { icon: AlertTriangle, label: 'SOS Alert', to: '/emergency', color: '#DC2626' },
];

const activityIcons: Record<string, ElementType> = {
  Mic,
  MessageSquare,
  FileText,
  MapPin,
  Heart,
  AlertTriangle,
};

export default function DashboardPage() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [showAllActivity, setShowAllActivity] = useState(false);

  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  });

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <DemoBanner message="SAHAAYA is running in Demo Mode with simulated speech, OCR and emergency services." />

      {/* Greeting */}
      <div>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-secondary)' }}>
          {greeting}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
          Hello{user ? `, ${user.name.split(' ')[0]}` : ''}! How can SAHAAYA help you today?
        </h1>
      </div>

      {/* Quick actions */}
      <section aria-labelledby="quick-actions-heading">
        <h2
          id="quick-actions-heading"
          className="text-xs sm:text-sm font-semibold mb-3 uppercase tracking-wider"
          style={{ color: 'var(--color-secondary)' }}
        >
          Quick Actions
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
          {quickActions.map(({ icon: Icon, label, to, color }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border min-w-[96px] flex-shrink-0 hover:shadow-md transition-all cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
              aria-label={label}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
                style={{ backgroundColor: 'var(--color-teal-sage)' }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <span className="text-xs font-medium text-center leading-tight" style={{ color: 'var(--color-text)' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Feature cards grid */}
      <section aria-labelledby="features-heading">
        <h2
          id="features-heading"
          className="text-xs sm:text-sm font-semibold mb-3 uppercase tracking-wider"
          style={{ color: 'var(--color-secondary)' }}
        >
          Assistance Modes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureCards.map(({ to, icon: Icon, label, title, desc, color, bg }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="card p-5 text-left hover:-translate-y-1 transition-all duration-200 group border border-gray-100 cursor-pointer shadow-xs hover:shadow-md"
              aria-label={`${title}: ${desc}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: bg }}
                >
                  <Icon size={22} style={{ color }} />
                </div>
                <span className="text-xs font-bold tracking-wider" style={{ color: 'var(--color-secondary)' }}>
                  {label}
                </span>
              </div>
              <h3
                className="font-semibold text-base mb-1.5 group-hover:text-teal-700 transition-colors"
                style={{ color: 'var(--color-text)' }}
              >
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-secondary)' }}>
                {desc}
              </p>
              <div
                className="flex items-center gap-1 mt-3 text-xs font-semibold"
                style={{ color: 'var(--color-teal-deep)' }}
              >
                <span>Open Mode</span>
                <ChevronRight size={14} aria-hidden="true" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section aria-labelledby="activity-heading">
        <div className="flex items-center justify-between mb-3">
          <h2
            id="activity-heading"
            className="text-xs sm:text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-secondary)' }}
          >
            Recent Activity
          </h2>
          <button
            onClick={() => setShowAllActivity(true)}
            className="text-xs font-semibold hover:underline cursor-pointer"
            style={{ color: 'var(--color-teal-deep)' }}
          >
            View all
          </button>
        </div>
        <div className="card divide-y border" style={{ borderColor: 'var(--color-border)' }}>
          {DEMO_ACTIVITY.slice(0, 4).map((item) => {
            const Icon = activityIcons[item.icon] || Zap;
            return (
              <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-teal-sage)' }}
                >
                  <Icon size={18} style={{ color: 'var(--color-teal-deep)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                    {item.description}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={11} style={{ color: 'var(--color-secondary)' }} />
                    <span className="text-xs" style={{ color: 'var(--color-secondary)' }}>
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Activity Details Modal */}
      <Modal
        isOpen={showAllActivity}
        onClose={() => setShowAllActivity(false)}
        title="Recent Activity Log"
        size="md"
      >
        <div className="space-y-3">
          {DEMO_ACTIVITY.map((item) => {
            const Icon = activityIcons[item.icon] || Zap;
            return (
              <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-teal-sage)' }}
                >
                  <Icon size={16} style={{ color: 'var(--color-teal-deep)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    {item.description}
                  </p>
                  <span className="text-xs text-gray-500">{item.timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
