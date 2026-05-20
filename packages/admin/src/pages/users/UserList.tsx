import React, { useState } from 'react';
import { Table, Button, Input, Tag, Space, Modal, message, Card } from 'antd';
import { SearchOutlined, EyeOutlined, LockOutlined, UnlockOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  diabetesType?: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export function UserList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, pageSize, search],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/admin/users`, {
        params: { page, limit: pageSize, search },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      return data;
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: string }) => {
      return axios.patch(
        `${API_URL}/admin/users/${userId}`,
        { isBlocked: action === 'block' ? true : false },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      message.success('Пользователь обновлен');
    },
    onError: () => {
      message.error('Ошибка обновления');
    },
  });

  const handleBlock = (userId: string) => {
    Modal.confirm({
      title: 'Блокировка пользователя',
      content: 'Вы уверены, что хотите заблокировать этого пользователя?',
      onOk: () => updateUserMutation.mutate({ userId, action: 'block' }),
    });
  };

  const handleUnblock = (userId: string) => {
    Modal.confirm({
      title: 'Разблокировка пользователя',
      content: 'Вы уверены, что хотите разблокировать этого пользователя?',
      onOk: () => updateUserMutation.mutate({ userId, action: 'unblock' }),
    });
  };

  const handleDelete = (userId: string) => {
    Modal.confirm({
      title: 'Удаление пользователя',
      content: 'Это действие выполнит soft delete. Вы уверены?',
      okText: 'Удалить',
      okType: 'danger',
      onOk: () => updateUserMutation.mutate({ userId, action: 'delete' }),
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (text: string) => <span style={{ fontSize: 12 }}>{text.slice(0, 8)}...</span>,
    },
    {
      title: 'Telegram ID',
      dataIndex: 'telegramId',
      key: 'telegramId',
      width: 150,
    },
    {
      title: 'Имя',
      key: 'name',
      render: (_: any, record: User) => (
        <span>{record.firstName} {record.lastName}</span>
      ),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Подписка',
      key: 'subscription',
      render: (_: any, record: User) => (
        <Space>
          <Tag color={record.subscriptionPlan === 'FREE' ? 'default' : 'gold'}>
            {record.subscriptionPlan}
          </Tag>
          <Tag color={record.subscriptionStatus === 'ACTIVE' ? 'green' : 'red'}>
            {record.subscriptionStatus}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_: any, record: User) => (
        <Tag color={record.deletedAt ? 'red' : 'green'}>
          {record.deletedAt ? 'Заблокирован' : 'Активен'}
        </Tag>
      ),
    },
    {
      title: 'Дата регистрации',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 200,
      render: (_: any, record: User) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small">
            Просмотр
          </Button>
          {record.deletedAt ? (
            <Button
              icon={<UnlockOutlined />}
              size="small"
              onClick={() => handleUnblock(record.id)}
            >
              Разблокировать
            </Button>
          ) : (
            <>
              <Button
                icon={<LockOutlined />}
                size="small"
                danger
                onClick={() => handleBlock(record.id)}
              >
                Блокировать
              </Button>
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
                onClick={() => handleDelete(record.id)}
              >
                Удалить
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>👥 Пользователи</h2>
            <Input
              placeholder="Поиск по имени или Telegram ID..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
          </div>

          <Table
            columns={columns}
            dataSource={data?.data || []}
            loading={isLoading}
            rowKey="id"
            pagination={{
              current: page,
              pageSize: pageSize,
              total: data?.total || 0,
              showSizeChanger: true,
              showTotal: (total) => `Всего ${total} пользователей`,
              onChange: (newPage, newPageSize) => {
                setPage(newPage);
                setPageSize(newPageSize);
              },
            }}
          />
        </Space>
      </Card>
    </div>
  );
}
