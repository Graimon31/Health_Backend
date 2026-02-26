# Health_Backend

Минимальный рабочий каркас проекта: PostgreSQL + FastAPI + React(Vite) + Nginx.

## Что уже есть в репозитории

- `docker-compose.yml` — поднимает `db`, `api`, `web`, `nginx`.
- `backend/` — FastAPI с endpoint `GET /api/v1/health`.
- `web/` — базовое React-приложение.
- `nginx/default.conf` — прокси `/api` и `/ws`.
- `scripts/dev-up.sh` и `scripts/dev-up.ps1` — запуск одной командой.

## Быстрый старт

1. Скопируйте пример переменных:

```bash
cp .env.example .env
```

2. Запустите сервисы:

```bash
docker compose up --build
```

3. Откройте:

- Веб: http://localhost:8080
- Swagger: http://localhost:8080/api/docs
- Health: http://localhost:8080/api/v1/health

Ожидаемый ответ health:

```json
{"status":"OK"}
```

## Полезные команды

Остановить сервисы:

```bash
docker compose down
```

Остановить и удалить volume базы:

```bash
docker compose down -v
```

Запуск через скрипты:

- Linux/macOS: `./scripts/dev-up.sh`
- Windows PowerShell: `./scripts/dev-up.ps1`

## Важно

Если в GitHub на `main` всё ещё виден только `README.md`, значит изменения находятся в другой ветке и ещё не вмержены. После merge этого PR структура и файлы станут видны в `main`.
