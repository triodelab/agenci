/**
 * The organisation's agents: one card per agent with its brand, the website
 * it serves and live numbers, plus quick actions (open, edit, delete).
 */

import { Link, useParams } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { cn } from "@workspace/ui/lib/utils";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  CheckIcon,
  MessagesSquareIcon,
  MoreHorizontalIcon,
  PaletteIcon,
  PencilLineIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AgenciLoader } from "@/components/agenci-loader";
import {
  type AgentListItem,
  useAgentsListQuery,
  useDeleteAgentMutation,
  useUpdateAgentMutation,
} from "@/features/agents/queries/agents-queries";

const dataText = "[font-family:var(--font-agenci-data)] tabular-nums";
const titleText = "[font-family:var(--font-agenci-title)]";
const icon = { strokeWidth: 1.5, absoluteStrokeWidth: true } as const;

type Status = AgentListItem["status"];

const STATUS: Record<Status, { label: string; dot: string; pill: string }> = {
  COMPLETED: {
    label: "Aktiv",
    dot: "bg-(--agenci-ink)",
    pill: "bg-[#f1f3f2] text-(--agenci-ink) dark:bg-white/5",
  },
  PROCESSING: {
    label: "Lærer",
    dot: "bg-[#E49A62] animate-pulse",
    pill: "bg-[#fbf1e9] text-[#9a5a2a]",
  },
  PENDING: {
    label: "Venter",
    dot: "bg-(--agenci-ink-3)",
    pill: "bg-[#f1f3f2] text-(--agenci-ink-2) dark:bg-white/5",
  },
  FAILED: {
    label: "Feilet",
    dot: "bg-[#C4453A]",
    pill: "bg-[#fbeceb] text-[#a3372d]",
  },
};

const HEX = /^#[0-9a-f]{6}$/i;

function hostOf(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/.*$/, "");
  }
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "A";
}

function readableOn(hex: string) {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map(
    (i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255,
  );
  return 0.299 * r + 0.587 * g + 0.114 * b > 0.62 ? "#16181b" : "#ffffff";
}

/** Short "time since" for tight spots: "nå", "12 min", "20 t", "3 d". */
function ago(iso: string | null) {
  if (!iso) return "–";
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "nå";
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} t`;
  if (s < 604800) return `${Math.floor(s / 86400)} d`;
  if (s < 2629800) return `${Math.floor(s / 604800)} u`;
  if (s < 31557600) return `${Math.floor(s / 2629800)} mnd`;
  return `${Math.floor(s / 31557600)} år`;
}

function brandOf(agent: AgentListItem) {
  return agent.brandColor && HEX.test(agent.brandColor)
    ? agent.brandColor
    : "#243236";
}

/** Conversations per day, last 14 days — a soft area in the brand colour. */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const W = 280;
  const H = 44;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * W,
    H - 3 - (v / max) * (H - 8),
  ]);
  const line = pts
    .map(([x, y], i) => {
      if (i === 0) return `M${x},${y}`;
      const [px, py] = pts[i - 1] as number[];
      const cx = ((px as number) + (x as number)) / 2;
      return `C${cx},${py} ${cx},${y} ${x},${y}`;
    })
    .join(" ");
  const id = `spark-${color.slice(1)}`;
  const last = pts[pts.length - 1] as number[];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-11 w-full overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.18" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${W},${H} L0,${H} Z`} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
      <circle
        cx={last[0]}
        cy={last[1]}
        r="3"
        fill="#fff"
        stroke={color}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

