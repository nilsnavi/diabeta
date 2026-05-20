# DiaBeta - Git Configuration Guide

## 📁 .gitignore

Корневой `.gitignore` файл настроен для monorepo проекта с поддержкой всех используемых технологий.

### 🔒 Исключенные файлы и директории

#### 1. **Зависимости**
- `node_modules/` - все зависимости npm/yarn/pnpm
- `.pnp`, `.pnp.js` - Plug'n'Play файлы Yarn

#### 2. **Сборка и билды**
- `dist/` - выходные файлы TypeScript/NestJS
- `build/` - сборки React приложений
- `.next/` - Next.js build output
- `out/` - статический экспорт

#### 3. **Переменные окружения** ⚠️ ВАЖНО
- `.env` - основные переменные окружения
- `.env.local` - локальные переопределения
- `.env.*.local` - специфичные для среды файлы
- `*.env` - любые файлы с расширением .env

**Никогда не коммитьте файлы с секретами!**

#### 4. **IDE и редакторы**
- `.vscode/` - настройки VS Code workspace
- `.idea/` - JetBrains IDE
- `*.swp`, `*.swo` - Vim swap files
- `.DS_Store` - macOS metadata

#### 5. **Логи**
- `logs/` - директория логов
- `*.log` - все лог файлы
- `npm-debug.log*` - npm debug логи
- `yarn-debug.log*`, `yarn-error.log*` - Yarn логи

#### 6. **Тестирование**
- `coverage/` - отчёты покрытия кода
- `.nyc_output/` - NYC/Istanbul coverage data

#### 7. **Turborepo**
- `.turbo/` - кэш и артефакты Turborepo

#### 8. **TypeScript**
- `*.tsbuildinfo` - incremental compilation cache

#### 9. **Docker**
- `docker-compose.override.yml` - локальные переопределения Docker

#### 10. **Безопасность** 🔐
- `*.pem`, `*.key`, `*.crt` - SSL сертификаты и ключи
- `*.p12`, `*.jks` - keystores
- `secrets/` - директория секретов
- `certificates/` - сертификаты

#### 11. **База данных**
- `*.db`, `*.sqlite`, `*.sqlite3` - локальные БД

**Важно:** Миграции Prisma (`packages/backend/prisma/migrations/`) **ОТСЛЕЖИВАЮТСЯ** в Git!

---

## 📄 .gitattributes

Настроен для корректной обработки окончаний строк и бинарных файлов.

### Текстовые файлы (LF normalization)
- `*.js`, `*.jsx`, `*.ts`, `*.tsx` - исходный код
- `*.json` - конфигурационные файлы
- `*.css`, `*.scss` - стили
- `*.html`, `*.md` - разметка и документация
- `*.yml`, `*.yaml` - конфигурации

### Бинарные файлы (без модификаций)
- `*.png`, `*.jpg`, `*.jpeg`, `*.gif` - изображения
- `*.ico` - favicons
- `*.svg` - векторная графика
- `*.woff`, `*.woff2`, `*.ttf`, `*.eot` - шрифты

---

## 🎯 Best Practices

### ✅ Что коммитить
1. Исходный код (`.ts`, `.tsx`, `.js`, `.jsx`)
2. Конфигурационные файлы (`package.json`, `tsconfig.json`, etc.)
3. Миграции Prisma (`prisma/migrations/**/*`)
4. Документация (`.md` файлы)
5. Docker конфигурации (`Dockerfile`, `docker-compose.yml`)
6. CI/CD конфигурации

### ❌ Что НЕ коммитить
1. `node_modules/` - устанавливаются через `npm install`
2. `.env` файлы с секретами - используйте `.env.example` как шаблон
3. `dist/`, `build/` - генерируются при сборке
4. Логи и временные файлы
5. IDE-specific настройки (кроме shared workspace configs)
6. Coverage отчёты - генерируются при тестировании

### 🔐 Безопасность
- Никогда не коммитьте `.env` файлы с реальными секретами
- Используйте `.env.example` для документации переменных
- Ротируйте секреты если они случайно попали в Git
- Используйте Git hooks для проверки на секреты

---

## 🚀 Быстрый старт

```bash
# Клонировать репозиторий
git clone <repository-url>
cd diabeta

# Установить зависимости
npm install

# Скопировать пример .env
cp .env.example .env

# Отредактировать .env с вашими значениями
nano .env  # или ваш редактор

# Запустить проект
npm run dev
```

---

## 📝 Примечания

### Prisma Migrations
Миграции базы данных **должны быть в Git** для:
- Синхронизации схемы БД между разработчиками
- Воспроизводимости развёртываний
- Отката изменений при необходимости

### Environment Variables
Используйте `.env.example` как шаблон:
```bash
# В .env.example (коммитится)
DATABASE_URL="postgresql://user:password@localhost:5432/diabeta"
JWT_SECRET="your-secret-here"

# В .env (НЕ коммитится)
DATABASE_URL="postgresql://prod-user:real-password@prod-server:5432/diabeta"
JWT_SECRET="actual-production-secret"
```

### Turborepo Cache
Кэш Turborepo локальный и не синхронизируется. Каждый разработчик имеет свой кэш.

---

## 🔧 Troubleshooting

### Файл отслеживается, но должен игнорироваться
```bash
# Удалить из Git cache
git rm --cached <file>

# Добавить в .gitignore
echo "<file>" >> .gitignore

# Закоммитить изменения
git add .gitignore
git commit -m "gitignore: add <file>"
```

### Проверить что игнорируется
```bash
# Показать игнорируемые файлы
git status --ignored

# Проверить конкретный файл
git check-ignore -v <file>
```

### Очистить Git cache
```bash
# Опасно: удалит все файлы из cache
git rm -r --cached .
git add .
git commit -m "chore: refresh gitignore cache"
```

---

## 📚 Дополнительные ресурсы

- [Git Documentation - gitignore](https://git-scm.com/docs/gitignore)
- [GitHub - .gitignore templates](https://github.com/github/gitignore)
- [Atlassian - .gitignore guide](https://www.atlassian.com/git/tutorials/saving-changes/gitignore)
- [Prisma - Version Control](https://www.prisma.io/docs/guides/database/version-control)
