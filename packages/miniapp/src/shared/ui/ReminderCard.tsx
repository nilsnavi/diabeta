import React from 'react';

interface ReminderCardProps {
  title: string;
  time: string;
  frequency: string;
  enabled: boolean;
  onToggle?: () => void;
  onClick?: () => void;
  className?: string;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  title,
  time,
  frequency,
  enabled,
  onToggle,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center justify-between p-4
        bg-white dark:bg-gray-800
        rounded-2xl
        shadow-sm
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
        transition-all duration-200
        ${className}
      `}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xl">
          ⏰
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {time} • {frequency === 'daily' ? 'Ежедневно' : frequency === 'weekly' ? 'Еженедельно' : frequency}
          </p>
        </div>
      </div>
      {onToggle && (
        <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={onToggle}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      )}
    </div>
  );
};
