import { Link, useParams } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import {
  ArrowUpIcon,
  ArrowUpRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  CircleDotIcon,
  ClockIcon,
  CopyIcon,
  ExternalLinkIcon,
  FlagIcon,
  InboxIcon,
  MailIcon,
  MessageSquareIcon,
  RotateCcwIcon,
  UserRoundIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  type ConversationDetail,
  type ConversationStatus,
  useConversationQuery,
  useSetConversationStatusMutation,
} from "../../queries/conversations-queries";
import {
  arrowChipClass,
  ContactAvatar,
  cardClass,
  contactName,
  contactSubtitle,
  deviceLabel,
  formatDayTime,
  formatLongDate,
  formatTime,
  iconButtonClass,
  insetClass,
  languageLabel,
  pageLabel,
  STATUS_META,
  StatusPill,
} from "../components/conversation-ui";

// ─── Right column cards (reference: Webinars / Events / Tasks) ──────────────

function InfoCard({
  icon: Icon,
  title,
  aside,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={cn(cardClass, "p-4")}>
      <header className="mb-3 flex min-h-7 items-center gap-2">
        <Icon className="size-4 text-(--agenci-ink)" strokeWidth={1.5} />
        <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-(--agenci-ink)">
          {title}
        </h3>
        <div className="ml-auto flex items-center text-[12px] text-(--agenci-ink-3)">
          {aside}
        </div>
      </header>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="shrink-0 text-[12.5px] text-(--agenci-ink-3)">{label}</dt>
      <dd
        className="min-w-0 truncate text-right text-[12.5px] font-medium text-(--agenci-ink)"
        title={value ?? undefined}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className={cn(insetClass, "px-3.5 pt-3.5 pb-3")}>
      <p className="text-[32px] font-medium leading-none tracking-[-0.04em] tabular-nums [font-family:var(--font-agenci-title)] text-(--agenci-ink)">
        {value}
      </p>
      <p className="mt-2 text-[12px] font-medium leading-snug tracking-[0.06em] uppercase text-(--agenci-ink-3) [font-family:var(--font-agenci-data)]">
        {label}
      </p>
    </div>
  );
}

const STATUS_ORDER: ConversationStatus[] = [
  "unresolved",
  "escalated",
  "resolved",
];

