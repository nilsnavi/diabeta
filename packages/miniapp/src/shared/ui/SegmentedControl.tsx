import React from 'react';

interface SegmentedControlProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            flex-1 py-2 px-3 rounded-lg text-sm font-medium
            transition-all duration-200
            ${value === option.value
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
