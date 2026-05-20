import { apiClient } from './client';

export interface User {
  id: string;
  telegramId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  languageCode?: string | null;
  timezone?: string | null;
  diabetesType?: 'TYPE_1' | 'TYPE_2' | 'GESTATIONAL' | 'OTHER' | null;
  glucoseUnit?: 'MMOL_L' | 'MG_DL';
  targetGlucoseMin?: number | null;
  targetGlucoseMax?: number | null;
  carbsPerBreadUnit?: number | null;
  usesInsulin?: boolean;
  usesMedications?: boolean;
  usesCgm?: boolean;
  onboardingCompleted?: boolean;
  acceptedTermsAt?: string | null;
  acceptedPrivacyAt?: string | null;
  acceptedHealthDataConsentAt?: string | null;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const usersApi = {
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/users/me');
    return data;
  },

  updateMe: async (data: Partial<User>): Promise<User> => {
    const { data: updatedUser } = await apiClient.patch<User>('/users/me', data);
    return updatedUser;
  },

  deleteMe: async (): Promise<void> => {
    await apiClient.delete('/users/me');
  },

  exportData: async (): Promise<void> => {
    // Запрос на экспорт данных - файл придет в Telegram
    await apiClient.post('/user-data/export');
  },
};
