import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { legalApi } from '../api/legal';
import { useAuthStore } from '../store/authStore';

export default function LegalConsentModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const setLegalStatus = useAuthStore((s) => s.setLegalStatus);

  const { data: legalStatus, isLoading, error } = useQuery({
    queryKey: ['legal-status'],
    queryFn: () => legalApi.getUserLegalStatus(),
  });

  const allAccepted = legalStatus?.acceptedTermsAt && 
                      legalStatus?.acceptedPrivacyAt && 
                      legalStatus?.acceptedHealthDataConsentAt;

  // Закрываем модалку если все документы приняты
  useEffect(() => {
    if (allAccepted) {
      onClose();
    }
  }, [allAccepted, onClose]);

  const handleAcceptAll = async () => {
    try {
      await legalApi.acceptDocument('terms');
      await legalApi.acceptDocument('privacy');
      await legalApi.acceptDocument('health-data');
      
      // Обновляем статус в store
      const updatedStatus = await legalApi.getUserLegalStatus();
      setLegalStatus(updatedStatus);
      
      onClose();
    } catch (error) {
      console.error('Error accepting documents:', error);
      alert('Ошибка при принятии документов. Попробуйте еще раз.');
    }
  };

  const handleViewDocument = (path: string) => {
    onClose();
    navigate(path);
  };

  // Показываем loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-md p-6">
          <div className="text-center">
            <span className="text-4xl mb-4 block">⚠️</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
            <p className="text-sm text-gray-600 mb-4">
              Не удалось загрузить документы. Проверьте подключение к интернету.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-900 rounded-xl py-3 px-6 font-medium"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Не показываем если все документы приняты
  if (allAccepted) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Важная информация</h2>
          <p className="text-sm text-gray-500 mt-1">
            Для продолжения необходимо принять документы
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {/* Дисклеймер */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
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

          {/* Список документов */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Необходимо принять:</p>
            
            <DocumentItem
              icon="📋"
              title="Пользовательское соглашение"
              accepted={!!legalStatus?.acceptedTermsAt}
              onClick={() => handleViewDocument('/legal/terms')}
            />
            
            <DocumentItem
              icon="🔒"
              title="Политика конфиденциальности"
              accepted={!!legalStatus?.acceptedPrivacyAt}
              onClick={() => handleViewDocument('/legal/privacy')}
            />
            
            <DocumentItem
              icon="👤"
              title="Согласие на обработку персональных данных"
              accepted={false} // Временно отключено до добавления поля в backend
              onClick={() => handleViewDocument('/legal/personal-data')}
            />
            
            <DocumentItem
              icon="🏥"
              title="Согласие на обработку данных о здоровье"
              accepted={!!legalStatus?.acceptedHealthDataConsentAt}
              onClick={() => handleViewDocument('/legal/health-data')}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-5 border-t border-gray-200 space-y-3">
          <button
            onClick={handleAcceptAll}
            disabled={!legalStatus}
            className="w-full bg-blue-600 text-white rounded-xl py-4 px-6 font-semibold active:scale-95 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Принять все документы
          </button>
          
          <button
            onClick={() => handleViewDocument('/legal/documents')}
            className="w-full text-blue-600 font-medium py-2"
          >
            Подробнее о документах →
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentItem({
  icon,
  title,
  accepted,
  onClick,
}: {
  icon: string;
  title: string;
  accepted: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="flex-1 text-left text-sm font-medium text-gray-700">{title}</span>
      {accepted ? (
        <span className="text-green-600 text-lg">✓</span>
      ) : (
        <span className="text-amber-600 text-lg">•</span>
      )}
    </button>
  );
}
