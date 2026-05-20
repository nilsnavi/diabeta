import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Card, Button, NumberInput, Chip } from '../shared/ui';
import type { DiabetesType } from '../shared/types';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [diabetesType, setDiabetesType] = useState<DiabetesType | ''>('');
  const [targetMin, setTargetMin] = useState<number | ''>(4.0);
  const [targetMax, setTargetMax] = useState<number | ''>(7.0);
  const [usesInsulin, setUsesInsulin] = useState<boolean>(false);

  const diabetesTypes: Array<{ value: DiabetesType; label: string; description: string }> = [
    { value: 'TYPE_1', label: 'Тип 1', description: 'Инсулинозависимый диабет' },
    { value: 'TYPE_2', label: 'Тип 2', description: 'Инсулиннезависимый диабет' },
    { value: 'GESTATIONAL', label: 'Гестационный', description: 'Диабет беременных' },
    { value: 'OTHER', label: 'Другой тип', description: 'LADA, MODY и др.' },
  ];

  const handleNext = () => {
    if (step === 1 && !diabetesType) return;
    if (step === 2 && (targetMin === '' || targetMax === '')) return;
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      // TODO: Save profile to API
      localStorage.setItem('onboarding_completed', 'true');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Header title="Настройка профиля" subtitle={`Шаг ${step} из 3`} />

      <div className="px-4 py-4 space-y-4">
        {/* Step 1: Diabetes Type */}
        {step === 1 && (
          <>
            <Card className="p-6 text-center">
              <div className="text-6xl mb-4">🏥</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Какой у вас тип диабета?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Эта информация поможет настроить приложение под ваши потребности
              </p>
            </Card>

            <div className="space-y-3">
              {diabetesTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setDiabetesType(type.value)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                    diabetesType === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{type.label}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{type.description}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2: Target Range */}
        {step === 2 && (
          <>
            <Card className="p-6 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Целевой диапазон сахара
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Укажите ваш персональный целевой диапазон глюкозы
              </p>
            </Card>

            <Card className="p-4 space-y-4">
              <NumberInput
                label="Минимальное значение"
                value={targetMin}
                onChange={(val) => setTargetMin(val)}
                min={3}
                max={10}
                step={0.1}
                suffix="ммоль/л"
                required
              />
              <NumberInput
                label="Максимальное значение"
                value={targetMax}
                onChange={(val) => setTargetMax(val)}
                min={3}
                max={10}
                step={0.1}
                suffix="ммоль/л"
                required
              />
            </Card>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Совет:</strong> Стандартный диапазон 4.0–7.0 ммоль/л подходит большинству людей с диабетом
              </p>
            </div>
          </>
        )}

        {/* Step 3: Insulin Usage */}
        {step === 3 && (
          <>
            <Card className="p-6 text-center">
              <div className="text-6xl mb-4">💉</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Используете ли вы инсулин?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Это поможет настроить разделы приложения
              </p>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setUsesInsulin(true)}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  usesInsulin
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="text-3xl mb-2">✅</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Да</div>
              </button>
              <button
                onClick={() => setUsesInsulin(false)}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  !usesInsulin
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="text-3xl mb-2">❌</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Нет</div>
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                🎉 <strong>Почти готово!</strong> После этого шага вы сможете начать использовать DiaBeta
              </p>
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              Назад
            </Button>
          )}
          <Button fullWidth onClick={handleNext}>
            {step === 3 ? 'Завершить настройку' : 'Продолжить'}
          </Button>
        </div>
      </div>
    </div>
  );
};
