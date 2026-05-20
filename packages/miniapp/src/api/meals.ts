import { apiClient } from './client';

export interface Meal {
  id: string;
  userId: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  title: string;
  carbs?: number | null;
  breadUnits?: number | null;
  calories?: number | null;
  proteins?: number | null;
  fats?: number | null;
  photoUrl?: string | null;
  eatenAt: string;
  comment?: string | null;
  isFavorite?: boolean;
}

export interface CreateMealPayload {
  mealType: Meal['mealType'];
  title: string;
  carbs?: number;
  breadUnits?: number;
  calories?: number;
  proteins?: number;
  fats?: number;
  photoUrl?: string;
  eatenAt: string;
  comment?: string;
}

export const mealsApi = {
  create: (data: CreateMealPayload): Promise<Meal> =>
    apiClient.post<Meal>('/meals', data).then((r) => r.data as Meal),

  getAll: (): Promise<Meal[]> =>
    apiClient.get<Meal[]>('/meals').then((r) => r.data as Meal[]),

  getFavorites: (): Promise<Meal[]> =>
    apiClient.get<Meal[]>('/meals/favorites').then((r) => r.data as Meal[]),

  addFavorite: (id: string): Promise<Meal> =>
    apiClient.post<Meal>(`/meals/${id}/favorite`).then((r) => r.data as Meal),
};
