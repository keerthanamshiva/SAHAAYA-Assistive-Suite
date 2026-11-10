import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mic,
  MessageSquare,
  Eye,
  Heart,
  ArrowRight,
  Building2,
  Train,
  Bus,
  Landmark,
  CreditCard,
  Globe,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const features = [
  {
    icon: Mic,
    title: 'Hear Every Word',
    description: 'Real-time speech-to-text in Indian languages. Never miss an important announcement or conversation.',
    color: '#176B67',
    bg: '#DCECE7',
  },
  {
    icon: MessageSquare,
    title: 'Express Yourself',
    description: 'Pre-loaded quick messages and text-to-speech for clear, dignified communication.',
    color: '#2E8580',
    bg: '#E8F4F3',
  },
  {
    icon: Eye,
    title: 'Understand Your Surroundings',
    description: 'Read signs, recognize text in images, and hear audio descriptions of your environment.',
    color: '#176B67',
    bg: '#DCECE7',
  },
  {
    icon: Heart,
    title: 'Healthcare Made Clear',
    description: 'Understand prescriptions, medical reports, and get hospital navigation assistance.',
    color: '#E8B86D',
    bg: '#FEF3C7',
  },
];

const publicPlaces = [
  { icon: Building2, label: 'Hospitals', color: '#176B67', bg: '#DCECE7' },
  { icon: Train, label: 'Railway Stations', color: '#2E8580', bg: '#E8F4F3' },
  { icon: Bus, label: 'Bus Stands', color: '#E8B86D', bg: '#FEF3C7' },
  { icon: Landmark, label: 'Govt. Offices', color: '#176B67', bg: '#DCECE7' },
  { icon: CreditCard, label: 'Banks', color: '#2E8580', bg: '#E8F4F3' },
];

