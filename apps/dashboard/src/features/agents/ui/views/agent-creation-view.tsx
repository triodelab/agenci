/**
 * Create an agent: name → what it helps with → the website it learns from →
 * create. Afterwards the page stays and shows the agent actually learning
 * (document status from the ingest pipeline) until it's ready to use.
 */

import { Link, useParams } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  CheckIcon,
  GlobeIcon,
  MessagesSquareIcon,
  PaletteIcon,
  RotateCcwIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AgenciLoader } from "@/components/agenci-loader";
import {
  useAddWebpageMutation,
  useAgentDocumentsQuery,
  useAgentsListQuery,
  useCreateAgentMutation,
} from "@/features/agents/queries/agents-queries";
import { useAgentDraftStore } from "@/features/agents/store/agent-draft-store";

const titleText = "[font-family:var(--font-agenci-title)]";
const dataText = "[font-family:var(--font-agenci-data)] tabular-nums";
const icon = { strokeWidth: 1.5, absoluteStrokeWidth: true } as const;

const TEMPLATES = [
  {
    label: "Kundestøtte",
    text: "Svarer på spørsmål om produkter, bestillinger, levering og retur, og hjelper kundene videre når de trenger et menneske.",
  },
  {
    label: "Salg",
    text: "Hjelper besøkende å finne riktig produkt eller tjeneste og svarer på spørsmål om priser og tilbud.",
  },
  {
    label: "Booking",
    text: "Hjelper kunder med å bestille, endre eller avbestille timer og svarer på praktiske spørsmål.",
  },
  {
    label: "Teknisk støtte",
    text: "Hjelper brukere med å komme i gang, løse vanlige problemer og finne riktig informasjon.",
  },
] as const;

const STEPS = ["Agent", "Kunnskap", "Opprett"] as const;
type Step = 0 | 1 | 2;

