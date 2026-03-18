# Docker: полная инструкция по запуску

Данный документ описывает **все способы** развёртывания Health Backend через Docker-контейнеры — от быстрого старта до продакшн-конфигурации.

---

## Содержание

1. [Требования](#1-требования)
2. [Архитектура контейнеров](#2-архитектура-контейнеров)
3. [Вариант 1 — Docker Compose (рекомендуемый)](#3-вариант-1--docker-compose-рекомендуемый)
4. [Вариант 2 — Standalone контейнер (всё-в-одном)](#4-вариант-2--standalone-контейнер-всё-в-одном)
5. [Переменные окружения](#5-переменные-окружения)
6. [Работа с контейнерами](#6-работа-с-контейнерами)
7. [Makefile-команды](#7-makefile-команды)
8. [Запуск тестов](#8-запуск-тестов)
9. [Решение проблем](#9-решение-проблем)

---

## 1. Требования

| Компонент       | Минимальная версия | Проверка                  |
|-----------------|--------------------|---------------------------|
| Docker Engine   | 20.10+             | `docker --version`        |
| Docker Compose  | 2.0+ (V2)         | `docker compose version`  |
| Git             | 2.x                | `git --version`           |
| Свободный порт  | 8080 (настраивается) | `lsof -i :8080`         |
| Оперативная память | 2 GB+           | —                         |
| Дисковое пространство | 3 GB+        | —                         |

> **Docker Desktop** для Windows/macOS уже включает Docker Compose V2.
> На Linux при необходимости установите плагин: `sudo apt install docker-compose-plugin`

---

## 2. Архитектура контейнеров

### Docker Compose (4 контейнера)

```
┌──────────────────────────────────────────────────────────┐
│                    Nginx (порт 8080)                     │
│                  health_nginx  (1.27-alpine)             │
│                                                          │
│    /           → Frontend (React)                        │
│    /api/       → Backend  (FastAPI)                      │
│    /ws/        → WebSocket (FastAPI)                     │
└────────┬──────────────────────┬──────────────────────────┘
         │                      │
   ┌─────▼──────┐        ┌─────▼──────┐
   │  Frontend   │        │  Backend   │
   │ health_web  │        │ health_api │
   │ Node 20     │        │ Python 3.11│
   │ порт 4173   │        │ порт 8000  │
   └─────────────┘        └─────┬──────┘
                                │
                          ┌─────▼──────┐
                          │ PostgreSQL  │
                          │ health_db   │
                          │ 14          │
                          │ порт 5432   │
                          └─────────────┘
```

### Standalone (1 контейнер)

```
┌────────────────────────────────┐
│  health-backend (порт 8080)    │
│  Python 3.11-slim              │
│                                │
│  Uvicorn (FastAPI)             │
│  + встроенная статика (React)  │
│  + SQLite (файловая БД)        │
└────────────────────────────────┘
```

---

## 3. Вариант 1 — Docker Compose (рекомендуемый)

Полный стек: **PostgreSQL + FastAPI + React + Nginx**. Подходит для разработки и продакшена.

### 3.1. Клонирование и подготовка

```bash
git clone <repo-url>
cd Health_Backend
```

### 3.2. Настройка переменных окружения

```bash
# Создайте .env из шаблона
cp .env.example .env

# Отредактируйте .env — обязательно измените JWT_SECRET и ADMIN_PASSWORD
nano .env
```

Минимально необходимые изменения в `.env`:

```env
JWT_SECRET=ваш_длинный_случайный_секрет_минимум_32_символа
ADMIN_PASSWORD=надёжный_пароль_администратора
```

### 3.3. Запуск

```bash
# Способ 1: через docker compose
docker compose up --build -d

# Способ 2: через Makefile
make up

# Способ 3: через скрипт (автоматически создаёт .env)
./scripts/dev-up.sh
```

Флаги:
- `--build` — пересобрать образы (обязательно при первом запуске и после изменений кода)
- `-d` — запуск в фоновом режиме (detached)

### 3.4. Проверка статуса

```bash
# Статус всех контейнеров
docker compose ps

# Ожидаемый вывод:
# NAME           STATUS                   PORTS
# health_db      running (healthy)        0.0.0.0:5432->5432/tcp
# health_api     running (healthy)        0.0.0.0:8000->8000/tcp
# health_web     running                  4173/tcp
# health_nginx   running                  0.0.0.0:8080->8080/tcp
```

### 3.5. Открытие в браузере

| Ресурс           | URL                                     |
|------------------|-----------------------------------------|
| Веб-приложение   | http://localhost:8080                   |
| Swagger (API)    | http://localhost:8080/api/docs          |
| Health check     | http://localhost:8080/api/v1/health     |
| API напрямую     | http://localhost:8000/api/docs          |

### 3.6. Остановка

```bash
# Остановить контейнеры (данные сохраняются)
docker compose down

# Остановить и удалить данные PostgreSQL
docker compose down -v
```

### 3.7. Порядок запуска контейнеров

Docker Compose управляет зависимостями автоматически:

1. **PostgreSQL** (`db`) — запускается первым, ожидается `pg_isready`
2. **Backend** (`api`) — запускается после того, как БД станет healthy; при старте создаёт таблицы и администратора
3. **Frontend** (`web`) — запускается параллельно с backend
4. **Nginx** — запускается последним, после того как API станет healthy

---

## 4. Вариант 2 — Standalone контейнер (всё-в-одном)

Один контейнер с встроенным SQLite. Идеален для быстрой демонстрации или тестирования.

### 4.1. Запуск через скрипт

```bash
# Linux / macOS
./scripts/one-click-start.sh

# Windows PowerShell
./scripts/one-click-start.ps1
```

Скрипт автоматически:
1. Удаляет старые контейнеры
2. Собирает образ из `Dockerfile.standalone` (фронтенд + бэкенд)
3. Запускает контейнер с volume для данных
4. Ждёт пока сервис станет healthy
5. Выводит URL для доступа

### 4.2. Запуск вручную

```bash
# Сборка образа
docker build -f Dockerfile.standalone -t health-backend:standalone .

# Запуск контейнера
docker run -d \
  --name health-backend \
  -p 8080:8080 \
  -v health_backend_data:/app/data \
  -e JWT_SECRET=ваш_секрет \
  -e ADMIN_PASSWORD=ваш_пароль \
  health-backend:standalone
```

### 4.3. Проверка

```bash
# Статус контейнера
docker ps --filter name=health-backend

# Health check
curl http://localhost:8080/api/v1/health
# Ожидаемый ответ: {"status":"OK"}
```

### 4.4. Остановка

```bash
# Через скрипт
./scripts/one-click-stop.sh

# Вручную
docker stop health-backend
docker rm health-backend
```

### 4.5. Отличия от Docker Compose

| Параметр      | Docker Compose            | Standalone              |
|---------------|---------------------------|-------------------------|
| БД            | PostgreSQL 14             | SQLite (файл)          |
| Контейнеры    | 4 (db, api, web, nginx)  | 1                       |
| Производительность | Выше                 | Достаточна для демо    |
| Масштабируемость | Да                     | Нет                     |
| Статика       | Nginx reverse proxy       | Uvicorn (встроенная)   |
| Данные        | PostgreSQL volume         | SQLite volume          |

---

## 5. Переменные окружения

### Полный список

| Переменная                  | По умолчанию                          | Описание                                    |
|-----------------------------|---------------------------------------|---------------------------------------------|
| `DATABASE_URL`              | `postgresql+psycopg://...@db:5432/health` | Строка подключения к БД                 |
| `JWT_SECRET`                | `change_this_secret_now`              | Секретный ключ для JWT-токенов (обязателен) |
| `JWT_ALGORITHM`             | `HS256`                               | Алгоритм подписи JWT                       |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30`                                | Время жизни access-токена (минуты)          |
| `REFRESH_TOKEN_EXPIRE_MINUTES`| `10080`                             | Время жизни refresh-токена (7 дней)         |
| `CORS_ORIGINS`              | `http://localhost:8080`               | Разрешённые CORS origins (через запятую)    |
| `ADMIN_EMAIL`               | `admin@example.com`                   | Email администратора (создаётся при старте) |
| `ADMIN_PASSWORD`            | `change_me_please`                    | Пароль администратора                       |
| `ADMIN_FULL_NAME`           | `System Admin`                        | Имя администратора                          |
| `DEMO_SEED`                 | `true`                                | Заполнить БД демо-данными                   |
| `HOST_PORT`                 | `8080`                                | Внешний порт (только для Compose/скриптов)  |

### Передача переменных

```bash
# Через .env файл (рекомендуется)
cp .env.example .env
# Отредактируйте .env

# Через командную строку
JWT_SECRET=mysecret ADMIN_PASSWORD=strongpass docker compose up --build -d

# Через флаг -e (standalone)
docker run -e JWT_SECRET=mysecret -e ADMIN_PASSWORD=strongpass ...
```

---

## 6. Работа с контейнерами

### Просмотр логов

```bash
# Все сервисы
docker compose logs -f

# Только бэкенд
docker compose logs -f api

# Только БД
docker compose logs -f db

# Standalone
docker logs -f health-backend
```

### Подключение к контейнеру

```bash
# Shell внутри бэкенда
docker compose exec api bash

# Shell внутри БД
docker compose exec db psql -U health_user -d health

# Standalone
docker exec -it health-backend bash
```

### Работа с базой данных

```bash
# Подключиться к PostgreSQL
docker compose exec db psql -U health_user -d health

# Пример SQL-запросов
# \dt                        — список таблиц
# SELECT * FROM users;       — все пользователи
# \q                         — выход
```

### Пересборка отдельного сервиса

```bash
# Пересобрать только бэкенд
docker compose up --build -d api

# Пересобрать только фронтенд
docker compose up --build -d web
```

### Перезапуск сервиса

```bash
docker compose restart api
docker compose restart web
```

---

## 7. Makefile-команды

| Команда             | Описание                                           |
|---------------------|----------------------------------------------------|
| `make up`           | Запуск Docker Compose (сборка + фон)               |
| `make down`         | Остановка всех контейнеров                         |
| `make standalone`   | Запуск standalone-контейнера                       |
| `make standalone-stop` | Остановка standalone-контейнера                 |
| `make logs`         | Просмотр логов всех сервисов в реальном времени    |
| `make clean`        | Полная очистка: контейнеры + volumes + данные      |

---

## 8. Запуск тестов

### Внутри контейнера

```bash
# Войти в контейнер бэкенда
docker compose exec api bash

# Запустить тесты
pytest -v
```

### Локально (без Docker)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -v
```

### Текущий результат тестов

```
tests/test_features.py           — 10 тестов (feature engineering)
tests/test_model_load_smoke.py   — 5 тестов  (загрузка ML-модели)
tests/test_prediction_api.py     — 4 теста   (API прогнозирования)
tests/test_risk_mapping.py       — 10 тестов (маппинг уровней риска)
─────────────────────────────────────────────────
Итого: 29 тестов — все PASSED
```

---

## 9. Решение проблем

### Порт 8080 занят

```bash
# Узнать, кто занимает порт
lsof -i :8080
# или
ss -tlnp | grep 8080

# Запустить на другом порту
HOST_PORT=9090 docker compose up --build -d
# Приложение будет на http://localhost:9090
```

### Контейнер не стартует / ошибка health check

```bash
# Посмотреть логи проблемного контейнера
docker compose logs api
docker compose logs db

# Проверить статус health check
docker inspect --format='{{json .State.Health}}' health_api | python -m json.tool
```

### Ошибка подключения к БД

```bash
# Убедитесь, что контейнер БД healthy
docker compose ps db

# Проверьте доступность БД
docker compose exec db pg_isready -U health_user -d health

# Пересоздайте контейнер БД
docker compose down -v
docker compose up --build -d
```

### Ошибка `bcrypt` (`module 'bcrypt' has no attribute '__about__'`)

Проблема решена фиксацией версии `bcrypt==4.0.1` в `requirements.txt`.
Если ошибка появляется, пересоберите образ без кеша:

```bash
docker compose build --no-cache api
docker compose up -d
```

### Фронтенд показывает старую версию

```
Ctrl+F5 (hard refresh) или откройте в режиме инкогнито.
```

### Полный сброс

```bash
# Удалить всё: контейнеры, образы, volumes
make clean

# Или вручную
docker compose down -v --rmi local
docker rm -f health-backend 2>/dev/null
docker volume rm health_backend_data 2>/dev/null

# Запустить заново
docker compose up --build -d
```

### Недостаточно памяти при сборке

Сборка ML-зависимостей (scikit-learn, lightgbm, shap) требует ~2 GB RAM.
Увеличьте лимит Docker Desktop: **Settings → Resources → Memory → 4 GB+**.

---

## Быстрая шпаргалка

```bash
# === Первый запуск ===
git clone <repo-url> && cd Health_Backend
cp .env.example .env              # Настроить переменные
nano .env                          # JWT_SECRET, ADMIN_PASSWORD
docker compose up --build -d       # Запуск
# Открыть http://localhost:8080

# === Ежедневная работа ===
docker compose up -d               # Запуск (без пересборки)
docker compose logs -f api         # Логи бэкенда
docker compose restart api         # Перезапуск после правок
docker compose down                # Остановка

# === Авторизация ===
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"change_me_please"}'
```
