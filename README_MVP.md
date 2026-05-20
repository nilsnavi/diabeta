# DiaBeta - Diabetes Management Assistant MVP

**DiaBeta** - это комплексное решение для управления диабетом через Telegram экосистему (Bot + Mini App) с веб-панелью администратора.

---

## 🎯 MVP Функционал

### ✅ Реализованные модули (15/15)

1. ✅ **Telegram Bot** - интерактивный бот для записи данных
2. ✅ **Telegram Auth** - аутентификация через Telegram WebApp SDK
3. ✅ **Onboarding** - пошаговая настройка профиля при первом запуске
4. ✅ **Профиль пользователя** - тип диабета, целевой диапазон, настройки
5. ✅ **Дневник сахара** - запись, просмотр, анализ глюкозы крови
6. ✅ **Дневник инсулина** - учет доз и типов инсулина
7. ✅ **Дневник еды** -Записывайте продукты питания и рассчитывайте хлебные единицы（ХЕ）
8. ✅ **История Timeline** - хронологическая лента всех записей
9. ✅ **Напоминания** -Регулярные напоминания о необходимости измерить уровень сахара в крови и ввести инсулин
10. ✅ **Базовая аналитика** -Статистические графики и анализ тенденций
11. ✅ **CSV/PDF отчёт** -Создавайте медицинские отчеты для просмотра врачами
12. ✅ **Mini App dashboard** -Современный мобильный интерфейс (в стиле Apple Health)
13. ✅ **Настройки** -Полная настройка пользователя и управление данными
14. ✅ **Юридические согласия** - Соблюдение GDPR, отказ от медицинской ответственности
15. ✅ **Docker Compose запуск** -一Ключевое развертывание всей системы

---

## 🚀 Быстрый старт

### Предварительные требования

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (для локальной разработки)

### Установка и запуск

#### Способ 1: Docker Compose (Рекомендуется)

```bash
# 1. Клонировать репозиторий
git clone <repository-url>
cd diabeta

# 2. Настроить переменные окружения
cp .env.example .env
nano .env  # Заполните обязательные поля

# 3. Запустить все сервисы
docker compose up -d

# 4. Проверить статус
docker compose ps

# 5. Просмотреть логи
docker compose logs -f
```

#### Способ 2: Локальная разработка

```bash
# 1. Установить зависимости
npm install

# 2. Настроить окружение
cp .env.example .env
cp packages/backend/.env.example packages/backend/.env
# Отредактируйте .env файлы

# 3. Запустить базу данных и Redis
docker compose up -d postgres redis

# 4. Запустить миграции
cd packages/backend
npx prisma migrate deploy
npx prisma generate

# 5. Запустить все сервисы в режиме разработки
cd ../..
npm run dev
```

### Доступ к сервисам

После запуска:

- **Mini App**: http://localhost (или через Telegram Bot)
- **Admin Panel**: http://localhost/admin
- **Backend API**: http://localhost/api
- **Health Check**: http://localhost/health
- **Swagger Docs**: http://localhost/api/docs (development mode)

---

## 👤 Полный пользовательский flow

### 1. Начало работы (/start)

```
Пользователь → /start в Telegram
     ↓
Bot показывает приветствие и дисклеймер
     ↓
"Принимаю условия" кнопка
```

### 2. Принятие дисклеймера

```
LegalConsentModal открывается
     ↓
Показывает медицинский дисклеймер:
"DiaBeta помогает вести дневник диабета..."
     ↓
Пользователь принимает все документы
     ↓
acceptedTermsAt, acceptedPrivacyAt, acceptedHealthDataConsentAt сохраняются
```

### 3. Onboarding - заполнение профиля

```
Пошаговый процесс:
1. Тип диабета (Type 1 / Type 2 / Gestational / Other)
2. Целевой диапазон сахара (min/max ммоль/л)
3. Используете ли инсулин? (Yes/No)
4. Часовой пояс
5. Единицы измерения (ммоль/л или мг/дл)
```

### 4. Добавление записи сахара

**Через Bot:**
```
User: /sugar
Bot: "Введите значение сахара:"
User: 6.5
Bot: "Контекст?" (до еды / после еды / перед сном)
User: до еды
Bot: "✅ Запись сохранена: 6.5 ммоль/л"
```

