import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { knowledgeApi } from '../api/knowledge';
import ReactMarkdown from 'react-markdown';

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['knowledge-article', slug],
    queryFn: () => knowledgeApi.getArticleBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-center py-8 text-gray-400">Загрузка...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="p-4">
        <div className="text-center py-8 text-red-500">Статья не найдена</div>
        <Link to="/knowledge" className="text-blue-600 text-center block">
          ← Вернуться к базе знаний
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <header className="mb-4">
        <Link to="/knowledge/articles" className="text-blue-600 text-sm mb-2 inline-block">
          ← Назад к статьям
        </Link>
        <div className="text-xs text-blue-600 mb-2">{article.category}</div>
        <h1 className="text-2xl font-bold text-gray-800">{article.title}</h1>
        <div className="text-xs text-gray-400 mt-1">
          Обновлено: {new Date(article.updatedAt).toLocaleDateString('ru-RU')}
        </div>
      </header>

      <div className="prose prose-sm max-w-none bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs text-amber-800 text-center">
          ⚠️ Материал носит справочный характер и не заменяет консультацию врача.
        </p>
      </div>
    </div>
  );
}
