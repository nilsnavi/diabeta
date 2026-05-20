import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  CrownOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const { Title } = Typography;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  activeUsersToday: number;
  activeUsers7d: number;
  glucoseEntriesCount: number;
  insulinEntriesCount: number;
  reportsCount: number;
  premiumUsers: number;
  errorsLast24h: number;
}

export function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      return data;
    },
  });

  if (isLoading) {
    return <div style={{ padding: 24 }}>Загрузка...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>📊 DiaBeta Admin Dashboard</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Основные метрики */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Всего пользователей"
                value={stats?.totalUsers || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Новых сегодня"
                value={stats?.newUsersToday || 0}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Активных сегодня"
                value={stats?.activeUsersToday || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Активных за 7 дней"
                value={stats?.activeUsers7d || 0}
                prefix={<HeartOutlined />}
                valueStyle={{ color: '#eb2f96' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Медицинские записи */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic
                title="Записей сахара"
                value={stats?.glucoseEntriesCount || 0}
                prefix={<HeartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic
                title="Записей инсулина"
                value={stats?.insulinEntriesCount || 0}
                prefix={<MedicineBoxOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic
                title="Отчетов создано"
                value={stats?.reportsCount || 0}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Подписки и ошибки */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={12}>
            <Card>
              <Statistic
                title="Premium пользователей"
                value={stats?.premiumUsers || 0}
                prefix={<CrownOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={12}>
            <Card>
              <Statistic
                title="Ошибок за 24 часа"
                value={stats?.errorsLast24h || 0}
                prefix={<WarningOutlined />}
                valueStyle={{ color: stats?.errorsLast24h ? '#ff4d4f' : '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        <Card>
          <p style={{ color: '#888', margin: 0 }}>
            ⚠️ Данная панель предназначена только для администраторов сервиса. 
            Медицинские данные пользователей не отображаются без специального разрешения.
          </p>
        </Card>
      </Space>
    </div>
  );
}
