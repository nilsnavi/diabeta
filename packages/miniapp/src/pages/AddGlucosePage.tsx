import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

type GlucoseContext = 
  | 'fasting'
  | 'before_meal'
  | 'after_meal'
  | 'bedtime'
  | 'night'
  | 'after_exercise'
  | 'bad_feeling'
  | 'other';

interface ContextOption {
  value: GlucoseContext;
  label: string;
  icon: string;
}

const contextOptions: ContextOption[] = [
  { value: 'fasting', label: 'Натощак', icon: '🌅' },
  { value: 'before_meal', label: 'До еды', icon: '🍽️' },
  { value: 'after_meal', label: 'После еды', icon: '✅' },
  { value: 'bedtime', label: 'Перед сном', icon: '🌙' },
  { value: 'night', label: 'Ночью', icon: '🌃' },
  { value: 'after_exercise', label: 'После тренировки', icon: '🏃' },
  { value: 'bad_feeling', label: 'Плохое самочувствие', icon: '😔' },
  { value: 'other', label: 'Другое', icon: '📝' },
];

const quickValues = [5.0, 5.5, 6.0, 6.5, 7.0, 8.0, 10.0];

const AddGlucosePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [value, setValue] = useState<string>('');
  const [context, setContext] = useState<GlucoseContext | ''>('');
  const [comment, setComment] = useState('');
  const [dateTime, setDateTime] = useState(dayjs().format('YYYY-MM-DDTHH:mm'));
  
  // Validation errors
  const [errors, setErrors] = useState<{
    value?: string;
    context?: string;
    comment?: string;
  }>({});
  
  // Success state
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock save function
  const mockSave = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Saved:', data);
    return { success: true };
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    // Value validation
    if (!value || value.trim() === '') {
      newErrors.value = 'Введите значение сахара';
    } else {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        newErrors.value = 'Введите корректное число';
      } else if (numValue < 1.0) {
        newErrors.value = 'Минимальное значение 1.0 ммоль/л';
      } else if (numValue > 35.0) {
        newErrors.value = 'Максимальное значение 35.0 ммоль/л';
      }
    }

    // Context validation
    if (!context) {
      newErrors.context = 'Выберите контекст измерения';
    }

    // Comment validation
    if (comment.length > 1000) {
      newErrors.comment = 'Комментарий не должен превышать 1000 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Get glucose status
  const getGlucoseStatus = (val: number) => {
    if (val < 4.0) {
      return { text: 'Ниже цели', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
    } else if (val > 7.0) {
      return { text: 'Выше цели', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' };
    } else {
      return { text: 'В целевом диапазоне', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' };
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await mockSave({
        value: parseFloat(value),
        context,
        measuredAt: dateTime,
        comment: comment.trim() || null,
      });

      setShowSuccess(true);
    } catch (error) {
      alert('Ошибка сохранения. Попробуйте ещё раз.');
    }
  };

  // Quick value handler
  const handleQuickValue = (val: number) => {
    setValue(val.toString());
    // Clear error if exists
    if (errors.value) {
      setErrors(prev => ({ ...prev, value: undefined }));
    }
  };

  // Success Screen
  if (showSuccess) {
    const numValue = parseFloat(value);
    const status = getGlucoseStatus(numValue);

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Success Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <span className="text-4xl">✓</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Сахар записан
            </h2>

            {/* Value */}
            <div className="mb-4">
              <div className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {numValue.toFixed(1)}
              </div>
              <div className="text-lg text-gray-500 dark:text-gray-400">ммоль/л</div>
            </div>

            {/* Status */}
            <div className={`inline-block px-4 py-2 rounded-full ${status.bg} mb-6`}>
              <span className={`font-medium ${status.color}`}>
                {status.text}
              </span>
            </div>

            {/* Context Info */}
            {context && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {contextOptions.find(c => c.value === context)?.icon}{' '}
                {contextOptions.find(c => c.value === context)?.label}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  // Reset form for another entry
                  setValue('');
                  setContext('');
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
            Добавить сахар
          </h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-md mx-auto">
        {/* Value Input - Large & Prominent */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Значение сахара <span className="text-red-500">*</span>
          </label>
          
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="1.0"
              max="35.0"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (errors.value) {
                  setErrors(prev => ({ ...prev, value: undefined }));
                }
              }}
              placeholder="6.4"
              className={`w-full text-5xl font-bold text-center py-6 bg-gray-50 dark:bg-gray-900 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all ${
                errors.value
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
              autoFocus
            />
            <span className="absolute right-4 bottom-6 text-lg text-gray-400 dark:text-gray-500">
              ммоль/л
            </span>
          </div>

          {errors.value && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <span>⚠️</span> {errors.value}
            </p>
          )}

          {/* Quick Values */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Быстрые значения:</p>
            <div className="flex flex-wrap gap-2">
              {quickValues.map((val) => (
                <button
                  key={val}
                  onClick={() => handleQuickValue(val)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                    value === val.toString()
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {val.toFixed(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Context Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Контекст измерения <span className="text-red-500">*</span>
          </label>
          
          <div className="grid grid-cols-2 gap-2">
            {contextOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setContext(option.value);
                  if (errors.context) {
                    setErrors(prev => ({ ...prev, context: undefined }));
                  }
                }}
                className={`p-3 rounded-xl border-2 text-left transition-all active:scale-95 ${
                  context === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-xl mb-1">{option.icon}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {option.label}
                </div>
              </button>
            ))}
          </div>

          {errors.context && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <span>⚠️</span> {errors.context}
            </p>
          )}
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
            placeholder="Например: после прогулки, стресс..."
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
            disabled={!value || !context}
            className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-200 active:scale-[0.98] ${
              !value || !context
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700'
            }`}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGlucosePage;
