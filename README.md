# Health_Backend

Врачебный веб-сервис для мониторинга здоровья, совместимый с мобильным приложением Health_Codex.

## Что включено

*   **Backend**: FastAPI, PostgreSQL, SQLAlchemy, Alembic, WebSocket.
*   **Frontend**: React, TypeScript, Vite, Material UI, Recharts.
*   **DevOps**: Docker Compose, Nginx.

## Быстрый старт (для новичков)

Этот проект настроен для запуска одной командой. Вам понадобятся установленные Docker и Docker Compose.

### Windows / macOS / Linux

1.  **Создайте файл окружения**:
    Скопируйте пример настроек.
    ```bash
    cp .env.example .env
    ```
    *Внутри `.env` можно поменять пароли, но для локальной разработки стандартные подойдут.*

2.  **Запустите проект**:
    ```bash
    docker compose up --build
    ```
    *Первый запуск займет время (скачивание образов и сборка).*
    *Бэкенд автоматически применит миграции базы данных.*

3.  **Проверьте работу**:
    *   **Врачебная панель (Frontend)**: http://localhost:8080
    *   **API Документация (Swagger)**: http://localhost:8080/api/docs
    *   **Проверка здоровья API**: http://localhost:8080/api/v1/health

### Пользователи по умолчанию (Demo Seed)

Если `DEMO_SEED=true` в `.env` (по умолчанию), при запуске будут созданы:
*   **Admin**: `admin@example.com` / `admin`
*   **Doctor**: `doctor@example.com` / `doctor`

### Полезные команды

*   **Остановить все**: `Ctrl+C` в терминале или `docker compose down`
*   **Очистить базу данных**: `docker compose down -v`
*   **Перезапустить только бэкенд**: `docker compose restart api`
*   **Создать новую миграцию** (если вы меняли модели):
    ```bash
    docker compose exec api alembic revision --autogenerate -m "description"
    ```

## Структура API

*   `/api/v1/auth`: Логин, Регистрация.
*   `/api/v1/patients`: Управление пациентами и профилями.
*   `/api/v1/mobile`: Импорт/Экспорт профилей (JSON совместимый с мобильным приложением).
*   `/api/v1/chat`: REST API чата + WebSocket `/api/v1/ws/chat`.
*   `/api/v1/measurements`: Измерения (пульс, давление) и аналитика.
*   `/api/v1/faq`: FAQ.

## Разработка Frontend

Фронтенд находится в папке `web/`.
Для локальной разработки без Docker (если нужно):
```bash
cd web
npm install
npm run dev
```
(Не забудьте настроить прокси или CORS для доступа к бэкенду).

## Тестирование

```bash
docker compose exec api pytest
```
