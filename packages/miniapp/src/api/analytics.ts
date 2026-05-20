import { apiClient } from './client';
import type { AnalyticsSummary, GlucoseChartData, AnalyticsPatterns } from '../types';

export const analyticsApi = {
  getSummary: async (period = '7d'): Promise<AnalyticsSummary> => {
    const { data } = await apiClient.get<AnalyticsSummary>('/analytics/summary', {
      params: { period },
    });
    return data;
  },
  getGlucoseChart: async (period = '7d'): Promise<GlucoseChartData> => {
    const { data } = await apiClient.get<GlucoseChartData>('/analytics/glucose-chart', {
      params: { period },
    });
    return data;
  },
  getPatterns: async (period = '7d'): Promise<AnalyticsPatterns> => {
    const { data } = await apiClient.get<AnalyticsPatterns>('/analytics/patterns', {
      params: { period },
    });
    return data;
  },
};
