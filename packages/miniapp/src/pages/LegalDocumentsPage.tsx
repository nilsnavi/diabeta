import React from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

export default function LegalDocumentsPage() {
  // В реальном приложении эти данные будут приходить с backend
  const documents = [
    {
      id: 'terms',
      title: 'Пользовательское соглашение',
      version: '1.0',
      acceptedAt: null, // Здесь будет дата принятия из API
      icon: '📋',
      link: '/legal/terms',
    },
    {
      id: 'privacy',
      title: 'Политика конфиденциальности',
      version: '1.0',
      acceptedAt: null,
      icon: '🔒',
      link: '/legal/privacy',
    },
    {
      id: 'personal-data',
      title: 'Согласие на обработку персональных данных',
      version: '1.0',
      acceptedAt: null,
      icon: '👤',
      link: '/legal/personal-data',
    },
    {
      id: 'health-data',
      title: 'Согласие на обработку данных о здоровье',
      version: '1.0',
      acceptedAt: null,
      icon: '🏥',
      link: '/legal/health-data',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">Юридическая информация</h1>
      </header>

      <div className="px-4 py-4 space-y-3">
        {documents.map((doc) => (
          <Link
            key={doc.id}
            to={doc.link}
            className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-95 transition-transform"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{doc.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">{doc.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Версия {doc.version}</span>
                  {doc.acceptedAt ? (
                    <>
                      <span>•</span>
                      <span className="text-green-600">
                        Принято {dayjs(doc.acceptedAt).format('DD.MM.YYYY')}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>•</span>
                      <span className="text-amber-600">Требуется принятие</span>
                    </>
                  )}
                </div>
              </div>
              <span className="text-gray-400 text-lg">›</span>
            </div>
          </Link>
        ))}

        {/* Дисклеймер */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mt-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-sm font-semibold text-amber-900 mb-2">Медицинский дисклеймер</h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                DiaBeta помогает вести дневник диабета и анализировать записи. 
                Сервис не является медицинским изделием, не ставит диагноз, 
                не назначает лечение и не заменяет консультацию врача. 
                При плохом самочувствии обратитесь за медицинской помощью.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
