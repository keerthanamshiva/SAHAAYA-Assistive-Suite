import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Mic, MessageSquare, Eye, Heart, AlertTriangle, Hand } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/hear', icon: Mic, label: 'Hear' },
  { to: '/speak', icon: MessageSquare, label: 'Speak' },
  { to: '/see', icon: Eye, label: 'See' },
  { to: '/sign-connect', icon: Hand, label: 'Sign' },
  { to: '/healthcare', icon: Heart, label: 'Care' },
  { to: '/emergency', icon: AlertTriangle, label: 'SOS', accent: true },
];

export default function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t lg:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
      style={{ borderColor: 'var(--color-border)' }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 py-1 safe-area-bottom">
        {navItems.map(({ to, icon: Icon, label, accent }) => {
          const isActive = currentPath === to;
          return (
            <Link
              key={to}
              to={to}
              className={`bottom-nav-item flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs transition-colors ${
                isActive
                  ? accent
                    ? 'text-red-600 font-bold'
                    : 'text-[#176B67] font-bold'
                  : accent
                  ? 'text-red-500 hover:text-red-700'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} className={accent ? 'text-red-600' : ''} />
              <span className="text-[11px] mt-0.5">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
