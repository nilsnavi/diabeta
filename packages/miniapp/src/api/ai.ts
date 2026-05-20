import { apiClient } from './client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatResponse {
  message: ChatMessage;
  safetyFlag?: boolean;
}

export interface DiaryAnalysis {
  summary: string;
  insights: string[];
  createdAt: string;
}

export const aiApi = {
  sendMessage: async (message: string): Promise<ChatResponse> => {
    const { data } = await apiClient.post('/ai/chat', { message });
    return data;
  },

  analyzeDiary: async (days: number = 14): Promise<DiaryAnalysis> => {
    const { data } = await apiClient.post('/ai/analyze-diary', { days });
    return data;
  },

  getHistory: async (): Promise<ChatMessage[]> => {
    const { data } = await apiClient.get('/ai/history');
    return data;
  },

  clearHistory: async (): Promise<void> => {
    await apiClient.delete('/ai/history');
  },
};