/** The agent's brand: website logo, or a monogram in its brand colour. */
function AgentMark({ agent }: { agent: AgentListItem }) {
  const [broken, setBroken] = useState(false);
  const color = brandOf(agent);
  if (agent.logoUrl && !broken) {
    return (
      <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-white p-2 shadow-[inset_0_0_0_1px_rgb(5_6_7/0.08),0_4px_12px_-6px_rgb(5_6_7/0.2)]">
        <img
          src={agent.logoUrl}
          alt=""
          className="max-h-full max-w-full object-contain"
          onError={() => setBroken(true)}
        />
      </span>
    );
  }
  return (
    <span
      className={cn(
        titleText,
        "flex size-12 shrink-0 items-center justify-center rounded-[14px] text-[17px] font-medium tracking-[-0.02em] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12),0_6px_16px_-8px_rgb(5_6_7/0.45)]",
      )}
      style={{
        background: `linear-gradient(145deg, color-mix(in srgb, ${color} 82%, white), ${color})`,
        color: readableOn(color),
      }}
    >
      {initials(agent.name)}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-4 first:pl-0 last:pr-0">
      <p className="truncate text-[12px] text-(--agenci-ink-3)">{label}</p>
      <p
        className={cn(
          titleText,
          "mt-1 truncate text-[18px] leading-none font-medium tracking-[-0.02em] text-(--agenci-ink)",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function AgentCard({
  agent,
  orgSlug,
  index,
  onEdit,
  onDelete,
}: {
  agent: AgentListItem;
  orgSlug: string;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const status = STATUS[agent.status];
  const host = hostOf(agent.websiteUrl);
  const params = { orgSlug, agentId: agent.id };
  const menuItem = "gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px]";
  const brand = brandOf(agent);
  // Very light brand colours would vanish on white; fall back to ink.
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map(
    (i) => Number.parseInt(brand.slice(i, i + 2), 16) / 255,
  );
  const lineColor =
    0.299 * r + 0.587 * g + 0.114 * b > 0.75 ? "#243236" : brand;
  const recent = agent.activity.reduce((n, v) => n + v, 0);
  return (
    <article
      className="kb-card-in group relative flex flex-col overflow-hidden rounded-[20px] border border-(--agenci-line) bg-white shadow-[0_1px_2px_rgb(5_6_7/0.04),0_10px_28px_-20px_rgb(5_6_7/0.2)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(.23,1,.32,1)] hover:-translate-y-0.5 hover:border-[#d5dad7] hover:shadow-[0_1px_2px_rgb(5_6_7/0.05),0_20px_40px_-22px_rgb(5_6_7/0.3)] dark:bg-(--card)"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Soft wash in the agent's brand colour */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-80 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120% 100% at 0% 0%, color-mix(in srgb, ${brand} 11%, transparent), transparent 70%)`,
        }}
      />
      <div className="relative flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3">
          <AgentMark agent={agent} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[15px] leading-tight font-semibold tracking-[-0.01em] text-(--agenci-ink)">
              {/* Stretched link: the whole card opens the agent. */}
              <Link
                to="/org/$orgSlug/agents/$agentId"
                params={params}
                className="outline-none after:absolute after:inset-0 after:rounded-[20px] focus-visible:after:shadow-[0_0_0_2px_var(--agenci-ink)]"
              >
                {agent.name}
              </Link>
            </h2>
            {host ? (
              <a
                href={agent.websiteUrl ?? undefined}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  dataText,
                  "relative z-10 mt-0.5 inline-flex max-w-full items-center gap-0.5 text-[12px] text-(--agenci-ink-3) transition-colors hover:text-(--agenci-ink)",
                )}
              >
                <span className="truncate">{host}</span>
                <ArrowUpRightIcon className="size-3 shrink-0" {...icon} />
              </a>
            ) : (
              <p
                className={cn(
                  dataText,
                  "mt-0.5 text-[12px] text-(--agenci-ink-3)",
                )}
              >
                Ingen nettside
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Handlinger for ${agent.name}`}
                className="relative z-10 -mr-1.5 flex size-8 shrink-0 items-center justify-center self-start rounded-full text-(--agenci-ink-3) opacity-60 transition-[background-color,color,opacity] group-hover:opacity-100 hover:bg-[#f1f3f2] hover:text-(--agenci-ink) data-[state=open]:bg-[#f1f3f2] data-[state=open]:text-(--agenci-ink) data-[state=open]:opacity-100 dark:hover:bg-white/5"
              >
                <MoreHorizontalIcon className="size-4" {...icon} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 rounded-[14px] border-(--agenci-line) p-1 shadow-[0_16px_40px_-16px_rgb(5_6_7/0.3)]"
            >
              <DropdownMenuItem asChild className={menuItem}>
                <Link
                  to="/org/$orgSlug/agents/$agentId/conversations"
                  params={params}
                >
                  <MessagesSquareIcon className="size-4" {...icon} />
                  Samtaler
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className={menuItem}>
                <Link to="/org/$orgSlug/agents/$agentId/files" params={params}>
                  <BookOpenIcon className="size-4" {...icon} />
                  Kunnskapsbase
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className={menuItem}>
                <Link
                  to="/org/$orgSlug/agents/$agentId/customization"
                  params={params}
                >
                  <PaletteIcon className="size-4" {...icon} />
                  Widget-tilpasning
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="mx-1 bg-(--agenci-line)" />
              <DropdownMenuItem onSelect={onEdit} className={menuItem}>
                <PencilLineIcon className="size-4" {...icon} />
                Gi nytt navn
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={onDelete}
                className={cn(
                  menuItem,
                  "text-[#a3372d] focus:bg-[#fbeceb] focus:text-[#a3372d] [&_svg]:text-[#a3372d]",
                )}
              >
                <Trash2Icon className="size-4" {...icon} />
                Slett agent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="mt-4 line-clamp-2 text-[13px] leading-[1.55] text-(--agenci-ink-2)">
          {agent.description || "Ingen beskrivelse."}
        </p>

        <div className="mt-5">
          <div className="mb-1 flex items-baseline justify-between text-[12px]">
            <span className="text-(--agenci-ink-3)">Siste 14 dager</span>
            <span className={cn(dataText, "text-(--agenci-ink-2)")}>
              {recent ? plural(recent, "ny samtale", "nye samtaler") : "Stille"}
            </span>
          </div>
          <Sparkline values={agent.activity} color={lineColor} />
        </div>

        <div className="mt-auto grid grid-cols-3 divide-x divide-(--agenci-line) pt-4">
          <Stat label="Kilder" value={String(agent.sourceCount)} />
          <Stat label="Samtaler" value={String(agent.conversationCount)} />
          <Stat label="Sist aktiv" value={ago(agent.lastActivityAt)} />
        </div>
      </div>

      <div className="relative flex items-center gap-2 border-t border-(--agenci-line) px-5 py-3.5">
        <span
          className={cn(
            "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium",
            status.pill,
          )}
        >
          <span className={cn("size-1.5 rounded-full", status.dot)} />
          {status.label}
        </span>
        {agent.failedSourceCount > 0 ? (
          <span className="inline-flex h-6 items-center rounded-full bg-[#fbeceb] px-2.5 text-[12px] font-medium text-[#a3372d]">
            {plural(agent.failedSourceCount, "kilde feilet", "kilder feilet")}
          </span>
        ) : null}
        <span className="ml-auto inline-flex items-center gap-1 text-[12.5px] font-medium text-(--agenci-ink-3) transition-colors group-hover:text-(--agenci-ink)">
          Åpne
          <ArrowRightIcon
            className="size-3.5 transition-transform duration-300 ease-[cubic-bezier(.23,1,.32,1)] group-hover:translate-x-0.5"
            {...icon}
          />
        </span>
      </div>
    </article>
  );
}

function NewAgentCard({ orgSlug, index }: { orgSlug: string; index: number }) {
  return (
    <Link
      to="/org/$orgSlug/agents/create"
      params={{ orgSlug }}
      className="kb-card-in group flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-[#cfd5d2] text-center transition-[border-color,background-color] duration-300 hover:border-(--agenci-ink-3) hover:bg-white/60 dark:border-white/15 dark:hover:bg-white/[0.03]"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-(--agenci-ink) text-white shadow-[0_8px_20px_-10px_rgb(5_6_7/0.6)] transition-transform duration-300 ease-[cubic-bezier(.23,1,.32,1)] group-hover:scale-105 group-active:scale-[0.97] dark:text-[#0b0c0e]">
        <PlusIcon className="size-5" {...icon} />
      </span>
      <span>
        <span className="block text-[14px] font-semibold text-(--agenci-ink)">
          Ny agent
        </span>
        <span className="mt-0.5 block text-[12.5px] text-(--agenci-ink-3)">
          Fra nettside eller dokumenter
        </span>
      </span>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="flex h-[260px] flex-col gap-4 rounded-[20px] border border-(--agenci-line) bg-white p-5 dark:bg-(--card)">
      <div className="flex gap-3.5">
        <div className="size-12 animate-pulse rounded-[14px] bg-[#f1f3f2]" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-32 animate-pulse rounded-full bg-[#f1f3f2]" />
          <div className="h-3 w-20 animate-pulse rounded-full bg-[#f1f3f2]" />
        </div>
      </div>
      <div className="h-9 animate-pulse rounded-[10px] bg-[#f6f7f6]" />
      <div className="h-16 animate-pulse rounded-[14px] bg-[#f6f7f6]" />
    </div>
  );
}

const STEPS = [
  ["Opprett agenten", "Navn og hva den skal hjelpe med"],
  ["Legg til kunnskap", "Nettsiden din eller dokumenter"],
  ["Tilpass widgeten", "Farger, tekst og oppførsel"],
  ["Legg den ut", "Én kodelinje på nettsiden"],
] as const;

function EmptyState({ orgSlug }: { orgSlug: string }) {
  return (
    <div className="kb-card-in mx-auto w-full max-w-2xl overflow-hidden rounded-[24px] border border-(--agenci-line) bg-white shadow-[0_1px_2px_rgb(5_6_7/0.04),0_24px_48px_-28px_rgb(5_6_7/0.25)] dark:bg-(--card)">
      <div className="px-8 pt-10 pb-8 text-center">
        <h2
          className={cn(
            titleText,
            "text-[24px] leading-tight font-medium tracking-[-0.03em] text-(--agenci-ink)",
          )}
        >
          Din første agent
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-(--agenci-ink-2)">
          Klar til å svare kundene dine på under fem minutter.
        </p>
        <Link
          to="/org/$orgSlug/agents/create"
          params={{ orgSlug }}
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-(--agenci-ink) px-5 text-[13.5px] font-medium text-white transition-transform active:scale-[0.97] dark:text-[#0b0c0e]"
        >
          Kom i gang
          <ArrowRightIcon className="size-4" {...icon} />
        </Link>
      </div>
      <ol className="grid border-t border-(--agenci-line) sm:grid-cols-4">
        {STEPS.map(([title, text], i) => (
          <li
            key={title}
            className="border-(--agenci-line) px-5 py-5 not-last:border-b sm:not-last:border-r sm:not-last:border-b-0"
          >
            <span className={cn(dataText, "text-[12px] text-(--agenci-ink-3)")}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="mt-2 text-[13px] font-semibold text-(--agenci-ink)">
              {title}
            </p>
            <p className="mt-0.5 text-[12px] leading-snug text-(--agenci-ink-3)">
              {text}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function EditDialog({
  agent,
  onClose,
}: {
  agent: AgentListItem | null;
  onClose: () => void;
}) {
  const update = useUpdateAgentMutation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [seen, setSeen] = useState<string | null>(null);
  if (agent && seen !== agent.id) {
    setSeen(agent.id);
    setName(agent.name);
    setDescription(agent.description ?? "");
  }
  const valid = name.trim().length > 0;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent || !valid) return;
    update.mutate(
      { id: agent.id, name: name.trim(), description: description.trim() },
      { onSuccess: onClose },
    );
  };
  const input =
    "w-full rounded-[10px] border border-[#d7dce2] bg-white px-3 text-[14px] text-(--agenci-ink) outline-none transition-[border-color,box-shadow] focus:border-(--agenci-ink-3) focus:shadow-[0_0_0_3px_rgb(36_50_54/0.08)] dark:border-white/10 dark:bg-transparent";

  return (
    <Dialog
      open={Boolean(agent)}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          setSeen(null);
        }
      }}
    >
      <DialogContent className="gap-0 rounded-[24px] p-0 sm:max-w-[440px]">
        <form onSubmit={submit}>
          <div className="px-6 pt-6">
            <DialogTitle className="text-[17px] font-semibold tracking-[-0.01em] text-(--agenci-ink)">
              Rediger agent
            </DialogTitle>
            <DialogDescription className="sr-only">
              Endre navn og beskrivelse
            </DialogDescription>
          </div>
          <div className="space-y-4 px-6 pt-5 pb-6">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-(--agenci-ink)">
                Navn
              </span>
              <input
                value={name}
                maxLength={80}
                onChange={(e) => setName(e.target.value)}
                className={cn(input, "h-10")}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-(--agenci-ink)">
                Beskrivelse
              </span>
              <textarea
                value={description}
                maxLength={500}
                rows={3}
                onChange={(e) => setDescription(e.target.value)}
                className={cn(input, "resize-none py-2.5 leading-relaxed")}
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 border-t border-(--agenci-line) px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-full px-4 text-[13px] font-medium text-(--agenci-ink-2) transition-colors hover:bg-[#f1f3f2] hover:text-(--agenci-ink) dark:hover:bg-white/5"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={!valid || update.isPending}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-(--agenci-ink) px-4 text-[13px] font-medium text-white transition-[opacity,transform] active:scale-[0.97] disabled:opacity-40 dark:text-[#0b0c0e]"
            >
              {update.isPending ? <AgenciLoader size={20} decorative /> : null}
              Lagre
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  agent,
  onClose,
}: {
  agent: AgentListItem | null;
  onClose: () => void;
}) {
  const remove = useDeleteAgentMutation();
  const [typed, setTyped] = useState("");
  // Keep the last agent while the dialog animates out.
  const [shown, setShown] = useState<AgentListItem | null>(null);
  if (agent && agent !== shown) setShown(agent);
  const target = agent ?? shown;
  const matches =
    !!target && typed.trim().toLowerCase() === target.name.trim().toLowerCase();

  const close = () => {
    onClose();
    setTyped("");
  };
  const confirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target || !matches) return;
    remove.mutate(
      { id: target.id },
      {
        onSuccess: (res) => {
          toast.success(`«${target.name}» er slettet`, {
            description: `${plural(res.deleted.sources, "kilde", "kilder")} og ${plural(res.deleted.conversations, "samtale", "samtaler")} ble fjernet.`,
          });
          close();
        },
      },
    );
  };

  return (
    <Dialog open={Boolean(agent)} onOpenChange={(o) => !o && close()}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden rounded-[24px] border-(--agenci-line) p-0 shadow-[0_24px_64px_-24px_rgb(5_6_7/0.45)] sm:max-w-[420px]"
      >
        {target ? (
          <form onSubmit={confirm} className="p-6">
            <div className="flex flex-col items-center text-center">
              <span className="relative">
                <AgentMark agent={target} />
                <span className="absolute -right-1.5 -bottom-1.5 flex size-6 items-center justify-center rounded-full bg-[#B8392E] text-white shadow-[0_0_0_3px_#fff]">
                  <Trash2Icon className="size-3" strokeWidth={2} />
                </span>
              </span>
              <DialogTitle className="mt-4 text-[17px] leading-snug font-semibold tracking-[-0.01em] text-(--agenci-ink)">
                Slett {target.name}?
              </DialogTitle>
              <DialogDescription className="mt-1 max-w-[300px] text-[13px] leading-relaxed text-(--agenci-ink-2)">
                Agenten og widgeten på nettsiden slutter å virke. Dette kan ikke
                angres.
              </DialogDescription>
            </div>

            <div className="mt-5 grid grid-cols-3 divide-x divide-(--agenci-line) rounded-[14px] bg-[#f6f7f6] py-3.5 dark:bg-white/5">
              {[
                [
                  String(target.sourceCount),
                  target.sourceCount === 1 ? "kilde" : "kilder",
                ],
                [
                  String(target.conversationCount),
                  target.conversationCount === 1 ? "samtale" : "samtaler",
                ],
                ["1", "widget"],
              ].map(([value, label]) => (
                <div key={label} className="text-center">
                  <p
                    className={cn(
                      titleText,
                      "text-[18px] leading-none font-medium tracking-[-0.02em] text-(--agenci-ink)",
                    )}
                  >
                    {value}
                  </p>
                  <p className="mt-1 text-[12px] text-(--agenci-ink-3)">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <label className="mt-5 block">
              <span className="mb-1.5 block text-[12.5px] text-(--agenci-ink-2)">
                Skriv{" "}
                <span className="font-medium text-(--agenci-ink)">
                  {target.name}
                </span>{" "}
                for å bekrefte
              </span>
              <span className="relative block">
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder={target.name}
                  autoComplete="off"
                  spellCheck={false}
                  className="h-10 w-full rounded-[10px] border border-[#d7dce2] bg-white pr-9 pl-3 text-[14px] text-(--agenci-ink) outline-none transition-[border-color,box-shadow] placeholder:text-[#c3c8cc] focus:border-(--agenci-ink-3) focus:shadow-[0_0_0_3px_rgb(36_50_54/0.08)] dark:border-white/10 dark:bg-transparent"
                />
                <CheckIcon
                  aria-hidden
                  className={cn(
                    "absolute top-1/2 right-3 size-4 -translate-y-1/2 text-(--agenci-ink) transition-[opacity,transform] duration-200",
                    matches ? "scale-100 opacity-100" : "scale-75 opacity-0",
                  )}
                  strokeWidth={2}
                />
              </span>
            </label>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={close}
                className="h-10 rounded-full border border-(--agenci-line) text-[13px] font-medium text-(--agenci-ink) transition-[background-color,transform] hover:bg-[#f6f7f6] active:scale-[0.97] dark:hover:bg-white/5"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={!matches || remove.isPending}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-1.5 rounded-full text-[13px] font-medium transition-[background-color,color,transform] duration-200 active:scale-[0.97]",
                  matches
                    ? "bg-[#B8392E] text-white hover:bg-[#a3322a]"
                    : "cursor-not-allowed bg-[#f1f3f2] text-(--agenci-ink-3) dark:bg-white/5",
                )}
              >
                {remove.isPending ? (
                  <>
                    <AgenciLoader size={20} decorative />
                    Sletter
                  </>
                ) : (
                  "Slett agent"
                )}
              </button>
            </div>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default function AgentsListView() {
  const { orgSlug } = useParams({ from: "/_authed/org/$orgSlug" });
  const { data, isPending, isError } = useAgentsListQuery();
  const [editing, setEditing] = useState<AgentListItem | null>(null);
  const [deleting, setDeleting] = useState<AgentListItem | null>(null);
  const agents = data ?? [];

  const active = agents.filter((a) => a.status === "COMPLETED").length;
  const chats = agents.reduce((n, a) => n + a.conversationCount, 0);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-7 flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1
            className={cn(
              titleText,
              "text-[28px] leading-[1.1] font-medium tracking-[-0.03em] text-(--agenci-ink)",
            )}
          >
            Agenter
          </h1>
          {agents.length ? (
            <p
              className={cn(
                dataText,
                "mt-2 text-[12.5px] text-(--agenci-ink-3)",
              )}
            >
              {plural(agents.length, "agent", "agenter")} · {active} aktive ·{" "}
              {plural(chats, "samtale", "samtaler")}
            </p>
          ) : null}
        </div>
      </header>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <p className="text-[13px] text-[#a3372d]">
          Kunne ikke hente agentene. Prøv å laste siden på nytt.
        </p>
      ) : agents.length === 0 ? (
        <EmptyState orgSlug={orgSlug} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent, i) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              orgSlug={orgSlug}
              index={i}
              onEdit={() => setEditing(agent)}
              onDelete={() => setDeleting(agent)}
            />
          ))}
          <NewAgentCard orgSlug={orgSlug} index={agents.length} />
        </div>
      )}

      <EditDialog agent={editing} onClose={() => setEditing(null)} />
      <DeleteDialog agent={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}
