import React from 'react';
import { Table, Tag, Space, Card } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Report {
  id: string;
  format: string;
  status: string;
  startDate: string;
  endDate: string;
  fileUrl?: string;
  fileName?: string;
  user?: {
    username?: string;
    firstName?: string;
  };
}

export function ReportList() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/admin/reports`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      return data;
    },
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (text: string) => <span style={{ fontSize: 12 }}>{text.slice(0, 8)}...</span>,
    },
    {
      title: 'Пользователь',
      key: 'user',
      width: 150,
      render: (_: any, record: Report) => (
        <span>{record.user?.firstName || record.user?.username}</span>
      ),
    },
    {
      title: 'Формат',
      dataIndex: 'format',
      key: 'format',
      width: 100,
      render: (format: string) => <Tag>{format}</Tag>,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const colors: any = {
          PENDING: 'orange',
          PROCESSING: 'blue',
          COMPLETED: 'green',
          FAILED: 'red',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Период',
      key: 'period',
      width: 200,
      render: (_: any, record: Report) => (
        <span>
          {new Date(record.startDate).toLocaleDateString('ru-RU')} -{' '}
          {new Date(record.endDate).toLocaleDateString('ru-RU')}
        </span>
      ),
    },
    {
      title: 'Файл',
      dataIndex: 'fileName',
      key: 'fileName',
      width: 200,
      render: (fileName?: string, record: Report) =>
        fileName ? (
          <a href={record.fileUrl} target="_blank" rel="noopener noreferrer">
            {fileName}
          </a>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <h2 style={{ margin: 0 }}>📄 Отчеты</h2>

          <Table
            columns={columns}
            dataSource={data?.data || []}
            loading={isLoading}
            rowKey="id"
            pagination={{ pageSize: 20, showTotal: (total) => `Всего ${total} отчетов` }}
          />
        </Space>
      </Card>
    </div>
  );
}
