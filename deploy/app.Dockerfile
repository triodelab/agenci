# Dashboard (static build) served by Caddy, which also terminates HTTPS and
# proxies the API on the same origin — so auth cookies stay first-party.
FROM oven/bun:1.4 AS build
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN cd apps/dashboard && bunx vite build

FROM caddy:2
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/apps/dashboard/dist /srv/app