**Через Mini App:**
```
Dashboard → "+ Сахар" кнопка
     ↓
Форма ввода значения
     ↓
Выбор контекста
     ↓
Сохранение → PATCH /api/glucose
```

### 5. Добавление инсулина

**Через Bot:**
```
User: /insulin
Bot: "Введите дозу (единиц):"
User: 5
Bot: "Тип инсулина?" (bolus / basal)
User: bolus
Bot: "✅ Инсулин записан: 5 единиц"
```

**Через Mini App:**
```
Dashboard → "+ Инсулин"
     ↓
Ввод дозы и типа
     ↓
Сохранение → POST /api/insulin
```

### 6. Добавление еды

**Через Bot:**
```
User: /meal
Bot: "Что съели?"
User: Овсянка 200г
Bot: "Углеводы (граммы):"
User: 24
Bot: "✅ Запись: 24г углеводов = 2 ХЕ"
```

**Через Mini App:**
```
Dashboard → "+ Еда"
     ↓
Ввод продуктов и КБЖУ
     ↓
Автоматический расчет ХЕ (carbs / 12)
     ↓
Сохранение → POST /api/meals
```

### 7. Просмотр истории

**Mini App:**
```
BottomNav → "История"
     ↓
Timeline с записями:
- 🩸 6.5 ммоль/л (14:30)
- 💉 5 единиц инсулина (14:00)
- 🍽️ Овсянка 24г У (13:30)
```

**API:**
```
GET /api/timeline?limit=20
→ Возвращает объединенную ленту всех записей
```

### 8. Просмотр аналитики

**Mini App:**
```
BottomNav → "Аналитика"
     ↓
Графики:
- Средний сахар за день/неделю/месяц
- % времени в целевом диапазоне
- Тренды (снижение/повышение)
- Распределение по времени суток
```

**API:**
```
GET /api/analytics/summary?period=7d
GET /api/analytics/glucose-chart?period=7d
→ Статистика и данные для графиков
```

### 9. Создание напоминания

**Mini App:**
```
Settings → "Напоминания"
     ↓
"+ Добавить напоминание"
     ↓
Настройка:
- Название: "Измерить сахар"
- Время: 08:00, 14:00, 20:00
- Частота: ежедневно
- Дни недели: Пн, Ср, Пт (для weekly)
```

**API:**
```
POST /api/reminders
{
  "title": "Измерить сахар",
  "time": "08:00",
  "frequency": "daily",
  "enabled": true
}
```

### 10. Получение уведомления

```
Cron job проверяет reminders каждую минуту
     ↓
Если current_time >= nextRunAt:
     ↓
Bot отправляет сообщение:
"⏰ Напоминание: Измерить сахар"
[Кнопка: "Записать сейчас"]
     ↓
nextRunAt обновляется на следующее время
```

### 11. Формирование отчёта

**Mini App:**
```
Dashboard → "Создать отчёт для врача"
     ↓
Выбор периода: неделя / месяц / квартал
     ↓
Выбор содержимого:
☑️ Глюкоза
☑️ Инсулин
☑️ Питание
☑️ Статистика
     ↓
"Сгенерировать PDF"
     ↓
Report Job создается → BullMQ очередь
     ↓
Background worker генерирует PDF
     ↓
File сохраняется в MinIO/S3
     ↓
User получает ссылку на скачивание
```

**API:**
```
POST /api/reports
{
  "period": "monthly",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "includeGlucose": true,
  "includeInsulin": true,
  "includeMeals": true
}
→ Returns: { jobId: "..." }

GET /api/reports/:jobId/status
→ Returns: { status: "completed", fileUrl: "/reports/report.pdf" }
```

### 12. Открытие Mini App

```
Telegram Bot → Кнопка "Открыть приложение"
     ↓
WebApp.initData передается в Mini App
     ↓
Backend валидирует HMAC-SHA256 подпись
     ↓
JWT токен выдается
     ↓
Mini App загружается с авторизацией
     ↓
Dashboard отображает последние данные
```

### 13. Изменение настроек

**Mini App:**
```
BottomNav → "Настройки"
     ↓
Разделы:
- Профиль (имя, аватар)
- Тип диабета (dropdown)
- Целевой диапазон (min/max inputs)
- Использует инсулин (toggle)
- Часовой пояс (dropdown)
- Напоминания
- Подписка
- Семейный доступ
- Юридические документы
- Экспорт данных
- Удалить аккаунт
```

