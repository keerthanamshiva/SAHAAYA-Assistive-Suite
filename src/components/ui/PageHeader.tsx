import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  children?: ReactNode;
}

export default function PageHeader({ title, subtitle, showBack = false, children }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
      <div className="flex items-start gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 mt-0.5 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="section-title">{title}</h1>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
