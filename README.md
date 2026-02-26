# Health_Backend

Подробная инструкция для запуска проекта **с нуля** (как для новичка).

Проект поднимает 4 сервиса через Docker:
- `db` — PostgreSQL (порт `5432`)
- `api` — FastAPI (порт `8000`, наружу через Nginx)
- `web` — React + Vite (внутри Docker)
- `nginx` — единая точка входа (порт `8080`)

---

## 1. Что уже есть в репозитории

- `docker-compose.yml` — описание всех сервисов.
- `backend/` — минимальный backend с `GET /api/v1/health`.
- `web/` — минимальный frontend.
- `nginx/default.conf` — прокси для `/`, `/api`, `/ws`.
- `.env.example` — пример переменных окружения.
- `scripts/dev-up.sh` и `scripts/dev-up.ps1` — запуск в 1 команду.

---

## 2. Что нужно установить заранее

> Нужно установить **Docker Desktop** и **Git**. Node/Python локально не обязательны для запуска через Docker.

### 2.1 Windows
1. Установите Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Установите Git: https://git-scm.com/download/win
3. Перезагрузите ПК.
4. Запустите Docker Desktop и дождитесь статуса **Engine running**.

Проверка в PowerShell:

```powershell
docker --version
git --version
```

Ожидаемый результат: команды выводят версии без ошибок.

### 2.2 macOS
1. Установите Docker Desktop (версия для вашего CPU): https://www.docker.com/products/docker-desktop/
2. Установите Git (или `xcode-select --install`).
3. Запустите Docker Desktop.

Проверка в Terminal:

```bash
docker --version
git --version
```

### 2.3 Linux
1. Установите Docker Engine: https://docs.docker.com/engine/install/
2. Установите Docker Compose plugin (по инструкции для дистрибутива).
3. Установите Git: `sudo apt install git` (или аналог).

Проверка:

```bash
docker --version
docker compose version
git --version
```

---

## 3. Клонирование проекта

```bash
git clone <URL_ВАШЕГО_РЕПО>
cd Health_Backend
```

Проверка:

```bash
pwd
```

Ожидаемый результат: текущая папка `.../Health_Backend`.

---

## 4. Настройка `.env`

Скопируйте шаблон:

### Linux/macOS
```bash
cp .env.example .env
```

### Windows PowerShell
```powershell
Copy-Item .env.example .env
```

Откройте `.env` и при необходимости поменяйте значения.
Минимально можно оставить как есть для локального старта.

Текущие переменные:
- `DATABASE_URL=postgresql+psycopg://health_user:health_pass@db:5432/health`
- `JWT_SECRET=replace_with_long_random_secret`
- `CORS_ORIGINS=http://localhost:8080`
- `ADMIN_EMAIL=admin@example.com`
- `ADMIN_PASSWORD=change_me`
- `DEMO_SEED=true`

Рекомендуется поменять `JWT_SECRET` на случайную строку.

Пример генерации:
- Linux/macOS: `openssl rand -hex 32`
- PowerShell: `[guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")`

---

## 5. Запуск проекта

### Вариант A — напрямую через docker compose

```bash
docker compose up --build
```

### Вариант B — через скрипт

- Linux/macOS:
  ```bash
  ./scripts/dev-up.sh
  ```
- Windows PowerShell:
  ```powershell
  ./scripts/dev-up.ps1
  ```

Что должно появиться в логах:
- `health_db` — PostgreSQL started / ready to accept connections
- `health_api` — Uvicorn running on `0.0.0.0:8000`
- `health_web` — Vite preview listening on `4173`
- `health_nginx` — Nginx started

---

## 6. Проверка после запуска

Откройте в браузере:

1. `http://localhost:8080` — стартовая страница frontend.
2. `http://localhost:8080/api/docs` — Swagger UI FastAPI.
3. `http://localhost:8080/api/v1/health` — health-check endpoint.

Ожидаемый ответ health:

```json
{"status":"OK"}
```

Проверка через curl:

```bash
curl http://localhost:8080/api/v1/health
```

---

## 7. Остановка проекта

Остановить контейнеры:

```bash
docker compose down
```

Остановить и удалить том базы данных (осторожно: удаляет данные БД):

```bash
docker compose down -v
```

---

## 8. Частые проблемы и решения

### Проблема 1: `docker: command not found`
Причина: Docker не установлен или не запущен.
Решение: установить/запустить Docker Desktop, перезапустить терминал.

### Проблема 2: порт `8080`/`5432` уже занят
Проверьте, кто занимает порт:
- Linux/macOS: `lsof -i :8080`
- Windows: `netstat -ano | findstr :8080`

Завершите процесс или смените порт в `docker-compose.yml`.

### Проблема 3: в GitHub на `main` всё ещё только README
Причина: изменения в другой ветке.
Решение: убедиться, что PR **замёржен в `main`**.

### Проблема 4: Swagger не открывается
1. Проверьте, что контейнер `health_api` запущен: `docker compose ps`.
2. Посмотрите логи API: `docker compose logs api --tail=200`.
3. Проверьте прокси в `nginx/default.conf`.

### Проблема 5: frontend открывается, но API 502
1. `docker compose ps` — API должен быть `Up`.
2. `docker compose logs nginx --tail=200`.
3. `docker compose logs api --tail=200`.

---

## 9. Быстрый чек-лист перед работой

- [ ] Docker установлен и запущен
- [ ] Репозиторий склонирован
- [ ] Создан `.env` из `.env.example`
- [ ] Выполнен `docker compose up --build`
- [ ] Открываются `http://localhost:8080`, `/api/docs`, `/api/v1/health`

---

## 10. Следующий шаг

После успешного старта каркаса переходим к реализации:
- auth (`/api/v1/auth/...`),
- модели БД и миграции,
- пациенты/профили,
- чат и т.д.
