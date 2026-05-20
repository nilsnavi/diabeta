import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  path: string;
  color?: string;
}

const settingsSections: SettingItem[] = [
  {
    id: 'profile',
    title: 'Профиль диабета',
    subtitle: 'Тип, целевой диапазон, единицы',
    icon: '🩺',
    path: '/diabetes-profile',
    color: 'blue',
  },
  {
    id: 'insulins',
    title: 'Инсулины',
    subtitle: 'Управление препаратами',
    icon: '💉',
    path: '/insulins',
    color: 'purple',
  },
  {
    id: 'reminders',
    title: 'Напоминания',
    subtitle: 'Уведомления и расписание',
    icon: '⏰',
    path: '/reminders',
    color: 'amber',
  },
  {
    id: 'subscription',
    title: 'Подписка',
    subtitle: 'Premium функции',
    icon: '⭐',
    path: '/premium',
    color: 'yellow',
  },
  {
    id: 'family',
    title: 'Семейный доступ',
    subtitle: 'Делитесь данными с близкими',
    icon: '👨‍👩‍👧‍👦',
    path: '/family',
    color: 'green',
  },
  {
    id: 'legal',
    title: 'Юридические документы',
    subtitle: 'Политика конфиденциальности, условия использования',
    icon: '📄',
    path: '/legal-documents',
    color: 'gray',
  },
  {
    id: 'export',
    title: 'Экспорт данных',
    subtitle: 'CSV, PDF отчёты',
    icon: '📊',
    path: '/reports',
    color: 'cyan',
  },
];

// Mock user profile data
const mockProfile = {
  diabetesType: 'Тип 1',
  targetRange: '4.0 - 7.0 ммоль/л',
  units: 'ммоль/л',
};

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  // Handle delete account
  const handleDeleteAccount = () => {
    if (deleteInput.toLowerCase() === 'удалить') {
      // TODO: Call API to delete account
      alert('Аккаунт будет удалён. В реальном приложении здесь был бы API вызов.');
      setShowDeleteConfirm(false);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Настройки</h1>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-md mx-auto">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm opacity-90 font-medium">Профиль</p>
              <h2 className="text-xl font-bold mt-1">{mockProfile.diabetesType}</h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="opacity-80">🎯</span>
              <span>Целевой диапазон: {mockProfile.targetRange}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="opacity-80">📏</span>
              <span>Единицы: {mockProfile.units}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/diabetes-profile')}
            className="mt-4 w-full py-2 px-4 bg-white/20 backdrop-blur rounded-xl text-sm font-medium hover:bg-white/30 transition-colors active:scale-95"
          >
            Редактировать профиль
          </button>
        </div>

        {/* Settings Sections */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden">
          {settingsSections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => navigate(section.path)}
              className={`w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors active:scale-[0.98] ${
                index !== settingsSections.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
              }`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                section.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                section.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                section.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30' :
                section.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                section.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                section.color === 'gray' ? 'bg-gray-100 dark:bg-gray-700' :
                section.color === 'cyan' ? 'bg-cyan-100 dark:bg-cyan-900/30' :
                'bg-gray-100 dark:bg-gray-700'
              }`}>
                {section.icon}
              </div>

              {/* Content */}
              <div className="flex-1 text-left min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {section.title}
                </h3>
                {section.subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {section.subtitle}
                  </p>
                )}
              </div>

              {/* Arrow */}
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl p-5">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200">Опасная зона</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Эти действия нельзя отменить
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 px-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors active:scale-[0.98]"
          >
            Удалить аккаунт
          </button>
        </div>

        {/* App Version */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-4">
          DiaBeta v1.0.0
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span className="text-3xl">🗑️</span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
              Удалить аккаунт?
            </h2>

            {/* Warning */}
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              Это действие нельзя отменить. Все ваши данные будут безвозвратно удалены.
            </p>

            {/* Input confirmation */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Введите <span className="font-bold text-red-600">"удалить"</span> для подтверждения:
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="удалить"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                autoFocus
              />
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput.toLowerCase() !== 'удалить'}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] ${
                  deleteInput.toLowerCase() !== 'удалить'
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:from-red-600 hover:to-red-700'
                }`}
              >
                Удалить навсегда
              </button>

              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteInput('');
                }}
                className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors active:scale-[0.98]"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
