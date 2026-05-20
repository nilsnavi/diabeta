import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { analyticsApi } from '../api/analytics';
import { timelineApi, type TimelineItem } from '../api/timeline';
import { remindersApi, type Reminder } from '../api/reminders';
import { useAuthStore } from '../store/authStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';

dayjs.locale('ru');
dayjs.extend(relativeTime);

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  // Получаем сводку за сегодня
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['analytics-summary', '1d'],
    queryFn: () => analyticsApi.getSummary('1d'),
  });

  // Получаем график сахара за день
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['glucose-chart', '1d'],
    queryFn: () => analyticsApi.getGlucoseChart('1d'),
  });

  // Получаем последние записи
  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['timeline', 'recent'],
    queryFn: () => timelineApi.getTimeline({ limit: 5 }),
  });

  // Получаем ближайшее напоминание
  const { data: reminders, isLoading: remindersLoading } = useQuery({
    queryKey: ['reminders', 'next'],
    queryFn: () => remindersApi.list(),
  });

  const nextReminder = reminders?.data?.find((r: Reminder) => r.enabled);

  // Определяем последний сахар и его статус
  const lastGlucose = chartData?.points[chartData.points.length - 1];
  const glucoseStatus = getGlucoseStatus(lastGlucose?.value, chartData?.targetMin, chartData?.targetMax);

  // Форматируем данные для графика
  const chartPoints = (chartData?.points || []).map((point) => ({
    value: point.value,
    time: dayjs(point.measuredAt).format('HH:mm'),
    timestamp: new Date(point.measuredAt).getTime(),
  }));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">DiaBeta</h1>
            <p className="text-sm text-gray-500">{dayjs().format('D MMMM, dddd')}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {user?.firstName?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Карточка последнего сахара */}
        <section>
          {summaryLoading ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ) : lastGlucose ? (
            <div className={`bg-gradient-to-br ${getGlucoseGradient(glucoseStatus)} rounded-2xl p-6 shadow-lg text-white`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm opacity-90 mb-1">Последний сахар</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">{lastGlucose.value.toFixed(1)}</span>
                    <span className="text-lg opacity-80">ммоль/л</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl">{getGlucoseIcon(glucoseStatus)}</div>
                  <p className="text-xs mt-1 opacity-80">{getGlucoseStatusLabel(glucoseStatus)}</p>
                </div>
              </div>
              <p className="text-sm opacity-80">
                {dayjs(lastGlucose.measuredAt).format('HH:mm')} • {dayjs(lastGlucose.measuredAt).fromNow()}
              </p>
            </div>
          ) : (
            <EmptyState
              icon="🩸"
              title="Нет измерений"
              subtitle="Добавьте первое измерение сахара"
              actionText="Измерить сейчас"
              actionLink="/blood-sugar"
            />
          )}
        </section>

        {/* Мини-график сахара за день */}
        {chartPoints.length > 0 && (
          <section className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">График за день</h3>
              <span className="text-xs text-gray-400">{chartPoints.length} измерений</span>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartPoints}>
                  <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2">
                            <p>{payload[0].payload.time}</p>
                            <p className="font-bold">{payload[0].value} ммоль/л</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Быстрые действия */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">Быстрые действия</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard
              to="/blood-sugar"
              icon="🩸"
              label="Сахар"
              color="from-red-500 to-orange-500"
            />
            <QuickActionCard
              to="/insulin"
              icon="💉"
              label="Инсулин"
              color="from-blue-500 to-cyan-500"
            />
            <QuickActionCard
              to="/food"
              icon="🍽️"
              label="Еда"
              color="from-green-500 to-emerald-500"
            />
            <QuickActionCard
              to="/feelings"
              icon="😊"
              label="Самочувствие"
              color="from-purple-500 to-pink-500"
            />
          </div>
        </section>

        {/* Ближайшее напоминание */}
        {nextReminder && !remindersLoading && (
          <section className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⏰</div>
              <div className="flex-1">
                <p className="text-xs text-amber-700 font-medium mb-1">Ближайшее напоминание</p>
                <p className="text-sm font-semibold text-gray-800">{nextReminder.title}</p>
                <p className="text-xs text-gray-600">{nextReminder.time}</p>
              </div>
            </div>
          </section>
        )}

        {/* Последние записи */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800">Последние записи</h2>
            <Link to="/history" className="text-sm text-blue-600 font-medium">
              Все →
            </Link>
          </div>
          
          {timelineLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : timeline?.items && timeline.items.length > 0 ? (
            <div className="space-y-2">
              {timeline.items.map((item: TimelineItem) => (
                <TimelineCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 text-center">
              <p className="text-gray-400 text-sm">Нет записей</p>
            </div>
          )}
        </section>

        {/* Кнопка "Отчёт врачу" */}
        <section>
          <button
            onClick={() => navigate('/reports')}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl py-4 px-6 shadow-lg active:scale-95 transition-transform"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">📊</span>
              <div className="text-left">
                <p className="font-semibold">Создать отчёт для врача</p>
                <p className="text-xs opacity-80">PDF с анализом за период</p>
              </div>
            </div>
          </button>
        </section>
      </div>
    </div>
  );
}

// Компонент карточки быстрого действия
function QuickActionCard({
  to,
  icon,
  label,
  color,
}: {
  to: string;
  icon: string;
  label: string;
  color: string;
}) {
  return (
    <Link
      to={to}
      className={`bg-gradient-to-br ${color} rounded-2xl p-5 shadow-md active:scale-95 transition-transform`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-white font-semibold text-sm">{label}</p>
    </Link>
  );
}

// Компонент карточки записи в таймлайне
function TimelineCard({ item }: { item: TimelineItem }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{getTypeIcon(item.type)}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
          <p className="text-xs text-gray-500">{item.subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-700">{item.value}</p>
          <p className="text-xs text-gray-400">{dayjs(item.occurredAt).format('HH:mm')}</p>
        </div>
      </div>
    </div>
  );
}

// Компонент пустого состояния
function EmptyState({
  icon,
  title,
  subtitle,
  actionText,
  actionLink,
}: {
  icon: string;
  title: string;
  subtitle: string;
  actionText: string;
  actionLink: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
      <Link
        to={actionLink}
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-medium active:scale-95 transition-transform"
      >
        {actionText}
      </Link>
    </div>
  );
}

// Утилиты для определения статуса сахара
function getGlucoseStatus(
  value: number | undefined,
  targetMin: number | undefined,
  targetMax: number | undefined,
): 'below' | 'in-range' | 'above' | 'unknown' {
  if (!value || !targetMin || !targetMax) return 'unknown';
  if (value < targetMin) return 'below';
  if (value > targetMax) return 'above';
  return 'in-range';
}

function getGlucoseGradient(status: 'below' | 'in-range' | 'above' | 'unknown'): string {
  switch (status) {
    case 'below':
      return 'from-orange-500 to-red-600';
    case 'in-range':
      return 'from-green-500 to-emerald-600';
    case 'above':
      return 'from-red-500 to-rose-600';
    default:
      return 'from-gray-500 to-gray-600';
  }
}

function getGlucoseIcon(status: 'below' | 'in-range' | 'above' | 'unknown'): string {
  switch (status) {
    case 'below':
      return '⬇️';
    case 'in-range':
      return '✅';
    case 'above':
      return '⬆️';
    default:
      return '❓';
  }
}

function getGlucoseStatusLabel(status: 'below' | 'in-range' | 'above' | 'unknown'): string {
  switch (status) {
    case 'below':
      return 'Ниже нормы';
    case 'in-range':
      return 'В норме';
    case 'above':
      return 'Выше нормы';
    default:
      return 'Нет данных';
  }
}

function getTypeIcon(type: string): string {
  switch (type) {
    case 'glucose':
      return '🩸';
    case 'insulin':
      return '💉';
    case 'meal':
      return '🍽️';
    case 'feeling':
      return '😊';
    case 'activity':
      return '🏃';
    default:
      return '📝';
  }
}
