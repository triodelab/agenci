import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { Toaster } from "@workspace/ui/components/sonner";
import "../index.css";
import { authClient, type Session } from "@/lib/auth-client";
import type { orpc } from "@/lib/api";
import { useTheme } from "@/lib/theme";

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
  const { resolved } = useTheme();
  return (
    <>
      <Outlet />
      <Toaster richColors theme={resolved} />
    </>
  );
}
