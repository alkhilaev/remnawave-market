.PHONY: help up up-follow down reload reload-follow logs logs-app logs-bot logs-front clean

help: ## Показать список доступных команд
	@echo ""
	@echo "📘 Команды Makefile:"
	@echo ""
	@grep -E '^[a-zA-Z0-9_-]+:.*?##' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
	@echo ""

up: ## Поднять все контейнеры (detached)
	@echo "🚀 Поднимаем backend..."
	docker compose up -d --build
	@echo "🤖 Поднимаем bot..."
	cd bot && docker compose up -d --build
	@echo "🌐 Поднимаем frontend..."
	cd frontend && docker compose up -d --build
	@echo "📡 Логи всех контейнеров..."
	docker compose logs -f app & cd bot && docker compose logs -f & cd frontend && docker compose logs -f

up-follow: ## Поднять все контейнеры с логами
	@echo "📡 Поднимаем backend, bot и frontend (в консоли)..."
	docker compose up --build &
	cd bot && docker compose up --build &
	cd frontend && docker compose up --build

down: ## Остановить и удалить все контейнеры
	@echo "🌐 Останавливаем frontend..."
	cd frontend && docker compose down || true
	@echo "🤖 Останавливаем bot..."
	cd bot && docker compose down || true
	@echo "🛑 Останавливаем backend..."
	docker compose down

reload: ## Перезапустить все контейнеры (detached)
	@$(MAKE) down
	@$(MAKE) up

reload-follow: ## Перезапустить все контейнеры с логами
	@$(MAKE) down
	@$(MAKE) up-follow

logs: ## Показать логи всех контейнеров
	@echo "📡 Логи всех контейнеров..."
	docker compose logs -f &
	cd bot && docker compose logs -f &
	cd frontend && docker compose logs -f

logs-app: ## Показать логи backend
	@echo "📱 Логи backend..."
	docker compose logs -f app

logs-bot: ## Показать логи бота
	@echo "🤖 Логи бота..."
	cd bot && docker compose logs -f bot

logs-front: ## Показать логи frontend
	@echo "🌐 Логи frontend..."
	cd frontend && docker compose logs -f frontend

clean: ## Удалить все контейнеры и volumes
	@echo "🌐 Удаляем frontend..."
	cd frontend && docker compose down -v || true
	@echo "🤖 Удаляем bot..."
	cd bot && docker compose down -v || true
	@echo "🗑️  Удаляем backend..."
	docker compose down -v
