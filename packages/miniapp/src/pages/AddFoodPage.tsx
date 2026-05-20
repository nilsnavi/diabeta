import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mealsApi, type Meal, type CreateMealPayload } from '../api/meals';

type MealType = Meal['mealType'];

const MEAL_TYPES: { value: MealType; label: string; icon: string }[] = [
  { value: 'BREAKFAST', label: 'Завтрак', icon: '🌅' },
  { value: 'LUNCH', label: 'Обед', icon: '☀️' },
  { value: 'DINNER', label: 'Ужин', icon: '🌙' },
  { value: 'SNACK', label: 'Перекус', icon: '🍎' },
];

const defaultForm = (): {
  mealType: MealType;
  title: string;
  carbs: string;
  breadUnits: string;
  calories: string;
  proteins: string;
  fats: string;
  comment: string;
  eatenAt: string;
} => ({
  mealType: 'BREAKFAST',
  title: '',
  carbs: '',
  breadUnits: '',
  calories: '',
  proteins: '',
  fats: '',
  comment: '',
  eatenAt: new Date().toISOString().slice(0, 16),
});

type FormState = ReturnType<typeof defaultForm>;

function validate(form: FormState): string | null {
  if (!form.title.trim()) return 'Укажите название блюда';
  if (form.carbs && isNaN(parseFloat(form.carbs))) return 'Углеводы должны быть числом';
  if (form.breadUnits && isNaN(parseFloat(form.breadUnits))) return 'ХЕ должны быть числом';
  if (form.calories && isNaN(parseFloat(form.calories))) return 'Калории должны быть числом';
  return null;
}

