.PHONY: up down standalone standalone-stop logs clean

# Запуск через docker-compose (PostgreSQL + API + Frontend + Nginx)
up:
	docker compose up --build -d
	@echo ""
	@echo "✅ Сервисы запущены!"
	@echo "   Приложение:  http://localhost:8080"
	@echo "   API docs:    http://localhost:8080/api/docs"
	@echo "   Health:      http://localhost:8080/api/v1/health"

# Остановка docker-compose
down:
	docker compose down

# Запуск standalone контейнера (всё-в-одном, SQLite)
standalone:
	./scripts/one-click-start.sh

# Остановка standalone
standalone-stop:
	./scripts/one-click-stop.sh

# Логи всех сервисов
logs:
	docker compose logs -f

# Полная очистка (контейнеры + volumes)
clean:
	docker compose down -v
	docker rm -f health-backend 2>/dev/null || true
	docker volume rm health_backend_data 2>/dev/null || true
	@echo "✅ Всё очищено"