const steps = [
  { num: '01', title: 'Choose Your Assistance', desc: 'Select the type of help you need — hearing, speaking, seeing, or healthcare.' },
  { num: '02', title: 'Interact Naturally', desc: 'Use touch, voice, or text. SAHAAYA adapts to your preferred way of communicating.' },
  { num: '03', title: 'Stay Independent', desc: 'Navigate public spaces with confidence. Get help exactly when and where you need it.' },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useApp();

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      login('ravi.kumar@example.com', 'Ravi Kumar');
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5" aria-label="SAHAAYA Home">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm"
              style={{ backgroundColor: 'var(--color-teal-deep)' }}
            >
              S
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--color-text)' }}>
              SAHAAYA
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Site navigation">
            {['Features', 'How it works', 'Places'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm font-medium transition-colors hover:text-teal-700"
                style={{ color: 'var(--color-secondary)' }}
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGetStarted}
              className="btn-secondary text-sm py-2 px-4 hidden sm:inline-flex cursor-pointer"
            >
              Demo Login
            </button>
            <button
              onClick={handleGetStarted}
              className="btn-primary text-sm py-2 px-4 cursor-pointer flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-b bg-white px-6 py-4 space-y-3">
            <a
              href="#features"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-gray-700"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-gray-700"
            >
              How it works
            </a>
            <a
              href="#places"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-gray-700"
            >
              Public Places
            </a>
            <div className="pt-2 border-t flex flex-col gap-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleGetStarted();
                }}
                className="btn-primary w-full py-2.5 text-center text-sm"
              >
                Launch Dashboard
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-16 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-8 border"
          style={{ backgroundColor: 'var(--color-teal-sage)', color: 'var(--color-teal-deep)', borderColor: '#c5ddd8' }}
        >
          <Globe size={14} aria-hidden="true" />
          <span>Available in English, Kannada, Hindi, Tamil, Telugu & Malayalam</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6" style={{ color: 'var(--color-text)' }}>
          Your world.<br />
          Your voice.<br />
          <span style={{ color: 'var(--color-teal-deep)' }}>Your independence.</span>
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--color-secondary)' }}>
          One accessible companion for communication, understanding, and assistance wherever life takes you.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={handleGetStarted}
            className="btn-primary text-base px-8 py-3.5 cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <span>Open SAHAAYA App</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <a href="#features" className="btn-secondary text-base px-8 py-3.5">
            Explore Features
          </a>
        </div>

        {/* Hero illustration */}
        <div className="mt-16 relative max-w-3xl mx-auto">
          <div
            className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
            style={{ backgroundColor: 'var(--color-teal-sage)', border: '1px solid #c5ddd8' }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Mic, label: 'Hear', desc: 'Live captions', to: '/hear' },
                { icon: MessageSquare, label: 'Speak', desc: 'Quick messages', to: '/speak' },
                { icon: Eye, label: 'See', desc: 'Read & describe', to: '/see' },
                { icon: Heart, label: 'Health', desc: 'Prescriptions', to: '/healthcare' },
              ].map(({ icon: Icon, label, desc, to }) => (
                <div
                  key={label}
                  onClick={() => navigate(to)}
                  className="bg-white rounded-2xl p-4 text-center cursor-pointer hover:-translate-y-1 transition-transform"
                  style={{ boxShadow: '0 2px 12px rgba(23,107,103,0.10)' }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(to);
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-teal-sage)' }}
                  >
                    <Icon size={20} style={{ color: 'var(--color-teal-deep)' }} />
                  </div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{label}</p>
                  <p className="text-xs mt-0.5 text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm font-medium italic flex items-center justify-center gap-1.5" style={{ color: 'var(--color-teal-deep)' }}>
                <Sparkles size={16} />
                "A little assistance. A lot more independence."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Built for every need</h2>
          <p className="text-base" style={{ color: 'var(--color-secondary)' }}>
            Four pillars of accessibility support, working together seamlessly.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, description, color, bg }) => (
            <div key={title} className="card p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ backgroundColor: bg }}
              >
                <Icon size={24} style={{ color }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-secondary)' }}>{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Public Places */}
      <section id="places" className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Navigate public spaces</h2>
          <p className="text-base" style={{ color: 'var(--color-secondary)' }}>
            SAHAAYA is designed for the places where accessibility matters most.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {publicPlaces.map(({ icon: Icon, label, color, bg }) => (
            <div
              key={label}
              onClick={() => navigate('/navigate')}
              className="card p-5 flex flex-col items-center gap-3 w-36 text-center cursor-pointer hover:-translate-y-1 transition-transform border border-gray-100"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: bg }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 my-8 rounded-3xl mx-6" style={{ backgroundColor: 'var(--color-teal-sage)' }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>How it works</h2>
            <p className="text-base" style={{ color: 'var(--color-secondary)' }}>Simple, intuitive, and always accessible.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="text-center">
                <div className="text-5xl font-black mb-4 opacity-20" style={{ color: 'var(--color-teal-deep)' }}>{num}</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-secondary)' }}>{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={handleGetStarted}
              className="btn-primary text-base px-8 py-3.5 cursor-pointer inline-flex items-center gap-2"
            >
              <span>Start using SAHAAYA</span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16 py-12" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: 'var(--color-teal-deep)' }}
                >
                  S
                </div>
                <span className="font-bold" style={{ color: 'var(--color-text)' }}>SAHAAYA</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
                A little assistance. A lot more independence.
              </p>
            </div>
            <div className="flex gap-12 text-sm">
              <div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Features</h4>
                <ul className="space-y-2 text-gray-500">
                  <li><Link to="/hear" className="hover:underline">Hear to Text</Link></li>
                  <li><Link to="/speak" className="hover:underline">Speak for Me</Link></li>
                  <li><Link to="/see" className="hover:underline">Visual Reader</Link></li>
                  <li><Link to="/healthcare" className="hover:underline">Prescription Helper</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Services</h4>
                <ul className="space-y-2 text-gray-500">
                  <li><Link to="/navigate" className="hover:underline">Navigation</Link></li>
                  <li><Link to="/emergency" className="hover:underline">Emergency SOS</Link></li>
                  <li><Link to="/dashboard" className="hover:underline">Dashboard</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t text-center text-xs" style={{ borderColor: 'var(--color-border)', color: 'var(--color-secondary)' }}>
            © 2026 SAHAAYA. Built with accessibility at its core. Demo mode active.
          </div>
        </div>
      </footer>
    </div>
  );
}
