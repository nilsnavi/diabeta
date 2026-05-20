# DiaBeta — Диабет Ассистент

Информационный сервис для ведения дневника диабетика: учёт сахара крови, инсулина, питания, аналитика и напоминания через Telegram.

> ⚠️ **Медицинский дисклеймер:** DiaBeta не является медицинским устройством. Сервис не ставит диагнозы, не назначает лечение и не изменяет дозировки препаратов. Все клинические решения принимает только ваш лечащий врач.

---

## Структура монорепозитория

```
diabeta/
├── packages/
│   ├── backend/          # NestJS + Prisma + PostgreSQL + Redis
│   ├── miniapp/          # React + Vite — Telegram Mini App
│   ├── bot/              # Telegraf.js — Telegram Bot
│   └── admin/            # Refine + Ant Design — Admin Panel
├── .env.example          # Корневой шаблон env-переменных
├── docker-compose.yml    # Полный стек: DB, Redis, MinIO, сервисы
├── package.json          # Turborepo root + общие скрипты
├── tsconfig.json         # Базовый TypeScript конфиг
└── turbo.json            # Turborepo pipeline
```

### Детальная структура backend

```
packages/backend/
├── prisma/
│   └── schema.prisma     # User, DiabetesProfile, BloodSugar, Insulin, Food, Reminder, Report
├── src/
│   ├── auth/             # JWT + Telegram initData аутентификация
│   ├── users/            # Управление пользователями
│   ├── diabetes-profile/ # Профиль диабетика
│   ├── blood-sugar/      # Дневник сахара крови
│   ├── insulin/          # Дневник инсулина
│   ├── food/             # Дневник питания
│   ├── analytics/        # Аналитика и статистика
│   ├── reminders/        # Напоминания (BullMQ + Redis)
│   ├── reports/          # Генерация PDF/CSV/XLSX (BullMQ)
│   └── prisma/           # PrismaService
├── Dockerfile
└── .env.example
```

---

## Стек технологий

| Компонент  | Технологии                                                          |
|------------|---------------------------------------------------------------------|
| Backend    | NestJS 10, TypeScript, PostgreSQL 15, Prisma 5, Redis 7, BullMQ    |
| Mini App   | React 18, Vite 5, Telegram WebApp SDK, Tailwind CSS, Zustand, Recharts |
| Bot        | Telegraf.js 4, TypeScript                                           |
| Admin      | Refine 4, Ant Design 5, React 18, Vite 5                           |
| Auth       | Telegram initData + JWT                                             |
| Reports    | PDFKit, ExcelJS, csv-writer                                        |
| Storage    | MinIO (S3-compatible)                                               |
| Deploy     | Docker, Docker Compose, Nginx                                       |

---

## Быстрый старт (локальная разработка)

### 1. Установить зависимости

```bash
git clone <repo-url>
cd diabeta
npm install
```

### 2. Настроить переменные окружения

```bash
# Корневой .env (для docker-compose)
cp .env.example .env

# Backend
cp packages/backend/.env.example packages/backend/.env

# Bot
cp packages/bot/.env.example packages/bot/.env

# Mini App
cp packages/miniapp/.env.example packages/miniapp/.env

# Admin
cp packages/admin/.env.example packages/admin/.env
```

Обязательные переменные в `packages/backend/.env`:

```env
DATABASE_URL=postgresql://diabeta:diabeta_password@localhost:5432/diabeta
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key-min-32-chars
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### 3. Запустить инфраструктуру (PostgreSQL + Redis + MinIO)

```bash
# Только инфраструктура (рекомендуется для разработки)
docker-compose up -d postgres redis minio

# Или полный стек включая все сервисы
npm run docker:up
```

Сервисы будут доступны:
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- MinIO Console: `http://localhost:9001` (login: minioadmin / minioadmin)

### 4. Применить миграции Prisma

```bash
# Создать и применить миграции
npm run prisma:migrate

# Сгенерировать Prisma Client
npm run prisma:generate
```

### 5. Запустить все сервисы в режиме разработки

```bash
# Все сервисы параллельно через Turborepo
npm run dev
```

Или каждый сервис отдельно:

```bash
# Backend API (http://localhost:3001)
cd packages/backend && npm run start:dev

# Mini App (http://localhost:5173)
cd packages/miniapp && npm run dev

# Admin Panel (http://localhost:3000 или 5174)
cd packages/admin && npm run dev

# Telegram Bot
cd packages/bot && npm run dev
```

---

## NPM Scripts (корень)