/** Status rows with a toggle each (reference: Tasks card). */
function StatusToggles({
  value,
  onChange,
  disabled,
}: {
  value: ConversationStatus;
  onChange: (status: ConversationStatus) => void;
  disabled: boolean;
}) {
  return (
    <fieldset aria-label="Status" className="flex min-w-0 flex-col">
      {STATUS_ORDER.map((status) => {
        const active = status === value;
        return (
          <button
            key={status}
            aria-pressed={active}
            disabled={disabled}
            onClick={() => !active && onChange(status)}
            type="button"
            className="flex items-center gap-3 rounded-[10px] px-1 py-2 text-left transition-colors hover:bg-[#f3f5f4] disabled:opacity-60 dark:hover:bg-white/5"
          >
            <span
              aria-hidden
              className={cn(
                "relative h-4 w-7 shrink-0 rounded-full transition-colors duration-200",
                active
                  ? "bg-(--agenci-ink) dark:bg-white"
                  : "bg-[#D7DCE2] dark:bg-white/15",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-3 rounded-full bg-white shadow-sm transition-[left] duration-200 dark:bg-[#0b0c0e]",
                  active ? "left-[14px]" : "left-0.5",
                )}
              />
            </span>
            <span
              className={cn(
                "flex-1 text-[13px]",
                active
                  ? "font-medium text-(--agenci-ink)"
                  : "text-(--agenci-ink-2)",
              )}
            >
              {STATUS_META[status].label}
            </span>
            {active ? <StatusPill status={status} /> : null}
          </button>
        );
      })}
    </fieldset>
  );
}

function ConversationSidebar({
  conversation: c,
  onStatusChange,
  statusPending,
}: {
  conversation: ConversationDetail;
  onStatusChange: (status: ConversationStatus) => void;
  statusPending: boolean;
}) {
  const expired = new Date(c.contact.expiresAt).getTime() < Date.now();

  return (
    <>
      <InfoCard
        icon={MessageSquareIcon}
        title="Samtale"
        aside={formatLongDate(c.createdAt)}
      >
        <div className="grid grid-cols-2 gap-2">
          <StatTile value={String(c.messageCount)} label="Meldinger" />
          <StatTile value={formatTime(c.createdAt)} label="Startet" />
        </div>
      </InfoCard>

      <InfoCard
        icon={UserRoundIcon}
        title="Kontakt"
        aside={
          c.contact.email ? (
            <a
              href={`mailto:${c.contact.email}`}
              aria-label="Send e-post"
              className={cn(arrowChipClass, "hover:bg-[#f3f5f4]")}
            >
              <ArrowUpRightIcon className="size-3.5" strokeWidth={1.5} />
            </a>
          ) : null
        }
      >
        <dl className={cn(insetClass, "px-3.5 py-2")}>
          <InfoRow label="Navn" value={contactName(c.contact)} />
          <InfoRow label="E-post" value={c.contact.email} />
          <InfoRow label="Språk" value={languageLabel(c.contact.language)} />
          <InfoRow label="Tidssone" value={c.contact.timezone} />
          <InfoRow label="Nettleser" value={deviceLabel(c.contact.userAgent)} />
          <InfoRow label="Kom fra" value={pageLabel(c.contact.referrer)} />
          <InfoRow label="Side" value={pageLabel(c.contact.currentUrl)} />
        </dl>
      </InfoCard>

      <InfoCard icon={CircleDotIcon} title="Status">
        <StatusToggles
          value={c.status}
          onChange={onStatusChange}
          disabled={statusPending}
        />
      </InfoCard>

      <InfoCard icon={ClockIcon} title="Økt">
        <dl className={cn(insetClass, "px-3.5 py-2")}>
          <InfoRow label="Agent" value={c.agentName} />
          <InfoRow label="Siste aktivitet" value={formatDayTime(c.updatedAt)} />
          <InfoRow
            label={expired ? "Økt utløpt" : "Økt utløper"}
            value={formatDayTime(c.contact.expiresAt)}
          />
        </dl>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(c.threadId);
            toast.success("Samtale-ID kopiert");
          }}
          className="mt-2 flex w-full items-center justify-between gap-2 rounded-[10px] px-1 py-1.5 text-left text-(--agenci-ink-3) transition-colors hover:text-(--agenci-ink)"
        >
          <span className="truncate font-mono text-[12px]">{c.threadId}</span>
          <CopyIcon className="size-3.5 shrink-0" strokeWidth={1.5} />
        </button>
      </InfoCard>
    </>
  );
}

// ─── Thread ──────────────────────────────────────────────────────────────────

