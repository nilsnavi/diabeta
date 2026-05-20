import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { Insulin } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const insulinApi = {
  getAll: () => apiClient.get<Insulin[]>('/insulin').then((r) => r.data),
  create: (d: Omit<Insulin, 'id' | 'userId'>) => apiClient.post<Insulin>('/insulin', d).then((r) => r.data),
};

const INSULIN_TYPES = [
  { value: 'RAPID', label: 'Ультракороткий' },
  { value: 'SHORT', label: 'Короткий' },
  { value: 'INTERMEDIATE', label: 'Средний' },
  { value: 'LONG', label: 'Длинный' },
  { value: 'PREMIXED', label: 'Смешанный' },
];

export default function InsulinPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    insulinType: 'RAPID' as const,
    dosage: '',
    injectedAt: new Date().toISOString().slice(0, 16),
    notes: '',
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['insulin'],
    queryFn: insulinApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: insulinApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insulin'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
      setShowForm(false);
      setForm({ insulinType: 'RAPID', dosage: '', injectedAt: new Date().toISOString().slice(0, 16), notes: '' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.dosage) return;
    createMutation.mutate({
      insulinType: form.insulinType,
      dosage: parseFloat(form.dosage),
      units: 'ед.',
      injectedAt: new Date(form.injectedAt).toISOString(),
      notes: form.notes || null,
    });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">💉 Дневник инсулина</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Добавить
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Тип инсулина</label>
            <select
              value={form.insulinType}
              onChange={(e) => setForm({ ...form, insulinType: e.target.value as typeof form.insulinType })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              {INSULIN_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Доза (единицы)</label>
            <input
              type="number" step="0.5" min="0" max="200" placeholder="10"
              value={form.dosage}
              onChange={(e) => setForm({ ...form, dosage: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Дата и время</label>
            <input type="datetime-local" value={form.injectedAt}
              onChange={(e) => setForm({ ...form, injectedAt: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="mb-3">
            <input type="text" placeholder="Заметки (необязательно)" value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <p className="text-xs text-gray-400 mb-3">⚠️ Дозировку инсулина назначает только врач.</p>
          <button type="submit" disabled={createMutation.isPending}
            className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            {createMutation.isPending ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Загрузка...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-8 text-gray-400"><p className="text-4xl mb-2">💉</p><p>Записей пока нет</p></div>
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <div key={r.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <span className="text-lg font-bold text-blue-600">{r.dosage} ед.</span>
                <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                  {INSULIN_TYPES.find((t) => t.value === r.insulinType)?.label}
                </span>
                {r.notes && <p className="text-xs text-gray-400 mt-1">{r.notes}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">{format(new Date(r.injectedAt), 'dd MMM', { locale: ru })}</p>
                <p className="text-xs text-gray-400">{format(new Date(r.injectedAt), 'HH:mm')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}