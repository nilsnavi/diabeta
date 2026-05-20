import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: Array<{ time: string; value: number }>;
  targetMin?: number;
  targetMax?: number;
  color?: string;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  data,
  targetMin,
  targetMax,
  color = '#3B82F6',
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      
      {data.length > 0 ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              {targetMin && (
                <ReferenceLine y={targetMin} stroke="#10B981" strokeDasharray="3 3" label="Мин" />
              )}
              {targetMax && (
                <ReferenceLine y={targetMax} stroke="#EF4444" strokeDasharray="3 3" label="Макс" />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
          Нет данных для отображения
        </div>
      )}
    </div>
  );
};