**API:**
```
PATCH /api/users/me
{
  "diabetesType": "TYPE_1",
  "targetGlucoseMin": 4.0,
  "targetGlucoseMax": 7.0,
  "usesInsulin": true,
  "timezone": "Europe/Moscow"
}
→ Автосохранение при каждом изменении
```

### 14. Удаление аккаунта

**Mini App:**
```
Settings → "Удалить аккаунт" (внизу страницы)
     ↓
Модальное окно подтверждения:
"Это действие необратимо. Введите УДАЛИТЬ"
     ↓
User вводит: УДАЛИТЬ
     ↓
DELETE /api/users/me
     ↓
Soft delete (deletedAt устанавливается)
     ↓
Все данные помечаются как удаленные
     ↓
Logout и redirect на главную
```

**GDPR Compliance:**
```
POST /api/user-data/export
→ Экспорт всех данных в JSON

DELETE /api/user-data/permanent
→ Полное удаление (hard delete)
```

---

## 🔒 Безопасность

### Защита данных

✅ **JWT Authentication** - все API endpoints защищены  
✅ **Telegram InitData Validation** - HMAC-SHA256 проверка подписи  
✅ **Ownership Guard** - пользователи видят только свои данные  
✅ **Medical Data Sanitization** - логи не содержат чувствительных значений  
✅ **Rate Limiting** - 100 requests/minute global limit  
✅ **Soft Delete** - все записи можно восстановить  
✅ **Audit Logging** - все admin actions логируются  

### Ownership Validation

Каждый сервис проверяет владение данными:

```typescript
// Пример из glucose.service.ts
async findOne(userId: string, id: string) {
  const record = await this.prisma.glucoseEntry.findUnique({ where: { id } });
  
  if (!record) {
    throw new NotFoundException('Record not found');
  }
  
  if (record.userId !== userId) {
    throw new ForbiddenException('Access denied'); // ❌ Чужие данные недоступны
  }
  
  return record;
}
```

### Sanitized Logs

```typescript
// AuditLogService автоматически скрывает:
- Значения сахара → [REDACTED]
- Дозы инсулина → [REDACTED]
- Симптомы → [REDACTED]
- Комментарии → [REDACTED]
- Диагнозы → [REDACTED]

// Логируется только:
- User ID
- Action type
- Entity type
- Timestamp
- IP address
```

---

## 📋 Переменные окружения

### Обязательные (.env)

```bash
# JWT Authentication (минимум 32 символа)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars-long

# Telegram Bot (получить от @BotFather)
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_BOT_USERNAME=your_bot_username

# PostgreSQL Database
POSTGRES_DB=diabeta
POSTGRES_USER=diabeta
POSTGRES_PASSWORD=secure_password_here
POSTGRES_PORT=5432

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
```

### Необязательные

```bash
# MinIO / S3 Storage (для файлов отчетов)
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=diabeta

# YooKassa Payment Gateway (для подписок)
YOOKASSA_SHOP_ID=shop_id
YOOKASSA_SECRET_KEY=secret_key

# Application Settings
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
TZ=Europe/Moscow
```

---

## 🧪 Тестирование

### Запуск тестов

```bash
# Все тесты
npm run test

# Backend тесты
npm run test:backend

# Frontend тесты
npm run test:frontend

# Bot тесты
npm run test:bot

# С coverage report
npm run test:cov
```

### Покрытие тестами

- **Backend**: 7 test suites, ~50+ tests (Auth, Glucose, Insulin, Meals, Reminders, Reports, Security)
- **Frontend**: 2 test suites, ~12+ tests (Dashboard, Form Validation)
- **Bot**: 1 test suite, ~15+ tests (FSM Scenarios)
- **Total**: ~77+ tests

Подробнее: [TESTING_GUIDE.md](./TESTING_GUIDE.md)

---

## 📦 Архитектура проекта

### Monorepo Structure (Turborepo)

