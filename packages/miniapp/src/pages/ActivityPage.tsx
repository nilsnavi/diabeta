import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityApi, type ActivityEntry, type ActivityType, type Intensity, type CreateActivityData } from '../api/activity';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const ACTIVITY_OPTIONS: { value: ActivityType; label: string; emoji: string; color: string }[] = [
  { value: 'walking', label: 'Ходьба', emoji: '🚶', color: 'bg-green-100 border-green-400 text-green-700' },
  { value: 'running', label: 'Бег', emoji: '🏃', color: 'bg-blue-100 border-blue-400 text-blue-700' },
  { value: 'gym', label: 'Тренажёрный зал', emoji: '🏋️', color: 'bg-purple-100 border-purple-400 text-purple-700' },
  { value: 'cardio', label: 'Кардио', emoji: '❤️', color: 'bg-red-100 border-red-400 text-red-700' },
  { value: 'strength', label: 'Силовая', emoji: '💪', color: 'bg-orange-100 border-orange-400 text-orange-700' },
  { value: 'cycling', label: 'Велосипед', emoji: '🚴', color: 'bg-yellow-100 border-yellow-400 text-yellow-700' },
  { value: 'lfk', label: 'ЛФК', emoji: '🤸', color: 'bg-teal-100 border-teal-400 text-teal-700' },
  { value: 'other', label: 'Другое', emoji: '🏅', color: 'bg-gray-100 border-gray-400 text-gray-700' },
];

const INTENSITY_OPTIONS: { value: Intensity; label: string; emoji: string; color: string }[] = [
  { value: 'low', label: 'Низкая', emoji: '🟢', color: 'bg-green-100 border-green-400 text-green-700' },
  { value: 'medium', label: 'Средняя', emoji: '🟡', color: 'bg-yellow-100 border-yellow-400 text-yellow-700' },
  { value: 'high', label: 'Высокая', emoji: '🔴', color: 'bg-red-100 border-red-400 text-red-700' },
];

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  walking: 'Ходьба', running: 'Бег', gym: 'Тренажёрный зал',
  cardio: 'Кардио', strength: 'Силовая', cycling: 'Велосипед', lfk: 'ЛФК', other: 'Другое',
};

const ACTIVITY_EMOJIS: Record<ActivityType, string> = {
  walking: '🚶', running: '🏃', gym: '🏋️', cardio: '❤️',
  strength: '💪', cycling: '🚴', lfk: '🤸', other: '🏅',
};

const INTENSITY_LABELS: Record<Intensity, string> = { low: 'Низкая', medium: 'Средняя', high: 'Высокая' };

export default function ActivityPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType | null>(null);
  const [durationMinutes, setDurationMinutes] = useState('');
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  const [comment, setComment] = useState('');
  const [durationError, setDurationError] = useState('');

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => activityApi.getAll(),
  });

  const mutation = useMutation({
    mutationFn: (d: CreateActivityData) => activityApi.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      setShowForm(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setActivityType(null);
    setDurationMinutes('');
    setIntensity(null);
    setComment('');
    setDurationError('');
  };

  const handleDurationChange = (val: string) => {
    setDurationMinutes(val);
    const n = parseInt(val);
    if (val && (isNaN(n) || n < 1 || n > 600)) {
      setDurationError('Длительность: от 1 до 600 минут');
    } else {
      setDurationError('');
    }
  };

  const handleSubmit = () => {
    const duration = parseInt(durationMinutes);
    if (!activityType || !intensity || isNaN(duration) || duration < 1 || duration > 600) return;
    mutation.mutate({
      activityType,
      durationMinutes: duration,
      intensity,
      startedAt: new Date().toISOString(),
      comment: comment.trim() || undefined,
    });
  };

  const isValid = activityType && intensity && !durationError &&
    durationMinutes && parseInt(durationMinutes) >= 1 && parseInt(durationMinutes) <= 600;

  if (showForm) {
    return (
      <div className="p-4 pb-20">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-500 text-lg">←</button>
          <h1 className="text-xl font-bold text-gray-800">🏃 Активность</h1>
        </div>

        {/* Activity type */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-600 mb-3">Тип активности</p>
          <div className="grid grid-cols-2 gap-2">
            {ACTIVITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setActivityType(opt.value)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 font-medium text-sm transition-all ${
                  activityType === opt.value ? opt.color : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-600 mb-2">Длительность (минуты)</p>
          <input
            type="number"
            value={durationMinutes}
            onChange={(e) => handleDurationChange(e.target.value)}
            placeholder="Например: 30"
            min={1}
            max={600}
            className={`w-full border rounded-xl p-3 text-sm outline-none ${
              durationError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-400'
            }`}
          />
          {durationError && <p className="text-xs text-red-500 mt-1">{durationError}</p>}
        </div>

        {/* Intensity */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-600 mb-3">Интенсивность</p>
          <div className="flex gap-2">
            {INTENSITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setIntensity(opt.value)}
                className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 font-medium text-sm transition-all ${
                  intensity === opt.value ? opt.color : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-600 mb-2">Комментарий (необязательно)</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            placeholder="Опишите активность..."
            className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none h-20 outline-none focus:border-blue-400"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isValid || mutation.isPending}
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {mutation.isPending ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">🏃 Активность</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Добавить
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Загрузка...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-5xl mb-3">🏃</p>
          <p className="mb-4">Записей пока нет</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-medium"
          >
            Добавить первую запись
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r: ActivityEntry) => (
            <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{ACTIVITY_EMOJIS[r.activityType]}</span>
                    <span className="font-semibold text-gray-800">{ACTIVITY_LABELS[r.activityType]}</span>
                  </div>
                  <div className="flex gap-3 text-sm text-gray-600 mt-1">
                    <span>⏱ {r.durationMinutes} мин</span>
                    <span>· {INTENSITY_LABELS[r.intensity]}</span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-500 mt-1">{r.comment}</p>}
                </div>
                <div className="text-right text-xs text-gray-400 ml-2 flex-shrink-0">
                  <p>{format(new Date(r.startedAt), 'dd MMM', { locale: ru })}</p>
                  <p>{format(new Date(r.startedAt), 'HH:mm')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}