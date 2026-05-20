import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mealsApi, type Meal } from '../api/meals';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const MEAL_TYPES = [
  { value: 'BREAKFAST', label: 'Завтрак', icon: '🌅' },
  { value: 'LUNCH', label: 'Обед', icon: '☀️' },
  { value: 'DINNER', label: 'Ужин', icon: '🌙' },
  { value: 'SNACK', label: 'Перекус', icon: '🍎' },
];

export default function FoodPage() {
  const navigate = useNavigate();
  const { data: records = [], isLoading } = useQuery({ queryKey: ['meals'], queryFn: mealsApi.getAll });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">🍽️ Дневник еды</h1>
        <button
          onClick={() => navigate('/add-food')}
          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Добавить
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Загрузка...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-5xl mb-3">🍽️</p>
          <p className="mb-4">Записей пока нет</p>
          <button
            onClick={() => navigate('/add-food')}
            className="bg-green-500 text-white px-6 py-2 rounded-xl text-sm font-medium"
          >
            Добавить первый приём пищи
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((r: Meal) => {
            const meal = MEAL_TYPES.find((t) => t.value === r.mealType);
            return (
              <div key={r.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <span className="mr-2">{meal?.icon}</span>
                  <span className="font-medium text-gray-800">{r.title}</span>
                  <div className="flex gap-3 mt-1">
                    {r.breadUnits != null && <span className="text-xs text-green-600">🍞 {r.breadUnits} ХЕ</span>}
                    {r.carbs != null && <span className="text-xs text-orange-500">{r.carbs}г</span>}
                    {r.calories != null && <span className="text-xs text-purple-500">🔥 {r.calories}ккал</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{format(new Date(r.eatenAt), 'dd MMM', { locale: ru })}</p>
                  <p className="text-xs text-gray-400">{format(new Date(r.eatenAt), 'HH:mm')}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
