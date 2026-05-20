import React from 'react';

interface WarningBannerProps {
  title?: string;
  message: string;
  type?: 'warning' | 'info' | 'error';
  className?: string;
}

export const WarningBanner: React.FC<WarningBannerProps> = ({
  title,
  message,
  type = 'warning',
  className = '',
}) => {
  const types = {
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  };

  const icons = {
    warning: '⚠️',
    info: 'ℹ️',
    error: '❌',
  };

  return (
    <div className={`p-4 rounded-xl border ${types[type]} ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{icons[type]}</span>
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
};
