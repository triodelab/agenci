# Hono API. Runs on Bun (the server uses Bun APIs such as Bun's S3Client).
FROM oven/bun:1.4
WORKDIR /app

# prisma generate needs a DATABASE_URL at build time; the real one comes from compose.
ENV SKIP_ENV_VALIDATION=1
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build

COPY . .
RUN bun install --frozen-lockfile && bun --filter @agenci/db db:generate

ENV SKIP_ENV_VALIDATION=
ENV NODE_ENV=production
WORKDIR /app/apps/server
EXPOSE 3003
CMD ["bun", "src/index.ts"]
