# Health_Backend — запуск «одной кнопкой»

Вы правы: нужно, чтобы запускалось «нажал и работает». Исправил.

Что важно:
- устранена ошибка `bcrypt` при старте (зафиксирована совместимая версия `bcrypt==4.0.1`),
- сохранение БД вынесено в отдельный volume `/app/data`,
- one-click скрипт поднимает контейнер и ждёт health-status `healthy`.

## 1) Запуск одной кнопкой

### Linux / macOS

```bash
./scripts/one-click-start.sh
```

### Windows PowerShell

```powershell
./scripts/one-click-start.ps1
```

После `✅ Ready` открывайте:
- http://localhost:8080
- http://localhost:8080/api/docs
- http://localhost:8080/api/v1/health

---

## 2) Если был старый упавший контейнер (рекомендую выполнить один раз)

```bash
docker rm -f health-backend || true
docker volume rm health_backend_data || true
```

Потом снова:

```bash
./scripts/one-click-start.sh
```

> Это очистит старое состояние и гарантированно стартанёт на новой версии.

---

## 3) Настройка админа (опционально)

### Linux/macOS

```bash
export JWT_SECRET='super_secret'
export ADMIN_EMAIL='admin@example.com'
export ADMIN_PASSWORD='my_strong_password'
export ADMIN_FULL_NAME='System Admin'
./scripts/one-click-start.sh
```

### Windows PowerShell

```powershell
$env:JWT_SECRET='super_secret'
$env:ADMIN_EMAIL='admin@example.com'
$env:ADMIN_PASSWORD='my_strong_password'
$env:ADMIN_FULL_NAME='System Admin'
./scripts/one-click-start.ps1
```

---

## 4) Проверка авторизации

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"my_strong_password"}'
```

Если пароль не задавали, используйте `change_me_please`.

---

## 5) Остановка

### Linux / macOS

```bash
./scripts/one-click-stop.sh
```

### Windows PowerShell

```powershell
./scripts/one-click-stop.ps1
```

---

## 6) Что именно сломалось у вас и что исправлено

У вас падало на старте с ошибкой passlib/bcrypt (`module 'bcrypt' has no attribute '__about__'`).
Причина: несовместимая версия `bcrypt`.
Исправление в проекте:
- добавлен явный пин `bcrypt==4.0.1` в `backend/requirements.txt`.

Также улучшено:
- в Dockerfile удалены секреты из `ENV` (меньше предупреждений Docker),
- SQLite хранится в `/app/data/health.db` (персистентно и без перетирания кода).


## Почему на `localhost:8080` раньше казалось «пусто»

Это была минимальная стартовая заглушка фронтенда (один экран с текстом), поэтому визуально казалось, что приложение «пустое».
Сейчас стартовая страница показывает:
- live-статус `GET /api/v1/health`,
- быстрые ссылки на Swagger и health endpoint,
- форму быстрого теста входа (`/api/v1/auth/login`).

Если вы видите старую страницу, перезапустите one-click скрипт, чтобы пересобрать образ:

```bash
./scripts/one-click-start.sh
```


## Новый макет Dashboard

Добавлен кликабельный UI в стиле вашего макета:
- левое меню (`Dashboard`, `Patients`, `Chat`, `FAQ`, `Settings`),
- верхняя панель поиска и профиль,
- KPI-карточки,
- блоки `Alerts`, `Recent Activity`, `Unread Chats`, `Quick Actions`,
- переключатель light/dark темы.

Чтобы увидеть новую страницу, обязательно пересоберите и перезапустите:

```bash
./scripts/one-click-start.sh
```
