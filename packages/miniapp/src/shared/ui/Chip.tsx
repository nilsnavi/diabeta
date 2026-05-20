import React from 'react';

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  active = false,
  onClick,
  variant = 'default',
  className = '',
}) => {
  const variants = {
    default: active 
      ? 'bg-blue-500 text-white' 
      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    success: active
      ? 'bg-green-500 text-white'
      : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    warning: active
      ? 'bg-amber-500 text-white'
      : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    danger: active
      ? 'bg-red-500 text-white'
      : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-200
        ${variants[variant]}
        ${onClick ? 'cursor-pointer hover:opacity-80 active:scale-95' : ''}
        ${className}
      `}
    >
      {label}
    </button>
  );
};
