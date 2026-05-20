import apiClient from '../../shared/api/client';
import type { GlucoseEntry } from '../../shared/types';

// Mock data для разработки без backend
const mockGlucoseEntries: GlucoseEntry[] = [
  {
    id: '1',
    userId: 'user-1',
    value: 6.5,
    measuredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    context: 'before_meal',
    comment: 'Перед обедом',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user-1',
    value: 7.2,
    measuredAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    context: 'after_meal',
    comment: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: 'user-1',
    value: 5.8,
    measuredAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    context: 'fasting',
    comment: 'Утром натощак',
    createdAt: new Date().toISOString(),
  },
];

export const glucoseApi = {
  // Получить список записей глюкозы
  list: async (params?: { limit?: number; offset?: number }): Promise<{ data: GlucoseEntry[] }> => {
    // TODO: Заменить на реальный API вызов
    // const { data } = await apiClient.get('/glucose', { params });
    // return data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return { data: mockGlucoseEntries.slice(0, params?.limit || 20) };
  },

  // Получить одну запись
  getById: async (id: string): Promise<GlucoseEntry> => {
    // TODO: Заменить на реальный API вызов
    // const { data } = await apiClient.get(`/glucose/${id}`);
    // return data;
    
    const entry = mockGlucoseEntries.find(e => e.id === id);
    if (!entry) throw new Error('Not found');
    return entry;
  },

  // Создать новую запись
  create: async (entry: Omit<GlucoseEntry, 'id' | 'userId' | 'createdAt'>): Promise<GlucoseEntry> => {
    // TODO: Заменить на реальный API вызов
    // const { data } = await apiClient.post('/glucose', entry);
    // return data;
    
    await new Promise(resolve => setTimeout(resolve, 500));
    const newEntry: GlucoseEntry = {
      ...entry,
      id: String(mockGlucoseEntries.length + 1),
      userId: 'user-1',
      createdAt: new Date().toISOString(),
    };
    mockGlucoseEntries.unshift(newEntry);
    return newEntry;
  },

  // Обновить запись
  update: async (id: string, updates: Partial<GlucoseEntry>): Promise<GlucoseEntry> => {
    // TODO: Заменить на реальный API вызов
    // const { data } = await apiClient.patch(`/glucose/${id}`, updates);
    // return data;
    
    const index = mockGlucoseEntries.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Not found');
    
    mockGlucoseEntries[index] = { ...mockGlucoseEntries[index], ...updates };
    return mockGlucoseEntries[index];
  },

  // Удалить запись
  delete: async (id: string): Promise<void> => {
    // TODO: Заменить на реальный API вызов
    // await apiClient.delete(`/glucose/${id}`);
    
    const index = mockGlucoseEntries.findIndex(e => e.id === id);
    if (index !== -1) {
      mockGlucoseEntries.splice(index, 1);
    }
  },
};
