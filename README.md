# Health Backend — Панель врача

Полноценное веб-приложение: **FastAPI** (бэкенд) + **React/TypeScript** (фронтенд) + **PostgreSQL** (БД).

---

## Быстрый старт

### Требования

- [Docker](https://docs.docker.com/get-docker/) и Docker Compose (входит в Docker Desktop)
- Git

### Вариант 1: Docker Compose (рекомендуемый)

Полный стек: PostgreSQL + API + Frontend + Nginx.

```bash
git clone <repo-url> && cd Health_Backend

# Запуск (одна команда)
docker compose up --build -d

# Или через Makefile
make up
```

После запуска откройте:
- **Приложение:** http://localhost:8080
- **API документация (Swagger):** http://localhost:8080/api/docs
- **Health check:** http://localhost:8080/api/v1/health

Остановка:
```bash
docker compose down
# или
make down
```

### Вариант 2: Standalone контейнер (всё-в-одном)

Один контейнер без PostgreSQL (используется SQLite). Проще всего для быстрого теста.

```bash
# Linux / macOS
./scripts/one-click-start.sh

# Windows PowerShell
./scripts/one-click-start.ps1
```

Остановка:
```bash
./scripts/one-click-stop.sh
```

---

## Учётные данные по умолчанию

| Параметр | Значение |
|----------|----------|
| Email    | `admin@example.com` |
| Пароль   | `change_me_please` |

Можно настроить через переменные окружения:

```bash
# Docker Compose
JWT_SECRET=my_secret ADMIN_EMAIL=me@mail.com ADMIN_PASSWORD=strongpass docker compose up --build -d

# Standalone
JWT_SECRET=my_secret ADMIN_EMAIL=me@mail.com ADMIN_PASSWORD=strongpass ./scripts/one-click-start.sh
```

---

## Проверка авторизации

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"change_me_please"}'
```

---

## Запуск без Docker (для разработки)

### Бэкенд

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Используем SQLite для простоты
DATABASE_URL=sqlite:///./health.db \
JWT_SECRET=dev_secret \
ADMIN_PASSWORD=admin123 \
uvicorn app.main:app --reload --port 8000
```

API будет доступно на http://localhost:8000/api/docs

### Фронтенд

```bash
cd web
npm install
npm run dev
```

Фронтенд будет доступен на http://localhost:3000

---

## Структура проекта

```
Health_Backend/
├── backend/              # FastAPI бэкенд
│   ├── app/
│   │   ├── main.py       # Точка входа
│   │   ├── db.py         # SQLAlchemy подключение
│   │   ├── security.py   # JWT, хэширование паролей
│   │   ├── api/          # Роуты (auth)
│   │   ├── models/       # ORM модели (User)
│   │   ├── schemas/      # Pydantic схемы
│   │   └── core/         # Конфигурация
│   ├── Dockerfile
│   └── requirements.txt
├── web/                  # React фронтенд
│   ├── src/main.tsx      # Дашборд
│   ├── Dockerfile
│   └── package.json
├── nginx/                # Реверс-прокси
│   └── default.conf
├── docker-compose.yml    # Полный стек
├── Dockerfile.standalone # Всё-в-одном контейнер
├── Makefile              # Быстрые команды
└── scripts/              # One-click скрипты
```

## API эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| GET   | `/api/v1/health` | Health check |
| POST  | `/api/v1/auth/login` | Авторизация (JWT) |
| POST  | `/api/v1/auth/refresh` | Обновление токена |
| POST  | `/api/v1/auth/register-doctor` | Регистрация врача (только admin) |

---

## Makefile команды

| Команда | Описание |
|---------|----------|
| `make up` | Запуск через docker-compose |
| `make down` | Остановка |
| `make standalone` | Запуск standalone контейнера |
| `make logs` | Просмотр логов |
| `make clean` | Полная очистка (контейнеры + данные) |

---

## Решение проблем

**Порт 8080 занят:**
```bash
HOST_PORT=9090 docker compose up --build -d
# или
HOST_PORT=9090 ./scripts/one-click-start.sh
```

**Ошибка bcrypt (`module 'bcrypt' has no attribute '__about__'`):**
Уже исправлено — `bcrypt==4.0.1` зафиксирован в requirements.txt.

**Видите старую страницу в браузере:**
Нажмите `Ctrl+F5` (hard refresh) или откройте в режиме инкогнито.
