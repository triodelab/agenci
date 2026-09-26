import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { createQueryClient, orpc } from "./lib/api";

const queryClient = createQueryClient();

export function getQueryClient() {
  return queryClient;
}

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    context: {
      orpc,
      queryClient,
      session: null,
    },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
