import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';

interface OptionItem {
  value: string;
  label: string;
  icon: string;
}

const mealTypes: OptionItem[] = [
  { value: 'breakfast', label: 'Завтрак', icon: '🌅' },
  { value: 'lunch', label: 'Обед', icon: '☀️' },
  { value: 'dinner', label: 'Ужин', icon: '🌙' },
  { value: 'snack', label: 'Перекус', icon: '🍎' },
  { value: 'other', label: 'Другое', icon: '📝' },
];

const AddMealPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [mealType, setMealType] = useState<MealType | ''>('');
  const [title, setTitle] = useState('');
  const [breadUnits, setBreadUnits] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [calories, setCalories] = useState<string>('');
  const [proteins, setProteins] = useState<string>('');
  const [fats, setFats] = useState<string>('');
  const [comment, setComment] = useState('');
  const [dateTime, setDateTime] = useState(dayjs().format('YYYY-MM-DDTHH:mm'));
  const [photo, setPhoto] = useState<File | null>(null);
  
  // UI state
  const [showAdditional, setShowAdditional] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<{
    mealType?: string;
    title?: string;
    breadUnits?: string;
    carbs?: string;
    calories?: string;
    proteins?: string;
    fats?: string;
    comment?: string;
  }>({});
  
  // Success state
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock save function
  const mockSave = async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Saved meal:', data);
    return { success: true };
  };

  // Auto-calculate ХЕ or carbs
  useEffect(() => {
    // If user enters carbs but not ХЕ - calculate ХЕ = carbs / 12
    if (carbs && !breadUnits) {
      const carbsNum = parseFloat(carbs);
      if (!isNaN(carbsNum)) {
        const calculatedXE = (carbsNum / 12).toFixed(1);
        setBreadUnits(calculatedXE);
      }
    }
    
    // If user enters ХЕ but not carbs - calculate carbs = ХЕ * 12
    // But don't overwrite if user manually changed carbs
    if (breadUnits && !carbs) {
      const xeNum = parseFloat(breadUnits);
      if (!isNaN(xeNum)) {
        const calculatedCarbs = (xeNum * 12).toFixed(0);
        setCarbs(calculatedCarbs);
      }
    }
  }, [carbs, breadUnits]);

  // Validation
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    // Meal type validation
    if (!mealType) {
      newErrors.mealType = 'Выберите тип приёма пищи';
    }

    // Title validation
    if (!title || title.trim() === '') {
      newErrors.title = 'Введите название блюда';
    }

    // Bread units validation
    if (breadUnits) {
      const xeNum = parseFloat(breadUnits);
      if (isNaN(xeNum)) {
        newErrors.breadUnits = 'Введите корректное число';
      } else if (xeNum < 0 || xeNum > 50) {
        newErrors.breadUnits = 'ХЕ должно быть от 0 до 50';
      }
    }

    // Carbs validation
    if (carbs) {
      const carbsNum = parseFloat(carbs);
      if (isNaN(carbsNum)) {
        newErrors.carbs = 'Введите корректное число';
      } else if (carbsNum < 0 || carbsNum > 500) {
        newErrors.carbs = 'Углеводы должны быть от 0 до 500 г';
      }
    }

    // Calories validation
    if (calories) {
      const calNum = parseFloat(calories);
      if (isNaN(calNum)) {
        newErrors.calories = 'Введите корректное число';
      } else if (calNum < 0 || calNum > 5000) {
        newErrors.calories = 'Калории должны быть от 0 до 5000';
      }
    }

    // Proteins validation
    if (proteins) {
      const protNum = parseFloat(proteins);
      if (isNaN(protNum)) {
        newErrors.proteins = 'Введите корректное число';
      } else if (protNum < 0 || protNum > 300) {
        newErrors.proteins = 'Белки должны быть от 0 до 300 г';
      }
    }

    // Fats validation
    if (fats) {
      const fatNum = parseFloat(fats);
      if (isNaN(fatNum)) {
        newErrors.fats = 'Введите корректное число';
      } else if (fatNum < 0 || fatNum > 300) {
        newErrors.fats = 'Жиры должны быть от 0 до 300 г';
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
        mealType,
        title: title.trim(),
        breadUnits: breadUnits ? parseFloat(breadUnits) : null,
        carbs: carbs ? parseFloat(carbs) : null,
        calories: calories ? parseFloat(calories) : null,
        proteins: proteins ? parseFloat(proteins) : null,
        fats: fats ? parseFloat(fats) : null,
        photo: photo ? 'photo_url_here' : null,
        measuredAt: dateTime,
        comment: comment.trim() || null,
      });

      setShowSuccess(true);
    } catch (error) {
      alert('Ошибка сохранения. Попробуйте ещё раз.');
    }
  };

  // Repeat last meal (mock)
  const handleRepeatLastMeal = () => {
    // TODO: Load last meal from API
    setMealType('lunch');
    setTitle('Овсянка с фруктами');
    setBreadUnits('2.0');
    setCarbs('24');
    setCalories('250');
    setProteins('8');
    setFats('5');
    alert('Загружено последнее блюдо');
  };

  // Success Screen
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <span className="text-4xl">🍽️</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Еда записана
            </h2>

            {/* Meal Info */}
            <div className="mb-6">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {title}
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{mealTypes.find(t => t.value === mealType)?.icon}</span>
                <span>{mealTypes.find(t => t.value === mealType)?.label}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {breadUnits && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">ХЕ</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{breadUnits}</div>
                </div>
              )}
              {carbs && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Углеводы</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{carbs}г</div>
                </div>
              )}
              {calories && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Калории</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{calories}</div>
                </div>
              )}
              {(proteins || fats) && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Б/Ж</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {proteins || 0}/{fats || 0}г
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsFavorite(true);
                  alert('Добавлено в избранное!');
                }}
                disabled={isFavorite}
                className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-200 active:scale-[0.98] ${
                  isFavorite
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 cursor-default'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30 hover:from-yellow-600 hover:to-orange-600'
                }`}
              >
                {isFavorite ? '⭐ В избранном' : '☆ Добавить в избранное'}
              </button>

              <button
                onClick={() => {
                  setMealType('');
                  setTitle('');
                  setBreadUnits('');
                  setCarbs('');
                  setCalories('');
                  setProteins('');
                  setFats('');
                  setComment('');
                  setPhoto(null);
                  setDateTime(dayjs().format('YYYY-MM-DDTHH:mm'));
                  setShowSuccess(false);
                  setIsFavorite(false);
                  setErrors({});
                }}
                className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold shadow-lg shadow-green-500/30 active:scale-[0.98] transition-all duration-200"
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
            Добавить еду
          </h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-md mx-auto">
        {/* Repeat Last Meal Button */}
        <button
          onClick={handleRepeatLastMeal}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl text-blue-700 dark:text-blue-300 font-medium active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span>🔄</span>
          <span>Повторить последнее блюдо</span>
        </button>

        {/* Meal Type */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Тип приёма пищи <span className="text-red-500">*</span>
          </label>
          
          <div className="grid grid-cols-2 gap-2">
            {mealTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  setMealType(type.value as MealType);
                  if (errors.mealType) {
                    setErrors(prev => ({ ...prev, mealType: undefined }));
                  }
                }}
                className={`p-3 rounded-xl border-2 text-left transition-all active:scale-95 ${
                  mealType === type.value
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
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

          {errors.mealType && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <span>⚠️</span> {errors.mealType}
            </p>
          )}
        </div>

        {/* Dish Name */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Название блюда <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) {
                setErrors(prev => ({ ...prev, title: undefined }));
              }
            }}
            placeholder="Например: Овсянка с фруктами"
            className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none transition-all ${
              errors.title
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          />
          {errors.title && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <span>⚠️</span> {errors.title}
            </p>
          )}
        </div>

        {/* ХЕ and Carbs - Main Fields */}
        <div className="grid grid-cols-2 gap-3">
          {/* Bread Units */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ХЕ
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              max="50"
              value={breadUnits}
              onChange={(e) => {
                setBreadUnits(e.target.value);
                if (errors.breadUnits) {
                  setErrors(prev => ({ ...prev, breadUnits: undefined }));
                }
              }}
              placeholder="2.0"
              className={`w-full px-3 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-center font-semibold transition-all ${
                errors.breadUnits
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {errors.breadUnits && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.breadUnits}
              </p>
            )}
          </div>

          {/* Carbs */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Углеводы (г)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="1"
              min="0"
              max="500"
              value={carbs}
              onChange={(e) => {
                setCarbs(e.target.value);
                if (errors.carbs) {
                  setErrors(prev => ({ ...prev, carbs: undefined }));
                }
              }}
              placeholder="24"
              className={`w-full px-3 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-center font-semibold transition-all ${
                errors.carbs
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {errors.carbs && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.carbs}
              </p>
            )}
          </div>
        </div>

        {/* Additional Fields Accordion */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden">
          <button
            onClick={() => setShowAdditional(!showAdditional)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-gray-100">Дополнительно</span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                showAdditional ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAdditional && (
            <div className="px-5 pb-5 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
              {/* Calories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Калории
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="0"
                  max="5000"
                  value={calories}
                  onChange={(e) => {
                    setCalories(e.target.value);
                    if (errors.calories) {
                      setErrors(prev => ({ ...prev, calories: undefined }));
                    }
                  }}
                  placeholder="250"
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                    errors.calories
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
                {errors.calories && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.calories}
                  </p>
                )}
              </div>

              {/* Proteins and Fats */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Белки (г)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    step="0.1"
                    min="0"
                    max="300"
                    value={proteins}
                    onChange={(e) => {
                      setProteins(e.target.value);
                      if (errors.proteins) {
                        setErrors(prev => ({ ...prev, proteins: undefined }));
                      }
                    }}
                    placeholder="8"
                    className={`w-full px-3 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                      errors.proteins
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                  {errors.proteins && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.proteins}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Жиры (г)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    step="0.1"
                    min="0"
                    max="300"
                    value={fats}
                    onChange={(e) => {
                      setFats(e.target.value);
                      if (errors.fats) {
                        setErrors(prev => ({ ...prev, fats: undefined }));
                      }
                    }}
                    placeholder="5"
                    className={`w-full px-3 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                      errors.fats
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                  {errors.fats && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.fats}
                    </p>
                  )}
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Фото еды <span className="text-gray-400">(необязательно)</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setPhoto(file);
                    }}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-green-500 dark:hover:border-green-400 transition-colors"
                  >
                    {photo ? (
                      <div className="text-center">
                        <span className="text-3xl mb-2 block">📷</span>
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          {photo.name}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-3xl mb-2 block">📸</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Нажмите чтобы добавить фото
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Date & Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Дата и время
                </label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  placeholder="Например: домашняя еда, ресторан..."
                  rows={3}
                  maxLength={1000}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none transition-all ${
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
            </div>
          )}
        </div>

        {/* Spacer for fixed button */}
        <div className="h-4"></div>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 p-4 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!mealType || !title}
            className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-200 active:scale-[0.98] ${
              !mealType || !title
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30 hover:from-green-600 hover:to-emerald-700'
            }`}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMealPage;
