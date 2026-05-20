import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, TimelineItem, EmptyState, SegmentedControl } from '../shared/ui';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');

  // Mock timeline data
  const timelineEntries: TimelineEntry[] = [
    {
      id: '1',
      type: 'glucose',
      icon: '🩸',
      title: 'Сахар крови',
      subtitle: 'Перед обедом',
      value: 6.5,
      unit: 'ммоль/л',
      time: '14:30',
      color: 'blue',
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
      type: 'glucose',
      icon: '🩸',
      title: 'Сахар крови',
      subtitle: 'После завтрака',
      value: 7.2,
      unit: 'ммоль/л',
      time: '10:00',
      color: 'blue',
    },
    {
      id: '5',
      type: 'glucose',
      icon: '🩸',
      title: 'Сахар крови',
      subtitle: 'Натощак',
      value: 5.8,
      unit: 'ммоль/л',
      time: '08:00',
      color: 'green',
    },
  ];

  const filteredEntries =
    filter === 'all'
      ? timelineEntries
      : timelineEntries.filter((entry) => entry.type === filter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Header title="История" onBack={() => navigate(-1)} />

      <div className="px-4 py-4 space-y-4">
        {/* Filter */}
        <SegmentedControl
          options={[
            { value: 'all', label: 'Все' },
            { value: 'glucose', label: 'Сахар' },
            { value: 'insulin', label: 'Инсулин' },
            { value: 'meal', label: 'Еда' },
            { value: 'feeling', label: 'Здоровье' },
            { value: 'activity', label: 'Активность' },
          ]}
          value={filter}
          onChange={(val) => setFilter(val as FilterType)}
        />

        {/* Timeline */}
        {filteredEntries.length > 0 ? (
          <div className="space-y-2">
            {filteredEntries.map((entry) => (
              <TimelineItem
                key={entry.id}
                icon={entry.icon}
                title={entry.title}
                subtitle={entry.subtitle}
                value={entry.value}
                unit={entry.unit}
                time={entry.time}
                color={entry.color}
                onClick={() => alert(`Детали записи ${entry.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📭"
            title="Нет записей"
            subtitle="Добавьте первое измерение"
            actionLabel="Измерить сейчас"
            onAction={() => navigate('/add-glucose')}
          />
        )}
      </div>
    </div>
  );
}