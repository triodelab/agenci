/**
 * Agenci widget (embeddable chat) — plain Vite + React SPA.
 * Migrated off Next.js: iframe-embedded, client-only, no routing/SSR needed.
 * Ports: web=3000, widget=3001, embed=3002, server=3003, dashboard=3004.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(rootDir, "src"),
    },
  },
  server: {
    port: 3001,
  },
  preview: {
    port: 3001,
  },
  // This repo's .env files use the NEXT_PUBLIC_ prefix everywhere (server, web,
  // widget) — widen Vite's prefix instead of renaming every .env in the monorepo.
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  plugins: [tailwindcss(), viteReact()],
});
