import { cn } from "@workspace/ui/lib/utils";
import { CheckIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { adminApi, useAdmin } from "../admin-queries";
import { useAdminNav } from "./nav";
import { btn, bytes, Card, CsvButton, DataTable, Drawer, KeyValues, Loading, num, PageHeader, SearchBox, Stat, when } from "./parts";

function Flag({ on, label }: { on: boolean; label: string }) {
  return (
    <span className="flex items-center gap-2 text-[13px]">
      <span className={cn("flex size-5 items-center justify-center rounded-full", on ? "bg-[#e9f4ec] text-[#2f6b3c]" : "bg-[#fbeceb] text-[#b23a2e]")}>
        {on ? <CheckIcon className="size-3" strokeWidth={2.5} /> : <XIcon className="size-3" strokeWidth={2.5} />}
      </span>
      {label}
    </span>
  );
}

export function SystemPage() {
  const { data: s } = useAdmin(["system"], () => adminApi.system(), { refetchInterval: 15_000 });
  const h = Math.floor((s?.uptimeSeconds ?? 0) / 3600);
  const m = Math.floor(((s?.uptimeSeconds ?? 0) % 3600) / 60);
  return (
    <>
      <PageHeader title="System" description="Serveren, databasen og innstillingene som styrer Agenci. Hemmeligheter vises aldri." />
      {!s ? (
        <Loading />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Oppetid" value={`${h} t ${m} min`} hint={`Startet ${when(s.startedAt)}`} />
            <Stat label="Minne i bruk" value={`${num(s.memoryMb)} MB`} hint={s.runtime} />
            <Stat label="Databasestørrelse" value={bytes(s.dbBytes)} />
            <Stat label="Aktive innlogginger" value={num(s.activeSessions)} />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card title="Innstillinger">
              <div className="grid gap-2.5">
                <Flag on={s.config.nodeEnv === "production"} label={`Miljø: ${s.config.nodeEnv}`} />
                <Flag on={s.config.nexiMode === "live"} label={`Nexi: ${s.config.nexiMode === "live" ? "live, ekte betalinger" : "testmodus"}`} />
                <Flag on={s.config.nexiConfigured} label="Nexi-nøkler lagt inn" />
                <Flag on={s.config.billingEnforced} label="Grenser håndheves (BILLING_ENFORCE)" />
                <Flag on={s.config.emailConfigured} label={`E-post via Resend (${s.config.emailFrom})`} />
                <Flag on={s.config.openaiConfigured} label="OpenAI-nøkkel lagt inn" />
                <Flag on={s.config.vatRegistered} label="Mva-registrert (SELLER_VAT_REGISTERED)" />
              </div>
            </Card>
            <Card title="Tilgang">
              <KeyValues
                rows={[
                  ["Utviklere", s.config.developers.join(", ") || "–"],
                  ["Testbetalere", s.config.testPayers.join(", ") || "–"],
                  ["Admin krever", "Utvikler-e-post + bekreftet konto + 2FA"],
                ]}
              />
            </Card>
          </div>
          <Card title="Største tabeller" pad={false}>
            <DataTable
              rows={s.biggestTables}
              columns={[
                { key: "t", label: "Tabell", render: (t) => <span className="font-mono text-[12.5px]">{t.table}</span> },
                { key: "b", label: "Størrelse", align: "right", render: (t) => bytes(t.bytes) },
              ]}
            />
          </Card>
        </div>
      )}
    </>
  );
}

export function DatabasePage() {
  const tables = useAdmin(["tables"], () => adminApi.tables());
  const [table, setTable] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const rows = useAdmin(["rows", table, page, q], () => adminApi.rows({ table: table as string, page, search: q || undefined }), {
    enabled: Boolean(table),
    refetchInterval: 10_000,
  });
  const [open, setOpen] = useState<Record<string, string | null> | null>(null);
  const list = (tables.data ?? []).filter((t) => t.table.includes(filter.toLowerCase()));

  return (
    <>
      <PageHeader title="Database" description="Alle tabeller, kun lesing. Passord, tokens og nøkler vises aldri. Hvert oppslag logges." />
      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Card pad={false} className="h-fit">
          <div className="p-3">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Finn tabell"
              className="h-8 w-full rounded-full border border-(--agenci-line) bg-transparent px-3 text-[12.5px] outline-none focus:border-(--agenci-ink-3)"
            />
          </div>
          {!tables.data ? (
            <Loading />
          ) : (
            <ul className="max-h-[70vh] overflow-y-auto pb-2">
              {list.map((t) => (
                <li key={t.table}>
                  <button
                    type="button"
                    onClick={() => {
                      setTable(t.table);
                      setPage(0);
                      setSearch("");
                      setQ("");
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-4 py-1.5 text-left text-[12.5px] transition-colors",
                      table === t.table ? "bg-(--dash-subtle) font-medium text-(--agenci-ink) dark:bg-white/5" : "text-(--agenci-ink-2) hover:bg-(--dash-subtle-2)",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate font-mono">{t.table}</span>
                    <span className="shrink-0 text-[11px] text-(--agenci-ink-3) tabular-nums">{num(t.rows)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card pad={false} className="min-w-0">
          {!table ? (
            <p className="p-10 text-center text-[13.5px] text-(--agenci-ink-3)">Velg en tabell til venstre.</p>
          ) : (
            <>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPage(0);
                  setQ(search);
                }}
                className="flex flex-wrap items-center gap-3 px-5 py-4"
              >
                <p className="flex-1 font-mono text-[14px] font-semibold">{table}</p>
                <SearchBox value={search} onChange={setSearch} placeholder="Søk i alle kolonner, Enter" />
                {rows.data ? <CsvButton name={table} rows={rows.data.rows} /> : null}
              </form>
              {!rows.data ? (
                <Loading />
              ) : rows.data.rows.length === 0 ? (
                <p className="border-t border-(--agenci-line) p-10 text-center text-[13.5px] text-(--agenci-ink-3)">Ingen rader.</p>
              ) : (
                <div className="overflow-x-auto border-t border-(--agenci-line)">
                  <table className="w-max min-w-full border-collapse text-[12px]">
                    <thead className="bg-(--dash-subtle-2) text-left dark:bg-white/5">
                      <tr>
                        {rows.data.columns.map((c) => (
                          <th key={c.name} className="h-9 px-3 font-medium whitespace-nowrap text-(--agenci-ink-2)">
                            {c.name} <span className="font-normal text-(--agenci-ink-3)">{c.secret ? "skjult" : c.type}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {rows.data.rows.map((r, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: rows have no common id
                        <tr key={i} onClick={() => setOpen(r)} className="cursor-pointer border-t border-(--agenci-line)/70 hover:bg-(--dash-subtle-2)">
                          {rows.data?.columns.map((c) => (
                            <td key={c.name} className="max-w-[260px] truncate px-3 py-2">
                              {r[c.name] ?? <span className="text-(--agenci-ink-3)">null</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-(--agenci-line) px-5 py-3 text-[12px] text-(--agenci-ink-3)">
                <span>Side {page + 1} · 50 per side · oppdateres hvert 10. sekund</span>
                <span className="flex gap-2">
                  <button type="button" className={btn} disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                    Forrige
                  </button>
                  <button type="button" className={btn} disabled={!rows.data?.hasMore} onClick={() => setPage((p) => p + 1)}>
                    Neste
                  </button>
                </span>
              </div>
            </>
          )}
        </Card>
      </div>
      {open ? (
        <Drawer title={`Rad i ${table}`} onClose={() => setOpen(null)}>
          <dl className="divide-y divide-(--agenci-line)">
            {Object.entries(open).map(([k, v]) => (
              <div key={k} className="px-6 py-3">
                <dt className="text-[12px] text-(--agenci-ink-3)">{k}</dt>
                <dd className="mt-1 font-mono text-[12px] break-all whitespace-pre-wrap">{v ?? "null"}</dd>
              </div>
            ))}
          </dl>
        </Drawer>
      ) : null}
    </>
  );
}

export const ACTION_LABEL: Record<string, string> = {
  view_organization: "Åpnet bedrift",
  view_user: "Åpnet bruker",
  view_conversation: "Leste samtale",
  view_table: "Så på tabell",
  extend_trial: "Forlenget prøveperiode",
  end_trial: "Avsluttet prøveperiode",
  set_plan: "Ga eller endret plan",
  cancel_subscription: "Sa opp abonnement",
  release_org_number: "Frigjorde org.nr.",
  delete_organization: "Slettet bedrift",
  change_member_role: "Endret rolle",
  remove_member: "Fjernet medlem",
  delete_document: "Slettet kunnskapskilde",
  recrawl_document: "Leste nettside på nytt",
  delete_user: "Slettet bruker",
  verify_user: "Bekreftet bruker",
  unverify_user: "Fjernet bekreftelse",
  send_password_reset: "Sendte lenke for nytt passord",
  revoke_sessions: "Logget ut bruker overalt",
};

export function AuditPage() {
  const nav = useAdminNav();
  const { data } = useAdmin(["audit"], () => adminApi.audit(), { refetchInterval: 15_000 });
  const [q, setQ] = useState("");
  const rows = (data ?? []).filter((a) => `${a.actorEmail} ${ACTION_LABEL[a.action] ?? a.action} ${a.target ?? ""} ${a.details}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader
        title="Logg"
        description="Alt som er gjort i admin: hvem, hva, på hvem og når. Kan ikke endres herfra."
        actions={
          <>
            <SearchBox value={q} onChange={setQ} placeholder="Søk i loggen" />
            <CsvButton name="admin-logg" rows={rows.map((a) => ({ tid: a.createdAt, hvem: a.actorEmail, hva: a.action, mal: a.target ?? "", detaljer: a.details }))} />
          </>
        }
      />
      <Card pad={false}>
        {!data ? (
          <Loading />
        ) : (
          <DataTable
            rows={rows}
            empty="Ingenting logget ennå."
            onRow={(a) => {
              if (a.action.includes("organization") || ["extend_trial", "end_trial", "set_plan", "cancel_subscription", "release_org_number"].includes(a.action)) {
                if (a.target && a.action !== "delete_organization") nav.openOrg(a.target);
              } else if (a.action.includes("user") || ["send_password_reset", "revoke_sessions"].includes(a.action)) {
                if (a.target && a.action !== "delete_user") nav.openUser(a.target);
              } else if (a.action === "view_conversation" && a.target) nav.openConv(a.target);
            }}
            columns={[
              { key: "at", label: "Når", render: (a) => <span className="whitespace-nowrap text-(--agenci-ink-2)">{when(a.createdAt)}</span> },
              { key: "who", label: "Hvem", render: (a) => a.actorEmail },
              { key: "what", label: "Hva", render: (a) => <span className="font-medium">{ACTION_LABEL[a.action] ?? a.action}</span> },
              { key: "target", label: "Mål", render: (a) => <span className="block max-w-[200px] truncate font-mono text-[11.5px] text-(--agenci-ink-2)">{a.target ?? "–"}</span> },
              { key: "d", label: "Detaljer", render: (a) => <span className="block max-w-[360px] truncate font-mono text-[11.5px] text-(--agenci-ink-3)">{a.details === "{}" ? "" : a.details}</span> },
            ]}
          />
        )}
      </Card>
    </>
  );
}