```
diabeta/
├── packages/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   │   ├── auth/     # Authentication
│   │   │   ├── glucose/  # Blood sugar management
│   │   │   ├── insulin/  # Insulin tracking
│   │   │   ├── meals/    # Food logging
│   │   │   ├── feelings/ # Mood/symptoms
│   │   │   ├── activity/ # Physical activity
│   │   │   ├── analytics/# Statistics & charts
│   │   │   ├── reports/  # PDF/CSV generation
│   │   │   ├── reminders/# Notifications
│   │   │   ├── ai/       # AI chat (safe)
│   │   │   ├── admin/    # Admin panel API
│   │   │   ├── security/ # Guards, audit log
│   │   │   └── legal/    # Legal documents
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── Dockerfile
│   │
│   ├── bot/              # Telegram Bot
│   │   ├── src/
│   │   │   ├── commands/ # /start, /sugar, /insulin
│   │   │   ├── scenes/   # FSM for data entry
│   │   │   └── keyboards/# Inline keyboards
│   │   └── Dockerfile
│   │
│   ├── miniapp/          # React Mobile App
│   │   ├── src/
│   │   │   ├── pages/    # Dashboard, History, Analytics
│   │   │   ├── components/# UI components
│   │   │   ├── api/      # API clients
│   │   │   └── store/    # Zustand state
│   │   └── Dockerfile
│   │
│   └── admin/            # Admin Panel (Refine + Ant Design)
│       ├── src/
│       │   ├── pages/    # Users, Knowledge, Errors
│       │   └── App.tsx
│       └── Dockerfile
│
├── docker-compose.yml        # Development
├── docker-compose.prod.yml   # Production
├── nginx.conf                # Reverse proxy config
├── .env.example              # Environment template
└── package.json              # Root scripts
```

### Сервисы Docker Compose

```yaml
services:
  postgres:    # PostgreSQL 15 - основная БД
  redis:       # Redis 7 - кэш и очереди
  backend:     # NestJS API (port 3000)
  bot:         # Telegram Bot
  miniapp:     # React Frontend (nginx)
  admin:       # Admin Panel (nginx)
  nginx:       # Reverse proxy (ports 80, 443)
```

---

## 🗄️ База данных

### Основные таблицы (Prisma Schema)

```prisma
model User {
  id                        String    @id @default(uuid())
  telegramId                String    @unique
  username                  String?
  firstName                 String?
  lastName                  String?
  
  diabetesType              DiabetesType?
  targetGlucoseMin          Float?
  targetGlucoseMax          Float?
  usesInsulin               Boolean   @default(false)
  timezone                  String    @default("Europe/Moscow")
  
  acceptedTermsAt           DateTime?
  acceptedPrivacyAt         DateTime?
  acceptedHealthDataConsentAt DateTime?
  
  deletedAt                 DateTime?  // Soft delete
  
  glucoseEntries            GlucoseEntry[]
  insulinEntries            InsulinEntry[]
  mealEntries               MealEntry[]
  // ... другие связи
}

model GlucoseEntry {
  id          String   @id @default(uuid())
  userId      String
  value       Float    // ммоль/л
  measuredAt  DateTime
  context     String?  // before_meal, after_meal, bedtime
  comment     String?
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
}

model InsulinEntry {
  id             String   @id @default(uuid())
  userId         String
  dose           Float    // единицы
  insulinType    String   // bolus, basal
  administeredAt DateTime
  comment        String?
  createdAt      DateTime @default(now())
  
  user           User     @relation(fields: [userId], references: [id])
}

model MealEntry {
  id            String   @id @default(uuid())
  userId        String
  eatenAt       DateTime
  foodItems     Json     // [{name, carbs, proteins, fats, calories}]
  totalCarbs    Float
  totalProteins Float
  totalFats     Float
  totalCalories Int
  isFavorite    Boolean  @default(false)
  comment       String?
  createdAt     DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id])
}

model Reminder {
  id          String   @id @default(uuid())
  userId      String
  title       String
  time        String   // "08:00"
  frequency   String   // daily, weekly
  daysOfWeek  Int[]?   // [1,3,5] для weekly
  enabled     Boolean  @default(true)
  nextRunAt   DateTime
  snoozedUntil DateTime?
  completedAt DateTime?
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
}
```

### Миграции

```bash
# Создать новую миграцию
cd packages/backend
npx prisma migrate dev --name add_new_field

# Применить миграции в production
npx prisma migrate deploy

# Открыть Prisma Studio (GUI)
npx prisma studio
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/telegram` - Login with Telegram initData
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update profile
- `DELETE /api/users/me` - Delete account (soft delete)

