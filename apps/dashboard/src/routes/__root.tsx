import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { Toaster } from "@workspace/ui/components/sonner";
import "../index.css";
import { authClient, type Session } from "@/lib/auth-client";
import type { orpc } from "@/lib/api";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
  session: Session | null;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  beforeLoad: async () => {
    try {
      const { data } = await authClient.getSession();
      return { session: data ?? null };
    } catch {
      return { session: null };
    }
  },
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster richColors />
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  );
}
