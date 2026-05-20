import React from 'react';
import { Table, Tag, Space, Card } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  startsAt: string;
  expiresAt?: string;
  user?: {
    username?: string;
    firstName?: string;
    telegramId: string;
  };
}

export function SubscriptionList() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/admin/subscriptions`, {
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
      width: 200,
      render: (_: any, record: Subscription) => (
        <div>
          <div>{record.user?.firstName || record.user?.username}</div>
          <div style={{ fontSize: 12, color: '#888' }}>ID: {record.user?.telegramId}</div>
        </div>
      ),
    },
    {
      title: 'Тариф',
      dataIndex: 'plan',
      key: 'plan',
      width: 120,
      render: (plan: string) => {
        const colors: any = {
          FREE: 'default',
          BASIC: 'blue',
          PREMIUM: 'gold',
        };
        return <Tag color={colors[plan]}>{plan}</Tag>;
      },
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const colors: any = {
          ACTIVE: 'green',
          CANCELLED: 'red',
          EXPIRED: 'orange',
          TRIAL: 'purple',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Начало',
      dataIndex: 'startsAt',
      key: 'startsAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Окончание',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 150,
      render: (date?: string) => date ? new Date(date).toLocaleDateString('ru-RU') : '—',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <h2 style={{ margin: 0 }}>💳 Подписки</h2>

          <Table
            columns={columns}
            dataSource={data?.data || []}
            loading={isLoading}
            rowKey="id"
            pagination={{ pageSize: 20, showTotal: (total) => `Всего ${total} подписок` }}
          />
        </Space>
      </Card>
    </div>
  );
}