/** Accepts "triodelab.no" as well as full URLs. */
function normalizeUrl(raw: string) {
  const v = raw.trim();
  if (!v) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    if (!u.hostname.includes(".") || u.hostname.endsWith(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function hostOf(url: string | null | undefined) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "A";
}

const inputBase =
  "w-full rounded-[12px] border border-[#d7dce2] bg-white text-(--agenci-ink) outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#b3b9be] focus:border-(--agenci-ink-3) focus:shadow-[0_0_0_4px_rgb(36_50_54/0.07)] dark:border-white/10 dark:bg-transparent";

function PrimaryButton({
  children,
  disabled,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="group inline-flex h-12 items-center gap-2 rounded-full bg-(--agenci-ink) pr-5 pl-6 text-[15px] font-medium text-white shadow-[0_8px_20px_-10px_rgb(5_6_7/0.6)] transition-[background-color,opacity,transform] duration-150 hover:bg-(--agenci-accent-hover) active:scale-[0.97] disabled:pointer-events-none disabled:opacity-35 dark:text-[#0b0c0e]"
    >
      {children}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-12 items-center gap-1.5 rounded-full px-5 text-[15px] font-medium text-(--agenci-ink-2) transition-colors hover:bg-[#f1f3f2] hover:text-(--agenci-ink) dark:hover:bg-white/5"
    >
      <ArrowLeftIcon className="size-4" {...icon} />
      Tilbake
    </button>
  );
}

function Stepper({ step }: { step: Step }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Fremdrift">
      {STEPS.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          <span
            className={cn(
              "flex items-center gap-2.5 text-[13.5px] transition-colors duration-300",
              i === step
                ? "font-medium text-(--agenci-ink)"
                : i < step
                  ? "text-(--agenci-ink-2)"
                  : "text-(--agenci-ink-3)",
            )}
            aria-current={i === step ? "step" : undefined}
          >
            <span
              className={cn(
                dataText,
                "flex size-6 items-center justify-center rounded-full text-[12px] transition-[background-color,color,box-shadow] duration-300",
                i < step && "bg-(--agenci-ink) text-white dark:text-[#0b0c0e]",
                i === step &&
                  "text-(--agenci-ink) shadow-[inset_0_0_0_1.5px_var(--agenci-ink)]",
                i > step &&
                  "text-(--agenci-ink-3) shadow-[inset_0_0_0_1px_var(--agenci-line)]",
              )}
            >
              {i < step ? (
                <CheckIcon className="size-3" strokeWidth={2.5} />
              ) : (
                i + 1
              )}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </span>
          {i < STEPS.length - 1 ? (
            <span className="relative h-px w-8 overflow-hidden bg-(--agenci-line) sm:w-14">
              <span
                className="absolute inset-y-0 left-0 bg-(--agenci-ink) transition-[width] duration-500 ease-[cubic-bezier(.23,1,.32,1)]"
                style={{ width: i < step ? "100%" : "0%" }}
              />
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

type CardStatus = "draft" | "learning" | "ready" | "failed";

const CARD_STATUS: Record<
  CardStatus,
  { label: string; dot: string; pill: string }
> = {
  draft: {
    label: "Utkast",
    dot: "bg-(--agenci-ink-3)",
    pill: "bg-[#f1f3f2] text-(--agenci-ink-2) dark:bg-white/5",
  },
  learning: {
    label: "Lærer",
    dot: "bg-[#E49A62] animate-pulse",
    pill: "bg-[#fbf1e9] text-[#9a5a2a]",
  },
  ready: {
    label: "Aktiv",
    dot: "bg-(--agenci-ink)",
    pill: "bg-[#f1f3f2] text-(--agenci-ink) dark:bg-white/5",
  },
  failed: {
    label: "Feilet",
    dot: "bg-[#C4453A]",
    pill: "bg-[#fbeceb] text-[#a3372d]",
  },
};

/** How the agent will look in the agent list — updates while typing. */
function PreviewCard({
  name,
  description,
  url,
  logoUrl,
  brandColor,
  status = "draft",
  sources,
  conversations,
}: {
  name: string;
  description: string;
  url: string | null;
  logoUrl?: string | null;
  brandColor?: string | null;
  status?: CardStatus;
  sources?: number;
  conversations?: number;
}) {
  const host = hostOf(url);
  const color =
    brandColor && /^#[0-9a-f]{6}$/i.test(brandColor) ? brandColor : "#243236";
  const s = CARD_STATUS[status];
  const stats: [string, string][] = [
    ["Kilder", sources === undefined ? "–" : String(sources)],
    ["Samtaler", conversations === undefined ? "–" : String(conversations)],
    ["Språk", "Norsk"],
  ];
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-(--agenci-line) bg-white shadow-[0_1px_2px_rgb(5_6_7/0.04),0_32px_64px_-32px_rgb(5_6_7/0.32)] dark:bg-(--card)">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-44 transition-[background] duration-700"
        style={{
          background: `radial-gradient(120% 100% at 0% 0%, color-mix(in srgb, ${color} 12%, transparent), transparent 70%)`,
        }}
      />
      <div className="relative p-7">
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <span className="kb-card-in flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-white p-2.5 shadow-[inset_0_0_0_1px_rgb(5_6_7/0.08),0_6px_16px_-8px_rgb(5_6_7/0.25)]">
              <img
                src={logoUrl}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            </span>
          ) : (
            <span
              className={cn(
                titleText,
                "flex size-16 shrink-0 items-center justify-center rounded-[18px] text-[22px] font-medium text-white shadow-[0_8px_20px_-10px_rgb(5_6_7/0.5)] transition-[background] duration-700",
              )}
              style={{
                background: `linear-gradient(145deg, color-mix(in srgb, ${color} 82%, white), ${color})`,
              }}
            >
              {initials(name || "Agent")}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate text-[19px] leading-tight font-semibold tracking-[-0.015em]",
                name ? "text-(--agenci-ink)" : "text-(--agenci-ink-3)",
              )}
            >
              {name || "Navn på agenten"}
            </p>
            <p
              className={cn(
                dataText,
                "mt-1 flex items-center gap-0.5 truncate text-[13px] text-(--agenci-ink-3)",
              )}
            >
              {host ? (
                <>
                  {host}
                  <ArrowUpRightIcon className="size-3.5 shrink-0" {...icon} />
                </>
              ) : (
                "nettside.no"
              )}
            </p>
          </div>
        </div>
        <p
          className={cn(
            "mt-6 line-clamp-4 min-h-[72px] text-[15px] leading-[1.6]",
            description ? "text-(--agenci-ink-2)" : "text-(--agenci-ink-3)",
          )}
        >
          {description || "Hva agenten hjelper kundene med."}
        </p>
        <div className="mt-6 grid grid-cols-3 divide-x divide-(--agenci-line) border-t border-(--agenci-line) pt-5">
          {stats.map(([label, value]) => (
            <div key={label} className="min-w-0 px-4 first:pl-0 last:pr-0">
              <p className="text-[12.5px] text-(--agenci-ink-3)">{label}</p>
              <p
                className={cn(
                  titleText,
                  "mt-1.5 truncate text-[22px] leading-none font-medium tracking-[-0.02em] text-(--agenci-ink)",
                )}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="relative flex items-center gap-2 border-t border-(--agenci-line) bg-[#fafbfa] px-7 py-4 dark:bg-white/[0.02]">
        <span
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium",
            s.pill,
          )}
        >
          <span className={cn("size-1.5 rounded-full", s.dot)} />
          {s.label}
        </span>
        <span className="ml-auto text-[12.5px] text-(--agenci-ink-3)">
          Slik vises agenten
        </span>
      </div>
    </div>
  );
}

/* ---------- The steps ---------- */

function StepAgent({
  name,
  description,
  setName,
  setDescription,
  onNext,
}: {
  name: string;
  description: string;
  setName: (v: string) => void;
  setDescription: (v: string) => void;
  onNext: () => void;
}) {
  const ready = name.trim().length > 0 && description.trim().length > 0;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) onNext();
      }}
      className="kb-enter"
    >
      <h1
        className={cn(
          titleText,
          "text-[40px] leading-[1.05] font-medium tracking-[-0.03em] text-(--agenci-ink)",
        )}
      >
        Hvem er agenten din?
      </h1>

      <label className="mt-10 block">
        <span className="mb-2.5 block text-[14px] font-medium text-(--agenci-ink)">
          Navn
        </span>
        <input
          // biome-ignore lint/a11y/noAutofocus: first field of the flow
          autoFocus
          value={name}
          maxLength={80}
          onChange={(e) => setName(e.target.value)}
          placeholder="F.eks. Kundestøtte"
          className={cn(inputBase, "h-14 px-5 text-[17px]")}
        />
      </label>

      <div className="mt-6">
        <label
          htmlFor="agent-description"
          className="mb-2.5 block text-[14px] font-medium text-(--agenci-ink)"
        >
          Hva skal den hjelpe kundene med?
        </label>
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {TEMPLATES.map((t) => {
            const active = description === t.text;
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => setDescription(t.text)}
                aria-pressed={active}
                className={cn(
                  "h-9 rounded-full px-4 text-[13.5px] font-medium transition-[background-color,color,box-shadow] duration-150 active:scale-[0.97]",
                  active
                    ? "bg-(--agenci-ink) text-white dark:text-[#0b0c0e]"
                    : "bg-[#f1f3f2] text-(--agenci-ink-2) hover:text-(--agenci-ink) dark:bg-white/5",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <textarea
          id="agent-description"
          value={description}
          maxLength={500}
          rows={4}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && ready)
              onNext();
          }}
          placeholder="Beskriv med egne ord, eller velg et utgangspunkt over."
          className={cn(
            inputBase,
            "resize-none px-5 py-4 text-[15px] leading-relaxed",
          )}
        />
      </div>

      <div className="mt-10 flex justify-end">
        <PrimaryButton type="submit" disabled={!ready}>
          Fortsett
          <ArrowRightIcon
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            {...icon}
          />
        </PrimaryButton>
      </div>
    </form>
  );
}

function StepKnowledge({
  url,
  setUrl,
  onBack,
  onNext,
}: {
  url: string;
  setUrl: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const normalized = normalizeUrl(url);
  const [touched, setTouched] = useState(false);
  const invalid = touched && url.trim().length > 0 && !normalized;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (normalized) {
          setUrl(normalized);
          onNext();
        } else setTouched(true);
      }}
      className="kb-enter"
    >
      <h1
        className={cn(
          titleText,
          "text-[40px] leading-[1.05] font-medium tracking-[-0.03em] text-(--agenci-ink)",
        )}
      >
        Hvor skal den lære fra?
      </h1>
      <p className="mt-4 max-w-[520px] text-[16px] leading-relaxed text-(--agenci-ink-2)">
        Agenten leser nettsiden din og henter også logo og farger derfra.
      </p>

      <label className="mt-10 block">
        <span className="mb-2.5 block text-[14px] font-medium text-(--agenci-ink)">
          Nettside
        </span>
        <span className="relative block">
          <GlobeIcon
            className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-(--agenci-ink-3)"
            {...icon}
          />
          <input
            // biome-ignore lint/a11y/noAutofocus: the only field of this step
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="dinbedrift.no"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            aria-invalid={invalid}
            className={cn(
              inputBase,
              "h-14 pr-12 pl-12 text-[17px]",
              invalid && "border-[#d9837a] focus:border-[#d9837a]",
            )}
          />
          <span
            className={cn(
              "absolute top-1/2 right-4 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-(--agenci-ink) text-white transition-[opacity,transform] duration-200 dark:text-[#0b0c0e]",
              normalized ? "scale-100 opacity-100" : "scale-75 opacity-0",
            )}
            aria-hidden
          >
            <CheckIcon className="size-3.5" strokeWidth={2.5} />
          </span>
        </span>
        <span
          className={cn(
            "mt-2.5 block text-[13px]",
            invalid ? "text-[#a3372d]" : "text-(--agenci-ink-3)",
          )}
        >
          {invalid
            ? "Det ser ikke ut som en nettadresse."
            : "Du kan legge til flere sider og dokumenter senere."}
        </span>
      </label>

      <div className="mt-10 flex items-center justify-between">
        <BackButton onClick={onBack} />
        <PrimaryButton type="submit" disabled={!normalized}>
          Fortsett
          <ArrowRightIcon
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            {...icon}
          />
        </PrimaryButton>
      </div>
    </form>
  );
}

