import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import Card from './Card';

interface TrendIndicator {
  direction: 'up' | 'down';
  percentage: number;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: TrendIndicator;
  icon?: React.ReactNode;
  color?: 'default' | 'orange' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  trend,
  icon,
  color = 'default',
  size = 'md',
  className = '',
}) => {
  const colorStyles = {
    default: 'text-neutral-text-primary',
    orange: 'text-brand-orange',
    blue: 'text-info',
  };

  const sizeStyles = {
    sm: {
      label: 'text-label',
      value: 'text-h4',
      padding: 'p-4',
    },
    md: {
      label: 'text-label',
      value: 'text-h2',
      padding: 'p-6',
    },
    lg: {
      label: 'text-label',
      value: 'text-display',
      padding: 'p-8',
    },
  };

  const currentSize = sizeStyles[size];
  const trendColor = trend?.direction === 'up' ? 'text-success' : 'text-error';

  return (
    <Card variant="default" padding="md" className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Label */}
          <p className="text-label text-neutral-text-secondary uppercase tracking-wide mb-3">
            {label}
          </p>

          {/* Value */}
          <p className={`${currentSize.value} font-bold ${colorStyles[color]} mb-2`}>
            {value}
          </p>

          {/* Trend Indicator */}
          {trend && (
            <div className={`flex items-center gap-1 ${trendColor} text-body-sm`}>
              {trend.direction === 'up' ? (
                <ArrowUp size={16} />
              ) : (
                <ArrowDown size={16} />
              )}
              <span className="font-medium">
                {trend.percentage > 0 ? '+' : ''}{trend.percentage}%
              </span>
            </div>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <div className="text-neutral-text-tertiary">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default KpiCard;