function Thread({ conversation: c }: { conversation: ConversationDetail }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [c.messages.length]);

  return (
    <div className="flex flex-col gap-3">
      {c.messages.map((m) => {
        const fromVisitor = m.role === "user";
        return (
          <div
            key={m.id}
            className={cn(
              "flex max-w-[80%] flex-col gap-1",
              fromVisitor ? "self-end items-end" : "self-start items-start",
            )}
          >
            <div
              className={cn(
                "rounded-[16px] px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap",
                fromVisitor
                  ? "rounded-br-[6px] bg-(--agenci-ink) text-white dark:bg-white dark:text-[#0b0c0e]"
                  : "rounded-bl-[6px] border border-(--agenci-line) bg-white text-(--agenci-ink) [font-family:var(--font-agenci-voice)] dark:bg-transparent",
              )}
            >
              {m.text}
            </div>
            <span className="px-1 text-[12px] tabular-nums [font-family:var(--font-agenci-data)] text-(--agenci-ink-3)">
              {fromVisitor ? contactName(c.contact) : c.agentName} ·{" "}
              {formatTime(m.createdAt)}
            </span>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}

// ─── View ────────────────────────────────────────────────────────────────────

export function ConversationIdView() {
  const { orgSlug, agentId, conversationId } = useParams({
    from: "/_authed/org/$orgSlug/agents/$agentId/conversations/$conversationId",
  });
  const { data: conversation, isPending } = useConversationQuery(
    agentId,
    conversationId,
  );
  const setStatus = useSetConversationStatusMutation(agentId, conversationId);

  const backLink = (
    <Link
      to="/org/$orgSlug/agents/$agentId/conversations"
      params={{ orgSlug, agentId }}
      className="inline-flex items-center gap-1 text-[13px] font-medium text-(--agenci-ink-2) hover:text-(--agenci-ink) lg:hidden"
    >
      <ChevronLeftIcon className="size-4" strokeWidth={1.5} />
      Alle samtaler
    </Link>
  );

  if (isPending) {
    return (
      <div className="flex min-h-0 flex-1 gap-3">
        <div
          className={cn(cardClass, "min-h-0 flex-1 animate-pulse bg-white/70")}
        />
        <div className="hidden w-[320px] shrink-0 flex-col gap-3 xl:flex">
          {[150, 260, 170].map((h) => (
            <div
              key={h}
              style={{ height: h }}
              className={cn(cardClass, "animate-pulse bg-white/70")}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className={cn(cardClass, "flex min-h-0 flex-1 flex-col p-5")}>
        {backLink}
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-[#f3f5f4] text-(--agenci-ink) dark:bg-white/5">
            <InboxIcon className="size-6" strokeWidth={1.5} />
          </div>
          <h2 className="text-[20px] font-medium leading-[1.25] tracking-[-0.025em] [font-family:var(--font-agenci-title)] text-(--agenci-ink)">
            Samtalen ble ikke funnet
          </h2>
          <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-(--agenci-ink-2)">
            Den kan være slettet av kunden, eller høre til en annen agent.
          </p>
        </div>
      </div>
    );
  }

  const c = conversation;
  const resolved = c.status === "resolved";
  const escalated = c.status === "escalated";
  const pageUrl =
    c.contact.currentUrl && /^https?:\/\//.test(c.contact.currentUrl)
      ? c.contact.currentUrl
      : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto xl:flex-row xl:overflow-hidden">
      <article
        className={cn(
          cardClass,
          "flex min-h-[640px] min-w-0 flex-1 flex-col overflow-hidden xl:min-h-0",
        )}
      >
        {/* Top row (reference: "Mark as spam" · date ↗) */}
        <div className="flex shrink-0 items-center gap-3 px-5 pt-4">
          {backLink}
          <button
            type="button"
            title={escalated ? "Eskalert" : "Eskaler til et menneske"}
            disabled={setStatus.isPending || escalated}
            onClick={() => setStatus.mutate("escalated")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-1.5 py-1 text-[12.5px] text-(--agenci-ink-2) transition-colors hover:text-(--agenci-ink) disabled:pointer-events-none",
              escalated && "text-[#B2463A]",
            )}
          >
            <FlagIcon className="size-3.5" strokeWidth={1.5} />
            {escalated ? "Eskalert" : "Eskaler"}
          </button>
          <span className="ml-auto flex items-center gap-3">
            <StatusPill status={c.status} />
            <span className="text-[12.5px] tabular-nums text-(--agenci-ink-2) [font-family:var(--font-agenci-data)]">
              {formatLongDate(c.createdAt)}
            </span>
            {pageUrl ? (
              <a
                href={pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Åpne siden kunden var på"
                className="text-(--agenci-ink-2) transition-colors hover:text-(--agenci-ink)"
              >
                <ArrowUpRightIcon className="size-4" strokeWidth={1.5} />
              </a>
            ) : null}
          </span>
        </div>

        {/* Contact */}
        <div className="flex shrink-0 flex-col items-center px-5 pt-1 pb-4 text-center">
          <div className="relative">
            <ContactAvatar contact={c.contact} size={64} />
            <span
              aria-hidden
              className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border-[2.5px] border-white bg-(--agenci-ink) text-white dark:border-(--card) dark:bg-white dark:text-[#0b0c0e]"
            >
              <MessageSquareIcon className="size-2.5" strokeWidth={1.5} />
            </span>
          </div>
          <p className="mt-3 text-[15px] font-semibold tracking-[-0.015em] text-(--agenci-ink)">
            {contactName(c.contact)}
          </p>
          <p className="mt-0.5 text-[12.5px] text-(--agenci-ink-3)">
            {contactSubtitle(c.contact)}
          </p>

          {/* Actions (reference: Reply + icon row) */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
            <button
              type="button"
              disabled={setStatus.isPending}
              onClick={() =>
                setStatus.mutate(resolved ? "unresolved" : "resolved")
              }
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-(--agenci-line) bg-white px-4 text-[13px] font-medium active:scale-[0.985] text-(--agenci-ink) transition-colors hover:bg-[#f3f5f4] disabled:opacity-50 dark:border-white/10 dark:bg-transparent"
            >
              {resolved ? (
                <RotateCcwIcon className="size-3.5" strokeWidth={1.5} />
              ) : (
                <CheckIcon className="size-3.5" strokeWidth={1.5} />
              )}
              {resolved ? "Gjenåpne" : "Merk som løst"}
            </button>
            <button
              type="button"
              title="Kopier e-post"
              aria-label="Kopier e-post"
              disabled={!c.contact.email}
              onClick={() => {
                if (!c.contact.email) return;
                void navigator.clipboard.writeText(c.contact.email);
                toast.success("E-post kopiert");
              }}
              className={iconButtonClass}
            >
              <CopyIcon className="size-3.5" strokeWidth={1.5} />
            </button>
            {c.contact.email ? (
              <a
                href={`mailto:${c.contact.email}`}
                title="Send e-post"
                aria-label="Send e-post"
                className={iconButtonClass}
              >
                <MailIcon className="size-3.5" strokeWidth={1.5} />
              </a>
            ) : (
              <button
                type="button"
                disabled
                aria-label="Send e-post"
                className={iconButtonClass}
              >
                <MailIcon className="size-3.5" strokeWidth={1.5} />
              </button>
            )}
            <button
              type="button"
              title={escalated ? "Eskalert" : "Eskaler til et menneske"}
              aria-label="Eskaler"
              disabled={setStatus.isPending || escalated}
              onClick={() => setStatus.mutate("escalated")}
              className={iconButtonClass}
            >
              <FlagIcon className="size-3.5" strokeWidth={1.5} />
            </button>
            {pageUrl ? (
              <a
                href={pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Åpne siden kunden var på"
                aria-label="Åpne siden kunden var på"
                className={iconButtonClass}
              >
                <ExternalLinkIcon className="size-3.5" strokeWidth={1.5} />
              </a>
            ) : null}
          </div>
        </div>

        {/* Thread */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 md:px-8">
          <Thread conversation={c} />
        </div>

        {/* Composer (reference: grey reply box, black send) */}
        <div className="shrink-0 px-4 pb-4">
          <div className={cn(insetClass, "rounded-[16px] p-3")}>
            <textarea
              disabled
              rows={2}
              aria-label="Svar"
              placeholder="Svar fra teamet kommer snart — i mellomtiden svarer agenten kunden automatisk."
              className="w-full resize-none bg-transparent px-1 text-[13.5px] text-(--agenci-ink) outline-none placeholder:text-(--agenci-ink-3) disabled:cursor-not-allowed"
            />
            <div className="mt-1 flex items-center justify-end">
              <button
                type="button"
                disabled
                aria-label="Send"
                className="flex size-8 items-center justify-center rounded-full bg-(--agenci-ink) text-white disabled:opacity-40 dark:bg-white dark:text-[#0b0c0e]"
              >
                <ArrowUpIcon className="size-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </article>

      <aside className="flex w-full shrink-0 flex-col gap-3 xl:-my-2 xl:-mr-2 xl:w-[328px] xl:overflow-y-auto xl:py-2 xl:pr-2 xl:[scrollbar-width:none] xl:[&::-webkit-scrollbar]:hidden">
        <ConversationSidebar
          conversation={c}
          onStatusChange={(status) => setStatus.mutate(status)}
          statusPending={setStatus.isPending}
        />
      </aside>
    </div>
  );
}
