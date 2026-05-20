import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { knowledgeApi, KNOWLEDGE_CATEGORIES } from '../api/knowledge';

export default function ArticleList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const category = searchParams.get('category') || '';

  const { data: articles, isLoading } = useQuery({
    queryKey: ['knowledge-articles', category, searchQuery],
    queryFn: () =>
      knowledgeApi.getArticles({
        category: category || undefined,
        search: searchQuery || undefined,
      }),
  });

  useEffect(() => {
    if (searchQuery) {
      searchParams.set('search', searchQuery);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  }, [searchQuery, searchParams, setSearchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryClick = (cat: string) => {
    if (cat === category) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="p-4">
      <header className="mb-4">
        <Link to="/knowledge" className="text-blue-600 text-sm mb-2 inline-block">
          ← Назад к категориям
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-2">
          {category || 'Все статьи'}
        </h1>
      </header>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Поиск по заголовку и содержанию..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryClick('')}
          className={`px-3 py-1 rounded-full text-sm ${
            !category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Все
        </button>
        {KNOWLEDGE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-3 py-1 rounded-full text-sm ${
              category === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Загрузка...</div>
      ) : articles && articles.length > 0 ? (
        <div className="space-y-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/knowledge/articles/${article.slug}`}
              className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="text-xs text-blue-600 mb-1">{article.category}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{article.title}</h3>
              <div className="text-xs text-gray-400">
                {new Date(article.createdAt).toLocaleDateString('ru-RU')}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          {searchQuery || category ? 'Статьи не найдены' : 'Нет опубликованных статей'}
        </div>
      )}
    </div>
  );
}
