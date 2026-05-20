import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Главная', icon: '🏠' },
  { path: '/diary', label: 'Дневник', icon: '📋' },
  { path: '/analytics', label: 'Аналитика', icon: '📊' },
  { path: '/ai-chat', label: 'AI', icon: '🤖' },
  { path: '/settings', label: 'Настройки', icon: '⚙️' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 flex safe-area-bottom">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`
          }
        >
          <span className="text-xl mb-0.5">{item.icon}</span>
          <span className="font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}