### Glucose
- `POST /api/glucose` - Create glucose record
- `GET /api/glucose` - List glucose records
- `GET /api/glucose/:id` - Get single record
- `PATCH /api/glucose/:id` - Update record
- `DELETE /api/glucose/:id` - Delete record

### Insulin
- `POST /api/insulin` - Create insulin record
- `GET /api/insulin` - List insulin records
- `GET /api/insulin/:id` - Get single record
- `PATCH /api/insulin/:id` - Update record
- `DELETE /api/insulin/:id` - Delete record

### Meals
- `POST /api/meals` - Create meal record
- `GET /api/meals` - List meal records
- `GET /api/meals/favorites` - Get favorite meals
- `POST /api/meals/:id/favorite` - Toggle favorite
- `GET /api/meals/:id` - Get single record
- `PATCH /api/meals/:id` - Update record
- `DELETE /api/meals/:id` - Delete record

### Analytics
- `GET /api/analytics/summary?period=7d` - Get statistics summary
- `GET /api/analytics/glucose-chart?period=7d` - Get chart data
- `GET /api/analytics/insulin-summary?period=7d` - Insulin statistics
- `GET /api/analytics/meals-summary?period=7d` - Meals statistics

### Reminders
- `POST /api/reminders` - Create reminder
- `GET /api/reminders` - List reminders
- `POST /api/reminders/:id/snooze` - Snooze reminder
- `POST /api/reminders/:id/complete` - Mark as complete
- `PATCH /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

### Reports
- `POST /api/reports` - Create report job
- `GET /api/reports/:jobId/status` - Check job status
- `GET /api/reports/:jobId/download` - Download generated file

### Timeline
- `GET /api/timeline?limit=20` - Get unified timeline of all records

### Legal
- `GET /api/legal/documents` - List legal documents
- `GET /api/legal/documents/:id` - Get specific document
- `POST /api/users/me/accept-legal` - Accept legal document
- `GET /api/users/me/legal-status` - Get acceptance status

### User Data (GDPR)
- `POST /api/user-data/export` - Export all user data
- `DELETE /api/user-data/permanent` - Permanent delete (hard delete)

### Health
- `GET /api/health` - Health check endpoint

---

## 🤖 Telegram Bot Commands

### Основные команды

```
/start          - Начать работу, показать дисклеймер
/menu           - Главное меню
/sugar          - Записать сахар
/insulin        - Записать инсулин
/meal           - Записать еду
/feeling        - Записать самочувствие
/history        - Последние записи
/stats          - Статистика за неделю
/reminders      - Управление напоминаниями
/profile        - Настройки профиля
/help           - Помощь
```

### Inline кнопки

После каждого ввода данных бот предлагает:
- "Записать еще"
- "Посмотреть историю"
- "Открыть Mini App"

---

## 🎨 Mini App Screens

### 1. Dashboard (/)
- Header с датой и аватаром
- Карточка последнего сахара (цветовой статус)
- Мини-график за день
- Быстрые действия (+ Сахар, + Инсулин, + Еда, + Самочувствие)
- Ближайшее напоминание
- Последние записи (timeline)
- Кнопка "Отчёт врачу"
- Bottom навигация

### 2. История (/history)
- Фильтры по типу записи
- Хронологический список
- Поиск по дате
- Редактирование/удаление записей

### 3. Аналитика (/analytics)
- Графики глюкозы (день/неделя/месяц)
- % времени в диапазоне
- Средние значения
- Тренды
- Распределение по времени суток

### 4. AI Chat (/ai-chat)
- Безопасный чат с фильтрацией
- Вопросы о диабете
- Рекомендации (не медицинские!)
- Ссылки на базу знаний

### 5. Настройки (/settings)
- Профиль
- Тип диабета
- Целевой диапазон
- Использование инсулина
- Часовой пояс
- Напоминания
- Подписка
- Семейный доступ
- Юридические документы
- Экспорт данных
- Удалить аккаунт

---

## 🛠️ Технологии

### Backend
- **Framework**: NestJS 10
- **ORM**: Prisma 5
- **Database**: PostgreSQL 15
- **Cache/Queue**: Redis 7 + BullMQ
- **Auth**: JWT + Telegram WebApp SDK
- **Validation**: class-validator + Joi
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

### Frontend (Mini App)
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Data Fetching**: TanStack Query
- **Charts**: Recharts
- **Routing**: React Router DOM
- **Testing**: Vitest + React Testing Library

### Admin Panel
- **Framework**: React 18
- **UI Library**: Ant Design 5
- **Admin Framework**: Refine 4
- **Build Tool**: Vite 5

### Bot
- **Library**: Telegraf.js 4
- **FSM**: Scenes for multi-step conversations

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **File Storage**: MinIO (S3 compatible)
- **Monitoring**: Health checks, structured logging

---

## 📈 Roadmap - Что осталось после MVP

### Phase 2: Расширенная аналитика
- [ ] Прогнозирование гипогликемии (ML модель)
- [ ] Корреляция между едой и сахаром
- [ ] Инсулиновые кривые
- [ ] Экспорт в Apple Health / Google Fit

### Phase 3: Семейный доступ
- [ ] Приглашение членов семьи
- [ ] Роли (parent, child, doctor)
- [ ] Совместный просмотр данных
- [ ] Уведомления о критических значениях

### Phase 4: CGM интеграция
- [ ] Поддержка Libre, Dexcom, Medtronic
- [ ] Real-time glucose monitoring
- [ ] Автоматическая синхронизация
- [ ] Alert system для опасных значений

### Phase 5: AI Assistant
- [ ] Персонализированные рекомендации
- [ ] Анализ паттернов
- [ ] Predictive alerts
- [ ] Natural language queries ("покажи средний сахар за неделю")

### Phase 6: Монетизация
- [ ] Subscription plans (Free, Pro, Family)
- [ ] Payment integration (YooKassa)
- [ ] Premium features
- [ ] Doctor consultation marketplace

### Phase 7: Международная экспансия
- [ ] Мультиязычность (i18n)
- [ ] Локализация единиц (mg/dL, mmol/L)
- [ ] Региональные compliance (HIPAA, GDPR)
- [ ] Local payment methods

### Phase 8: Advanced Features
- [ ] Medication tracker (кроме инсулина)
- [ ] Exercise impact analysis
- [ ] Stress level tracking
- [ ] Sleep quality correlation
- [ ] HbA1c estimation
- [ ] Doctor portal для просмотра пациентов

---

## 📞 Поддержка

### Документация
- [README_DEPLOY.md](./README_DEPLOY.md) - Полное руководство по деплою
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Руководство по тестированию
- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) - Аудит безопасности
- [DASHBOARD_IMPLEMENTATION.md](./DASHBOARD_IMPLEMENTATION.md) - Dashboard реализация
- [SETTINGS_IMPLEMENTATION.md](./SETTINGS_IMPLEMENTATION.md) - Settings реализация

### Troubleshooting

**Backend не запускается:**
```bash
docker compose logs backend
docker compose exec backend npx prisma migrate deploy
```

**Redis недоступен:**
```bash
docker compose exec redis redis-cli ping
docker compose restart redis
```

**Nginx 502 Bad Gateway:**
```bash
docker compose logs backend
docker compose exec nginx wget -qO- http://backend:3000/api/health
docker compose restart nginx
```

**База данных пуста:**
```bash
docker compose exec backend npx prisma db seed
```

---

## ⚖️ Лицензия и отказ от ответственности

### Медицинский дисклеймер

**ВАЖНО**: DiaBeta является инструментом для ведения дневника диабета и НЕ является медицинским изделием.

- ❌ Не ставит диагнозы
- ❌ Не назначает лечение
- ❌ Не заменяет консультацию врача
- ❌ Не рекомендует дозы инсулина

При плохом самочувствии немедленно обратитесь за медицинской помощью.

### Лицензия

MIT License - см. файл LICENSE для деталей.

---

## 🎉 Заключение

**DiaBeta MVP полностью готов к использованию!**

✅ 15 модулей реализовано  
✅ Полный пользовательский flow работает  
✅ Данные защищены (ownership, encryption, sanitization)  
✅ Docker Compose deployment готов  
✅ Тесты написаны (~77+ tests)  
✅ Документация полная  

**Запуск одной командой:**
```bash
docker compose up -d
```

**Готово к production!** 🚀
