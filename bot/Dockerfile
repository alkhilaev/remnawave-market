# =========================================
# Stage 1: Base
# =========================================
FROM node:20-alpine AS base

# Устанавливаем pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# =========================================
# Stage 2: Dependencies
# =========================================
FROM base AS dependencies

# Копируем файлы зависимостей
COPY package.json pnpm-lock.yaml* ./

# Устанавливаем зависимости
RUN pnpm install --no-frozen-lockfile

# =========================================
# Stage 3: Development
# =========================================
FROM base AS development

WORKDIR /app

# Копируем node_modules из dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Копируем исходный код
COPY . .

# Порт не требуется (бот работает через polling)
# EXPOSE 3000

CMD ["pnpm", "run", "dev"]

# =========================================
# Stage 4: Builder
# =========================================
FROM base AS builder

WORKDIR /app

# Копируем node_modules и исходный код
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Собираем проект
RUN pnpm run build

# =========================================
# Stage 5: Production
# =========================================
FROM node:20-alpine AS production

# Устанавливаем pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Копируем только production зависимости
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --no-frozen-lockfile

# Копируем собранные файлы
COPY --from=builder /app/dist ./dist

# Создаём пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

CMD ["node", "dist/index.js"]
