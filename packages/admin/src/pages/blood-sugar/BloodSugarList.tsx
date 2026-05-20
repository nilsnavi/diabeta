import React from 'react';
import { useList } from '@refinedev/core';
import { Table, Tag } from 'antd';

export function BloodSugarList() {
  const { data, isLoading } = useList({ resource: 'blood-sugar' });

  const getColor = (value: number, unit: string) => {
    const mmol = unit === 'MG_DL' ? value / 18 : value;
    if (mmol < 3.9) return 'blue';
    if (mmol > 10) return 'red';
    if (mmol > 7.8) return 'orange';
    return 'green';
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Пользователь', dataIndex: 'userId', key: 'userId' },
    {
      title: 'Сахар',
      key: 'value',
      render: (_: unknown, r: any) => (
        <Tag color={getColor(r.value, r.unit)}>
          {r.value} {r.unit === 'MMOL_L' ? 'ммоль/л' : 'мг/дл'}
        </Tag>
      ),
    },
    { title: 'До еды', dataIndex: 'beforeMeal', key: 'beforeMeal', render: (v: boolean | null) => v ? '✓' : '—' },
    { title: 'После еды', dataIndex: 'afterMeal', key: 'afterMeal', render: (v: boolean | null) => v ? '✓' : '—' },
    { title: 'Дата', dataIndex: 'measuredAt', key: 'measuredAt', render: (v: string) => new Date(v).toLocaleString('ru') },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>🩸 Записи уровня сахара</h2>
      <Table
        dataSource={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}