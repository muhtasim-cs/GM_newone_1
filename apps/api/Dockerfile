# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/

RUN npm ci --workspace=apps/api

COPY apps/api/ ./apps/api/
COPY turbo.json ./
COPY package.json ./

RUN npx turbo run build --filter=api

# ── Stage 2: Production ────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache libc6-compat tini

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/

USER nestjs

EXPOSE 3001

ENTRYPOINT ["tini", "--"]
CMD ["node", "apps/api/dist/main.js"]
