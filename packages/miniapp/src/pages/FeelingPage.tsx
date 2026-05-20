import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feelingsApi, type FeelingEntry, type FeelingType, type SymptomType, type CreateFeelingData } from '../api/feelings';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const FEELING_OPTIONS: { value: FeelingType; label: string; emoji: string; color: string }[] = [
  { value: 'good', label: 'Хорошо', emoji: '😊', color: 'bg-green-100 border-green-400 text-green-700' },
  { value: 'normal', label: 'Нормально', emoji: '🙂', color: 'bg-blue-100 border-blue-400 text-blue-700' },
  { value: 'weakness', label: 'Слабость', emoji: '😴', color: 'bg-yellow-100 border-yellow-400 text-yellow-700' },
  { value: 'dizzy', label: 'Головокружение', emoji: '😵', color: 'bg-orange-100 border-orange-400 text-orange-700' },
  { value: 'bad', label: 'Плохо', emoji: '😣', color: 'bg-red-100 border-red-400 text-red-700' },
  { value: 'other', label: 'Другое', emoji: '🤔', color: 'bg-gray-100 border-gray-400 text-gray-700' },
];

const SYMPTOM_OPTIONS: { value: SymptomType; label: string; emoji: string }[] = [
  { value: 'sweating', label: 'Потливость', emoji: '💧' },
  { value: 'tremor', label: 'Тремор', emoji: '🤲' },
  { value: 'hunger', label: 'Голод', emoji: '🍽️' },
  { value: 'headache', label: 'Головная боль', emoji: '🤕' },
  { value: 'drowsiness', label: 'Сонливость', emoji: '😪' },
  { value: 'anxiety', label: 'Тревожность', emoji: '😰' },
  { value: 'nausea', label: 'Тошнота', emoji: '🤢' },
  { value: 'thirst', label: 'Жажда', emoji: '🥤' },
  { value: 'frequent_urination', label: 'Частое мочеиспускание', emoji: '🚽' },
  { value: 'other', label: 'Другое', emoji: '❓' },
];

const FEELING_LABELS: Record<FeelingType, string> = {
  good: 'Хорошо',
  normal: 'Нормально',
  weakness: 'Слабость',
  dizzy: 'Головокружение',
  bad: 'Плохо',
  other: 'Другое',
};

const FEELING_EMOJIS: Record<FeelingType, string> = {
  good: '😊',
  normal: '🙂',
  weakness: '😴',
  dizzy: '😵',
  bad: '😣',
  other: '🤔',
};

const SAFETY_FEELINGS: FeelingType[] = ['bad', 'dizzy', 'weakness'];

export default function FeelingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [feeling, setFeeling] = useState<FeelingType | null>(null);
  const [symptoms, setSymptoms] = useState<SymptomType[]>([]);
  const [mood, setMood] = useState<number>(3);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [comment, setComment] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['feelings'],
    queryFn: () => feelingsApi.getAll({ limit: 20 }),
  });

  const mutation = useMutation({
    mutationFn: (d: CreateFeelingData) => feelingsApi.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feelings'] });
      setShowForm(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setFeeling(null);
    setSymptoms([]);
    setMood(3);
    setEnergyLevel(3);
    setComment('');
  };

  const toggleSymptom = (s: SymptomType) => {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const handleSubmit = () => {
    if (!feeling) return;
    mutation.mutate({
      feeling,
      symptoms,
      mood,
      energyLevel,
      comment: comment.trim() || undefined,
      recordedAt: new Date().toISOString(),
    });
  };

  const showSafetyNote = feeling && SAFETY_FEELINGS.includes(feeling);

  const records = data?.data ?? [];

  if (showForm) {
    return (
      <div className="p-4 pb-20">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-500 text-lg">←</button>
          <h1 className="text-xl font-bold text-gray-800">🙂 Самочувствие</h1>
        </div>

        {/* Feeling selection */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-600 mb-3">Как вы себя чувствуете?</p>
          <div className="grid grid-cols-2 gap-2">
            {FEELING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFeeling(opt.value)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 font-medium text-sm transition-all ${
                  feeling === opt.value
                    ? opt.color + ' border-2'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Safety notice */}
        {showSafetyNote && (
          <div className="mb-4 bg-amber-50 border border-amber-300 rounded-xl p-3 text-sm text-amber-800">
            ⚠️ Если состояние ухудшается или есть тревожные симптомы, обратитесь за медицинской помощью.
          </div>
        )}

        {/* Symptoms */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-600 mb-3">Симптомы (можно выбрать несколько)</p>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => toggleSymptom(s.value)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm transition-all ${
                  symptoms.includes(s.value)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                <span>{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mood scale */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-600 mb-2">Настроение: {mood}/5</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => setMood(v)}
                className={`flex-1 h-10 rounded-lg font-bold text-sm border-2 transition-all ${
                  mood === v
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Плохое</span>
            <span>Отличное</span>
          </div>
        </div>

        {/* Energy scale */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-600 mb-2">Энергия: {energyLevel}/5</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => setEnergyLevel(v)}
                className={`flex-1 h-10 rounded-lg font-bold text-sm border-2 transition-all ${
                  energyLevel === v
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Нет сил</span>
            <span>Полон сил</span>
          </div>
        </div>

        {/* Comment */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-600 mb-2">Комментарий (необязательно)</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            placeholder="Опишите своё состояние..."
            className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none h-20 outline-none focus:border-blue-400"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!feeling || mutation.isPending}
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
        <h1 className="text-xl font-bold text-gray-800">🙂 Самочувствие</h1>
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
          <p className="text-5xl mb-3">🙂</p>
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
          {records.map((r: FeelingEntry) => (
            <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{FEELING_EMOJIS[r.feeling]}</span>
                    <span className="font-semibold text-gray-800">{FEELING_LABELS[r.feeling]}</span>
                  </div>
                  {r.symptoms && r.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {r.symptoms.map((s) => {
                        const opt = SYMPTOM_OPTIONS.find((o) => o.value === s);
                        return (
                          <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {opt?.emoji} {opt?.label ?? s}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex gap-3 text-xs text-gray-500">
                    {r.mood != null && <span>😊 Настроение: {r.mood}/5</span>}
                    {r.energyLevel != null && <span>⚡ Энергия: {r.energyLevel}/5</span>}
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
                  {SAFETY_FEELINGS.includes(r.feeling) && (
                    <p className="text-xs text-amber-600 mt-2">
                      ⚠️ Если состояние ухудшается, обратитесь за медицинской помощью.
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-gray-400 ml-2 flex-shrink-0">
                  <p>{format(new Date(r.recordedAt), 'dd MMM', { locale: ru })}</p>
                  <p>{format(new Date(r.recordedAt), 'HH:mm')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}