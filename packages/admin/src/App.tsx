import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Refine } from '@refinedev/core';
import { RefineThemes, ThemedLayoutV2, ThemedTitleV2 } from '@refinedev/antd';
import { ConfigProvider, App as AntdApp } from 'antd';
import dataProvider from '@refinedev/simple-rest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@refinedev/antd/dist/reset.css';

import { Dashboard } from './pages/Dashboard';
import { UserList } from './pages/users/UserList';
import { KnowledgeList } from './pages/knowledge/KnowledgeList';
import { ErrorList } from './pages/errors/ErrorList';
import { SubscriptionList } from './pages/subscriptions/SubscriptionList';
import { ReportList } from './pages/reports/ReportList';
import { LoginPage } from './pages/auth/LoginPage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Создаем QueryClient для TanStack Query
const queryClient = new QueryClient();

// Компонент для защиты маршрутов
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={RefineThemes.Blue}>
        <AntdApp>
          <Routes>
            {/* Публичный маршрут */}
            <Route path="/login" element={<LoginPage />} />

            {/* Защищенные маршруты */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Refine
                    dataProvider={dataProvider(API_URL)}
                    resources={[
                      {
                        name: 'dashboard',
                        list: '/',
                        meta: { label: 'Dashboard', icon: '📊' },
                      },
                      {
                        name: 'users',
                        list: '/users',
                        meta: { label: 'Пользователи', icon: '👥' },
                      },
                      {
                        name: 'subscriptions',
                        list: '/subscriptions',
                        meta: { label: 'Подписки', icon: '💳' },
                      },
                      {
                        name: 'reports',
                        list: '/reports',
                        meta: { label: 'Отчеты', icon: '📄' },
                      },
                      {
                        name: 'knowledge',
                        list: '/knowledge',
                        meta: { label: 'База знаний', icon: '📚' },
                      },
                      {
                        name: 'errors',
                        list: '/errors',
                        meta: { label: 'Ошибки', icon: '⚠️' },
                      },
                    ]}
                    options={{ syncWithLocation: true, warnWhenUnsavedChanges: true }}
                  >
                    <ThemedLayoutV2
                      Title={() => <ThemedTitleV2 collapsed={false} text="DiaBeta Admin" />}
                    >
                      <Routes>
                        <Route index element={<Dashboard />} />
                        <Route path="/users" element={<UserList />} />
                        <Route path="/subscriptions" element={<SubscriptionList />} />
                        <Route path="/reports" element={<ReportList />} />
                        <Route path="/knowledge" element={<KnowledgeList />} />
                        <Route path="/errors" element={<ErrorList />} />
                        <Route path="*" element={<Navigate to="/" />} />
                      </Routes>
                    </ThemedLayoutV2>
                  </Refine>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
