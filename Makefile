.PHONY: help install dev build start stop restart clean \
	prisma-generate prisma-migrate prisma-migrate-deploy prisma-studio prisma-seed \
	docker-dev-build docker-dev-up docker-dev-down docker-dev-logs docker-dev-logs-app docker-dev-reload \
	docker-build docker-up docker-down docker-logs docker-reload docker-clean \
	test test-watch test-cov test-e2e lint format setup dev-full db-reset db-push

help: ## Показать список доступных команд
	@echo ""
	@echo "📘 Команды Makefile для Remnawave Market:"
	@echo ""
	@grep -E '^[a-zA-Z0-9_-]+:.*?##' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-24s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ==========================================
# Установка и запуск
# ==========================================

install: ## 📦 Установить зависимости
	@echo "📦 Устанавливаем зависимости..."
	pnpm install

dev: ## 🚀 Запустить dev сервер (локально)
	@echo "🚀 Запускаем dev сервер..."
	pnpm run start:dev

build: ## 🔨 Собрать приложение
	@echo "🔨 Собираем приложение..."
	pnpm run build

start: ## ▶️  Запустить production сервер (требует сборки)
	@echo "▶️  Запускаем production сервер..."
	pnpm run start:prod

stop: ## ⏹️  Остановить приложение
	@echo "⏹️  Останавливаем приложение..."
	pkill -f "node dist/main" || true

restart: stop start ## 🔄 Перезапустить приложение

clean: ## 🧹 Очистить сборку и зависимости
	@echo "🧹 Очищаем..."
	rm -rf dist node_modules coverage .pnpm-store

# ==========================================
# Prisma команды
# ==========================================

prisma-generate: ## 🔧 Сгенерировать Prisma Client
	@echo "🔧 Генерируем Prisma Client..."
	pnpm prisma generate

prisma-migrate: ## 🗄️  Применить миграции БД (dev)
	@echo "🗄️  Применяем миграции БД..."
	pnpm prisma migrate dev

prisma-migrate-deploy: ## 🚀 Применить миграции БД (production)
	@echo "🚀 Применяем миграции БД (production)..."
	pnpm prisma migrate deploy

prisma-studio: ## 🎨 Открыть Prisma Studio
	@echo "🎨 Открываем Prisma Studio..."
	pnpm prisma studio

prisma-seed: ## 🌱 Наполнить БД тестовыми данными
	@echo "🌱 Наполняем БД..."
	pnpm run prisma:seed

# ==========================================
# Docker команды - Разработка
# ==========================================

docker-dev-build: ## 🏗️  Собрать Docker образ (dev)
	@echo "🏗️  Собираем Docker образ для разработки..."
	docker compose -f docker-compose.dev.yml build

docker-dev-up: ## 🐳 Поднять контейнеры (dev, detached)
	@echo "🐳 Поднимаем контейнеры для разработки..."
	docker compose -f docker-compose.dev.yml up -d

docker-dev-down: ## 🛑 Остановить контейнеры (dev)
	@echo "🛑 Останавливаем контейнеры для разработки..."
	docker compose -f docker-compose.dev.yml down

docker-dev-logs: ## 📡 Показать логи контейнеров (dev)
	@echo "📡 Логи контейнеров для разработки..."
	docker compose -f docker-compose.dev.yml logs -f

docker-dev-logs-app: ## 📱 Показать логи приложения (dev)
	@echo "📱 Логи приложения..."
	docker compose -f docker-compose.dev.yml logs -f app

docker-dev-restart: ## ⚡ Быстрый рестарт приложения (без пересборки)
	@echo "⚡ Перезапускаем приложение..."
	docker compose -f docker-compose.dev.yml restart app

docker-dev-reload: docker-dev-down docker-dev-build docker-dev-up ## 🔄 Пересобрать и перезапустить (dev)

# ==========================================
# Docker команды - Production
# ==========================================

docker-build: ## 🏗️  Собрать Docker образ (prod)
	@echo "🏗️  Собираем Docker образ для production..."
	docker compose build

docker-up: ## 🐳 Поднять контейнеры (prod, detached)
	@echo "🐳 Поднимаем контейнеры для production..."
	docker compose up -d

docker-down: ## 🛑 Остановить контейнеры (prod)
	@echo "🛑 Останавливаем контейнеры..."
	docker compose down

docker-logs: ## 📡 Показать логи контейнеров (prod)
	@echo "📡 Логи контейнеров..."
	docker compose logs -f

docker-reload: docker-down docker-build docker-up ## 🔄 Пересобрать и перезапустить (prod)

docker-clean: ## 🗑️  Удалить контейнеры и volumes
	@echo "🗑️  Удаляем контейнеры и volumes..."
	docker compose down -v
	docker compose -f docker-compose.dev.yml down -v

# ==========================================
# Тестирование
# ==========================================

test: ## 🧪 Запустить тесты
	@echo "🧪 Запускаем тесты..."
	pnpm run test

test-watch: ## 👀 Запустить тесты (watch режим)
	@echo "👀 Запускаем тесты в watch режиме..."
	pnpm run test:watch

test-cov: ## 📊 Запустить тесты с coverage
	@echo "📊 Запускаем тесты с coverage..."
	pnpm run test:cov

test-e2e: ## 🔗 Запустить e2e тесты
	@echo "🔗 Запускаем e2e тесты..."
	pnpm run test:e2e

# ==========================================
# Качество кода
# ==========================================

lint: ## 🔍 Запустить линтер
	@echo "🔍 Запускаем линтер..."
	pnpm run lint

format: ## ✨ Форматировать код
	@echo "✨ Форматируем код..."
	pnpm run format

# ==========================================
# Утилиты
# ==========================================

setup: install prisma-generate ## ⚙️  Начальная настройка проекта
	@echo ""
	@echo "✅ Настройка проекта завершена!"
	@echo ""
	@echo "📝 Не забудьте:"
	@echo "  1️⃣  Скопировать .env.example в .env"
	@echo "  2️⃣  Обновить .env с вашими настройками"
	@echo "  3️⃣  Запустить 'make docker-dev-build' для сборки образа"
	@echo "  4️⃣  Запустить 'make docker-dev-up' для запуска в Docker"
	@echo "  5️⃣  Или 'make dev' для локального запуска"
	@echo ""

dev-full: docker-dev-build docker-dev-up ## 🚀 Запустить полное dev окружение в Docker

# ==========================================
# База данных
# ==========================================

db-reset: ## ⚠️  Сбросить БД (УДАЛИТ ВСЕ ДАННЫЕ!)
	@echo "⚠️  Сбрасываем БД..."
	pnpm prisma migrate reset --force

db-push: ## 🔧 Применить схему БД (без миграций, для прототипирования)
	@echo "🔧 Применяем схему БД..."
	pnpm prisma db push
