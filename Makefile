.PHONY: help up upf down reload reloadf logs clean \
	up-app upf-app down-app reload-app reloadf-app logs-app \
	up-bot upf-bot down-bot reload-bot reloadf-bot logs-bot \
	up-front upf-front down-front reload-front reloadf-front logs-front

help:
	@echo ""
	@echo "📘 Команды Makefile:"
	@echo ""
	@echo "  \033[33m── Все контейнеры ──\033[0m"
	@echo "  \033[36mup              \033[0m Поднять все"
	@echo "  \033[36mupf             \033[0m Поднять все + логи"
	@echo "  \033[36mdown            \033[0m Остановить все"
	@echo "  \033[36mreload          \033[0m Перезапустить все"
	@echo "  \033[36mreloadf         \033[0m Перезапустить все + логи"
	@echo "  \033[36mlogs            \033[0m Логи всех контейнеров"
	@echo "  \033[36mclean           \033[0m Удалить все контейнеры и volumes"
	@echo ""
	@echo "  \033[33m── Backend ──\033[0m"
	@echo "  \033[36mup-app          \033[0m Поднять backend"
	@echo "  \033[36mupf-app         \033[0m Поднять backend + логи"
	@echo "  \033[36mdown-app        \033[0m Остановить backend"
	@echo "  \033[36mreload-app      \033[0m Перезапустить backend"
	@echo "  \033[36mreloadf-app     \033[0m Перезапустить backend + логи"
	@echo "  \033[36mlogs-app        \033[0m Логи backend"
	@echo ""
	@echo "  \033[33m── Bot ──\033[0m"
	@echo "  \033[36mup-bot          \033[0m Поднять бота"
	@echo "  \033[36mupf-bot         \033[0m Поднять бота + логи"
	@echo "  \033[36mdown-bot        \033[0m Остановить бота"
	@echo "  \033[36mreload-bot      \033[0m Перезапустить бота"
	@echo "  \033[36mreloadf-bot     \033[0m Перезапустить бота + логи"
	@echo "  \033[36mlogs-bot        \033[0m Логи бота"
	@echo ""
	@echo "  \033[33m── Frontend ──\033[0m"
	@echo "  \033[36mup-front        \033[0m Поднять frontend"
	@echo "  \033[36mupf-front       \033[0m Поднять frontend + логи"
	@echo "  \033[36mdown-front      \033[0m Остановить frontend"
	@echo "  \033[36mreload-front    \033[0m Перезапустить frontend"
	@echo "  \033[36mreloadf-front   \033[0m Перезапустить frontend + логи"
	@echo "  \033[36mlogs-front      \033[0m Логи frontend"
	@echo ""

# ─── Все контейнеры ───

up:
	@echo "🚀 Поднимаем backend..."
	@docker compose up -d --build
	@echo "🤖 Поднимаем bot..."
	@cd bot && docker compose up -d --build
	@echo "🌐 Поднимаем frontend..."
	@cd frontend && docker compose up -d --build
	@echo "✅ Все контейнеры запущены"

upf:
	@$(MAKE) up
	@$(MAKE) logs

down:
	@echo "🌐 Останавливаем frontend..."
	@cd frontend && docker compose down || true
	@echo "🤖 Останавливаем bot..."
	@cd bot && docker compose down || true
	@echo "🛑 Останавливаем backend..."
	@docker compose down
	@echo "✅ Все контейнеры остановлены"

reload:
	@$(MAKE) down
	@$(MAKE) up

reloadf:
	@$(MAKE) down
	@$(MAKE) upf

logs:
	@docker compose logs -f &
	@cd bot && docker compose logs -f &
	@cd frontend && docker compose logs -f

clean:
	@echo "🌐 Удаляем frontend..."
	@cd frontend && docker compose down -v || true
	@echo "🤖 Удаляем bot..."
	@cd bot && docker compose down -v || true
	@echo "🗑️  Удаляем backend..."
	@docker compose down -v
	@echo "✅ Все удалено"

# ─── Backend ───

up-app:
	@echo "🚀 Поднимаем backend..."
	@docker compose up -d --build
	@echo "✅ Backend запущен"

upf-app:
	@$(MAKE) up-app
	@$(MAKE) logs-app

down-app:
	@echo "🛑 Останавливаем backend..."
	@docker compose down

reload-app:
	@$(MAKE) down-app
	@$(MAKE) up-app

reloadf-app:
	@$(MAKE) down-app
	@$(MAKE) upf-app

logs-app:
	@docker compose logs -f app

# ─── Bot ───

up-bot:
	@echo "🤖 Поднимаем bot..."
	@cd bot && docker compose up -d --build
	@echo "✅ Bot запущен"

upf-bot:
	@$(MAKE) up-bot
	@$(MAKE) logs-bot

down-bot:
	@echo "🤖 Останавливаем bot..."
	@cd bot && docker compose down || true

reload-bot:
	@$(MAKE) down-bot
	@$(MAKE) up-bot

reloadf-bot:
	@$(MAKE) down-bot
	@$(MAKE) upf-bot

logs-bot:
	@cd bot && docker compose logs -f bot

# ─── Frontend ───

up-front:
	@echo "🌐 Поднимаем frontend..."
	@cd frontend && docker compose up -d --build
	@echo "✅ Frontend запущен"

upf-front:
	@$(MAKE) up-front
	@$(MAKE) logs-front

down-front:
	@echo "🌐 Останавливаем frontend..."
	@cd frontend && docker compose down || true

reload-front:
	@$(MAKE) down-front
	@$(MAKE) up-front

reloadf-front:
	@$(MAKE) down-front
	@$(MAKE) upf-front

logs-front:
	@cd frontend && docker compose logs -f frontend
