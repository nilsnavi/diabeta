import { apiClient } from './client';

export type ActivityType = 'walking' | 'running' | 'gym' | 'cardio' | 'strength' | 'cycling' | 'lfk' | 'other';
export type Intensity = 'low' | 'medium' | 'high';

export interface ActivityEntry {
  id: string;
  userId: string;
  activityType: ActivityType;
  durationMinutes: number;
  intensity: Intensity;
  startedAt: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateActivityData {
  activityType: ActivityType;
  durationMinutes: number;
  intensity: Intensity;
  startedAt: string;
  comment?: string;
}

export const activityApi = {
  create: (data: CreateActivityData): Promise<ActivityEntry> =>
    apiClient.post<ActivityEntry>('/activities', data).then((r: { data: ActivityEntry }) => r.data),

  getAll: (params?: { activityType?: ActivityType; from?: string; to?: string }): Promise<ActivityEntry[]> =>
    apiClient.get<ActivityEntry[]>('/activities', { params }).then((r: { data: ActivityEntry[] }) => r.data),

  getOne: (id: string): Promise<ActivityEntry> =>
    apiClient.get<ActivityEntry>(`/activities/${id}`).then((r: { data: ActivityEntry }) => r.data),

  update: (id: string, data: Partial<CreateActivityData>): Promise<ActivityEntry> =>
    apiClient.patch<ActivityEntry>(`/activities/${id}`, data).then((r: { data: ActivityEntry }) => r.data),

  delete: (id: string): Promise<unknown> =>
    apiClient.delete(`/activities/${id}`).then((r: { data: unknown }) => r.data),
};