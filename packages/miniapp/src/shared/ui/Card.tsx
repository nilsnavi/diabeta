import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 
        rounded-2xl 
        shadow-sm hover:shadow-md 
        transition-shadow duration-200
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
