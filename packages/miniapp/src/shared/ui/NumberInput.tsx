import React from 'react';

interface NumberInputProps {
  label?: string;
  value: number | string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  suffix?: string;
  className?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  placeholder,
  error,
  disabled = false,
  required = false,
  suffix,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(val);
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 pr-12
            bg-white dark:bg-gray-800
            border rounded-xl
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700'}
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}
          `}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
