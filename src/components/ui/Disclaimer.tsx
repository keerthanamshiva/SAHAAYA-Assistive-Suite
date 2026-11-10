import { AlertTriangle } from 'lucide-react';

interface DisclaimerProps {
  message: string;
}

export default function Disclaimer({ message }: DisclaimerProps) {
  return (
    <div className="disclaimer" role="note">
      <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}
