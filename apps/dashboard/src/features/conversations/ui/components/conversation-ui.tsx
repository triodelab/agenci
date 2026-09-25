import { cn } from "@workspace/ui/lib/utils";
import { UserRoundIcon } from "lucide-react";
import type { ConversationStatus } from "../../queries/conversations-queries";

// ─── Status (same soft, filled tones as the overview) ───────────────────────

export const STATUS_META: Record<
  ConversationStatus,
  { label: string; className: string }
> = {
  unresolved: {
    label: "Uavklart",
    className: "bg-[#FBEBDD] text-[#B06A34] dark:bg-[#B06A34]/15",
  },
  escalated: {
    label: "Eskalert",
    className: "bg-[#F9E2DF] text-[#B2463A] dark:bg-[#B2463A]/15",
  },
  resolved: {
    label: "Løst",
    className: "bg-[#E2F2E5] text-[#2F7D46] dark:bg-[#2F7D46]/15",
  },
};

export function StatusPill({
  status,
  className,
}: {
  status: ConversationStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-px text-[12px] font-medium leading-[18px] [font-family:var(--font-agenci-data)]",
        meta.className,
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}

// ─── Contact identity ────────────────────────────────────────────────────────

type ContactLike = {
  name: string | null;
  email: string | null;
  anonymous: boolean;
};

export function contactName(contact: ContactLike) {
  return (
    contact.name?.trim() ||
    (contact.anonymous ? "Anonym besøkende" : contact.email) ||
    "Besøkende"
  );
}

export function contactSubtitle(contact: ContactLike) {
  return contact.email?.trim() || "Ikke oppgitt e-post";
}

export function initialsOf(contact: ContactLike) {
  const source = contact.name?.trim() || contact.email?.trim() || "";
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  return (
    parts.length > 1
      ? `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`
      : source.slice(0, 2)
  ).toUpperCase();
}

export function ContactAvatar({
  contact,
  size = 36,
  className,
}: {
  contact: ContactLike;
  size?: number;
  className?: string;
}) {
  const anonymous = !contact.name?.trim() && !contact.email?.trim();
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#f1f2f4] to-[#e3e6ea] font-medium tracking-[-0.01em] text-(--agenci-ink) dark:from-white/10 dark:to-white/5",
        className,
      )}
    >
      {anonymous ? (
        <UserRoundIcon
          style={{ width: size * 0.46, height: size * 0.46 }}
          className="text-(--agenci-ink-3)"
          strokeWidth={1.5}
        />
      ) : (
        initialsOf(contact)
      )}
    </span>
  );
}

// ─── Formatting ──────────────────────────────────────────────────────────────

export function formatDayTime(iso: string) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
  const time = d.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} · ${time}`;
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function languageLabel(tag: string | null) {
  if (!tag) return null;
  try {
    const name = new Intl.DisplayNames(["nb"], { type: "language" }).of(tag);
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : tag;
  } catch {
    return tag;
  }
}

export function deviceLabel(userAgent: string | null) {
  if (!userAgent) return null;
  const ua = userAgent;
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : null;
  const os = /iPhone|iPad/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Mac OS X/.test(ua)
        ? "macOS"
        : /Windows/.test(ua)
          ? "Windows"
          : /Linux/.test(ua)
            ? "Linux"
            : null;
  return [browser, os].filter(Boolean).join(" på ") || null;
}

export function pageLabel(url: string | null) {
  if (!url || url === "direct") return url === "direct" ? "Direkte" : null;
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname === "/" ? "" : u.pathname}`;
  } catch {
    return url;
  }
}

// ─── Card chrome (DESIGN.md: surface, 16px radius, --shadow-1) ──────────────

export const cardClass =
  "rounded-[16px] border border-white/80 bg-white shadow-[0_1px_3px_rgb(5_6_7/0.07),0_14px_34px_-14px_rgb(5_6_7/0.22)] dark:border-white/5 dark:bg-(--card)";

/** Inset surface inside cards (DESIGN.md --surface-2, 10px radius). */
export const insetClass = "rounded-[10px] bg-[#f3f5f4] dark:bg-white/[0.04]";

/** Caption / time / number text (DESIGN.md: Space Grotesk, tabular). */
export const dataTextClass =
  "[font-family:var(--font-agenci-data)] tabular-nums";

export const iconButtonClass =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-(--agenci-line) bg-white text-(--agenci-ink-2) transition-[color,background-color,transform] duration-150 hover:bg-[#f3f5f4] hover:text-(--agenci-ink) active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:border-white/10 dark:bg-transparent";

/** Round arrow chip in card corners (reference: ↗ on every card). */
export const arrowChipClass =
  "flex size-7 shrink-0 items-center justify-center rounded-full border border-(--agenci-line) text-(--agenci-ink) transition-colors dark:border-white/10";
