import { useNavigate, useSearch } from "@tanstack/react-router";

export const ADMIN_TABS = [
  "overview",
  "activity",
  "organizations",
  "users",
  "conversations",
  "agents",
  "billing",
  "usage",
  "system",
  "database",
  "audit",
] as const;
export type AdminTab = (typeof ADMIN_TABS)[number];

export type AdminSearch = { tab: AdminTab; org?: string; user?: string; conv?: string };

/** Moves around the admin area; everything lives in the URL so it can be shared. */
export function useAdminNav() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_authed/admin" }) as AdminSearch;
  const go = (next: Partial<AdminSearch>) =>
    void navigate({
      to: "/admin",
      search: {
        tab: next.tab ?? search.tab,
        org: "org" in next ? next.org : search.org,
        user: "user" in next ? next.user : search.user,
        conv: "conv" in next ? next.conv : search.conv,
      },
    });
  return {
    search,
    go,
    tab: (tab: AdminTab) => go({ tab, org: undefined, user: undefined, conv: undefined }),
    openOrg: (id: string) => go({ tab: "organizations", org: id, user: undefined, conv: undefined }),
    openUser: (id: string) => go({ user: id }),
    openConv: (id: string) => go({ conv: id }),
  };
}
