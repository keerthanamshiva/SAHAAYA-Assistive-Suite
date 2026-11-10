import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, AlertTriangle, Sun, Moon } from 'lucide-react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useApp } from '../../context/AppContext';
import LanguageSelector from '../ui/LanguageSelector';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    user,
    preferences,
    updatePreferences,
    setLanguage,
  } = useApp();

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="lg:ml-64 min-h-screen flex flex-col">

        {/* Top bar */}
        <header
          className="sticky top-0 z-30 bg-white border-b px-4 h-14 flex items-center gap-3"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 lg:hidden"
          >
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: 'var(--color-teal-deep)' }}
            >
              S
            </div>

            <span
              className="font-bold text-sm tracking-tight"
              style={{ color: 'var(--color-text)' }}
            >
              SAHAAYA
            </span>
          </Link>

          <div className="flex-1" />

          {/* Accessibility Quick Toggle */}
          <div className="hidden sm:flex items-center gap-2 mr-2">

            {/* High Contrast */}
            <button
              onClick={() =>
                updatePreferences({
                  highContrast: !preferences.highContrast,
                })
              }
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                preferences.highContrast
                  ? 'bg-black text-yellow-300 border-yellow-300'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
              }`}
              title="Toggle High Contrast"
              aria-label="Toggle High Contrast"
            >
              {preferences.highContrast ? (
                <Sun size={15} />
              ) : (
                <Moon size={15} />
              )}

              <span className="hidden md:inline">
                Contrast
              </span>
            </button>

            {/* Language Selector */}
            <LanguageSelector
              value={user?.preferredLanguage || 'en'}
              onChange={setLanguage}
            />

          </div>

          {/* Emergency SOS */}
          <Link
            to="/emergency"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
            aria-label="Emergency SOS"
          >
            <AlertTriangle size={15} />
            <span>SOS</span>
          </Link>

          {/* User Profile */}
          {user && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm"
              style={{
                backgroundColor: 'var(--color-teal-secondary)',
              }}
              title={user.name}
            >
              {user.name[0].toUpperCase()}
            </div>
          )}

        </header>

        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-6">
          <Outlet />
        </main>

      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

    </div>
  );
}