import { apiClient } from './client';
import type { BloodSugar } from '../types';

export const bloodSugarApi = {
  getAll: async (startDate?: string, endDate?: string): Promise<BloodSugar[]> => {
    const { data } = await apiClient.get<BloodSugar[]>('/blood-sugar', {
      params: { startDate, endDate },
    });
    return data;
  },
  create: async (payload: Omit<BloodSugar, 'id' | 'userId'>): Promise<BloodSugar> => {
    const { data } = await apiClient.post<BloodSugar>('/blood-sugar', payload);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/blood-sugar/${id}`);
  },
};