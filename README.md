# Health Backend — Шаг 0. Предполётная проверка (для новичка)

Этот документ нужен, чтобы **без ошибок подготовить компьютер** к запуску проекта на следующем шаге (`docker compose up --build`).

---

## 1) Глоссарий (очень простыми словами)

- **Docker** — программа, которая запускает сервисы в изолированных контейнерах.
- **Контейнер** — «коробка» с уже настроенной средой (например, PostgreSQL или API).
- **Образ (image)** — шаблон контейнера.
- **Порт** — номер сетевой «двери» (в проекте используем `5432`, `8000`, `8080`).
- **`.env`** — файл с переменными окружения (секреты и настройки).
- **Миграция БД** — версия изменений структуры базы данных.
- **JWT** — токен авторизации пользователя.
- **WebSocket (WS)** — постоянный канал связи для чата в реальном времени.

---

## 2) Что нужно установить

> Делайте по порядку: Docker → Node.js → Git.

### 2.1 Docker Desktop

#### Windows
1. Откройте сайт: https://www.docker.com/products/docker-desktop/
2. Нажмите **Download for Windows**.
3. Запустите установщик, оставьте настройки по умолчанию, нажмите **Install**.
4. После установки перезагрузите ПК (если попросит).
5. Запустите Docker Desktop из меню Пуск.

**Ожидаемый результат:** в трее есть иконка Docker, статус `Engine running`.

#### macOS
1. Откройте сайт: https://www.docker.com/products/docker-desktop/
2. Выберите версию для вашего CPU (Apple Silicon или Intel).
3. Установите Docker Desktop в `Applications`.
4. Запустите приложение и дайте разрешения системе.

**Ожидаемый результат:** в верхней панели macOS видна иконка Docker без ошибок.

#### Linux
Используйте официальную инструкцию для вашего дистрибутива: https://docs.docker.com/engine/install/

**Ожидаемый результат:** команда `docker --version` выполняется без ошибки.

---

### 2.2 Node.js LTS

- Сайт: https://nodejs.org/
- Скачайте версию **LTS** (не Current).

**Ожидаемый результат:** команды `node -v` и `npm -v` показывают версии.

---

### 2.3 Git

- Сайт: https://git-scm.com/downloads
- Установите с настройками по умолчанию.

**Ожидаемый результат:** команда `git --version` показывает версию Git.

---

## 3) Проверка, что всё установилось

Откройте терминал:
- **Windows:** PowerShell
- **macOS/Linux:** Terminal

Выполните команды:

```bash
docker --version
node -v
npm -v
git --version
```

**Ожидаемый результат:**
- нет сообщений `command not found`
- выводятся версии всех 4 инструментов

---

## 4) Подготовка проекта локально

### 4.1 Клонировать репозиторий

```bash
git clone <URL_ВАШЕГО_РЕПО>
cd Health_Backend
```

**Ожидаемый результат:** команда `pwd` (или `Get-Location`) указывает на папку `Health_Backend`.

---

### 4.2 Проверить, что нужные порты свободны

Нужно, чтобы были свободны:
- PostgreSQL: `5432`
- API: `8000`
- Nginx: `8080`

#### Windows PowerShell
```powershell
netstat -ano | findstr :5432
netstat -ano | findstr :8000
netstat -ano | findstr :8080
```

#### macOS / Linux
```bash
lsof -i :5432
lsof -i :8000
lsof -i :8080
```

**Ожидаемый результат:** пустой вывод (или нет строк LISTEN на этих портах).

Если порт занят:
- Windows: `taskkill /PID <PID> /F`
- macOS/Linux: `kill -9 <PID>`

---

### 4.3 Сгенерировать JWT_SECRET (понадобится на Шаге 1)

#### Windows PowerShell
```powershell
[guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
```

#### macOS / Linux
```bash
openssl rand -hex 32
```

Сохраните результат в заметки/менеджер паролей.

**Ожидаемый результат:** длинная строка без пробелов (пример: `f6f9...`).

---

### 4.4 Проверить структуру папок проекта

```bash
# macOS/Linux
find . -maxdepth 3 -type d | sort

# Windows PowerShell
Get-ChildItem -Directory -Recurse -Depth 3 | Select-Object FullName
```

Должны существовать ключевые директории:

```text
backend/
backend/app/
backend/alembic/
backend/alembic/versions/
backend/tests/
web/
web/src/
web/public/
scripts/
```

**Ожидаемый результат:** все директории из списка присутствуют.

---

## 5) Что подготовить заранее от пользователя

1. **`health_profile_sample.json`** (экспорт из мобильного приложения).
   - Если файла пока нет — на Шаге 4 сделаем временный шаблон.
2. **Значения для `.env`**:
   - `JWT_SECRET` (вы уже сгенерировали)
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `CORS_ORIGINS`
   - `DATABASE_URL` (для docker-compose дадим готовый вариант на следующем шаге)
3. **Домен для продакшена** (если нет — используем `localhost`).
4. **Цвета/логотип бренда** (если нет — оставим стандартную MUI-тему).

---

## 6) Быстрый self-check (перед Шагом 1)

- [ ] Docker установлен и запущен
- [ ] Node.js LTS установлен
- [ ] Git установлен
- [ ] Порты 5432/8000/8080 свободны
- [ ] Репозиторий склонирован
- [ ] JWT_SECRET сгенерирован и сохранён

Если все пункты отмечены — можно переходить к **Шагу 1 (каркас: docker-compose + nginx + backend + web)**.
