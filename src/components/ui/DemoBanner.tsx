import { Info } from 'lucide-react';

interface DemoBannerProps {
  message?: string;
}

export default function DemoBanner({ message = 'Demo mode — no real data is stored or transmitted.' }: DemoBannerProps) {
  return (
    <div className="demo-banner" role="status" aria-live="polite">
      <Info size={15} className="flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
