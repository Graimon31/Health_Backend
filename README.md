# Health_Backend

Подробная инструкция для новичка: запуск проекта и проверка авторизации (Шаг 2: Auth/JWT).

## 0) Что уже реализовано

- Инфраструктура: `db` + `api` + `web` + `nginx` через Docker Compose.
- Backend: FastAPI + PostgreSQL + SQLAlchemy.
- Auth endpoints:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/register-doctor` (только ADMIN)
- Health endpoint: `GET /api/v1/health`
- Swagger: `/api/docs`

---

## 1) Быстрый запуск

### 1.1 Подготовка `.env`

Linux/macOS:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Откройте `.env` и обязательно проверьте:
- `JWT_SECRET` (замените на случайную строку)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

### 1.2 Запуск

```bash
docker compose up --build
```

или:

- Linux/macOS: `./scripts/dev-up.sh`
- Windows PowerShell: `./scripts/dev-up.ps1`

---

## 2) Проверка, что всё поднялось

Откройте:
- http://localhost:8080
- http://localhost:8080/api/docs
- http://localhost:8080/api/v1/health

Проверка health в терминале:

```bash
curl http://localhost:8080/api/v1/health
```

Ожидаемый ответ:

```json
{"status":"OK"}
```

---

## 3) Проверка Auth (очень пошагово)

Ниже команды для Linux/macOS (bash). Для PowerShell JSON можно отправить через Postman/Insomnia или `Invoke-RestMethod`.

### 3.1 Логин админом

> На старте API автоматически создаёт ADMIN из `.env` (`ADMIN_EMAIL` + `ADMIN_PASSWORD`).

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"change_me_please"}'
```

Ожидаемый результат:
- В ответе есть `access_token`, `refresh_token`, `user.role = "ADMIN"`.

### 3.2 Обновление access-token

Подставьте ваш refresh token:

```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"<ВАШ_REFRESH_TOKEN>"}'
```

Ожидаемый результат:
- Новый `access_token`.

### 3.3 Создание врача (только ADMIN)

Подставьте access token администратора:

```bash
curl -X POST http://localhost:8080/api/v1/auth/register-doctor \
  -H "Authorization: Bearer <ВАШ_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"doctor1@example.com",
    "password":"doctor123",
    "full_name":"Dr. John Doe",
    "specialty":"Cardiology",
    "phone":"+123456789"
  }'
```

Ожидаемый результат:
- Объект пользователя с `role = "DOCTOR"`.

### 3.4 Логин под врачом

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor1@example.com","password":"doctor123"}'
```

Ожидаемый результат:
- Возвращаются токены и `user.role = "DOCTOR"`.

---

## 4) Частые ошибки и решения

### Ошибка: `docker: command not found`
- Установите Docker Desktop/Engine.
- Перезапустите терминал.

### Ошибка: `401 Invalid email or password`
- Проверьте `ADMIN_EMAIL`/`ADMIN_PASSWORD` в `.env`.
- Если меняли `.env` после первого запуска, перезапустите контейнеры:
  ```bash
  docker compose down -v
  docker compose up --build
  ```

### Ошибка: `403 Admin role required` при `register-doctor`
- Вы используете токен не администратора.
- Выполните логин под ADMIN и возьмите новый access token.

### Swagger не открывается
- Проверьте статус контейнеров:
  ```bash
  docker compose ps
  docker compose logs api --tail=200
  docker compose logs nginx --tail=200
  ```

---

## 5) Полезные команды

Остановить:

```bash
docker compose down
```

Остановить + удалить данные БД:

```bash
docker compose down -v
```

---

## 6) Что делаем дальше

Следующий шаг: `patients` и `profiles` (CRUD, валидация, camelCase JSON, импорт/экспорт совместимый с мобильным приложением).
