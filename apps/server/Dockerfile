FROM oven/bun:1.4 AS builder
WORKDIR /app
ENV SKIP_ENV_VALIDATION=1
# prisma generate resolves DATABASE_URL at install time; the real value comes from compose at runtime
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build

COPY . .
RUN bun install --frozen-lockfile

ENV NODE_ENV=production
RUN cd apps/server && bun run build

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app

EXPOSE 3000

WORKDIR /app/apps/server
CMD ["node", "dist/index.mjs"]
