# =========================================
# Stage 1: Dependencies
# =========================================
FROM node:20-alpine AS dependencies

# Включаем pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Копируем конфиг и зависимости
COPY .npmrc package.json ./

# Устанавливаем ВСЕ зависимости
RUN pnpm install

# =========================================
# Stage 2: Builder
# =========================================
FROM node:20-alpine AS builder

# Включаем pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Копируем node_modules из dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Копируем package.json и конфиг
COPY .npmrc package.json ./

# Копируем исходный код
COPY . .

# Собираем проект
RUN pnpm run build

# =========================================
# Stage 3: Production
# =========================================
FROM node:20-alpine AS production

# Включаем pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Копируем конфиг и package.json
COPY .npmrc package.json ./

# Устанавливаем только production зависимости
RUN pnpm install --prod

# Копируем собранные файлы из builder
COPY --from=builder /app/dist ./dist

# Создаём пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

CMD ["node", "dist/index.js"]
