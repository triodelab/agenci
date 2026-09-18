/**
 * Agenci React dashboard (TanStack Router).
 * Port 3004 — web=3000, widget=3001, embed=3002, server=3003.
 *
 * `/api`, `/rpc` and `/ws` are proxied to the Hono server so Better Auth
 * cookies stay first-party on the dashboard origin.
 */
import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const serverUrl =
  process.env.VITE_SERVER_URL?.replace(/\/$/, "") || "http://127.0.0.1:3003";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(rootDir, "src"),
      "#": path.join(rootDir, "src"),
    },
  },
  server: {
    port: 3004,
    proxy: {
      "/api": {
        target: serverUrl,
        changeOrigin: true,
      },
      "/rpc": {
        target: serverUrl,
        changeOrigin: true,
      },
      "/ws": {
        target: serverUrl,
        changeOrigin: true,
        ws: true,
      },
    },
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    viteReact(),
  ],
});
