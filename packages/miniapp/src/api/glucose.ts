import { apiClient } from './client';

export type GlucoseContext =
  | 'fasting'
  | 'before_meal'
  | 'after_meal'
  | 'before_sleep'
  | 'night'
  | 'after_workout'
  | 'feeling_bad'
  | 'other';

export interface CreateGlucosePayload {
  value: number;
  unit: 'mmol_l';
  context: GlucoseContext;
  measuredAt: string;
  comment?: string;
}

export interface GlucoseRecord {
  id: string;
  value: number;
  unit: string;
  context: GlucoseContext;
  measuredAt: string;
  comment?: string;
}

export const glucoseApi = {
  create: async (payload: CreateGlucosePayload): Promise<GlucoseRecord> => {
    const { data } = await apiClient.post<GlucoseRecord>('/glucose', payload);
    return data;
  },
};