function StepReview({
  name,
  description,
  url,
  pending,
  onEdit,
  onBack,
  onCreate,
}: {
  name: string;
  description: string;
  url: string;
  pending: boolean;
  onEdit: (s: Step) => void;
  onBack: () => void;
  onCreate: () => void;
}) {
  const rows: { label: string; value: string; step: Step }[] = [
    { label: "Navn", value: name, step: 0 },
    { label: "Hjelper med", value: description, step: 0 },
    { label: "Lærer fra", value: hostOf(url) ?? url, step: 1 },
  ];
  return (
    <div className="kb-enter">
      <h1
        className={cn(
          titleText,
          "text-[40px] leading-[1.05] font-medium tracking-[-0.03em] text-(--agenci-ink)",
        )}
      >
        Klar til å lære
      </h1>

      <dl className="mt-8 divide-y divide-(--agenci-line) rounded-[16px] border border-(--agenci-line) bg-white dark:bg-transparent">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-4 px-5 py-4">
            <dt className="w-32 shrink-0 pt-px text-[13.5px] text-(--agenci-ink-3)">
              {r.label}
            </dt>
            <dd className="line-clamp-2 min-w-0 flex-1 text-[14px] leading-snug text-(--agenci-ink)">
              {r.value}
            </dd>
            <button
              type="button"
              onClick={() => onEdit(r.step)}
              className="shrink-0 text-[12.5px] font-medium text-(--agenci-ink-3) transition-colors hover:text-(--agenci-ink)"
            >
              Endre
            </button>
          </div>
        ))}
      </dl>

      <div className="mt-10 flex items-center justify-between">
        <BackButton onClick={onBack} />
        <PrimaryButton onClick={onCreate} disabled={pending}>
          {pending ? (
            <>
              <AgenciLoader size={22} decorative />
              Oppretter
            </>
          ) : (
            <>
              Opprett agent
              <ArrowRightIcon
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                {...icon}
              />
            </>
          )}
        </PrimaryButton>
      </div>
    </div>
  );
}

