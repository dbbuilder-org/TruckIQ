import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/lib/data/mock-data';

const riskConfig: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  low: { bg: 'bg-green-100', text: 'text-green-800', label: 'LOW' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'MED' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'HIGH' },
  critical: { bg: 'bg-red-100', text: 'text-red-800', label: 'CRIT' },
};

interface RiskBadgeProps {
  level: RiskLevel;
  showIcon?: boolean;
}

export function RiskBadge({ level, showIcon = true }: RiskBadgeProps) {
  const config = riskConfig[level];
  const icons: Record<RiskLevel, string> = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    critical: '🔴',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
        config.bg,
        config.text
      )}
    >
      {showIcon && icons[level]} {config.label}
    </span>
  );
}
