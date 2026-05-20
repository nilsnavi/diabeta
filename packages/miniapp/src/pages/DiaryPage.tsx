import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('ru');

type EntryType = 'glucose' | 'insulin' | 'meal' | 'feeling' | 'activity';
type Period = 'today' | 'week' | 'month';

interface TimelineEntry {
  id: string;
  type: EntryType;
  timestamp: string;
  title: string;
  subtitle?: string;
  value?: number | string;
  unit?: string;
  context?: string;
  status?: string;
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'yellow' | 'orange';
}

// Mock data
const mockEntries: TimelineEntry[] = [
  // Сегодня
  {
    id: '1',
    type: 'glucose',
    timestamp: new Date().toISOString(),
    title: 'Сахар крови',
    subtitle: 'До еды',
    value: 6.4,
    unit: 'ммоль/л',
    context: 'before_meal',
    status: 'В диапазоне',
    icon: '🩸',
    color: 'blue',
  },
  {
    id: '2',
    type: 'insulin',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    title: 'НовоРапид',
    subtitle: 'Bolus',
    value: 6,
    unit: 'ед',
    icon: '💉',
    color: 'purple',
  },
  {
    id: '3',
    type: 'meal',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    title: 'Завтрак',
    subtitle: 'Гречка с курицей',
    value: 4,
    unit: 'ХЕ',
    icon: '🍽️',
    color: 'green',
  },
  {
    id: '4',
    type: 'feeling',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    title: 'Самочувствие',
    subtitle: 'Нормально · энергия 4/5',
    icon: '🙂',
    color: 'yellow',
  },
  {
    id: '5',
    type: 'activity',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    title: 'Ходьба',
    subtitle: '45 минут · средняя',
    icon: '🏃',
    color: 'orange',
  },
  // Вчера
  {
    id: '6',
    type: 'glucose',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    title: 'Сахар крови',
    subtitle: 'После еды',
    value: 7.8,
    unit: 'ммоль/л',
    context: 'after_meal',
    status: 'Выше цели',
    icon: '🩸',
    color: 'blue',
  },
  {
    id: '7',
    type: 'meal',
    timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    title: 'Ужин',
    subtitle: 'Рыба с овощами',
    value: 3,
    unit: 'ХЕ',
    icon: '🍽️',
    color: 'green',
  },
  {
    id: '8',
    type: 'insulin',
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    title: 'Лантус',
    subtitle: 'Basal',
    value: 12,
    unit: 'ед',
    icon: '💉',
    color: 'purple',
  },
];

const periods: Array<{ value: Period; label: string }> = [
  { value: 'today', label: 'Сегодня' },
  { value: 'week', label: '7 дней' },
  { value: 'month', label: '30 дней' },
];

const filters: Array<{ value: EntryType | 'all'; label: string; icon: string }> = [
  { value: 'all', label: 'Все', icon: '📋' },
  { value: 'glucose', label: 'Сахар', icon: '🩸' },
  { value: 'insulin', label: 'Инсулин', icon: '💉' },
  { value: 'meal', label: 'Еда', icon: '🍽️' },
  { value: 'feeling', label: 'Самочувствие', icon: '😊' },
  { value: 'activity', label: 'Активность', icon: '🏃' },
];

const DiaryPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [period, setPeriod] = useState<Period>('today');
  const [filter, setFilter] = useState<EntryType | 'all'>('all');

  // Filter entries by period and type
  const filteredEntries = useMemo(() => {
    let entries = [...mockEntries];

    // Filter by period
    const now = dayjs();
    if (period === 'today') {
      entries = entries.filter(entry => dayjs(entry.timestamp).isSame(now, 'day'));
    } else if (period === 'week') {
      entries = entries.filter(entry => dayjs(entry.timestamp).isAfter(now.subtract(7, 'day')));
    } else if (period === 'month') {
      entries = entries.filter(entry => dayjs(entry.timestamp).isAfter(now.subtract(30, 'day')));
    }

    // Filter by type
    if (filter !== 'all') {
      entries = entries.filter(entry => entry.type === filter);
    }

    // Sort by timestamp descending
    return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [period, filter]);

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups: Record<string, TimelineEntry[]> = {};
    
    filteredEntries.forEach(entry => {
      const date = dayjs(entry.timestamp).format('DD MMMM YYYY');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });

    return groups;
  }, [filteredEntries]);

  // Get color classes for entry
  const getColorClasses = (color: TimelineEntry['color']) => {
    const colors = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    };
    return colors[color];
  };

  // Format time
  const formatTime = (timestamp: string) => {
    return dayjs(timestamp).format('HH:mm');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Дневник</h1>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-md mx-auto">
        {/* Period Selector */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all active:scale-95 ${
                period === p.value
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Filters - Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all active:scale-95 ${
                filter === f.value
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Entries Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400 px-1">
          {filteredEntries.length} {filteredEntries.length === 1 ? 'запись' : filteredEntries.length < 5 ? 'записи' : 'записей'}
        </div>

        {/* Timeline */}
        {Object.keys(groupedEntries).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedEntries).map(([date, entries]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="sticky top-16 z-10 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm py-2 mb-3">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    {dayjs(date, 'DD MMMM YYYY').format('D MMMM')}
                    {dayjs(date, 'DD MMMM YYYY').isSame(dayjs(), 'day') && ' (сегодня)'}
                    {dayjs(date, 'DD MMMM YYYY').isSame(dayjs().subtract(1, 'day'), 'day') && ' (вчера)'}
                  </h2>
                </div>

                {/* Entries for this date */}
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => alert(`Открыть детальную страницу записи ${entry.id}`)}
                      className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-all duration-200 text-left"
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${getColorClasses(entry.color)}`}>
                          {entry.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header row */}
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {entry.title}
                            </h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                              {formatTime(entry.timestamp)}
                            </span>
                          </div>

                          {/* Subtitle */}
                          {entry.subtitle && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {entry.subtitle}
                            </p>
                          )}

                          {/* Value and context */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {entry.value !== undefined && (
                              <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                  {typeof entry.value === 'number' ? entry.value.toFixed(1).replace('.0', '') : entry.value}
                                </span>
                                {entry.unit && (
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {entry.unit}
                                  </span>
                                )}
                              </div>
                            )}

                            {entry.context && (
                              <>
                                <span className="text-gray-300 dark:text-gray-600">·</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                  {entry.context.replace('_', ' ')}
                                </span>
                              </>
                            )}

                            {entry.status && (
                              <>
                                <span className="text-gray-300 dark:text-gray-600">·</span>
                                <span className={`text-sm font-medium ${
                                  entry.status.includes('диапазоне') || entry.status.includes('Нормально')
                                    ? 'text-green-600 dark:text-green-400'
                                    : entry.status.includes('Выше')
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {entry.status}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <span className="text-5xl">📭</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Нет записей
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xs">
              {filter === 'all' 
                ? 'Добавьте первую запись в дневник'
                : `Нет записей типа "${filters.find(f => f.value === filter)?.label}" за выбранный период`}
            </p>
            <button
              onClick={() => {
                if (filter === 'glucose' || filter === 'all') navigate('/add-glucose');
                else if (filter === 'insulin') navigate('/add-insulin');
                else if (filter === 'meal') navigate('/add-meal');
                else navigate('/');
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all duration-200"
            >
              Добавить запись
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryPage;