export default function AddFoodPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(defaultForm());
  const [showExtra, setShowExtra] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [favoritedId, setFavoritedId] = useState<string | null>(null);

  const { data: favorites = [] } = useQuery({
    queryKey: ['meals-favorites'],
    queryFn: mealsApi.getFavorites,
  });

  const createMutation = useMutation({
    mutationFn: mealsApi.create,
    onSuccess: (meal) => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['food'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
      setFavoritedId(meal.id);
      setSuccess(true);
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: mealsApi.addFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals-favorites'] });
    },
  });

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = () => {
    const err = validate(form);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);

    const payload: CreateMealPayload = {
      mealType: form.mealType,
      title: form.title.trim(),
      eatenAt: new Date(form.eatenAt).toISOString(),
    };
    if (form.carbs) payload.carbs = parseFloat(form.carbs);
    if (form.breadUnits) payload.breadUnits = parseFloat(form.breadUnits);
    if (form.calories) payload.calories = parseFloat(form.calories);
    if (form.proteins) payload.proteins = parseFloat(form.proteins);
    if (form.fats) payload.fats = parseFloat(form.fats);
    if (form.comment.trim()) payload.comment = form.comment.trim();

    createMutation.mutate(payload);
  };

  const fillFromFavorite = (meal: Meal) => {
    setForm((prev) => ({
      ...prev,
      mealType: meal.mealType,
      title: meal.title,
      carbs: meal.carbs != null ? String(meal.carbs) : '',
      breadUnits: meal.breadUnits != null ? String(meal.breadUnits) : '',
      calories: meal.calories != null ? String(meal.calories) : '',
      proteins: meal.proteins != null ? String(meal.proteins) : '',
      fats: meal.fats != null ? String(meal.fats) : '',
      comment: meal.comment ?? '',
    }));
  };

  // --- Success screen ---
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Сохранено!</h2>
        <p className="text-gray-500 mb-6">Приём пищи добавлен в дневник</p>

        {favoritedId && (
          <button
            onClick={() => favoriteMutation.mutate(favoritedId)}
            disabled={favoriteMutation.isPending || favoriteMutation.isSuccess}
            className="mb-3 w-full max-w-xs border border-yellow-400 text-yellow-600 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {favoriteMutation.isSuccess ? '⭐ Добавлено в избранное' : '☆ Добавить в избранное'}
          </button>
        )}

        <button
          onClick={() => {
            setSuccess(false);
            setForm(defaultForm());
            setFavoritedId(null);
            favoriteMutation.reset();
          }}
          className="mb-2 w-full max-w-xs bg-green-500 text-white py-2 rounded-xl text-sm font-medium"
        >
          + Добавить ещё
        </button>
        <button
          onClick={() => navigate('/food')}
          className="w-full max-w-xs bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-medium"
        >
          ← Назад к дневнику
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 bg-white border-b border-gray-100">
        <button onClick={() => navigate('/food')} className="text-gray-500 text-lg p-1">←</button>
        <h1 className="text-lg font-bold text-gray-800">Добавить приём пищи</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32 space-y-4">

        {/* Repeat last favorite */}
        {favorites.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Быстрое добавление</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {favorites.slice(0, 5).map((fav) => (
                <button
                  key={fav.id}
                  onClick={() => fillFromFavorite(fav)}
                  className="flex-shrink-0 bg-white border border-gray-200 rounded-xl px-3 py-2 text-left shadow-sm"
                >
                  <p className="text-sm font-medium text-gray-800 whitespace-nowrap">{fav.title}</p>
                  {fav.breadUnits != null && (
                    <p className="text-xs text-green-600">{fav.breadUnits} ХЕ</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meal type chips */}
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Приём пищи</p>
          <div className="grid grid-cols-4 gap-2">
            {MEAL_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, mealType: t.value }))}
                className={`py-2 rounded-xl text-xs text-center transition-colors ${
                  form.mealType === t.value
                    ? 'bg-green-100 text-green-700 border border-green-400 font-semibold'
                    : 'bg-white text-gray-500 border border-gray-200'
                }`}
              >
                <div className="text-lg">{t.icon}</div>
                <div>{t.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main fields */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <input
            type="text"
            placeholder="Название блюда *"
            value={form.title}
            onChange={set('title')}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-green-400"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">ХЕ (хлебные единицы)</label>
              <input
                type="number"
                placeholder="0.0"
                value={form.breadUnits}
                onChange={set('breadUnits')}
                step="0.1"
                min="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Углеводы (г)</label>
              <input
                type="number"
                placeholder="0"
                value={form.carbs}
                onChange={(e) => {
                  const val = e.target.value;
                  const bu = val ? String(Math.round((parseFloat(val) / 12) * 10) / 10) : '';
                  setForm((prev) => ({ ...prev, carbs: val, breadUnits: prev.breadUnits || bu }));
                }}
                step="1"
                min="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400">* 1 ХЕ ≈ 12 г углеводов. Заполните одно из полей — второе рассчитается.</p>
        </div>

        {/* Extra fields toggle */}
        <button
          type="button"
          onClick={() => setShowExtra(!showExtra)}
          className="w-full flex items-center justify-between bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm text-sm text-gray-600"
        >
          <span>Дополнительно</span>
          <span className="text-gray-400">{showExtra ? '▲' : '▼'}</span>
        </button>

        {showExtra && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Калории</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.calories}
                  onChange={set('calories')}
                  min="0"
                  className="w-full border border-gray-200 rounded-xl px-2 py-2 text-sm focus:outline-none focus:border-green-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Белки (г)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.proteins}
                  onChange={set('proteins')}
                  min="0"
                  className="w-full border border-gray-200 rounded-xl px-2 py-2 text-sm focus:outline-none focus:border-green-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Жиры (г)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.fats}
                  onChange={set('fats')}
                  min="0"
                  className="w-full border border-gray-200 rounded-xl px-2 py-2 text-sm focus:outline-none focus:border-green-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Дата и время</label>
              <input
                type="datetime-local"
                value={form.eatenAt}
                onChange={set('eatenAt')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Комментарий</label>
              <textarea
                placeholder="Заметки..."
                value={form.comment}
                onChange={set('comment')}
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 resize-none"
              />
            </div>
          </div>
        )}

        {/* Validation error */}
        {validationError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {validationError}
          </div>
        )}

        {/* Mutation error */}
        {createMutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            Ошибка сохранения. Попробуйте ещё раз.
          </div>
        )}
      </div>

      {/* Sticky bottom button */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-4 pb-3 bg-gray-50 border-t border-gray-100 pt-3">
        <button
          onClick={handleSubmit}
          disabled={createMutation.isPending}
          className="w-full bg-green-500 text-white py-3.5 rounded-2xl text-base font-semibold disabled:opacity-50 shadow-md active:scale-[0.98] transition-transform"
        >
          {createMutation.isPending ? '⏳ Сохранение...' : '✓ Сохранить'}
        </button>
      </div>
    </div>
  );
}