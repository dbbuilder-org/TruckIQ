import { cn } from '@/lib/utils';

interface HealthScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function HealthScore({ score, size = 'md', showLabel = false }: HealthScoreProps) {
  const getColor = (score: number) => {
    if (score >= 80) return 'bg-green-500 text-white';
    if (score >= 60) return 'bg-lime-500 text-white';
    if (score >= 40) return 'bg-yellow-500 text-white';
    if (score >= 20) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getLabel = (score: number) => {
    if (score >= 80) return 'Healthy';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'At Risk';
    if (score >= 20) return 'Poor';
    return 'Critical';
  };

  const sizeClasses = {
    sm: 'h-8 w-12 text-sm',
    md: 'h-10 w-14 text-base',
    lg: 'h-14 w-20 text-xl',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'rounded-md flex items-center justify-center font-bold',
          getColor(score),
          sizeClasses[size]
        )}
      >
        {score}
      </div>
      {showLabel && (
        <span className="text-sm text-slate-600">{getLabel(score)}</span>
      )}
    </div>
  );
}
