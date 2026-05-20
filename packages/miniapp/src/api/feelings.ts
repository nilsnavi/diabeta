import { apiClient } from './client';

export type FeelingType = 'good' | 'normal' | 'weakness' | 'dizzy' | 'bad' | 'other';

export type SymptomType =
  | 'sweating'
  | 'tremor'
  | 'hunger'
  | 'headache'
  | 'drowsiness'
  | 'anxiety'
  | 'nausea'
  | 'thirst'
  | 'frequent_urination'
  | 'other';

export interface FeelingEntry {
  id: string;
  userId: string;
  feeling: FeelingType;
  symptoms: SymptomType[];
  mood?: number;
  energyLevel?: number;
  recordedAt: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateFeelingData {
  feeling: FeelingType;
  symptoms?: SymptomType[];
  mood?: number;
  energyLevel?: number;
  recordedAt?: string;
  comment?: string;
}

export interface FeelingsResponse {
  data: FeelingEntry[];
  total: number;
  page: number;
  limit: number;
}

export const feelingsApi = {
  create: (data: CreateFeelingData): Promise<FeelingEntry> =>
    apiClient.post<FeelingEntry>('/feelings', data).then((r: { data: FeelingEntry }) => r.data),

  getAll: (params?: { page?: number; limit?: number; feeling?: FeelingType }): Promise<FeelingsResponse> =>
    apiClient.get<FeelingsResponse>('/feelings', { params }).then((r: { data: FeelingsResponse }) => r.data),

  getOne: (id: string): Promise<FeelingEntry> =>
    apiClient.get<FeelingEntry>(`/feelings/${id}`).then((r: { data: FeelingEntry }) => r.data),

  update: (id: string, data: Partial<CreateFeelingData>): Promise<FeelingEntry> =>
    apiClient.patch<FeelingEntry>(`/feelings/${id}`, data).then((r: { data: FeelingEntry }) => r.data),

  delete: (id: string): Promise<unknown> =>
    apiClient.delete(`/feelings/${id}`).then((r: { data: unknown }) => r.data),
};
