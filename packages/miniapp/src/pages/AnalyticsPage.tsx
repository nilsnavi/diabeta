import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceArea, Tooltip } from 'recharts';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

type Period = '7days' | '14days' | '30days';

interface GlucoseDataPoint {
  date: string;
  value: number;
}

interface MetricCard {
  title: string;
  value: string | number;
  unit?: string;
  icon: string;
  color: string;
}

interface Observation {
  icon: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'success';
}

// Mock data generator
const generateMockData = (period: Period) => {
  const days = period === '7days' ? 7 : period === '14days' ? 14 : 30;
  const data: GlucoseDataPoint[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = dayjs().subtract(i, 'day');
    // Generate realistic glucose values with some variation
    const baseValue = 5.5 + Math.sin(i * 0.5) * 1.5; // Oscillating pattern
    const randomVariation = (Math.random() - 0.5) * 2;
    const value = Math.max(3.5, Math.min(12, baseValue + randomVariation));
    
    data.push({
      date: date.format('DD MMM'),
      value: parseFloat(value.toFixed(1)),
    });
  }
  
  return data;
};

// Calculate metrics from data
const calculateMetrics = (data: GlucoseDataPoint[]) => {
  if (data.length === 0) {
    return null;
  }

  const values = data.map(d => d.value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Count hypo (< 4.0) and hyper (> 7.0)
  const hypo = values.filter(v => v < 4.0).length;
  const hyper = values.filter(v => v > 7.0).length;
  
  // Calculate time in range (4.0 - 7.0)
  const inRange = values.filter(v => v >= 4.0 && v <= 7.0).length;
  const inRangePercentage = Math.round((inRange / values.length) * 100);

  return {
    average: avg.toFixed(1),
    min: min.toFixed(1),
    max: max.toFixed(1),
    measurements: values.length,
    hypo,
    hyper,
    inRangePercentage,
  };
};

// Mock observations based on data patterns
const generateObservations = (period: Period, metrics: any): Observation[] => {
  const observations = [
    {
      icon: '🌙',
      title: 'Вечером сахар чаще выше',
      description: 'Замечена тенденция повышения уровня глюкозы в вечернее время',
      type: 'info' as const,
    },
    {
      icon: '🏃',
      title: 'После активности бывают снижения',
      description: 'Физическая активность может приводить к снижению уровня сахара',
      type: 'warning' as const,
    },
  ];

  if (metrics && metrics.measurements > 10) {
    observations.push({
      icon: '📊',
      title: 'Измерений стало больше',
      description: `За период ${metrics.measurements} измерений — хорошая динамика контроля`,
      type: 'success' as const,
    });
  }

  return observations;
};

const periods: Array<{ value: Period; label: string }> = [
  { value: '7days', label: '7 дней' },
  { value: '14days', label: '14 дней' },
  { value: '30days', label: '30 дней' },
];

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('7days');

  // Generate data based on selected period
  const chartData = useMemo(() => generateMockData(period), [period]);
  const metrics = useMemo(() => calculateMetrics(chartData), [chartData]);
  const observations = useMemo(() => generateObservations(period, metrics), [period, metrics]);

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{payload[0].payload.date}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {payload[0].value} ммоль/л
          </p>
        </div>
      );
    }
    return null;
  };

  // Empty state
  if (!metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <span className="text-5xl">📊</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Нет данных для анализа
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xs mx-auto">
            Добавьте измерения сахара, чтобы увидеть аналитику
          </p>
          <button
            onClick={() => navigate('/add-glucose')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all duration-200"
          >
            Добавить измерение
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Аналитика</h1>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-md mx-auto">
        {/* Period Selector */}
        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-all active:scale-95 ${
                period === p.value
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Main Card - Time in Range */}
        <div className={`rounded-3xl p-6 text-white shadow-xl ${
          metrics.inRangePercentage >= 70
            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
            : metrics.inRangePercentage >= 50
            ? 'bg-gradient-to-br from-amber-500 to-orange-600'
            : 'bg-gradient-to-br from-red-500 to-rose-600'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm opacity-90 font-medium">В целевом диапазоне</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-5xl font-bold">{metrics.inRangePercentage}%</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
          
          <p className="text-sm opacity-90">
            {metrics.inRangePercentage >= 70
              ? 'Отличный контроль! Продолжайте в том же духе'
              : metrics.inRangePercentage >= 50
              ? 'Хороший результат, есть потенциал для улучшения'
              : 'Обратите внимание на режим питания и активности'}
          </p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Average */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📊</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Средний сахар</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.average}
              <span className="text-sm font-normal text-gray-500 ml-1">ммоль/л</span>
            </div>
          </div>

          {/* Min */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⬇️</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Минимальный</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.min}
              <span className="text-sm font-normal text-gray-500 ml-1">ммоль/л</span>
            </div>
          </div>

          {/* Max */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⬆️</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Максимальный</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.max}
              <span className="text-sm font-normal text-gray-500 ml-1">ммоль/л</span>
            </div>
          </div>

          {/* Measurements */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🩸</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Измерений</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.measurements}
            </div>
          </div>

          {/* Hypo */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🔻</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Гипо</span>
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {metrics.hypo}
            </div>
          </div>

          {/* Hyper */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🔺</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Гипер</span>
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {metrics.hyper}
            </div>
          </div>
        </div>

        {/* Glucose Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">График сахара</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Динамика за период
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700" />
              <span className="text-gray-600 dark:text-gray-400">Цель 4-7</span>
            </div>
          </div>
          
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                {/* Target range background */}
                <ReferenceArea
                  y1={4.0}
                  y2={7.0}
                  fill="#10B981"
                  fillOpacity={0.1}
                />
                
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={[3, 12]}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  tickCount={5}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Observations */}
        {observations.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              🔍 Наблюдения
            </h3>
            
            <div className="space-y-3">
              {observations.map((obs, index) => (
                <div
                  key={index}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{obs.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {obs.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {obs.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medical Disclaimer */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                Наблюдения не являются медицинской рекомендацией. Обсудите изменения лечения с врачом.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
