import React from 'react';
import { Link } from 'react-router-dom';
import { KNOWLEDGE_CATEGORIES } from '../api/knowledge';

const categoryIcons: Record<string, string> = {
  'Основы диабета': '📚',
  'Гипогликемия': '⬇️',
  'Гипергликемия': '⬆️',
  'Питание': '🍽️',
  'ХЕ': '🍞',
  'Инсулин': '💉',
  'Физическая активность': '🏃',
  'Вопросы врачу': '👨‍⚕️',
  'Расходники': '📦',
  'Частые вопросы': '❓',
};

export default function KnowledgeBase() {
  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">База знаний</h1>
        <p className="text-gray-500 mt-1">Выберите категорию</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {KNOWLEDGE_CATEGORIES.map((category) => (
          <Link
            key={category}
            to={`/knowledge/articles?category=${encodeURIComponent(category)}`}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <span className="text-3xl">{categoryIcons[category] || '📄'}</span>
            <span className="text-sm font-medium text-gray-700 text-center">{category}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <Link
          to="/knowledge/articles"
          className="w-full bg-blue-50 text-blue-600 rounded-xl p-4 flex items-center justify-center gap-2 font-medium border border-blue-100"
        >
          <span>🔍</span>
          <span>Все статьи</span>
        </Link>
      </div>
    </div>
  );
}
