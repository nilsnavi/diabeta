import { apiClient } from './client';
import type { AuthResponse } from '../types';

export const authApi = {
  login: async (initData: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/telegram', { initData });
    return data;
  },
};