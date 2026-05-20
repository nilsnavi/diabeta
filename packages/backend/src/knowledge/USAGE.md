# Инструкция по использованию модуля базы знаний DiaBeta

## Быстрый старт

### 1. Запуск backend

```bash
cd packages/backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed  # Добавляет начальные статьи
npm run start:dev
```

### 2. Запуск Mini App

```bash
cd packages/miniapp
npm install
npm run dev
```

### 3. Проверка работы

Откройте Mini App и перейдите в раздел "База знаний" через:
- Нижнюю навигацию (📚 Знания)
- Dashboard → Быстрые действия → База знаний

## Создание статей (Admin)

### Через API

```bash
# Получить токен авторизации (через Telegram или другой метод)
TOKEN="your_jwt_token"

# Создать статью
curl -X POST http://localhost:3001/api/admin/knowledge/articles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Моя статья",
    "slug": "my-article",
    "category": "Основы диабета",
    "content": "# Заголовок\n\nСодержание статьи в формате **Markdown**.",
    "status": "published"
  }'

# Обновить статью
curl -X PATCH http://localhost:3001/api/admin/knowledge/articles/ARTICLE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "published"
  }'

# Удалить статью
curl -X DELETE http://localhost:3001/api/admin/knowledge/articles/ARTICLE_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Формат Markdown

Статьи поддерживают полный синтаксис Markdown:

```markdown
# Заголовок H1
## Заголовок H2
### Заголовок H3

**Жирный текст**
*Курсив*

- Список
- Элементы

1. Нумерованный
2. список

> Цитата или важное замечание

`код` или блок кода:

```javascript
const example = "code";
```

[Ссылка](https://example.com)

![Изображение](url)
```

## Просмотр статей (User)

Пользователи могут:
- Просматривать список категорий
- Искать статьи по ключевым словам
- Фильтровать по категориям
- Читать полные статьи
- Видеть дату обновления

## Структура URL

- `/knowledge` - Список категорий
- `/knowledge/articles` - Все статьи с поиском
- `/knowledge/articles?category=Инсулин` - Статьи категории
- `/knowledge/articles?search=гипогликемия` - Результаты поиска
- `/knowledge/articles/:slug` - Конкретная статья

## Troubleshooting

### Статьи не отображаются
- Проверьте статус статьи (должен быть `published`)
- Убедитесь, что backend запущен
- Проверьте консоль браузера на ошибки

### Поиск не работает
- Убедитесь, что запрос минимум 2 символа
- Проверьте网络连接 к backend
- Попробуйте другие ключевые слова

### Ошибка авторизации (admin endpoints)
- Проверьте JWT токен
- Убедитесь, что токен не истек
- Проверьте права доступа пользователя

## Best Practices

### Для авторов статей

1. **Уникальные slug**: Используйте латинские буквы, цифры и дефисы
   - ✅ `insulin-types-guide`
   - ❌ `Типы инсулина`

2. **Структурированный контент**: Используйте заголовки для организации
   ```markdown
   # Основной раздел
   ## Подраздел
   ### Детали
   ```

3. **Важная информация**: Выделяйте через цитаты
   ```markdown
   > **Важно:** Всегда консультируйтесь с врачом!
   ```

4. **Списки**: Используйте для перечислений
   ```markdown
   - Пункт 1
   - Пункт 2
   ```

5. **Проверка**: Перед публикацией проверьте:
   - Орфографию
   - Форматирование
   - Актуальность информации
   - Медицинскую точность

### Для администраторов

1. **Модерация**: Проверяйте статьи перед публикацией
2. **Обновления**: Регулярно обновляйте устаревшую информацию
3. **Категории**: Правильно categorize статьи
4. **SEO**: Используйте описательные slug и title

## Поддержка

При возникновении проблем:
1. Проверьте логи backend (`packages/backend/logs`)
2. Проверьте консоль браузера (F12)
3. Убедитесь, что все зависимости установлены
4. Проверьте конфигурацию `.env` файлов

## Дополнительная информация

- [README модуля](./README.md) - Техническая документация
- [Prisma Schema](../../prisma/schema.prisma) - Модель данных
- [API Client](../../../miniapp/src/api/knowledge.ts) - Frontend клиент
