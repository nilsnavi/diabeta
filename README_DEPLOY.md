# DiaBeta - Docker Deployment Guide

Полное руководство по развертыванию DiaBeta с использованием Docker и Docker Compose.

---

## 📋 Содержание

1. [Требования](#требования)
2. [Быстрый старт](#быстрый-старт)
3. [Конфигурация](#конфигурация)
4. [Production Deployment](#production-deployment)
5. [SSL/TLS Certificates](#ssltls-certificates)
6. [Backup & Restore](#backup--restore)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)
9. [Security](#security)

---

## 🔧 Требования

### Минимальные системные требования:
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Disk**: 20 GB SSD
- **OS**: Linux (Ubuntu 20.04+, CentOS 8+), macOS, Windows with WSL2

### Необходимое ПО:
- Docker 20.10+
- Docker Compose 2.0+
- Git

Проверка версий:
```bash
docker --version
docker compose version
```

---

## 🚀 Быстрый старт

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd diabeta
```

### 2. Настройка переменных окружения

```bash
# Скопируйте шаблон
cp .env.example .env

# Отредактируйте файл
nano .env
```

**Обязательные параметры:**
```bash
JWT_SECRET=<сгенерируйте случайную строку минимум 32 символа>
TELEGRAM_BOT_TOKEN=<получите от @BotFather>
POSTGRES_PASSWORD=<установите надежный пароль>
```

**Генерация JWT_SECRET:**
```bash
# Linux/macOS
openssl rand -hex 32

# Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 3. Запуск сервисов

```bash
# Development mode
docker compose up -d

# Production mode
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 4. Проверка статуса

```bash
#查看所有容器状态
docker compose ps

# Просмотр логов
docker compose logs -f

# Проверка health checks
docker compose ps --format "table {{.Name}}\t{{.Status}}"
```

### 5. Доступ к сервисам

- **Mini App**: http://localhost
- **Admin Panel**: http://localhost/admin
- **Backend API**: http://localhost/api
- **Health Check**: http://localhost/health

---

## ⚙️ Конфигурация

### Структура сервисов

```
┌─────────────┐
│   Nginx     │ :80, :443
│  (Reverse   │
│   Proxy)    │
└──┬──────┬───┘
   │      │
   │      └──────────────┐
   │                     │
┌──▼──┐           ┌─────▼─────┐
│ Mini│           │   Admin   │
│ App │           │  Panel    │
└─────┘           └───────────┘
                   
┌──────────────────────────┐
│      Backend API         │ :3000
└──┬───────────┬───────────┘
   │           │
┌──▼──┐   ┌───▼────┐
│Post-│   │ Redis  │
│greSQL│   │        │
└─────┘   └────────┘
```

### Переменные окружения

#### Обязательные:

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars) | `a1b2c3d4e5f6...` |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot token from @BotFather | `123456:ABC-DEF...` |
| `POSTGRES_PASSWORD` | PostgreSQL database password | `secure_password` |

#### Необязательные:

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_DB` | `diabeta` | Database name |
| `POSTGRES_USER` | `diabeta` | Database user |
| `POSTGRES_PORT` | `5432` | Database port |
| `REDIS_PORT` | `6379` | Redis port |
| `MINIO_ENDPOINT` | `minio:9000` | S3-compatible storage |
| `YOOKASSA_SHOP_ID` | - | Payment gateway shop ID |
| `YOOKASSA_SECRET_KEY` | - | Payment gateway secret |

---

## 🏭 Production Deployment

### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Настройка firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Настройка SSL/TLS (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install certbot -y

# Получение сертификата
sudo certbot certonly --standalone -d your-domain.com

# Копирование сертификатов
sudo mkdir -p ./ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/
sudo chmod 600 ./ssl/*
```

### 3. Активация HTTPS в nginx.conf

Раскомментируйте секцию HTTPS server в `nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    # ... остальная конфигурация
}
```

### 4. Запуск production режима

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 5. Автоматическое обновление сертификатов

```bash
# Создание cron job для обновления
sudo crontab -e

# Добавить строку:
0 3 * * 1 certbot renew --quiet && docker compose exec nginx nginx -s reload
```

---

## 💾 Backup & Restore

### Backup

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker compose exec -T postgres pg_dump -U diabeta diabeta | gzip > $BACKUP_DIR/db_$TIMESTAMP.sql.gz

# Backup uploads
tar czf $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz volumes/uploads_data

# Backup Redis (optional)
docker compose exec -T redis redis-cli SAVE

echo "Backup completed: $TIMESTAMP"
```

### Automated Backups (Cron)

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/diabeta-backup.log 2>&1

# Keep only last 30 days of backups
find ./backups -type f -mtime +30 -delete
```

### Restore

```bash
#!/bin/bash
# restore.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore.sh <backup-file.sql.gz>"
    exit 1
fi

# Stop application
docker compose down

# Restore database
gunzip < $BACKUP_FILE | docker compose exec -T postgres psql -U diabeta diabeta

# Start application
docker compose up -d

echo "Restore completed from: $BACKUP_FILE"
```

---

## 📊 Monitoring

### Health Checks

Все сервисы имеют встроенные health checks:

```bash
# Проверка состояния всех сервисов
docker compose ps

# Детальная информация
docker inspect diabeta-backend | grep -A 10 Health
```

### Logs

```bash
# Все логи
docker compose logs -f

# Логи конкретного сервиса
docker compose logs -f backend
docker compose logs -f bot
docker compose logs -f nginx

# Последние 100 строк
docker compose logs --tail=100 backend
```

### Resource Usage

```bash
# Использование ресурсов
docker stats

# Конкретный контейнер
docker stats diabeta-backend
```

### Prometheus Metrics (Optional)

Добавьте в `docker-compose.yml`:

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## 🔧 Troubleshooting

### Backend не запускается

```bash
# Проверка логов
docker compose logs backend

# Перезапуск миграций
docker compose exec backend npx prisma migrate deploy

# Проверка подключения к БД
docker compose exec backend ping postgres
```

### Redis недоступен

```bash
# Проверка статуса
docker compose exec redis redis-cli ping

# Перезапуск
docker compose restart redis
```

### Nginx возвращает 502 Bad Gateway

```bash
# Проверка backend
docker compose logs backend

# Проверка connectivity
docker compose exec nginx wget -qO- http://backend:3000/api/health

# Перезапуск nginx
docker compose restart nginx
```

### Проблемы с SSL

```bash
# Проверка сертификатов
openssl x509 -in ./ssl/fullchain.pem -text -noout

# Проверка прав доступа
ls -la ./ssl/

# Тест конфигурации nginx
docker compose exec nginx nginx -t
```

### Очистка и пересборка

```bash
# Полная очистка
docker compose down -v
docker system prune -af

# Пересборка образов
docker compose build --no-cache

# Запуск
docker compose up -d
```

---

## 🔒 Security

### Best Practices

1. **Никогда не коммитьте `.env` файл**
   ```bash
   git status  # Убедитесь что .env в .gitignore
   ```

2. **Используйте сильные пароли**
   ```bash
   # Генерация пароля
   openssl rand -base64 32
   ```

3. **Регулярно обновляйте образы**
   ```bash
   docker compose pull
   docker compose up -d
   ```

4. **Ограничьте доступ к портам**
   ```bash
   # В production используйте firewall
   sudo ufw allow only from trusted IPs
   ```

5. **Включите HTTPS**
   - Используйте Let's Encrypt для бесплатных сертификатов
   - Настройте HSTS headers

6. **Мониторинг логов**
   ```bash
   # Поиск подозрительной активности
   docker compose logs | grep -i "error\|warning\|failed"
   ```

### Firewall Configuration

```bash
# Ubuntu UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Проверка правил
sudo ufw status verbose
```

---

## 📝 Команды управления

### Основные команды

```bash
# Запуск всех сервисов
docker compose up -d

# Остановка всех сервисов
docker compose down

# Перезапуск конкретного сервиса
docker compose restart backend

# Просмотр логов
docker compose logs -f [service-name]

# Вход в контейнер
docker compose exec backend sh

# Масштабирование (если поддерживается)
docker compose up -d --scale backend=3

# Обновление образов
docker compose pull
docker compose up -d

# Полная очистка (включая volumes)
docker compose down -v
```

### Полезные алиасы

Добавьте в `~/.bashrc` или `~/.zshrc`:

```bash
alias db-up='cd /path/to/diabeta && docker compose up -d'
alias db-down='cd /path/to/diabeta && docker compose down'
alias db-logs='cd /path/to/diabeta && docker compose logs -f'
alias db-status='cd /path/to/diabeta && docker compose ps'
alias db-restart='cd /path/to/diabeta && docker compose restart'
```

---

## 🎯 Критерии готовности

✅ **Проект запускается командой `docker compose up -d`**  
✅ **Backend подключается к PostgreSQL** - через DATABASE_URL  
✅ **Redis работает** - health check через redis-cli ping  
✅ **Bot запускается** - подключается к backend через BACKEND_URL  
✅ **Mini-app доступен** - через nginx на порту 80  
✅ **Admin доступен** - через nginx на /admin  
✅ **README содержит инструкцию** - полное руководство выше  

---

## 📞 Support

При возникновении проблем:

1. Проверьте логи: `docker compose logs -f`
2. Убедитесь что все health checks passed: `docker compose ps`
3. Проверьте конфигурацию `.env`
4. Обратитесь к разделу [Troubleshooting](#troubleshooting)

---

## 📄 License

DiaBeta is licensed under the MIT License. See LICENSE file for details.
