import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      // В реальном приложении здесь будет запрос к backend для admin auth
      // Для демо используем простой токен
      const token = btoa(`${values.username}:${values.password}`);
      localStorage.setItem('admin_token', token);
      
      message.success('Вход выполнен');
      navigate('/');
    } catch (error) {
      message.error('Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>🩺 DiaBeta Admin</Title>
          <p style={{ color: '#888' }}>Войдите в панель администратора</p>
        </div>

        <Form onFinish={handleSubmit}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Введите имя пользователя' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Имя пользователя"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Пароль"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Войти
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 16, padding: 12, background: '#fff7e6', borderRadius: 4 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#ad6800' }}>
            ⚠️ Доступ только для авторизованных администраторов
          </p>
        </div>
      </Card>
    </div>
  );
}
