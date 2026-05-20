import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

type InsulinType = 'rapid' | 'short' | 'basal' | 'mixed' | 'other';
type InsulinName = 'novorapid' | 'tudjeo' | 'lantus' | 'levemir' | 'humalog' | 'apidra' | 'other';

interface OptionItem {
  value: string;
  label: string;
  icon?: string;
}

const insulinTypes: OptionItem[] = [
  { value: 'rapid', label: 'Быстрый', icon: '⚡' },
  { value: 'short', label: 'Короткий', icon: '⏱️' },
  { value: 'basal', label: 'Базальный', icon: '🌙' },
  { value: 'mixed', label: 'Смешанный', icon: '🔄' },
  { value: 'other', label: 'Другой', icon: '📝' },
];

const insulinNames: OptionItem[] = [
  { value: 'novorapid', label: 'НовоРапид' },
  { value: 'tudjeo', label: 'Туджео' },
  { value: 'lantus', label: 'Лантус' },
  { value: 'levemir', label: 'Левемир' },
  { value: 'humalog', label: 'Хумалог' },
  { value: 'apidra', label: 'Апидра' },
  { value: 'other', label: 'Другое' },
];

const injectionSites = [
  { value: 'abdomen', label: 'Живот', icon: '🔵' },
  { value: 'thigh', label: 'Бедро', icon: '🦵' },
  { value: 'arm', label: 'Рука', icon: '💪' },
  { value: 'buttock', label: 'Ягодица', icon: '🍑' },
];

const AddInsulinPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [insulinType, setInsulinType] = useState<InsulinType | ''>('');
  const [insulinName, setInsulinName] = useState<InsulinName | ''>('');
  const [units, setUnits] = useState<string>('');
  const [injectionSite, setInjectionSite] = useState<string>('');
  const [comment, setComment] = useState('');
  const [dateTime, setDateTime] = useState(dayjs().format('YYYY-MM-DDTHH:mm'));
  
  // Validation errors
  const [errors, setErrors] = useState<{
    insulinType?: string;
    insulinName?: string;
    units?: string;
    comment?: string;
  }>({});
  
  // Success state
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock save function
  const mockSave = async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Saved insulin:', data);
    return { success: true };
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    // Insulin type validation
    if (!insulinType) {
      newErrors.insulinType = 'Выберите тип инсулина';
    }

    // Insulin name validation
    if (!insulinName) {
      newErrors.insulinName = 'Выберите препарат';
    }

    // Units validation
    if (!units || units.trim() === '') {
      newErrors.units = 'Введите количество единиц';
    } else {
      const numUnits = parseFloat(units);
      if (isNaN(numUnits)) {
        newErrors.units = 'Введите корректное число';
      } else if (numUnits < 0.5) {
        newErrors.units = 'Минимальная доза 0.5 единиц';
      } else if (numUnits > 100) {
        newErrors.units = 'Максимальная доза 100 единиц';
      } else if (numUnits % 0.5 !== 0) {
        newErrors.units = 'Доза должна быть кратна 0.5';
      }
    }

    // Comment validation
    if (comment.length > 1000) {
      newErrors.comment = 'Комментарий не должен превышать 1000 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await mockSave({
        insulinType,
        insulinName,
        units: parseFloat(units),
        injectionSite: injectionSite || null,
        measuredAt: dateTime,
        comment: comment.trim() || null,
      });

      setShowSuccess(true);
    } catch (error) {
      alert('Ошибка сохранения. Попробуйте ещё раз.');
    }
  };

  // Adjust units by step
  const adjustUnits = (delta: number) => {
    const current = parseFloat(units) || 0;
    const newValue = Math.max(0.5, Math.min(100, current + delta));
    setUnits(newValue.toFixed(1));
    if (errors.units) {
      setErrors(prev => ({ ...prev, units: undefined }));
    }
  };

  // Success Screen
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <span className="text-4xl">💉</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Инсулин записан
            </h2>

            {/* Value */}
            <div className="mb-4">
              <div className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {parseFloat(units).toFixed(1)}
              </div>
              <div className="text-lg text-gray-500 dark:text-gray-400">единиц</div>
            </div>

            {/* Info */}
            <div className="space-y-2 mb-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{insulinTypes.find(t => t.value === insulinType)?.icon}</span>{' '}
                {insulinTypes.find(t => t.value === insulinType)?.label}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {insulinNames.find(n => n.value === insulinName)?.label}
              </div>
              {injectionSite && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {injectionSites.find(s => s.value === injectionSite)?.icon}{' '}
                  {injectionSites.find(s => s.value === injectionSite)?.label}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setInsulinType('');
                  setInsulinName('');
                  setUnits('');
                  setInjectionSite('');
                  setComment('');
                  setDateTime(dayjs().format('YYYY-MM-DDTHH:mm'));
                  setShowSuccess(false);
                  setErrors({});
                }}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all duration-200"
              >
                Добавить ещё
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full py-4 px-6 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl font-semibold active:scale-[0.98] transition-all duration-200"
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Form
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Назад"
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Добавить инсулин
          </h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-md mx-auto">
        {/* Medical Disclaimer */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Важно</h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                DiaBeta записывает введённую вами дозу, но <strong>не назначает лечение</strong> и{' '}
                <strong>не рассчитывает дозировки</strong>. Всегда следуйте назначениям вашего врача.
              </p>
            </div>
          </div>
        </div>

        {/* Insulin Type */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Тип инсулина <span className="text-red-500">*</span>
          </label>
          
          <div className="grid grid-cols-2 gap-2">
            {insulinTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  setInsulinType(type.value as InsulinType);
                  if (errors.insulinType) {
                    setErrors(prev => ({ ...prev, insulinType: undefined }));
                  }
                }}
                className={`p-3 rounded-xl border-2 text-left transition-all active:scale-95 ${
                  insulinType === type.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-xl mb-1">{type.icon}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {type.label}
                </div>
              </button>
            ))}
          </div>

          {errors.insulinType && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <span>⚠️</span> {errors.insulinType}
            </p>
          )}
        </div>

        {/* Insulin Name */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Препарат <span className="text-red-500">*</span>
          </label>
          
          <div className="flex flex-wrap gap-2">
            {insulinNames.map((name) => (
              <button
                key={name.value}
                onClick={() => {
                  setInsulinName(name.value as InsulinName);
                  if (errors.insulinName) {
                    setErrors(prev => ({ ...prev, insulinName: undefined }));
                  }
                }}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all active:scale-95 ${
                  insulinName === name.value
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {name.label}
              </button>
            ))}
          </div>

          {errors.insulinName && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <span>⚠️</span> {errors.insulinName}
            </p>
          )}
        </div>

        {/* Units Input - Large & Prominent */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Количество единиц <span className="text-red-500">*</span>
          </label>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => adjustUnits(-0.5)}
              className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xl active:scale-95 transition-transform"
              aria-label="Уменьшить на 0.5"
            >
              −
            </button>
            
            <div className="flex-1 relative">
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                min="0.5"
                max="100"
                value={units}
                onChange={(e) => {
                  setUnits(e.target.value);
                  if (errors.units) {
                    setErrors(prev => ({ ...prev, units: undefined }));
                  }
                }}
                placeholder="5.0"
                className={`w-full text-5xl font-bold text-center py-6 bg-gray-50 dark:bg-gray-900 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all ${
                  errors.units
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              <span className="absolute right-4 bottom-6 text-lg text-gray-400 dark:text-gray-500">
                ед
              </span>
            </div>
            
            <button
              onClick={() => adjustUnits(0.5)}
              className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xl active:scale-95 transition-transform"
              aria-label="Увеличить на 0.5"
            >
              +
            </button>
          </div>

          {errors.units && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <span>⚠️</span> {errors.units}
            </p>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Шаг: 0.5 единиц • Диапазон: 0.5–100
          </p>
        </div>

        {/* Injection Site (Optional) */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Место инъекции <span className="text-gray-400">(необязательно)</span>
          </label>
          
          <div className="grid grid-cols-2 gap-2">
            {injectionSites.map((site) => (
              <button
                key={site.value}
                onClick={() => setInjectionSite(site.value)}
                className={`p-3 rounded-xl border-2 text-left transition-all active:scale-95 ${
                  injectionSite === site.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-xl mb-1">{site.icon}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {site.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Дата и время
          </label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            По умолчанию установлено текущее время
          </p>
        </div>

        {/* Comment */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Комментарий <span className="text-gray-400">(необязательно)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if (errors.comment) {
                setErrors(prev => ({ ...prev, comment: undefined }));
              }
            }}
            placeholder="Например: перед обедом, после тренировки..."
            rows={3}
            maxLength={1000}
            className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all ${
              errors.comment
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          />
          <div className="flex justify-between items-center mt-2">
            {errors.comment ? (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <span>⚠️</span> {errors.comment}
              </p>
            ) : (
              <span></span>
            )}
            <span className={`text-xs ${comment.length > 900 ? 'text-amber-600' : 'text-gray-500'}`}>
              {comment.length}/1000
            </span>
          </div>
        </div>

        {/* Spacer for fixed button */}
        <div className="h-4"></div>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 p-4 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!insulinType || !insulinName || !units}
            className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-200 active:scale-[0.98] ${
              !insulinType || !insulinName || !units
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-blue-500/30 hover:from-blue-600 hover:to-cyan-700'
            }`}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddInsulinPage;
