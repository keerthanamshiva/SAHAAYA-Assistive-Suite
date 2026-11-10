import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Mic,
  MessageSquare,
  Eye,
  Hand,
  Heart,
  MapPin,
  AlertTriangle,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/hear', icon: Mic, label: 'Hear' },
  { to: '/speak', icon: MessageSquare, label: 'Speak' },
  { to: '/see', icon: Eye, label: 'See' },
  { to: '/sign-connect', icon: Hand, label: 'SignConnect' },
  { to: '/healthcare', icon: Heart, label: 'Healthcare' },
  { to: '/navigate', icon: MapPin, label: 'Navigate' },
  { to: '/emergency', icon: AlertTriangle, label: 'Emergency', accent: true },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 bg-white border-r flex flex-col transition-transform duration-300
          w-64 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ borderColor: 'var(--color-border)' }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <Link to="/dashboard" className="flex items-center gap-2.5" aria-label="SAHAAYA Dashboard">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm"
              style={{ backgroundColor: 'var(--color-teal-deep)' }}
            >
              S
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block leading-tight" style={{ color: 'var(--color-text)' }}>
                SAHAAYA
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-medium">Assistive Suite</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, accent }) => {
            const isActive = currentPath === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`sidebar-link ${isActive ? 'active' : ''} ${accent ? 'font-semibold' : ''}`}
                style={accent ? { color: isActive ? '#DC2626' : '#B91C1C' } : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  size={18}
                  style={accent ? { color: isActive ? '#DC2626' : '#B91C1C' } : undefined}
                />
                <span>{label}</span>
                {accent && (
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                    SOS
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--color-border)' }}>
          <Link
            to="/settings"
            className={`sidebar-link ${currentPath === '/settings' ? 'active' : ''}`}
            onClick={onClose}
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>

          {user ? (
            <div className="pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-3 px-3 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{ backgroundColor: 'var(--color-teal-secondary)' }}
                >
                  {user.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                    {user.name}
                  </p>
                  <p className="text-xs truncate text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="sidebar-link w-full text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/"
              className="sidebar-link text-center justify-center font-medium bg-emerald-50 text-emerald-800 rounded-lg hover:bg-emerald-100"
              onClick={onClose}
            >
              Sign In / Guest Home
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
