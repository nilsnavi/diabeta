import { apiClient } from './client';

export type TimelineType =
  | 'glucose'
  | 'insulin'
  | 'meal'
  | 'feeling'
  | 'activity';

export interface TimelineItem {
  id: string;
  type: TimelineType;
  entityId: string;
  title: string;
  subtitle: string;
  value: string;
  status: string | null;
  occurredAt: string;
}

export interface TimelineResponse {
  items: TimelineItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface TimelineQuery {
  from?: string;
  to?: string;
  type?: TimelineType;
  limit?: number;
  offset?: number;
}

export const timelineApi = {
  getTimeline: async (query: TimelineQuery = {}): Promise<TimelineResponse> => {
    const params = new URLSearchParams();
    if (query.from) params.set('from', query.from);
    if (query.to) params.set('to', query.to);
    if (query.type) params.set('type', query.type);
    if (query.limit !== undefined) params.set('limit', String(query.limit));
    if (query.offset !== undefined) params.set('offset', String(query.offset));

    const qs = params.toString();
    const response = await apiClient.get<TimelineResponse>(
      `/timeline${qs ? `?${qs}` : ''}`,
    );
    return response.data;
  },
};