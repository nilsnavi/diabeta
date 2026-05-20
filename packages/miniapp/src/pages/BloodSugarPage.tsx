import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bloodSugarApi } from '../api/bloodSugar';
import type { BloodSugar } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function BloodSugarPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    value: '',
    unit: 'MMOL_L' as const,
    measuredAt: new Date().toISOString().slice(0, 16),
    notes: '',
    beforeMeal: false,
    afterMeal: false,
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['blood-sugar'],
    queryFn: () => bloodSugarApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<BloodSugar, 'id' | 'userId'>) => bloodSugarApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blood-sugar'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
      setShowForm(false);
      setForm({ value: '', unit: 'MMOL_L', measuredAt: new Date().toISOString().slice(0, 16), notes: '', beforeMeal: false, afterMeal: false });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.value) return;
    createMutation.mutate({
      value: parseFloat(form.value),
      unit: form.unit,
      measuredAt: new Date(form.measuredAt).toISOString(),
      notes: form.notes || null,
      beforeMeal: form.beforeMeal || null,
      afterMeal: form.afterMeal || null,
    });
  };

  const getValueColor = (value: number, unit: string) => {
    const mmol = unit === 'MG_DL' ? value / 18 : value;
    if (mmol < 3.9) return 'text-blue-600';
    if (mmol > 10) return 'text-red-600';
    if (mmol > 7.8) return 'text-orange-500';
    return 'text-green-600';
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">🩸 Дневник сахара</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Добавить
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Уровень сахара</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                placeholder="5.5"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                required
              />
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value as 'MMOL_L' | 'MG_DL' })}
                className="border border-gray-200 rounded-lg px-2 py-2 text-sm"
              >
                <option value="MMOL_L">ммоль/л</option>
                <option value="MG_DL">мг/дл</option>
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Дата и время</label>
            <input
              type="datetime-local"
              value={form.measuredAt}
              onChange={(e) => setForm({ ...form, measuredAt: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="mb-3 flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={form.beforeMeal}
                onChange={(e) => setForm({ ...form, beforeMeal: e.target.checked, afterMeal: false })}
              />
              До еды
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={form.afterMeal}
                onChange={(e) => setForm({ ...form, afterMeal: e.target.checked, beforeMeal: false })}
              />
              После еды
            </label>
          </div>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Заметки (необязательно)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {createMutation.isPending ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Загрузка...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-4xl mb-2">🩸</p>
          <p>Записей пока нет</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <div key={record.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <span className={`text-2xl font-bold ${getValueColor(record.value, record.unit)}`}>
                  {record.value}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  {record.unit === 'MMOL_L' ? 'ммоль/л' : 'мг/дл'}
                </span>
                {record.beforeMeal && <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1 rounded">до еды</span>}
                {record.afterMeal && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1 rounded">после еды</span>}
                {record.notes && <p className="text-xs text-gray-400 mt-1">{record.notes}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">
                  {format(new Date(record.measuredAt), 'dd MMM', { locale: ru })}
                </p>
                <p className="text-xs text-gray-400">
                  {format(new Date(record.measuredAt), 'HH:mm')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}