import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Card, Button, WarningBanner } from '../shared/ui';

export const LegalConsentPage: React.FC = () => {
  const navigate = useNavigate();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedHealthData, setAcceptedHealthData] = useState(false);

  const canProceed = acceptedTerms && acceptedPrivacy && acceptedHealthData;

  const handleAcceptAll = () => {
    // TODO: API call to save consent
    localStorage.setItem('legal_consent_accepted', 'true');
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Header title="Юридические документы" />

      <div className="px-4 py-4 space-y-4">
        {/* Medical Disclaimer */}
        <WarningBanner
          type="warning"
          title="Важная информация"
          message="Перед использованием DiaBeta необходимо принять условия использования и политику конфиденциальности."
        />

        {/* Terms of Service */}
        <Card className="p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="w-5 h-5 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Пользовательское соглашение
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Я подтверждаю, что ознакомился с условиями использования сервиса DiaBeta. 
                Понимаю, что сервис предназначен для ведения дневника диабета и не является медицинским изделием.
              </p>
              <button
                onClick={() => alert('Открыть полный текст соглашения')}
                className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-2"
              >
                Читать полностью →
              </button>
            </div>
          </label>
        </Card>

        {/* Privacy Policy */}
        <Card className="p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              className="w-5 h-5 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Политика конфиденциальности
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Я согласен на обработку персональных данных в соответствии с политикой конфиденциальности. 
                Мои данные будут защищены и использоваться только для предоставления услуг DiaBeta.
              </p>
              <button
                onClick={() => alert('Открыть полную политику конфиденциальности')}
                className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-2"
              >
                Читать полностью →
              </button>
            </div>
          </label>
        </Card>

        {/* Health Data Consent */}
        <Card className="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedHealthData}
              onChange={(e) => setAcceptedHealthData(e.target.checked)}
              className="w-5 h-5 mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Согласие на обработку данных о здоровье
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Я даю explicit согласие на обработку специальных категорий персональных данных 
                (данные о здоровье), включая информацию об уровне глюкозы, дозах инсулина и диагнозе диабета.
              </p>
              <button
                onClick={() => alert('Открыть полное согласие')}
                className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-2"
              >
                Читать полностью →
              </button>
            </div>
          </label>
        </Card>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">ℹ️</span>
            <div className="flex-1 text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Ваши права:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Вы можете запросить экспорт всех ваших данных</li>
                <li>Вы можете удалить аккаунт в любое время</li>
                <li>Вы можете отозвать согласие на обработку данных</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Accept Button */}
        <Button
          fullWidth
          size="lg"
          onClick={handleAcceptAll}
          disabled={!canProceed}
          className={!canProceed ? 'opacity-50' : ''}
        >
          Принять все и продолжить
        </Button>

        {!canProceed && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Необходимо принять все документы для продолжения
          </p>
        )}
      </div>
    </div>
  );
};
