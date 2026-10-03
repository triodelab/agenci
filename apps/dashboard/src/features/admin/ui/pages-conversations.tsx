import { cn } from "@workspace/ui/lib/utils";
import { ExternalLinkIcon } from "lucide-react";
import { useState } from "react";
import { adminApi, useAdmin } from "../admin-queries";
import { useAdminNav } from "./nav";
import { ago, Badge, btn, Card, CsvButton, DataTable, day, Drawer, Loading, num, PageHeader, SearchBox, when } from "./parts";

const STATUSES = [
  ["", "Alle"],
  ["unresolved", "Uavklart"],
  ["escalated", "Til teamet"],
  ["resolved", "Løst"],
] as const;

export function ConversationsPage() {
  const nav = useAdminNav();
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | "unresolved" | "escalated" | "resolved">("");
  const [page, setPage] = useState(0);
  const { data } = useAdmin(["conversations", status, query, page], () =>
    adminApi.conversations({ status: status || undefined, q: query || undefined, page }),
  );
  return (
    <>
      <PageHeader
        title="Samtaler"
        description={data ? `${num(data.total)} samtaler${status || query ? " med filter" : " på tvers av alle bedrifter"}` : undefined}
        actions={
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPage(0);
                setQuery(q);
              }}
            >
              <SearchBox value={q} onChange={setQ} placeholder="Søk i meldinger, trykk Enter" />
            </form>
            <CsvButton
              name="samtaler"
              rows={(data?.rows ?? []).map((c) => ({
                bedrift: c.organization.name,
                agent: c.agent.name,
                besokende: c.contactSession?.name ?? "",
                epost: c.contactSession?.email ?? "",
                status: c.status,
                meldinger: c.messageCount,
                forste_melding: c.firstMessage,
                siste_melding: c.lastMessage,
                startet: c.createdAt,
                sist: c.lastMessageAt,
              }))}
            />
          </>
        }
      />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {STATUSES.map(([v, l]) => (
          <button
            key={v || "all"}
            type="button"
            onClick={() => {
              setStatus(v);
              setPage(0);
            }}
            className={cn(
              "h-8 rounded-full px-3 text-[12.5px] font-medium transition-colors",
              status === v ? "bg-(--agenci-ink) text-white dark:text-[#0b0c0e]" : "bg-(--dash-subtle) text-(--agenci-ink-2) hover:text-(--agenci-ink) dark:bg-white/5",
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
          <>
            <DataTable
              rows={data.rows}
              onRow={(c) => nav.openConv(c.id)}
              empty="Ingen samtaler."
              columns={[
                {
                  key: "msg",
                  label: "Samtale",
                  render: (c) => (
                    <span className="block max-w-[440px]">
                      <span className="block truncate font-medium text-(--agenci-ink)">{c.firstMessage || "(ingen melding)"}</span>
                      <span className="block truncate text-[12px] text-(--agenci-ink-3)">{c.lastMessage}</span>
                    </span>
                  ),
                },
                { key: "org", label: "Bedrift", render: (c) => <span className="text-(--agenci-ink-2)">{c.organization.name}</span> },
                { key: "visitor", label: "Besøkende", render: (c) => <span className="text-(--agenci-ink-2)">{c.contactSession?.name || c.contactSession?.email || "Anonym"}</span> },
                { key: "status", label: "Status", render: (c) => <Badge status={c.status} /> },
                { key: "n", label: "Meldinger", align: "right", render: (c) => c.messageCount },
                { key: "at", label: "Sist", render: (c) => <span className="text-(--agenci-ink-2)">{ago(c.lastMessageAt)}</span> },
              ]}
            />
            <div className="flex items-center justify-between border-t border-(--agenci-line) px-5 py-3 text-[12.5px] text-(--agenci-ink-3)">
              <span>
                Side {page + 1} av {Math.max(1, Math.ceil(data.total / data.pageSize))}
              </span>
              <span className="flex gap-2">
                <button type="button" className={btn} disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Forrige
                </button>
                <button type="button" className={btn} disabled={(page + 1) * data.pageSize >= data.total} onClick={() => setPage((p) => p + 1)}>
                  Neste
                </button>
              </span>
            </div>
          </>
        )}
      </Card>
    </>
  );
}

/** Full transcript (opening one is recorded in the audit log). */
export function TranscriptDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const nav = useAdminNav();
  const { data: c, isError } = useAdmin(["conversation", id], () => adminApi.conversation({ id }));
  return (
    <Drawer
      wide
      title={c ? c.contactSession?.name || c.contactSession?.email || "Anonym besøkende" : "Samtale"}
      subtitle={c ? `${c.organization.name} · ${c.agent.name} · startet ${when(c.createdAt)}` : undefined}
      onClose={onClose}
    >
      {isError ? (
        <p className="p-6 text-[13.5px] text-(--agenci-ink-3)">Fant ikke samtalen.</p>
      ) : !c ? (
        <Loading />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 border-b border-(--agenci-line) px-6 py-3">
            <Badge status={c.status} />
            <span className="text-[12.5px] text-(--agenci-ink-3)">{c.messageCount} meldinger · sist {when(c.lastMessageAt)}</span>
            <button type="button" className={`${btn} ml-auto`} onClick={() => nav.openOrg(c.organization.id)}>
              <ExternalLinkIcon className="size-3.5" /> Åpne bedriften
            </button>
          </div>
          <div className="flex flex-col gap-3 bg-(--dash-subtle-2) px-6 py-5 dark:bg-white/[0.02]">
            {c.messages.length === 0 ? (
              <p className="py-10 text-center text-[13.5px] text-(--agenci-ink-3)">Ingen meldinger lagret for denne samtalen.</p>
            ) : (
              c.messages.map((m) => (
                <div key={m.id} className={cn("flex flex-col", m.author === "visitor" ? "items-end" : "items-start")}>
                  <span className="mb-1 px-1 text-[11.5px] text-(--agenci-ink-3)">
                    {m.author === "visitor" ? "Besøkende" : m.author === "team" ? `Teamet${m.authorName ? ` · ${m.authorName}` : ""}` : "Agent"} · {when(m.createdAt)}
                  </span>
                  <p
                    className={cn(
                      "max-w-[80%] rounded-[16px] px-4 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap",
                      m.author === "visitor"
                        ? "rounded-br-[5px] bg-(--agenci-ink) text-white dark:text-[#0b0c0e]"
                        : m.author === "team"
                          ? "rounded-bl-[5px] border border-[#cfd9f5] bg-[#eef1fb] text-(--agenci-ink)"
                          : "rounded-bl-[5px] border border-(--agenci-line) bg-(--dash-surface) text-(--agenci-ink) dark:bg-(--card)",
                    )}
                  >
                    {m.text}
                    {m.products ? <span className="mt-1 block text-[11.5px] opacity-70">Viste {m.products} produkt(er)</span> : null}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </Drawer>
  );
}

export function AgentsPage() {
  const nav = useAdminNav();
  const { data } = useAdmin(["agents"], () => adminApi.agents());
  const [q, setQ] = useState("");
  const rows = (data ?? []).filter((a) => `${a.name} ${a.organization.name} ${a.widgetBrand?.sourceUrl ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader
        title="Agenter"
        description={data ? `${num(data.length)} agenter · ${data.filter((a) => a.status === "FAILED").length} feilet` : undefined}
        actions={
          <>
            <SearchBox value={q} onChange={setQ} placeholder="Agent, bedrift eller nettside" />
            <CsvButton name="agenter" rows={rows.map((a) => ({ agent: a.name, id: a.id, bedrift: a.organization.name, nettside: a.widgetBrand?.sourceUrl ?? "", status: a.status, kilder: a._count.documents, samtaler: a._count.conversations, opprettet: a.createdAt }))} />
          </>
        }
      />
      <Card pad={false}>
        {!data ? (
          <Loading />
        ) : (
          <DataTable
            rows={rows}
            onRow={(a) => nav.openOrg(a.organization.id)}
            initialSort={{ key: "convs", dir: -1 }}
            columns={[
              {
                key: "name",
                label: "Agent",
                sort: (a) => a.name.toLowerCase(),
                render: (a) => (
                  <span className="block">
                    <span className="block font-medium">{a.name}</span>
                    <span className="block font-mono text-[11.5px] text-(--agenci-ink-3)">{a.id}</span>
                  </span>
                ),
              },
              { key: "org", label: "Bedrift", sort: (a) => a.organization.name, render: (a) => a.organization.name },
              { key: "site", label: "Nettside", render: (a) => <span className="text-(--agenci-ink-2)">{a.widgetBrand?.sourceUrl?.replace(/^https?:\/\//, "") ?? "–"}</span> },
              { key: "status", label: "Status", sort: (a) => a.status, render: (a) => <Badge status={a.status} /> },
              { key: "docs", label: "Kilder", align: "right", sort: (a) => a._count.documents, render: (a) => a._count.documents },
              { key: "convs", label: "Samtaler", align: "right", sort: (a) => a._count.conversations, render: (a) => num(a._count.conversations) },
              { key: "created", label: "Opprettet", sort: (a) => new Date(a.createdAt).getTime(), render: (a) => <span className="text-(--agenci-ink-2)">{day(a.createdAt)}</span> },
            ]}
          />
        )}
      </Card>
    </>
  );
}
