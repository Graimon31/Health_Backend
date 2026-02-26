# Health_Backend

Да, можно запускать как **готовый один контейнер**: `docker run` и сайт сразу работает.

## Вариант 1 (рекомендую для старта): один standalone-контейнер

Этот режим не требует отдельной Postgres/Nginx/web-служб.
Внутри контейнера уже:
- FastAPI backend,
- собранный React frontend,
- SQLite база (файл `health.db`).

### 1) Собрать образ

```bash
docker build -f Dockerfile.standalone -t health-backend:standalone .
```

### 2) Запустить контейнер

```bash
docker run -d --name health-backend -p 8080:8080 \
  -e JWT_SECRET="super_secret_change_me" \
  -e ADMIN_EMAIL="admin@example.com" \
  -e ADMIN_PASSWORD="change_me_please" \
  health-backend:standalone
```

### 3) Проверить, что всё работает

Откройте:
- http://localhost:8080
- http://localhost:8080/api/docs
- http://localhost:8080/api/v1/health

Проверка API:

```bash
curl http://localhost:8080/api/v1/health
```

Ожидаемый ответ:

```json
{"status":"OK"}
```

### 4) Проверка логина администратора

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"change_me_please"}'
```

Ожидаемый результат:
- приходят `access_token` и `refresh_token`.

### 5) Остановка/удаление

```bash
docker stop health-backend
docker rm health-backend
```

---

## Вариант 2: полный docker compose (db + api + web + nginx)

Если нужен режим ближе к production-разделению сервисов, используйте compose.

```bash
cp .env.example .env
docker compose up --build
```

Открыть:
- http://localhost:8080
- http://localhost:8080/api/docs

---

## Готовые скрипты

### Linux/macOS

- Standalone: `./scripts/standalone-build-run.sh`
- Compose: `./scripts/dev-up.sh`

### Windows PowerShell

- Standalone: `./scripts/standalone-build-run.ps1`
- Compose: `./scripts/dev-up.ps1`

---

## Частые проблемы

1. `docker: command not found` — Docker не установлен или не запущен.
2. `port 8080 already in use` — освободите порт или смените `-p 8080:8080`.
3. Неверный логин админа — проверьте `ADMIN_EMAIL`/`ADMIN_PASSWORD`, с которыми запускали контейнер.
4. Если поменяли env — пересоздайте контейнер (`docker rm -f health-backend`, потом `docker run ...`).

---

## Что уже реализовано в API

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/register-doctor` (только ADMIN)
- `GET /api/v1/health`
