import { cn } from "@workspace/ui/lib/utils";
import { KeyRoundIcon, LogOutIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { adminApi, useAdmin, useAdminAction } from "../admin-queries";
import { useAdminNav } from "./nav";
import { ACTION_LABEL } from "./pages-system";

/** "Chrome på macOS" instead of the whole user-agent string. */
function device(ua: string | null) {
  if (!ua) return "Ukjent enhet";
  const browser = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Nettleser";
  const os = /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "ukjent system";
  return `${browser} på ${os}`;
}
import {
  ago,
  Badge,
  btn,
  btnDanger,
  Card,
  CsvButton,
  DataTable,
  day,
  Drawer,
  KeyValues,
  Loading,
  num,
  PageHeader,
  SearchBox,
  useConfirm,
  when,
} from "./parts";

const FILTERS = [
  ["all", "Alle"],
  ["developers", "Utviklere"],
  ["no-org", "Uten bedrift"],
  ["unverified", "Ikke bekreftet"],
  ["2fa", "Med 2FA"],
] as const;

export function UsersPage() {
  const nav = useAdminNav();
  const { data } = useAdmin(["users"], () => adminApi.users());
  const [q, setQ] = useState("");
  const [f, setF] = useState<string>("all");
  const match = (u: NonNullable<typeof data>[number]) =>
    f === "all" ||
    (f === "developers" && u.developer) ||
    (f === "no-org" && u.members.length === 0) ||
    (f === "unverified" && !u.emailVerified) ||
    (f === "2fa" && u.twoFactorEnabled);
  const rows = (data ?? []).filter((u) => match(u) && `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader
        title="Brukere"
        description={data ? `${num(data.length)} kontoer` : undefined}
        actions={
          <>
            <SearchBox value={q} onChange={setQ} placeholder="Navn eller e-post" />
            <CsvButton
              name="brukere"
              rows={rows.map((u) => ({
                navn: u.name,
                epost: u.email,
                bekreftet: u.emailVerified,
                tofaktor: u.twoFactorEnabled,
                organisasjoner: u.members.map((m) => `${m.organization.name} (${m.role})`).join(", "),
                sist_aktiv: u.lastSeenAt,
                registrert: u.createdAt,
              }))}
            />
          </>
        }
      />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => setF(v)}
            className={cn(
              "h-8 rounded-full px-3 text-[12.5px] font-medium transition-colors",
              f === v ? "bg-(--agenci-ink) text-white dark:text-[#0b0c0e]" : "bg-(--dash-subtle) text-(--agenci-ink-2) hover:text-(--agenci-ink) dark:bg-white/5",
            )}
          >
            {l}
          </button>
        ))}
      </div>
      <Card pad={false}>
        {!data ? (
          <Loading />
        ) : (
          <DataTable
            rows={rows}
            onRow={(u) => nav.openUser(u.id)}
            initialSort={{ key: "created", dir: -1 }}
            columns={[
              {
                key: "user",
                label: "Bruker",
                sort: (u) => (u.name || u.email).toLowerCase(),
                render: (u) => (
                  <span className="block min-w-[200px]">
                    <span className="flex items-center gap-2 font-medium text-(--agenci-ink)">
                      {u.name || "–"}
                      {u.developer ? <Badge status="developer" /> : null}
                    </span>
                    <span className="block text-[12px] text-(--agenci-ink-3)">{u.email}</span>
                  </span>
                ),
              },
              {
                key: "orgs",
                label: "Bedrifter",
                render: (u) =>
                  u.members.length ? (
                    <span className="flex flex-wrap gap-1">
                      {u.members.map((m) => (
                        <span key={m.organization.id} className="rounded-full bg-(--dash-subtle) px-2 py-0.5 text-[11.5px] text-(--agenci-ink-2) dark:bg-white/5">
                          {m.organization.name}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="text-(--agenci-ink-3)">Ingen</span>
                  ),
              },
              { key: "verified", label: "Bekreftet", sort: (u) => (u.emailVerified ? 1 : 0), render: (u) => (u.emailVerified ? <Badge status="active">Ja</Badge> : <span className="text-(--agenci-ink-3)">Nei</span>) },
              { key: "2fa", label: "2FA", sort: (u) => (u.twoFactorEnabled ? 1 : 0), render: (u) => (u.twoFactorEnabled ? <Badge status="active">På</Badge> : <span className="text-(--agenci-ink-3)">Av</span>) },
              { key: "seen", label: "Sist aktiv", sort: (u) => (u.lastSeenAt ? new Date(u.lastSeenAt).getTime() : 0), render: (u) => <span className="text-(--agenci-ink-2)">{u.lastSeenAt ? `${ago(u.lastSeenAt)} siden` : "–"}</span> },
              { key: "created", label: "Registrert", sort: (u) => new Date(u.createdAt).getTime(), render: (u) => <span className="text-(--agenci-ink-2)">{day(u.createdAt)}</span> },
            ]}
          />
        )}
      </Card>
    </>
  );
}

/** Opened from anywhere in admin (`?user=`). */
export function UserDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const nav = useAdminNav();
  const { data: u } = useAdmin(["user", id], () => adminApi.user({ id }));
  const { confirm, dialog } = useConfirm();
  const reset = useAdminAction((i: { userId: string }) => adminApi.sendPasswordReset(i), (r) => `Lenke for nytt passord er sendt til ${r.email}.`);
  const revoke = useAdminAction((i: { userId: string }) => adminApi.revokeSessions(i), (r) => `Logget ut på ${r.revoked} enhet(er).`);
  const verify = useAdminAction((i: { userId: string; verified: boolean }) => adminApi.setEmailVerified(i), "Brukeren er oppdatert.");
  const del = useAdminAction((i: { userId: string }) => adminApi.deleteUser(i), (r) => `${r.email} er slettet.`);
  const section = "border-b border-(--agenci-line) px-6 py-5";
  const h = "mb-3 text-[11.5px] font-medium tracking-[0.06em] text-(--agenci-ink-3) uppercase";

  return (
    <Drawer title={u ? u.name || u.email : "Bruker"} subtitle={u?.email} onClose={onClose}>
      {dialog}
      {!u ? (
        <Loading />
      ) : (
        <>
          <div className={section}>
            <div className="mb-4 flex flex-wrap gap-2">
              {u.developer ? <Badge status="developer" /> : null}
              {u.emailVerified ? <Badge status="active">E-post bekreftet</Badge> : <Badge status="pending">Ikke bekreftet</Badge>}
              {u.twoFactorEnabled ? <Badge status="active">2FA på</Badge> : <Badge status="unknown">2FA av</Badge>}
            </div>
            <KeyValues
              rows={[
                ["ID", <span key="id" className="font-mono text-[12px]">{u.id}</span>],
                ["Registrert", when(u.createdAt)],
                ["Sist endret", when(u.updatedAt)],
                ["Innlogging", u.accounts.map((a) => (a.providerId === "credential" ? "E-post og passord" : a.providerId)).join(", ") || "–"],
              ]}
            />
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className={btn}
                onClick={() =>
                  confirm({ title: "Sende lenke for nytt passord?", body: `${u.email} får en e-post fra Agenci med en lenke som gjelder i 1 time.`, confirmLabel: "Send", onConfirm: () => reset.mutate({ userId: u.id }) })
                }
              >
                <KeyRoundIcon className="size-3.5" /> Send nytt passord
              </button>
              <button
                type="button"
                className={btn}
                onClick={() =>
                  confirm({ title: "Logge ut overalt?", body: `${u.email} logges ut på alle enheter og må logge inn på nytt.`, confirmLabel: "Logg ut", onConfirm: () => revoke.mutate({ userId: u.id }) })
                }
              >
                <LogOutIcon className="size-3.5" /> Logg ut overalt
              </button>
              <button
                type="button"
                className={btn}
                onClick={() =>
                  confirm({
                    title: u.emailVerified ? "Fjerne bekreftelsen?" : "Markere som bekreftet?",
                    body: u.emailVerified
                      ? "Utviklere mister da tilgangen til admin og gratis tilgang."
                      : "Gjør dette bare når du vet at kontoen tilhører riktig person. Utviklere får da tilgang.",
                    confirmLabel: u.emailVerified ? "Fjern" : "Bekreft",
                    onConfirm: () => verify.mutate({ userId: u.id, verified: !u.emailVerified }),
                  })
                }
              >
                {u.emailVerified ? "Fjern bekreftelse" : "Bekreft e-post"}
              </button>
              <button
                type="button"
                className={btnDanger}
                onClick={() =>
                  confirm({
                    title: `Slette ${u.email}?`,
                    body: "Kontoen, innlogginger og medlemskap slettes for godt. Bedriftene de var med i beholdes.",
                    confirmLabel: "Slett bruker",
                    danger: true,
                    typeToConfirm: u.email,
                    onConfirm: () => del.mutateAsync({ userId: u.id }).then(onClose),
                  })
                }
              >
                <Trash2Icon className="size-3.5" /> Slett
              </button>
            </div>
          </div>

          <div className={section}>
            <p className={h}>Bedrifter ({u.members.length})</p>
            {u.members.length ? (
              <ul className="space-y-2">
                {u.members.map((m) => (
                  <li key={m.id} className="flex items-center gap-2 text-[13.5px]">
                    <button type="button" onClick={() => nav.openOrg(m.organization.id)} className="min-w-0 flex-1 truncate text-left font-medium hover:underline">
                      {m.organization.name}
                    </button>
                    <Badge status={m.role} />
                    <span className="text-[12px] text-(--agenci-ink-3)">siden {day(m.createdAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-(--agenci-ink-3)">Ikke med i noen bedrift.</p>
            )}
          </div>

          <div className={section}>
            <p className={h}>Innloggede enheter ({u.sessions.length})</p>
            {u.sessions.length ? (
              <ul className="space-y-3">
                {u.sessions.map((s) => (
                  <li key={s.id} className="text-[13px]">
                    <p className="truncate text-(--agenci-ink)" title={s.userAgent ?? undefined}>{device(s.userAgent)}</p>
                    <p className="text-[12px] text-(--agenci-ink-3)">
                      {s.ipAddress ?? "ukjent IP"} · aktiv {ago(s.updatedAt)} siden · utløper {day(s.expiresAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-(--agenci-ink-3)">Ingen aktive innlogginger.</p>
            )}
          </div>

          <div className="px-6 py-5">
            <p className={h}>Admin-handlinger på denne brukeren</p>
            {u.audit.length ? (
              <ul className="space-y-1.5 text-[12.5px]">
                {u.audit.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="w-28 shrink-0 text-(--agenci-ink-3)">{when(a.createdAt)}</span>
                    <span className="min-w-0 flex-1 truncate">{ACTION_LABEL[a.action] ?? a.action}</span>
                    <span className="shrink-0 text-(--agenci-ink-3)">{a.actorEmail}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-(--agenci-ink-3)">Ingen.</p>
            )}
          </div>
        </>
      )}
    </Drawer>
  );
}
