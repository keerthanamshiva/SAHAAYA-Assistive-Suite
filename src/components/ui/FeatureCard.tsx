import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  color?: string;
  bgColor?: string;
  onClick?: () => void;
  badge?: string;
  children?: ReactNode;
}

export default function FeatureCard({
  icon: Icon,
  title,
  subtitle,
  color = '#176B67',
  bgColor = '#DCECE7',
  onClick,
  badge,
  children,
}: FeatureCardProps) {
  return (
    <button
      onClick={onClick}
      className="card-feature text-left w-full"
      aria-label={`${title}: ${subtitle}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: bgColor }}
        >
          <Icon size={22} style={{ color }} />
        </div>
        {badge && <span className="badge">{badge}</span>}
      </div>
      <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--color-text)' }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-secondary)' }}>
        {subtitle}
      </p>
      {children}
    </button>
  );
}
