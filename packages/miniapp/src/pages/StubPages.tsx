import React from 'react';
import { Header, EmptyState } from '../shared/ui';

export const AddMealPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <Header title="Добавить еду" showBack onBack={() => window.history.back()} />
    <EmptyState icon="🍽️" title="Страница в разработке" subtitle="Функция добавления еды скоро будет доступна" />
  </div>
);

export const FeelingPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <Header title="Самочувствие" showBack onBack={() => window.history.back()} />
    <EmptyState icon="😊" title="Страница в разработке" subtitle="Запись самочувствия скоро будет доступна" />
  </div>
);

export const ActivityPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <Header title="Активность" showBack onBack={() => window.history.back()} />
    <EmptyState icon="🏃" title="Страница в разработке" subtitle="Трекинг активности скоро будет доступен" />
  </div>
);

export const CreateReminderPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <Header title="Новое напоминание" showBack onBack={() => window.history.back()} />
    <EmptyState icon="⏰" title="Страница в разработке" subtitle="Создание напоминаний скоро будет доступно" />
  </div>
);

export const DiabetesProfilePage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <Header title="Диабет профиль" showBack onBack={() => window.history.back()} />
    <EmptyState icon="🏥" title="Страница в разработке" subtitle="Настройка диабет профиля скоро будет доступна" />
  </div>
);

export const PremiumPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <Header title="Premium" showBack onBack={() => window.history.back()} />
    <EmptyState icon="💎" title="Страница в разработке" subtitle="Premium подписка скоро будет доступна" />
  </div>
);
