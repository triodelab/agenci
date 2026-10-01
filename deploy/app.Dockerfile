# Static front-ends served by Caddy, which also terminates HTTPS and proxies
# the API on the dashboard's origin — so auth cookies stay first-party.
#   app.agenci.no     dashboard (+ /rpc /api /ws → server)
#   widget.agenci.no  chat widget + embed script (widget.iife.js)
FROM oven/bun:1.4 AS build
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile

ENV VITE_WIDGET_PREVIEW_ORIGIN=https://widget.agenci.no
ENV VITE_WIDGET_EMBED_SCRIPT_URL=https://widget.agenci.no/widget.iife.js
RUN cd apps/dashboard && bunx vite build

ENV NEXT_PUBLIC_SERVER_URL=https://app.agenci.no
ENV VITE_DASHBOARD_URL=https://app.agenci.no
RUN cd apps/widget && bunx vite build

ENV VITE_WIDGET_URL=https://widget.agenci.no
RUN cd apps/embed && bunx vite build

FROM caddy:2
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/apps/dashboard/dist /srv/app
COPY --from=build /app/apps/widget/dist /srv/widget
COPY --from=build /app/apps/embed/dist/widget.iife.js /srv/widget/widget.iife.js
