import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  trend,
  trendValue,
  icon,
  color = 'blue',
  className = '',
}) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  };

  const trendIcons = {
    up: (
      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    down: (
      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
    neutral: null,
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
        {icon && <div className="text-gray-400 dark:text-gray-500">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</span>
        {unit && <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>}
      </div>
      {trend && trendValue && (
        <div className="flex items-center gap-1 mt-2">
          {trendIcons[trend]}
          <span className="text-xs text-gray-500 dark:text-gray-400">{trendValue}</span>
        </div>
      )}
    </div>
  );
};
