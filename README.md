# Health_Backend — запуск «одной кнопкой»

Да, сделано так, чтобы вы запускали **один скрипт**, и сайт сразу поднимался.

## Самый простой путь (one-click)

### Linux / macOS

```bash
./scripts/one-click-start.sh
```

### Windows PowerShell

```powershell
./scripts/one-click-start.ps1
```

Скрипт автоматически:
1. Собирает образ `health-backend:standalone`.
2. Пересоздаёт контейнер `health-backend`.
3. Запускает его на порту `8080`.
4. Ждёт статуса `healthy`.
5. Печатает готовые ссылки.

После успешного запуска открывайте:
- http://localhost:8080
- http://localhost:8080/api/docs
- http://localhost:8080/api/v1/health

---

## Что внутри standalone-контейнера

- FastAPI backend
- React frontend (собран и встроен)
- SQLite база внутри контейнера
- Автосоздание администратора (`ADMIN_EMAIL`/`ADMIN_PASSWORD`)
- Healthcheck для контроля готовности

То есть это реально «из коробки»: **один контейнер = работающий сайт + API**.

---

## Параметры (опционально)

Перед запуском можно задать свои значения:

### Linux/macOS

```bash
export JWT_SECRET='super_secret'
export ADMIN_EMAIL='admin@example.com'
export ADMIN_PASSWORD='my_strong_password'
./scripts/one-click-start.sh
```

### Windows PowerShell

```powershell
$env:JWT_SECRET='super_secret'
$env:ADMIN_EMAIL='admin@example.com'
$env:ADMIN_PASSWORD='my_strong_password'
./scripts/one-click-start.ps1
```

---

## Проверка логина администратора

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"my_strong_password"}'
```

Если пароль не меняли, по умолчанию `change_me_please`.

---

## Остановка (one-click)

### Linux / macOS

```bash
./scripts/one-click-stop.sh
```

### Windows PowerShell

```powershell
./scripts/one-click-stop.ps1
```

---

## Если хотите режим с несколькими контейнерами

Оставлен и старый путь через compose:

```bash
cp .env.example .env
docker compose up --build
```

---

## Частые проблемы

1. `docker: command not found` → Docker не установлен/не запущен.
2. `port 8080 already in use` → освободите порт или поменяйте порт в скрипте.
3. Не проходит логин admin → проверьте, какие `ADMIN_EMAIL`/`ADMIN_PASSWORD` передали в окружении.
4. Контейнер не стал healthy → `docker logs health-backend --tail 200`.
