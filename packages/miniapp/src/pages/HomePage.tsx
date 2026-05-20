import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceArea } from 'recharts';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('ru');

// Mock data
const glucoseChartData = [
  { time: '06:00', value: 5.2 },
  { time: '08:00', value: 5.8 },
  { time: '10:00', value: 7.2 },
  { time: '12:00', value: 6.5 },
  { time: '14:00', value: 8.1 },
  { time: '16:00', value: 6.9 },
  { time: '18:00', value: 6.4 },
];

const recentEntries = [
  {
    id: '1',
    type: 'glucose',
    icon: '🩸',
    title: 'Сахар крови',
    subtitle: 'Перед обедом',
    value: 6.4,
    unit: 'ммоль/л',
    time: '14:30',
    color: 'green',
  },
  {
    id: '2',
    type: 'insulin',
    icon: '💉',
    title: 'Инсулин',
    subtitle: 'Bolus',
    value: 5,
    unit: 'единиц',
    time: '14:00',
    color: 'purple',
  },
  {
    id: '3',
    type: 'meal',
    icon: '🍽️',
    title: 'Обед',
    subtitle: 'Овсянка, 24г У',
    value: 2,
    unit: 'ХЕ',
    time: '13:30',
    color: 'green',
  },
  {
    id: '4',
    type: 'feeling',
    icon: '😊',
    title: 'Самочувствие',
    subtitle: 'Хорошее настроение',
    time: '12:00',
    color: 'blue',
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock last glucose reading
  const lastGlucose = {
    value: 6.4,
    measuredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  };

  // Determine status and color
  const getGlucoseStatus = (value: number) => {
    if (value < 4.0) {
      return { status: 'Ниже цели', color: 'red', gradient: 'from-red-500 to-rose-600' };
    } else if (value > 7.0) {
      return { status: 'Выше цели', color: 'yellow', gradient: 'from-amber-500 to-orange-600' };
    } else {
      return { status: 'В целевом диапазоне', color: 'green', gradient: 'from-green-500 to-emerald-600' };
    }
  };

  const glucoseStatus = getGlucoseStatus(lastGlucose.value);

  // Mock daily summary
  const dailySummary = {
    measurements: 7,
    inRangePercentage: 71,
    totalInsulin: 18,
    totalXE: 8,
  };

  // Mock next reminder
  const nextReminder = {
    time: '18:00',
    title: 'Измерить сахар',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DiaBeta
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {dayjs().format('D MMMM, dddd')}
            </p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Настройки"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-md mx-auto">
        {/* Last Glucose Card */}
        <div className={`bg-gradient-to-br ${glucoseStatus.gradient} rounded-3xl p-6 text-white shadow-xl`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm opacity-90 font-medium">Последний сахар</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-5xl font-bold">{lastGlucose.value}</span>
                <span className="text-lg opacity-80">ммоль/л</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-2xl">🩸</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full bg-white`} />
            <span className="text-sm font-medium">{glucoseStatus.status}</span>
          </div>
          
          <p className="text-xs opacity-80">
            Измерено {dayjs(lastGlucose.measuredAt).fromNow()}
          </p>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 px-1">
            Быстрые действия
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/add-glucose')}
              className="group bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg shadow-red-500/30 active:scale-95 transition-all duration-200"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🩸</div>
              <div className="font-semibold text-base">Сахар</div>
              <div className="text-xs opacity-80 mt-1">Измерить</div>
            </button>

            <button
              onClick={() => navigate('/add-insulin')}
              className="group bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-500/30 active:scale-95 transition-all duration-200"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💉</div>
              <div className="font-semibold text-base">Инсулин</div>
              <div className="text-xs opacity-80 mt-1">Записать</div>
            </button>

            <button
              onClick={() => navigate('/add-meal')}
              className="group bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg shadow-green-500/30 active:scale-95 transition-all duration-200"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🍽️</div>
              <div className="font-semibold text-base">Еда</div>
              <div className="text-xs opacity-80 mt-1">Добавить</div>
            </button>

            <button
              onClick={() => navigate('/feeling')}
              className="group bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-4 text-white shadow-lg shadow-purple-500/30 active:scale-95 transition-all duration-200"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">😊</div>
              <div className="font-semibold text-base">Самочувствие</div>
              <div className="text-xs opacity-80 mt-1">Отметить</div>
            </button>
          </div>
        </div>

        {/* Glucose Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">График за сегодня</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {glucoseChartData.length} измерений
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700" />
              <span className="text-gray-600 dark:text-gray-400">Цель</span>
            </div>
          </div>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={glucoseChartData}>
                {/* Target range background */}
                <ReferenceArea
                  y1={4.0}
                  y2={7.0}
                  fill="#10B981"
                  fillOpacity={0.1}
                />
                
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  domain={[3, 10]}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  tickCount={5}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Сводка дня
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📊</span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Измерений</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {dailySummary.measurements}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">✅</span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">В диапазоне</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {dailySummary.inRangePercentage}%
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💉</span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Инсулин</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {dailySummary.totalInsulin} <span className="text-sm font-normal text-gray-500">ед</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🍞</span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">ХЕ</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {dailySummary.totalXE}
              </div>
            </div>
          </div>
        </div>

        {/* Next Reminder */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-3xl p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xl shadow-lg">
                ⏰
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{nextReminder.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Сегодня в {nextReminder.time}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/reminders')}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium text-amber-600 dark:text-amber-400 shadow-sm active:scale-95 transition-transform"
            >
              Открыть
            </button>
          </div>
        </div>

        {/* Recent Entries */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Последние записи
            </h2>
            <button
              onClick={() => navigate('/history')}
              className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Все →
            </button>
          </div>
          
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
                onClick={() => alert(`Открыть запись ${entry.id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    entry.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                    entry.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                    entry.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {entry.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {entry.title}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {entry.time}
                      </span>
                    </div>
                    {entry.subtitle && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                        {entry.subtitle}
                      </p>
                    )}
                    {entry.value !== undefined && (
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {entry.value}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {entry.unit}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 safe-area-bottom z-50">
        <div className="flex items-center justify-around max-w-md mx-auto py-2">
          {[
            { path: '/', icon: '🏠', label: 'Главная', active: true },
            { path: '/history', icon: '📋', label: 'Дневник', active: false },
            { path: '/analytics', icon: '📊', label: 'Аналитика', active: false },
            { path: '/ai-chat', icon: '🤖', label: 'AI', active: false },
            { path: '/settings', icon: '⚙️', label: 'Настройки', active: false },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-2 px-3 transition-all duration-200 ${
                item.active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className={`text-2xl mb-1 ${item.active ? 'scale-110' : ''} transition-transform`}>
                {item.icon}
              </span>
              <span className={`text-xs font-medium ${item.active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default HomePage;
