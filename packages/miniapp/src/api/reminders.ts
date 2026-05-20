import { apiClient } from './client';

export type ReminderType =
  | 'check_glucose'
  | 'basal_insulin'
  | 'medication'
  | 'after_meal_glucose'
  | 'before_sleep_glucose'
  | 'sensor_replace'
  | 'supplies'
  | 'report'
  | 'custom';

export type RepeatType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  time: string;
  repeatRule: string | null;
  timezone: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderDto {
  type: ReminderType;
  title: string;
  time: string;
  repeatRule?: string;
  timezone: string;
}

export interface UpdateReminderDto {
  type?: ReminderType;
  title?: string;
  time?: string;
  repeatRule?: string;
  timezone?: string;
  enabled?: boolean;
}

export function repeatTypeToRule(repeat: RepeatType): string | undefined {
  switch (repeat) {
    case 'DAILY': return 'FREQ=DAILY';
    case 'WEEKLY': return 'FREQ=WEEKLY';
    case 'MONTHLY': return 'FREQ=MONTHLY';
    default: return undefined;
  }
}

export function ruleToRepeatType(rule: string | null | undefined): RepeatType {
  if (!rule) return 'NONE';
  if (rule.includes('MONTHLY')) return 'MONTHLY';
  if (rule.includes('WEEKLY')) return 'WEEKLY';
  if (rule.includes('DAILY')) return 'DAILY';
  return 'NONE';
}

export const remindersApi = {
  list: () => apiClient.get<Reminder[]>('/reminders'),
  create: (data: CreateReminderDto) => apiClient.post<Reminder>('/reminders', data),
  update: (id: string, data: UpdateReminderDto) =>
    apiClient.patch<Reminder>(`/reminders/${id}`, data),
  delete: (id: string) => apiClient.delete(`/reminders/${id}`),
  toggle: (id: string, enabled: boolean) =>
    apiClient.patch<Reminder>(`/reminders/${id}`, { enabled }),
  complete: (id: string) => apiClient.post(`/reminders/${id}/complete`, {}),
  snooze: (id: string, minutes = 10) => apiClient.post(`/reminders/${id}/snooze`, { minutes }),
  skip: (id: string) => apiClient.post(`/reminders/${id}/skip`, {}),
};