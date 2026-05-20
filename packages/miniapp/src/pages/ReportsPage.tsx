import React, { useState } from 'react';
import { Header, Card, Button, SegmentedControl, WarningBanner, SuccessState } from '../shared/ui';

export const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [showSuccess, setShowSuccess] = useState(false);

  const periods = [
    { value: 'week', label: 'Неделя' },
    { value: 'month', label: 'Месяц' },
    { value: 'quarter', label: 'Квартал' },
  ];

  const handleGenerateReport = () => {
    // TODO: API call to generate report
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Отчёты" showBack onBack={() => window.history.back()} />
        <SuccessState
          icon="📊"
          title="Отчёт создан!"
          subtitle="PDF файл готов к скачиванию"
          actionLabel="Скачать PDF"
          onAction={() => alert('Скачивание файла...')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Header title="Отчёты для врача" />

      <div className="px-4 py-4 space-y-4">
        {/* Medical Disclaimer */}
        <WarningBanner
          type="info"
          message="Отчёты содержат статистику ваших измерений. Они не заменяют медицинскую консультацию."
        />

        {/* Period Selection */}
        <Card className="p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Выберите период
          </label>
          <SegmentedControl
            options={periods}
            value={period}
            onChange={(val) => setPeriod(val as any)}
          />
        </Card>

        {/* Report Contents */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Содержимое отчёта
          </h3>
          <div className="space-y-3">
            {[
              { icon: '🩸', label: 'Измерения сахара', checked: true },
              { icon: '💉', label: 'Дозы инсулина', checked: true },
              { icon: '🍽️', label: 'Питание и ХЕ', checked: true },
              { icon: '📊', label: 'Статистика и графики', checked: true },
              { icon: '😊', label: 'Самочувствие', checked: false },
              { icon: '🏃', label: 'Физическая активность', checked: false },
            ].map((item, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={item.checked}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Report Preview Info */}
        <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📋</span>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Предварительный просмотр</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Формат: PDF</li>
                <li>• Период: {period === 'week' ? 'неделя' : period === 'month' ? 'месяц' : 'квартал'}</li>
                <li>• Включено: 4 раздела</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Generate Button */}
        <Button fullWidth size="lg" onClick={handleGenerateReport}>
          Сгенерировать PDF отчёт
        </Button>

        {/* Previous Reports */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 px-2">
            Предыдущие отчёты
          </h3>
          <Card className="overflow-hidden">
            {[
              { date: '15 мая 2026', period: 'Апрель 2026' },
              { date: '15 апреля 2026', period: 'Март 2026' },
            ].map((report, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <div className="border-t border-gray-100 dark:border-gray-700" />}
                <button className="w-full flex items-center justify-between px-4 py-3 active:bg-gray-50 dark:active:bg-gray-800 transition-colors">
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{report.period}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Создан {report.date}</div>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">Скачать ↓</span>
                </button>
              </React.Fragment>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};
