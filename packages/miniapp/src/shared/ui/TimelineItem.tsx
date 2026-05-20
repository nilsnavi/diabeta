import React from 'react';

interface TimelineItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  value?: string | number;
  unit?: string;
  time: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  onClick?: () => void;
  className?: string;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  icon,
  title,
  subtitle,
  value,
  unit,
  time,
  color = 'blue',
  onClick,
  className = '',
}) => {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  return (
    <div
      onClick={onClick}
      className={`
        flex items-start gap-3 p-3
        bg-white dark:bg-gray-800
        rounded-xl
        ${onClick ? 'cursor-pointer active:bg-gray-50 dark:active:bg-gray-700' : ''}
        transition-colors duration-200
        ${className}
      `}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${colors[color]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{title}</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{time}</span>
        </div>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{subtitle}</p>
        )}
        {value !== undefined && (
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</span>
            {unit && <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
