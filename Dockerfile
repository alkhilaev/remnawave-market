# ==========================================
# Development Stage (для разработки с hot reload)
# ==========================================
FROM node:20-alpine AS development

# Устанавливаем системные зависимости (OpenSSL для Prisma)
RUN apk add --no-cache openssl libc6-compat

# Устанавливаем pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json pnpm-workspace.yaml .npmrc ./
COPY prisma ./prisma/

# Устанавливаем все зависимости (включая dev)
RUN pnpm install

# Копируем весь остальной код
COPY . .

# Генерируем Prisma Client
RUN pnpm prisma generate

# Открываем порты
EXPOSE 3000
EXPOSE 9229

# Запускаем в режиме разработки с hot reload
CMD ["pnpm", "run", "start:dev"]

# ==========================================
# Build Stage (для сборки приложения)
# ==========================================
FROM node:20-alpine AS builder

# Устанавливаем системные зависимости (OpenSSL для Prisma)
RUN apk add --no-cache openssl libc6-compat

# Устанавливаем pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json pnpm-workspace.yaml .npmrc ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN pnpm install

# Копируем исходный код
COPY . .

# Генерируем Prisma Client
RUN pnpm prisma generate

# Собираем приложение
RUN pnpm run build

# ==========================================
# Production Stage (для продакшена)
# ==========================================
FROM node:20-alpine AS production

# Устанавливаем системные зависимости (OpenSSL для Prisma)
RUN apk add --no-cache openssl libc6-compat

# Устанавливаем pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json pnpm-workspace.yaml .npmrc ./
COPY prisma ./prisma/

# Устанавливаем только production зависимости
RUN pnpm install --prod

# Генерируем Prisma Client
RUN pnpm prisma generate

# Копируем собранное приложение из builder stage
COPY --from=builder /app/dist ./dist

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["pnpm", "run", "start:prod"]
