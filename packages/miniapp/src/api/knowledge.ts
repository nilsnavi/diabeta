import { apiClient } from './client';

export const KNOWLEDGE_CATEGORIES = [
  'Основы диабета',
  'Гипогликемия',
  'Гипергликемия',
  'Питание',
  'ХЕ',
  'Инсулин',
  'Физическая активность',
  'Вопросы врачу',
  'Расходники',
  'Частые вопросы',
] as const;

export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number];

export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QueryArticlesParams {
  category?: string;
  search?: string;
  status?: ArticleStatus;
}

export const knowledgeApi = {
  getArticles: async (params?: QueryArticlesParams): Promise<KnowledgeArticle[]> => {
    const { data } = await apiClient.get<KnowledgeArticle[]>('/knowledge/articles', { params });
    return data;
  },

  getArticleBySlug: async (slug: string): Promise<KnowledgeArticle> => {
    const { data } = await apiClient.get<KnowledgeArticle>(`/knowledge/articles/${slug}`);
    return data;
  },
};
