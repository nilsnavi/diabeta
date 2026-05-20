import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, ReminderCard, Button, EmptyState } from '../shared/ui';

export const RemindersPage: React.FC = () => {
  const navigate = useNavigate();

  // Mock reminders data
  const reminders = [
    {
      id: '1',
      title: 'Измерить сахар',
      time: '08:00',
      frequency: 'daily',
      enabled: true,
    },
    {
      id: '2',
      title: 'Принять инсулин',
      time: '13:00',
      frequency: 'daily',
      enabled: true,
    },
    {
      id: '3',
      title: 'Вечернее измерение',
      time: '20:00',
      frequency: 'daily',
      enabled: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Header 
        title="Напоминания"
        rightAction={
          <button
            onClick={() => navigate('/reminders/create')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        }
      />

      <div className="px-4 py-4 space-y-4">
        {/* Info Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⏰</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Напоминания помогают не пропускать измерения</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Настройте расписание регулярных напоминаний для контроля диабета
              </p>
            </div>
          </div>
        </div>

        {/* Reminders List */}
        {reminders.length > 0 ? (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                title={reminder.title}
                time={reminder.time}
                frequency={reminder.frequency}
                enabled={reminder.enabled}
                onToggle={() => alert(`Toggle reminder ${reminder.id}`)}
                onClick={() => alert(`Edit reminder ${reminder.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🔔"
            title="Нет напоминаний"
            subtitle="Создайте первое напоминание"
            actionLabel="Добавить напоминание"
            onAction={() => navigate('/reminders/create')}
          />
        )}

        {/* Add Button (Mobile FAB style) */}
        <Button
          fullWidth
          onClick={() => navigate('/reminders/create')}
          className="fixed bottom-24 left-4 right-4 max-w-md mx-auto shadow-lg"
        >
          + Добавить напоминание
        </Button>
      </div>
    </div>
  );
};
