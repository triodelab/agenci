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

export function useAdminOverview() {
  return useQuery({ queryKey: ["admin", "overview"], queryFn: () => client.admin.overview(), refetchInterval: 30_000 });
}

export function useAdminOrganizations() {
  return useQuery({ queryKey: ["admin", "organizations"], queryFn: () => client.admin.organizations() });
}

export function useAdminUsers() {
  return useQuery({ queryKey: ["admin", "users"], queryFn: () => client.admin.users() });
}

export function useAdminOrganization(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "organization", id],
    queryFn: () => client.admin.organization({ id: id as string }),
    enabled: Boolean(id),
  });
}

function useAdminMutation<I, O>(fn: (input: I) => Promise<O>, done: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      toast.success(done);
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Noe gikk galt."),
  });
}

export const useExtendTrial = () =>
  useAdminMutation(
    (input: { organizationId: string; days: number }) => client.admin.extendTrial(input),
    "Prøveperioden er forlenget.",
  );

export const useSendPasswordReset = () =>
  useAdminMutation(
    (input: { userId: string }) => client.admin.sendPasswordReset(input),
    "E-post med lenke for nytt passord er sendt.",
  );

export const useRevokeSessions = () =>
  useAdminMutation((input: { userId: string }) => client.admin.revokeSessions(input), "Brukeren er logget ut overalt.");

export function useAdminAudit() {
  return useQuery({ queryKey: ["admin", "audit"], queryFn: () => client.admin.audit(), refetchInterval: 15_000 });
}

export const useSetEmailVerified = () =>
  useAdminMutation(
    (input: { userId: string; verified: boolean }) => client.admin.setEmailVerified(input),
    "Brukeren er oppdatert.",
  );
