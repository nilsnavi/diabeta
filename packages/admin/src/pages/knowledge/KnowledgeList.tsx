import React, { useState } from 'react';
import { Table, Button, Tag, Space, Input, Select, Modal, message, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import MDEditor from '@uiw/react-md-editor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const KNOWLEDGE_CATEGORIES = [
  'Основы диабета',
  'Гипогликемия',
  'Гипергликемия',
  'Питание',
  'ХЕ',
  'Инсулин',
  'Физическая активность',
  'Вопросы врачу',
  'Расходники',
  'Частые вопросы',
];

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export function KnowledgeList() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    content: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-knowledge'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/admin/knowledge/articles`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (articleData: any) => {
      return axios.post(`${API_URL}/admin/knowledge/articles`, articleData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-knowledge'] });
      message.success('Статья создана');
      setIsModalVisible(false);
      resetForm();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Ошибка создания');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return axios.patch(`${API_URL}/admin/knowledge/articles/${id}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-knowledge'] });
      message.success('Статья обновлена');
      setIsModalVisible(false);
      resetForm();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Ошибка обновления');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`${API_URL}/admin/knowledge/articles/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-knowledge'] });
      message.success('Статья удалена');
    },
    onError: () => {
      message.error('Ошибка удаления');
    },
  });

  const resetForm = () => {
    setFormData({ title: '', slug: '', category: '', content: '', status: 'draft' });
    setEditingArticle(null);
  };

  const handleCreate = () => {
    resetForm();
    setIsModalVisible(true);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      category: article.category,
      content: article.content,
      status: article.status,
    });
    setIsModalVisible(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.slug || !formData.category || !formData.content) {
      message.error('Заполните все обязательные поля');
      return;
    }

    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Удаление статьи',
      content: 'Вы уверены, что хотите удалить эту статью?',
      okText: 'Удалить',
      okType: 'danger',
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const columns = [
    {
      title: 'Заголовок',
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 200,
      render: (text: string) => <span style={{ fontSize: 12, color: '#888' }}>{text}</span>,
    },
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (text: string) => <Tag>{text}</Tag>,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const colors: any = {
          draft: 'default',
          published: 'green',
          archived: 'red',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Обновлено',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 200,
      render: (_: any, record: Article) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small">
            Просмотр
          </Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
            Редактировать
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record.id)}
          >
            Удалить
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>📚 База знаний</h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Создать статью
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={data || []}
            loading={isLoading}
            rowKey="id"
            pagination={{ pageSize: 20, showTotal: (total) => `Всего ${total} статей` }}
          />
        </Space>
      </Card>

      <Modal
        title={editingArticle ? 'Редактирование статьи' : 'Создание статьи'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          resetForm();
        }}
        onOk={handleSubmit}
        width={900}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Input
            placeholder="Заголовок"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Input
            placeholder="Slug (уникальный идентификатор)"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
          <Select
            placeholder="Категория"
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value })}
            style={{ width: '100%' }}
          >
            {KNOWLEDGE_CATEGORIES.map((cat) => (
              <Select.Option key={cat} value={cat}>
                {cat}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Статус"
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value })}
            style={{ width: '100%' }}
          >
            <Select.Option value="draft">Черновик</Select.Option>
            <Select.Option value="published">Опубликовано</Select.Option>
            <Select.Option value="archived">Архив</Select.Option>
          </Select>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>Содержание (Markdown):</label>
            <MDEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value || '' })}
              preview="edit"
              height={400}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
}