/* ---------- After create: watch the agent learn ---------- */

const PHASES = [
  { label: "Agenten er opprettet", hint: "Navn og oppgave er lagret" },
  {
    label: "Leser nettsiden",
    hint: "Henter innhold, logo og farger fra {host}",
  },
  { label: "Bygger kunnskapsbasen", hint: "Deler opp innholdet og lærer det" },
  {
    label: "Klar til å svare kunder",
    hint: "Svarer på norsk ut fra det den har lært",
  },
] as const;

function Learning({
  agentId,
  name,
  description,
  url,
}: {
  agentId: string;
  name: string;
  description: string;
  url: string;
}) {
  const { orgSlug } = useParams({ from: "/_authed/org/$orgSlug" });
  const { data: docs } = useAgentDocumentsQuery(agentId);
  const retry = useAddWebpageMutation(agentId);
  const doc = docs?.[0];
  const done = doc?.status === "COMPLETED";
  const failed = doc?.status === "FAILED";
  // Poll the list for the real logo/colours scraped from the site.
  const { data: agents } = useAgentsListQuery({
    refetchInterval: done || failed ? false : 3000,
  });
  const agent = agents?.find((a) => a.id === agentId);

  const phase = !doc
    ? 1
    : doc.status === "PENDING" || doc.status === "PROCESSING"
      ? 1
      : doc.status === "INDEXING"
        ? 2
        : done
          ? 4
          : 1;

  // Elapsed time, so waiting feels alive.
  const start = useRef(Date.now());
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (done || failed) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [done, failed]);
  const secs = Math.floor((now - start.current) / 1000);
  const params = { orgSlug, agentId };
  const host = hostOf(url);

  return (
    <div className="mx-auto grid w-full max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-20">
      <div className="kb-enter">
        <h1
          className={cn(
            titleText,
            "text-[40px] leading-[1.05] font-medium tracking-[-0.03em] text-(--agenci-ink)",
          )}
        >
          {done
            ? `${name} er klar`
            : failed
              ? "Vi fikk ikke lest nettsiden"
              : `${name} lærer ${host ?? "nettsiden"}`}
        </h1>
        <p className="mt-4 max-w-[520px] text-[16px] leading-relaxed text-(--agenci-ink-2)">
          {done
            ? "Kunnskapsbasen er bygget. Test agenten eller tilpass widgeten."
            : failed
              ? "Sjekk at adressen stemmer og at siden er offentlig, og prøv igjen."
              : "Dette tar vanligvis under ett minutt. Du kan gå videre imens."}
        </p>

        <ol className="mt-10 overflow-hidden rounded-[20px] border border-(--agenci-line) bg-white dark:bg-transparent">
          {PHASES.map((p, i) => {
            const state =
              failed && i === phase
                ? "failed"
                : i < phase
                  ? "done"
                  : i === phase
                    ? "active"
                    : "todo";
            return (
              <li
                key={p.label}
                className={cn(
                  "relative flex items-center gap-4 px-5 py-4 transition-colors duration-300",
                  i > 0 && "border-t border-(--agenci-line)",
                  state === "active" && "bg-[#fafbfa] dark:bg-white/[0.03]",
                )}
              >
                <span
                  className={cn(
                    "relative flex size-9 shrink-0 items-center justify-center rounded-full transition-[background-color,box-shadow,color] duration-300",
                    state === "done" &&
                      "bg-(--agenci-ink) text-white dark:text-[#0b0c0e]",
                    state === "active" &&
                      "bg-white shadow-[inset_0_0_0_1.5px_var(--agenci-ink)] dark:bg-transparent",
                    state === "todo" &&
                      "text-(--agenci-ink-3) shadow-[inset_0_0_0_1px_var(--agenci-line)]",
                    state === "failed" && "bg-[#fbeceb] text-[#a3372d]",
                  )}
                >
                  {state === "done" ? (
                    <CheckIcon className="size-4" strokeWidth={2.5} />
                  ) : state === "active" ? (
                    <AgenciLoader size={22} decorative />
                  ) : state === "failed" ? (
                    <XIcon className="size-4" strokeWidth={2.5} />
                  ) : (
                    <span className={cn(dataText, "text-[12px]")}>{i + 1}</span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-[16px] leading-snug font-medium transition-colors duration-300",
                      state === "todo"
                        ? "text-(--agenci-ink-3)"
                        : "text-(--agenci-ink)",
                    )}
                  >
                    {p.label}
                  </span>
                  <span className="mt-0.5 block truncate text-[13.5px] text-(--agenci-ink-3)">
                    {p.hint.replace("{host}", host ?? "nettsiden")}
                  </span>
                </span>
                <span
                  className={cn(
                    dataText,
                    "shrink-0 text-[12.5px]",
                    state === "failed"
                      ? "text-[#a3372d]"
                      : "text-(--agenci-ink-3)",
                  )}
                >
                  {state === "done"
                    ? "Ferdig"
                    : state === "active"
                      ? `${secs}s`
                      : state === "failed"
                        ? "Feilet"
                        : "Venter"}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 flex flex-wrap items-center gap-2">
          {failed ? (
            <PrimaryButton
              disabled={retry.isPending}
              onClick={() => retry.mutate({ url })}
            >
              <RotateCcwIcon className="size-4" {...icon} />
              Prøv igjen
            </PrimaryButton>
          ) : null}
          {done ? (
            <Link
              to="/org/$orgSlug/agents/$agentId/customization"
              params={params}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-(--agenci-ink) pr-5 pl-6 text-[15px] font-medium text-white shadow-[0_8px_20px_-10px_rgb(5_6_7/0.6)] transition-transform active:scale-[0.97] dark:text-[#0b0c0e]"
            >
              <PaletteIcon className="size-4" {...icon} />
              Tilpass og test widgeten
            </Link>
          ) : null}
          <Link
            to={
              done
                ? "/org/$orgSlug/agents/$agentId/files"
                : "/org/$orgSlug/agents/$agentId"
            }
            params={params}
            className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-[15px] font-medium text-(--agenci-ink-2) transition-colors hover:bg-[#f1f3f2] hover:text-(--agenci-ink) dark:hover:bg-white/5"
          >
            {done ? (
              <>
                <BookOpenIcon className="size-4" {...icon} />
                Se kunnskapsbasen
              </>
            ) : (
              <>
                Gå til agenten
                <ArrowRightIcon className="size-4" {...icon} />
              </>
            )}
          </Link>
          {done ? (
            <Link
              to="/org/$orgSlug/agents/$agentId/conversations"
              params={params}
              className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-[15px] font-medium text-(--agenci-ink-2) transition-colors hover:bg-[#f1f3f2] hover:text-(--agenci-ink) dark:hover:bg-white/5"
            >
              <MessagesSquareIcon className="size-4" {...icon} />
              Samtaler
            </Link>
          ) : null}
        </div>
      </div>

      <div className="lg:sticky lg:top-6">
        <PreviewCard
          name={agent?.name ?? name}
          description={agent?.description ?? description}
          url={agent?.websiteUrl ?? url}
          logoUrl={agent?.logoUrl}
          brandColor={agent?.brandColor}
          status={done ? "ready" : failed ? "failed" : "learning"}
          sources={agent?.sourceCount}
          conversations={agent?.conversationCount}
        />
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function AgentCreationView() {
  const { orgSlug } = useParams({ from: "/_authed/org/$orgSlug" });
  const draft = useAgentDraftStore((s) => s.draft);
  const setDraft = useAgentDraftStore((s) => s.setDraft);
  const create = useCreateAgentMutation({ stay: true });

  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState(draft?.name ?? "");
  const [description, setDescription] = useState(draft?.description ?? "");
  const [url, setUrl] = useState(draft?.url ?? "");
  const [created, setCreated] = useState<{
    id: string;
    name: string;
    description: string;
    url: string;
  } | null>(null);

  // Keep the draft if the user leaves and comes back.
  useEffect(() => {
    if (!created) setDraft({ name, description, url });
  }, [name, description, url, created, setDraft]);

  if (created) {
    return (
      <div className="flex w-full flex-col py-4 lg:py-10">
        <Learning
          agentId={created.id}
          name={created.name}
          description={created.description}
          url={created.url}
        />
      </div>
    );
  }

  const normalized = normalizeUrl(url);
  const onCreate = () => {
    if (!normalized) return setStep(1);
    const input = {
      name: name.trim(),
      description: description.trim(),
      url: normalized,
    };
    create.mutate(input, {
      onSuccess: (res) => {
        if (res.agent) setCreated({ id: res.agent.id, ...input });
      },
    });
  };

  return (
    <div className="flex w-full flex-col">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <Link
          to="/org/$orgSlug/agents"
          params={{ orgSlug }}
          className="inline-flex h-9 items-center gap-1.5 rounded-full pr-3 pl-2 text-[13px] font-medium text-(--agenci-ink-2) transition-colors hover:bg-[#f1f3f2] hover:text-(--agenci-ink) dark:hover:bg-white/5"
        >
          <XIcon className="size-4" {...icon} />
          Avbryt
        </Link>
        <Stepper step={step} />
        <span className="w-[76px]" aria-hidden />
      </div>

      <div className="mx-auto mt-10 grid w-full max-w-6xl items-start gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-20">
        <div key={step} className="max-w-[600px]">
          {step === 0 ? (
            <StepAgent
              name={name}
              description={description}
              setName={setName}
              setDescription={setDescription}
              onNext={() => setStep(1)}
            />
          ) : step === 1 ? (
            <StepKnowledge
              url={url}
              setUrl={setUrl}
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
            />
          ) : (
            <StepReview
              name={name.trim()}
              description={description.trim()}
              url={normalized ?? url}
              pending={create.isPending}
              onEdit={setStep}
              onBack={() => setStep(1)}
              onCreate={onCreate}
            />
          )}
        </div>

        <aside className="hidden lg:sticky lg:top-6 lg:block">
          <PreviewCard
            name={name.trim()}
            description={description.trim()}
            url={normalized}
          />
        </aside>
      </div>
    </div>
  );
}
