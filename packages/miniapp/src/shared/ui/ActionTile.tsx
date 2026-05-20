import React from 'react';

interface ActionTileProps {
  icon: string;
  title: string;
  subtitle?: string;
  onClick: () => void;
  gradient?: string;
  className?: string;
}

export const ActionTile: React.FC<ActionTileProps> = ({
  icon,
  title,
  subtitle,
  onClick,
  gradient = 'from-blue-500 to-blue-600',
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        bg-gradient-to-br ${gradient}
        rounded-2xl p-4
        text-white
        shadow-lg
        active:scale-95
        transition-all duration-200
        ${className}
      `}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-semibold text-base">{title}</div>
      {subtitle && (
        <div className="text-xs opacity-80 mt-1">{subtitle}</div>
      )}
    </button>
  );
};