| Команда                 | Описание                                        |
|-------------------------|-------------------------------------------------|
| `npm run dev`           | Запустить все пакеты в режиме разработки        |
| `npm run build`         | Собрать все пакеты                              |
| `npm run lint`          | Линтинг всех пакетов                            |
| `npm run test`          | Запустить тесты всех пакетов                    |
| `npm run format`        | Форматирование кода (Prettier)                  |
| `npm run prisma:migrate`| Создать и применить новую миграцию              |
| `npm run prisma:generate`| Регенерировать Prisma Client                   |
| `npm run prisma:studio` | Открыть Prisma Studio (GUI для БД)              |
| `npm run docker:up`     | Запустить все контейнеры                        |
| `npm run docker:down`   | Остановить все контейнеры                       |
| `npm run docker:logs`   | Смотреть логи контейнеров                       |

---

## Миграции базы данных

```bash
# Создать новую миграцию (после изменения schema.prisma)
npm run prisma:migrate
# или напрямую:
cd packages/backend && npx prisma migrate dev --name <название_миграции>

# Применить миграции в production
cd packages/backend && npx prisma migrate deploy

# Сгенерировать клиент после изменения схемы
npm run prisma:generate

# Открыть GUI для просмотра и редактирования данных
npm run prisma:studio
```

---

## API Endpoints

Swagger документация доступна по адресу: `http://localhost:3001/api/docs`

### Аутентификация
| Метод | URL                     | Описание                        |
|-------|-------------------------|---------------------------------|
| POST  | `/api/auth/telegram`    | Вход через Telegram initData    |

### Профиль
| Метод  | URL                          | Описание                  |
|--------|------------------------------|---------------------------|
| GET    | `/api/diabetes-profile`      | Получить профиль          |
| POST   | `/api/diabetes-profile`      | Создать профиль           |
| PATCH  | `/api/diabetes-profile`      | Обновить профиль          |

### Сахар крови
| Метод  | URL                     | Описание              |
|--------|-------------------------|-----------------------|
| GET    | `/api/blood-sugar`      | Список записей        |
| POST   | `/api/blood-sugar`      | Создать запись        |
| DELETE | `/api/blood-sugar/:id`  | Удалить запись        |

### Инсулин
| Метод | URL              | Описание       |
|-------|------------------|----------------|
| GET   | `/api/insulin`   | Список записей |
| POST  | `/api/insulin`   | Создать запись |

### Питание
| Метод | URL          | Описание       |
|-------|--------------|----------------|
| GET   | `/api/food`  | Список записей |
| POST  | `/api/food`  | Создать запись |

### Аналитика
| Метод | URL                                     | Описание            |
|-------|-----------------------------------------|---------------------|
| GET   | `/api/analytics/overview`               | Общий обзор         |
| GET   | `/api/analytics/blood-sugar?period=7d`  | Сахар за период     |

### Отчёты
| Метод | URL                | Описание                    |
|-------|--------------------|-----------------------------|
| POST  | `/api/reports`     | Создать отчёт (PDF/CSV/XLSX)|
| GET   | `/api/reports/:id` | Статус и ссылка на отчёт    |

---

## Тесты

```bash
# Все тесты
npm run test

# Тесты backend с покрытием
cd packages/backend && npm run test:cov

# Конкретный тест
cd packages/backend && npm test -- blood-sugar.service.spec
```

---

## Сборка и деплой

```bash
# Собрать все пакеты
npm run build

# Полный запуск через Docker Compose (production-like)
npm run docker:up

# Пересборка образов и запуск
docker-compose up --build -d
```

---

## Безопасность

- Все секреты хранятся в `.env` файлах, которые добавлены в `.gitignore`
- JWT подписывается секретом из `JWT_SECRET` (минимум 32 символа в production)
- Telegram initData верифицируется HMAC-SHA256 подписью
- Rate limiting настроен через `@nestjs/throttler`
- `.env` файлы **никогда** не коммитятся в репозиторий

---

## Модели данных (Prisma)

| Модель            | Описание                                          |
|-------------------|---------------------------------------------------|
| `User`            | Пользователь (telegramId, имя, язык)              |
| `DiabetesProfile` | Тип диабета, целевые значения глюкозы, врач       |
| `BloodSugar`      | Запись сахара крови (значение, единица, время)    |
| `Insulin`         | Запись инъекции инсулина (тип, доза, время)       |
| `Food`            | Запись приёма пищи (тип, КБЖУ, время)             |
| `Reminder`        | Напоминание (тип, частота, время, дни недели)     |
| `Report`          | Сгенерированный отчёт (PDF/CSV/XLSX, ссылка)      |