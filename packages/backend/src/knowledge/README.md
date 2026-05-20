# Модуль базы знаний DiaBeta

## Обзор

Модуль базы знаний предоставляет информационные статьи о диабете, питании, инсулине и других темах, связанных с управлением диабетом.

## Структура

### Backend (`packages/backend/src/knowledge/`)

- `knowledge.controller.ts` - Контроллеры (публичные и административные)
- `knowledge.service.ts` - Бизнес-логика
- `knowledge.module.ts` - Модуль NestJS
- `dto/` - DTO для валидации данных

### Mini App (`packages/miniapp/src/`)

- `pages/KnowledgeBase.tsx` - Экран списка категорий
- `pages/ArticleList.tsx` - Экран списка статей с поиском
- `pages/ArticleDetail.tsx` - Экран просмотра статьи
- `api/knowledge.ts` - API клиент

## Модель данных

```prisma
model KnowledgeArticle {
  id       String        @id @default(uuid())
  slug     String        @unique
  title    String
  category String
  content  String        // Markdown формат
  status   ArticleStatus @default(draft)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum ArticleStatus {
  draft
  published
  archived
}
```

## Категории

- Основы диабета
- Гипогликемия
- Гипергликемия
- Питание
- ХЕ (Хлебные единицы)
- Инсулин
- Физическая активность
- Вопросы врачу
- Расходники
- Частые вопросы

## API Endpoints

### Публичные endpoints

#### GET `/knowledge/articles`
Получить список опубликованных статей.

**Query параметры:**
- `category` (optional) - Фильтр по категории
- `search` (optional) - Поиск по заголовку и содержанию

**Пример:**
```bash
GET /knowledge/articles?category=Инсулин&search=типы
```

#### GET `/knowledge/articles/:slug`
Получить статью по slug.

**Пример:**
```bash
GET /knowledge/articles/insulin-types-and-action
```

### Административные endpoints (требуют JWT аутентификацию)

#### POST `/admin/knowledge/articles`
Создать новую статью.

**Body:**
```json
{
  "title": "Заголовок статьи",
  "slug": "unique-slug",
  "category": "Инсулин",
  "content": "# Markdown содержание...",
  "status": "draft"
}
```

#### PATCH `/admin/knowledge/articles/:id`
Обновить существующую статью.

**Body:** Любые поля из CreateArticleDto (частичное обновление)

#### DELETE `/admin/knowledge/articles/:id`
Удалить статью.

## Особенности реализации

### Права доступа
- **Пользователи**: видят только статьи со статусом `published`
- **Администраторы**: видят статьи со статусами `draft` и `published`

### Уникальность slug
Slug должен быть уникальным across всех статей. При попытке создать статью с существующим slug возвращается ошибка 409 Conflict.

### Поиск
Поиск осуществляется по полям `title` и `content` с использованием case-insensitive matching.

### Формат контента
Содержание статей хранится в формате Markdown и отображается с помощью react-markdown с плагинами Tailwind Typography.

### Дисклеймер
На экране просмотра статьи отображается дисклеймер:
> "Материал носит справочный характер и не заменяет консультацию врача."

## Seed данные

Для заполнения базы знаний начальными статьями выполните:

```bash
cd packages/backend
npm run prisma:seed
```

Это создаст 10 статей covering все основные категории.

## Навигация в Mini App

База знаний доступна через:
1. Нижнюю навигацию (иконка 📚 "Знания")
2. Dashboard → Быстрые действия → "База знаний"
3. Прямые ссылки: `/knowledge`, `/knowledge/articles`, `/knowledge/articles/:slug`

## Технические детали

### Backend
- NestJS 10
- Prisma ORM
- Class-validator для DTO
- JWT Guards для админ endpoints

### Frontend
- React 18
- React Router v6
- TanStack Query для data fetching
- React Markdown для рендеринга
- Tailwind CSS + Typography plugin

## Тестирование

### Проверка публичных endpoints
```bash
curl http://localhost:3001/api/knowledge/articles
curl http://localhost:3001/api/knowledge/articles/what-is-diabetes
```

### Проверка админ endpoints
```bash
# Сначала получите JWT токен через авторизацию
curl -X POST http://localhost:3001/api/admin/knowledge/articles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article",
    "slug": "test-article",
    "category": "Основы диабета",
    "content": "# Test content",
    "status": "draft"
  }'
```

## Будущие улучшения

- [ ] Добавить пагинацию для списка статей
- [ ] Добавить теги к статьям
- [ ] Добавить систему лайков/рейтингов
- [ ] Добавить связанные статьи
- [ ] Добавить поддержку изображений в статьях
- [ ] Добавить версию статей (история изменений)
- [ ] Добавить экспорт статей в PDF
