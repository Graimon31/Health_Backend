# Health Backend — Шаг 0. Предполётная проверка

## Глоссарий простыми словами
- **Docker** — программа, которая запускает готовые "коробочки" (контейнеры) с приложениями.
- **Контейнер** — изолированная мини-среда, в которой крутится часть сервиса (БД, бекенд, фронтенд).
- **Образ** — шаблон контейнера. Из образа запускаем контейнеры.
- **Порт** — номер "двери" в компьютере. Например, 8080 — вход для веб-сервера.
- **`.env` файл** — текстовый файл с секретами/настройками. Не коммитим в git.
- **Миграция** — инструкция, как изменить структуру БД (создать таблицу, добавить поле и т.д.).
- **JWT** — токен, которым бекенд подтверждает личность пользователя.
- **WebSocket (WS)** — постоянное соединение для мгновенного чата.

## Что установить перед началом
1. **Docker Desktop**
   - Windows: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/) → скачать → Next → перезагрузка.
   - macOS (Apple Silicon/Intel): тот же сайт → выбрать версию → перетащить в `Applications`.
   - Linux: следуем официальной инструкции [docs.docker.com/engine/install](https://docs.docker.com/engine/install/).
   - *Ожидаемый результат*: иконка Docker включена, `docker --version` показывает версию (см. проверку ниже).

2. **Node.js LTS (для фронта)**
   - Windows/macOS: [https://nodejs.org/](https://nodejs.org/) → кнопка "LTS" → установить.
   - Linux: `nvm` либо пакетный менеджер (`sudo apt install nodejs npm`).
   - *Ожидаемый результат*: `node -v` ~ `v18.x` или `v20.x`.

3. **Git**
   - Windows: [https://git-scm.com/download/win](https://git-scm.com/download/win).
   - macOS: `xcode-select --install` или [https://git-scm.com/download/mac](https://git-scm.com/download/mac).
   - Linux: `sudo apt install git` (или пакетный менеджер).
   - *Ожидаемый результат*: `git --version` показывает номер версии.

## Проверяем, что всё работает
Выполняем команды в терминале (PowerShell / Terminal / Bash).

| Операция | Windows PowerShell | macOS / Linux | Ожидаемый результат |
| --- | --- | --- | --- |
| Проверить Docker | `docker --version` | `docker --version` | строка вида `Docker version 24.x` |
| Проверить Node | `node -v` | `node -v` | строка `v18.x` или `v20.x` |
| Проверить npm | `npm -v` | `npm -v` | номер версии `9.x` или `10.x` |
| Проверить Git | `git --version` | `git --version` | строка `git version ...` |

## Готовим рабочее место проекта
1. **Клонировать репозиторий**
   - Windows PowerShell: `git clone <URL_репо> && cd Health_Backend`
   - macOS/Linux: `git clone <URL_репо> && cd Health_Backend`
   - *Ожидаемый результат*: папка `Health_Backend` открыта, команда `ls`/`dir` показывает её содержимое.

2. **Проверить, что порты свободны**
   - Windows PowerShell: `netstat -ano | findstr 5432`, `findstr 8000`, `findstr 8080`
   - macOS/Linux: `lsof -i :5432`, `lsof -i :8000`, `lsof -i :8080`
   - *Ожидаемый результат*: команда не показывает занятых процессов. Если порт занят — записать PID, остановить процесс.

3. **Сгенерировать JWT_SECRET**
   - Windows PowerShell: `[guid]::NewGuid().ToString()` → получить строку.
   - macOS/Linux: `openssl rand -hex 32`
   - *Ожидаемый результат*: длинная строка (ключ), сохраняем временно, потом добавим в `.env`.

4. **Подготовить структуру папок проекта**
   - Ничего не запускаем, а просто смотрим на готовую структуру (создана в репозитории):

```
backend/
  app/
  alembic/
    versions/
  tests/
web/
  src/
  public/
scripts/
```
   - *Ожидаемый результат*: команда `tree -L 3` (macOS/Linux) или `Get-ChildItem -Recurse` (Windows) показывает указанную структуру.

5. **Создать личный `.env` (позже)**
   - Пока пропускаем, потому что значения появятся на Шаге 1. Здесь просто убедитесь, что знаете свой JWT_SECRET и есть свободные порты.

## Следующие шаги
- На Шаге 1 добавим `docker-compose.yml`, Nginx и каркас бекенда/фронтенда.
- Подготовьте экспорт мобильного профиля `health_profile_sample.json` (если нет — создадим шаблон позже).

Готово! После выполнения этих действий можно переходить к Шагу 1.
