# Telegram Auth Module

## Overview

Аутентификация через Telegram WebApp `initData`. Backend проверяет подпись по алгоритму Telegram, возвращает JWT.

## Endpoint

### POST /auth/telegram

Аутентификация пользователя по Telegram initData.

**Request:**
```json
{
  "initData": "query_id=...&user=...&auth_date=...&hash=..."
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cuid123",
    "telegramId": "123456789",
    "onboardingCompleted": false
  }
}
```

**Error responses:**
- `400 Bad Request` — тело запроса не прошло валидацию
- `401 Unauthorized` — невалидный или просроченный initData

---

### GET /auth/me

Возвращает текущего пользователя. Требует JWT в заголовке.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):** объект пользователя из базы.

---

## Использование защищённых endpoints

Добавьте `@UseGuards(JwtAuthGuard)` к контроллеру или методу:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

Без валидного JWT endpoint вернёт `401 Unauthorized`.

---

## Переменные окружения

| Переменная         | Описание                           | Пример              |
|--------------------|------------------------------------|---------------------|
| `TELEGRAM_BOT_TOKEN` | Токен бота для проверки подписи  | `123456:ABC-DEF...` |
| `JWT_SECRET`       | Секрет для подписи JWT             | `my-secret`         |
| `JWT_EXPIRES_IN`   | Срок жизни JWT (по умолчанию `7d`) | `7d`, `24h`         |

---

## Алгоритм проверки initData

1. Из строки `initData` извлекается `hash` и удаляется из параметров.
2. Проверяется `auth_date` — если старше 24 часов, запрос отклоняется.
3. Оставшиеся параметры сортируются по ключу и объединяются через `\n`.
4. `secretKey = HMAC-SHA256("WebAppData", BOT_TOKEN)`
5. `expectedHash = HMAC-SHA256(secretKey, dataCheckString)`
6. Сравниваются `expectedHash` и `hash` из initData.

---

## Пример запроса (cURL)

```bash
curl -X POST http://localhost:3000/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "initData": "query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22John%22%7D&auth_date=1716120000&hash=abc123..."
  }'
```

## Пример запроса (JavaScript в Telegram Mini App)

```javascript
const initData = window.Telegram.WebApp.initData;

const response = await fetch('/auth/telegram', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ initData }),
});

const { accessToken, user } = await response.json();

// Использование токена
fetch('/blood-sugar', {
  headers: { Authorization: `Bearer ${accessToken}` },
});
```

---

## Безопасность

- `TELEGRAM_BOT_TOKEN` берётся только из переменной окружения.
- `initData` не логируется полностью (только предупреждение при неверном hash).
- `userId` никогда не берётся из тела запроса — только из JWT payload.
- Проверка `auth_date` защищает от replay-атак (окно 24 часа).