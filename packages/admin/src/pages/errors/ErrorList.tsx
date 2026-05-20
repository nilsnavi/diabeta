import React, { useState } from 'react';
import { Table, Tag, Space, Select, Card, Typography } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const { Title } = Typography;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Error {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  meta?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    username?: string;
    firstName?: string;
  };
}

export function ErrorList() {
  const [moduleFilter, setModuleFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-errors', moduleFilter, statusFilter],
    queryFn: async () => {
      const params: any = {};
      if (moduleFilter) params.module = moduleFilter;
      if (statusFilter) params.status = statusFilter;

      const { data } = await axios.get(`${API_URL}/admin/errors`, {
        params,
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
      title: 'Действие',
      dataIndex: 'action',
      key: 'action',
      width: 200,
    },
    {
      title: 'Модуль',
      dataIndex: 'entity',
      key: 'entity',
      width: 150,
      render: (text: string) => <Tag>{text}</Tag>,
    },
    {
      title: 'Пользователь',
      key: 'user',
      width: 150,
      render: (_: any, record: Error) => (
        <span>
          {record.user?.firstName || record.user?.username || '—'}
        </span>
      ),
    },
    {
      title: 'IP адрес',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 150,
    },
    {
      title: 'Статус',
      key: 'status',
      width: 120,
      render: (_: any, record: Error) => {
        const status = record.meta?.status || 'new';
        const colors: any = {
          new: 'red',
          in_progress: 'orange',
          resolved: 'green',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleString('ru-RU'),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>
              <WarningOutlined /> Ошибки
            </Title>
            <Space>
              <Select
                placeholder="Фильтр по модулю"
                allowClear
                style={{ width: 200 }}
                value={moduleFilter}
                onChange={setModuleFilter}
              >
                <Select.Option value="auth">Auth</Select.Option>
                <Select.Option value="users">Users</Select.Option>
                <Select.Option value="glucose">Glucose</Select.Option>
                <Select.Option value="insulin">Insulin</Select.Option>
                <Select.Option value="reports">Reports</Select.Option>
                <Select.Option value="ai">AI</Select.Option>
              </Select>
              <Select
                placeholder="Фильтр по статусу"
                allowClear
                style={{ width: 200 }}
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Select.Option value="new">Новые</Select.Option>
                <Select.Option value="in_progress">В работе</Select.Option>
                <Select.Option value="resolved">Решены</Select.Option>
              </Select>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={data?.data || []}
            loading={isLoading}
            rowKey="id"
            pagination={{
              pageSize: 20,
              showTotal: (total) => `Всего ${total} ошибок`,
            }}
          />
        </Space>
      </Card>
    </div>
  );
}
