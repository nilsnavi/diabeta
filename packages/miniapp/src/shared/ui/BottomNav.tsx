import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/', icon: '🏠', label: 'Главная' },
  { path: '/history', icon: '📋', label: 'История' },
  { path: '/analytics', icon: '📊', label: 'Аналитика' },
  { path: '/ai-chat', icon: '🤖', label: 'AI' },
  { path: '/settings', icon: '⚙️', label: 'Настройки' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 safe-area-bottom z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center py-2 px-3
                transition-all duration-200
                ${isActive 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
            >
              <span className={`text-2xl mb-1 ${isActive ? 'scale-110' : ''} transition-transform`}>
                {item.icon}
              </span>
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
