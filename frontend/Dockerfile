# ==========================================
# Build
# ==========================================
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

COPY .npmrc package.json ./

RUN pnpm install

COPY . .

RUN pnpm run build

# ==========================================
# Production
# ==========================================
FROM node:22-alpine AS production

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

COPY --from=builder /app/.output ./.output

USER nodejs

EXPOSE 3001

ENV HOST=0.0.0.0
ENV PORT=3001

CMD ["node", ".output/server/index.mjs"]
