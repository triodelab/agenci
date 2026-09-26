# Agenci dashboard (React + TanStack Router)

Part of the Bun/Turborepo monorepo. Dev server: **http://localhost:3004**

## Run

From repo root:

```bash
bun install
bun --filter dashboard dev
# or
bun dev:dashboard
```

Requires the Hono API for auth (`bun --filter server dev` on `:3003`).

## Ports

| App | Port |
|-----|------|
| web (Next) | 3000 |
| widget | 3001 |
| embed | 3002 |
| backend (Elysia) | 3003 |
| **dashboard (React)** | **3004** |

## Auth

`src/lib/auth-client.ts` uses Better Auth (`better-auth/react`). Vite proxies `/api/auth`, `/rpc`, and `/ws` to `VITE_SERVER_URL` (default `http://127.0.0.1:3003`).
