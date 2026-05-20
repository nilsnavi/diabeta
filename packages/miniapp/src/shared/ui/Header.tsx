import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  className = '',
}) => {
  return (
    <header className={`sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {showBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {rightAction && (
          <div className="ml-2">{rightAction}</div>
        )}
      </div>
    </header>
  );
};
