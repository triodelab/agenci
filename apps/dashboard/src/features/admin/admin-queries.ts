import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api";

/** Only Agenci's own developers get `admin: true` (checked on the server). */
export function useAdminAccess() {
  return useQuery({
    queryKey: ["admin", "access"],
    queryFn: () => client.admin.access(),
    staleTime: 5 * 60_000,
  });
}

/** Any admin read. Keys start with "admin" so every action refreshes them. */
export function useAdmin<T>(key: unknown[], fn: () => Promise<T>, opts: { refetchInterval?: number; enabled?: boolean } = {}) {
  return useQuery({ queryKey: ["admin", ...key], queryFn: fn, ...opts });
}

/** Any admin action: toast on success or error, then refresh every admin view. */
export function useAdminAction<I, O>(fn: (input: I) => Promise<O>, done: string | ((out: O) => string)) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (out) => {
      toast.success(typeof done === "function" ? done(out) : done);
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Noe gikk galt."),
  });
}

export const adminApi = client.admin;
