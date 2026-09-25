/**
 * "Oppførsel" — how the agent thinks and answers.
 *
 * Settings-page pattern (sticky section nav + settings cards with a footer),
 * built on DESIGN.md v1.2: Gellix sub-headings, Circular lead text, Inter UI,
 * Space Grotesk captions, pill controls, 16–24px cards, Lucide 1.5 icons.
 * Everything maps 1:1 to the instructions the agent receives — the last card
 * shows exactly that text (same builder the server uses).
 */
import { cn } from "@workspace/ui/lib/utils";
import {
  BadgePercentIcon,
  BrainCircuitIcon,
  BriefcaseBusinessIcon,
  CheckIcon,
  CoffeeIcon,
  CopyIcon,
  CpuIcon,
  CrosshairIcon,
  FileCode2Icon,
  GaugeIcon,
  HandIcon,
  LanguagesIcon,
  ListChecksIcon,
  MessageCircleQuestionIcon,
  MessageSquareWarningIcon,
  MessagesSquareIcon,
  PackageIcon,
  PlusIcon,
  ShieldAlertIcon,
  ShieldXIcon,
  SmileIcon,
  SmilePlusIcon,
  SparklesIcon,
  Trash2Icon,
  UserRoundIcon,
  XIcon,
  ZapIcon,
} from "lucide-react";
import { createContext, useContext, useRef, useState } from "react";
import {
  buildBehaviorInstructions,
  DEFAULT_AGENT_MODEL,
} from "server/agent-behavior";
import { Segment } from "@/components/segment";
import type { WidgetCustomization } from "../../queries/customization-queries";

/** Same shape the server validates (only the allowed models). */
export type Behavior = NonNullable<WidgetCustomization["behavior"]>;
type ModelId = NonNullable<Behavior["model"]>;
type Icon = React.ComponentType<{
  className?: string;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
}>;

const ICON = { strokeWidth: 1.5, absoluteStrokeWidth: true } as const;
const caption =
  "text-[12px] font-medium tracking-[0.06em] uppercase text-(--agenci-ink-3) [font-family:var(--font-agenci-data)]";
const input =
  "h-11 w-full rounded-[10px] border border-[#d7dce2] bg-white px-3.5 text-[14px] text-(--agenci-ink) outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-(--agenci-ink-3) focus:border-(--agenci-ink-3) focus:shadow-[0_0_0_3px_rgb(36_50_54/0.08)] dark:border-white/10 dark:bg-transparent";

// ─── Data ────────────────────────────────────────────────────────────────────

const MODELS: {
  id: ModelId;
  name: string;
  description: string;
  badge: string;
  icon: Icon;
}[] = [
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o mini",
    description: "Rask og rimelig. Dekker de aller fleste kundespørsmål.",
    badge: "Raskest",
    icon: ZapIcon,
  },
  {
    id: "openai/gpt-4.1-mini",
    name: "GPT-4.1 mini",
    description: "Litt smartere, fortsatt rask. Noe høyere pris.",
    badge: "Balansert",
    icon: GaugeIcon,
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    description: "Høy kvalitet og god språkfølelse. Høyere pris per samtale.",
    badge: "Kvalitet",
    icon: SparklesIcon,
  },
  {
    id: "openai/gpt-4.1",
    name: "GPT-4.1",
    description: "Best på vanskelige og sammensatte spørsmål. Høyest pris.",
    badge: "Smartest",
    icon: BrainCircuitIcon,
  },
];

const TONES: {
  value: NonNullable<Behavior["tone"]>;
  label: string;
  description: string;
  icon: Icon;
}[] = [
  {
    value: "vennlig",
    label: "Vennlig",
    description: "Varm og imøtekommende",
    icon: SmileIcon,
  },
  {
    value: "profesjonell",
    label: "Profesjonell",
    description: "Saklig og ryddig",
    icon: BriefcaseBusinessIcon,
  },
  {
    value: "uformell",
    label: "Uformell",
    description: "Avslappet og personlig",
    icon: CoffeeIcon,
  },
  {
    value: "presis",
    label: "Presis",
    description: "Rett på sak",
    icon: CrosshairIcon,
  },
];

const RULE_TEMPLATES: { category: string; icon: Icon; rules: string[] }[] = [
  {
    category: "Kommunikasjon",
    icon: MessagesSquareIcon,
    rules: [
      "Tilby alltid å sende svaret på e-post.",
      "Still et oppklarende spørsmål hvis kundens spørsmål er uklart.",
    ],
  },
  {
    category: "Priser og salg",
    icon: BadgePercentIcon,
    rules: [
      "Gi aldri rabatter eller lov noe som ikke står i kunnskapsbasen.",
      "Oppgi aldri priser som ikke står i kunnskapsbasen.",
    ],
  },
  {
    category: "Bestilling og levering",
    icon: PackageIcon,
    rules: [
      "Spør om ordrenummer når kunden spør om en bestilling.",
      "Ikke lov konkrete leveringsdatoer.",
    ],
  },
  {
    category: "Klager og konkurrenter",
    icon: ShieldAlertIcon,
    rules: [
      "Henvis klager til kundeservice på e-post.",
      "Ikke snakk om konkurrenter.",
    ],
  },
];

const TOPIC_SUGGESTIONS = [
  "Politikk",
  "Konkurrenter",
  "Medisinske råd",
  "Juridiske råd",
  "Lønn og ansatte",
];

/** A sample answer that follows the chosen personality, updated live. */
function sampleAnswer(b: Behavior) {
  const you = b.formality === "de" ? "De" : "du";
  const base: Record<string, string> = {
    vennlig: `Så hyggelig at ${you} spør! Vi har åpent 10–18 på hverdager og 10–16 på lørdager.`,
    profesjonell:
      "Åpningstidene våre er 10–18 på hverdager og 10–16 på lørdager.",
    uformell:
      "Vi holder åpent 10–18 i ukedagene og 10–16 på lørdag – bare stikk innom!",
    presis: "Hverdager 10–18, lørdag 10–16.",
  };
  let text = base[b.tone ?? "vennlig"] ?? "";
  if (b.length === "utfyllende")
    text += ` Søndager og helligdager har vi stengt. Er det noe mer jeg kan hjelpe ${b.formality === "de" ? "Dem" : "deg"} med?`;
  if (b.length === "kort") text = text.split(/(?<=[.!])\s/)[0] ?? text;
  if (b.language === "nynorsk")
    text = text
      .replace("hyggelig", "kjekt")
      .replace("har åpent", "har ope")
      .replace("holder åpent", "har ope")
      .replace("Åpningstidene", "Opningstidene")
      .replace("noe mer", "noko meir");
  if (b.emoji !== false && (b.tone ?? "vennlig") !== "presis") text += " 😊";
  return text;
}

// ─── Building blocks ─────────────────────────────────────────────────────────

function SettingsCard({
  id,
  icon: IconCmp,
  title,
  aside,
  children,
}: {
  id: string;
  icon: Icon;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  // Only the active section renders; the others keep no DOM (state lives in
  // the parent's `behavior`, so switching never loses anything).
  if (useContext(ActiveSection) !== id) return null;
  return (
    <section
      id={id}
      className="kb-enter overflow-hidden rounded-[20px] border border-(--agenci-line) bg-white shadow-[0_1px_2px_rgb(5_6_7/0.04),0_8px_24px_-16px_rgb(5_6_7/0.12)] dark:bg-(--card)"
    >
      <header className="flex items-center gap-4 px-6 pt-6">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-[#f3f5f4] text-(--agenci-ink) dark:bg-white/5">
          <IconCmp className="size-5" {...ICON} />
        </span>
        <h2 className="min-w-0 flex-1 [font-family:var(--font-agenci-title)] text-[21px] leading-[1.25] font-medium tracking-[-0.04em] text-(--agenci-ink)">
          {title}
        </h2>
        {aside}
      </header>
      <div className="px-6 pt-5 pb-6">{children}</div>
    </section>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.97]",
        checked ? "bg-(--agenci-ink)" : "bg-[#d7dce2] dark:bg-white/15",
      )}
    >
      <span
        className={cn(
          "absolute top-1 size-4 rounded-full bg-white shadow-[0_1px_2px_rgb(5_6_7/0.2)] transition-[left] duration-200 ease-[cubic-bezier(.23,1,.32,1)] dark:bg-[#0b0c0e]",
          checked ? "left-5" : "left-1",
        )}
      />
    </button>
  );
}

/** A labelled row with an icon on the left and a control on the right. */
function Row({
  icon: IconCmp,
  title,
  children,
}: {
  icon: Icon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 py-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f3f5f4] text-(--agenci-ink-2) dark:bg-white/5">
        <IconCmp className="size-4" {...ICON} />
      </span>
      <p className="min-w-0 flex-1 text-[14px] font-medium text-(--agenci-ink)">
        {title}
      </p>
      {children}
    </div>
  );
}

// ─── Sections (one visible at a time) ────────────────────────────────────────

const SECTIONS: { id: string; label: string; icon: Icon }[] = [
  { id: "bh-model", label: "AI-modell", icon: CpuIcon },
  { id: "bh-personality", label: "Personlighet", icon: SmileIcon },
  { id: "bh-rules", label: "Regler", icon: ListChecksIcon },
  { id: "bh-topics", label: "Emner å unngå", icon: ShieldXIcon },
  { id: "bh-handover", label: "Overlevering", icon: HandIcon },
  { id: "bh-instructions", label: "Instruksjoner", icon: FileCode2Icon },
];

/** Which section is showing — one at a time, so nothing needs scrolling. */
const ActiveSection = createContext<string>(SECTIONS[0]?.id ?? "");

// ─── Component ───────────────────────────────────────────────────────────────

export function BehaviorSettings({
  behavior,
  onChange,
}: {
  behavior: Behavior;
  onChange: (next: Behavior) => void;
}) {
  const b = behavior;
  const set = (patch: Partial<Behavior>) => onChange({ ...b, ...patch });
  const [newRule, setNewRule] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState(SECTIONS[0]?.id ?? "");
  const ruleInput = useRef<HTMLInputElement>(null);

  const rules = b.rules ?? [];
  const topics = b.avoidTopics ?? [];
  const model = b.model ?? DEFAULT_AGENT_MODEL;
  const prompt = buildBehaviorInstructions(b).trim();
  const esc = b.escalation ?? {};
  const enabledRules = rules.filter((r) => r.enabled).length;

  const addRule = (text: string) => {
    const t = text.trim();
    if (!t || rules.length >= 20 || rules.some((r) => r.text === t)) return;
    set({
      rules: [
        ...rules,
        {
          id: `r${Date.now().toString(36)}`,
          text: t.slice(0, 240),
          enabled: true,
        },
      ],
    });
    setNewRule("");
  };
  const addTopic = (text: string) => {
    const t = text.trim();
    if (
      !t ||
      topics.length >= 20 ||
      topics.some((x) => x.toLowerCase() === t.toLowerCase())
    )
      return;
    set({ avoidTopics: [...topics, t.slice(0, 60)] });
    setNewTopic("");
  };

  const status: Record<string, string> = {
    "bh-model": MODELS.find((m) => m.id === model)?.name ?? "",
    "bh-personality":
      TONES.find((t) => t.value === (b.tone ?? "vennlig"))?.label ?? "",
    "bh-rules": enabledRules ? `${enabledRules} aktive` : "Ingen",
    "bh-topics": topics.length ? String(topics.length) : "Ingen",
    "bh-handover": `${[esc.onHumanRequest !== false, esc.onComplaint, esc.onUncertain].filter(Boolean).length} utløsere`,
    "bh-instructions": prompt ? "Tilpasset" : "Standard",
  };

  return (
    <ActiveSection.Provider value={active}>
      <div className="grid gap-6 lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-8">
        {/* Section tabs: a row on small screens, a column on large ones */}
        <nav aria-label="Oppførsel">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:sticky lg:top-2 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
            <p className={cn(caption, "mb-2 hidden px-3 lg:block")}>
              Oppførsel
            </p>
            {SECTIONS.map((s) => {
              const on = active === s.id;
              const SIcon = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActive(s.id)}
                  className={cn(
                    "group flex shrink-0 items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-[14px] whitespace-nowrap transition-[background-color,color,transform] duration-150 active:scale-[0.98]",
                    on
                      ? "bg-white text-(--agenci-ink) shadow-[0_1px_2px_rgb(5_6_7/0.06)] dark:bg-white/10"
                      : "text-(--agenci-ink-2) hover:bg-white/60 hover:text-(--agenci-ink) dark:hover:bg-white/5",
                  )}
                >
                  <SIcon
                    className={cn(
                      "size-4 shrink-0",
                      on ? "text-(--agenci-ink)" : "text-(--agenci-ink-3)",
                    )}
                    {...ICON}
                  />
                  <span className="flex-1 truncate">{s.label}</span>
                  <span className="hidden text-[12px] tabular-nums text-(--agenci-ink-3) [font-family:var(--font-agenci-data)] lg:inline">
                    {status[s.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="flex min-w-0 max-w-[880px] flex-col gap-5">
          {/* ── Model ─────────────────────────────────────────────────── */}
          <SettingsCard id="bh-model" icon={CpuIcon} title="AI-modell">
            <div className="overflow-hidden rounded-[16px] border border-(--agenci-line)">
              {MODELS.map((m, i) => {
                const on = m.id === model;
                const MIcon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      set({
                        model: m.id === DEFAULT_AGENT_MODEL ? undefined : m.id,
                      })
                    }
                    className={cn(
                      "flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors duration-150",
                      i > 0 && "border-t border-(--agenci-line)",
                      on
                        ? "bg-[#f6f7f6] dark:bg-white/[0.05]"
                        : "hover:bg-[#fafbfa] dark:hover:bg-white/[0.02]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-[12px] transition-colors",
                        on
                          ? "bg-(--agenci-ink) text-white dark:text-[#0b0c0e]"
                          : "bg-[#f3f5f4] text-(--agenci-ink-2) dark:bg-white/5",
                      )}
                    >
                      <MIcon className="size-5" {...ICON} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-[15px] font-medium text-(--agenci-ink)">
                          {m.name}
                        </span>
                        <span className="rounded-full border border-(--agenci-line) px-2 text-[12px] leading-5 text-(--agenci-ink-2)">
                          {m.badge}
                        </span>
                        {m.id === DEFAULT_AGENT_MODEL ? (
                          <span
                            className={cn(caption, "text-(--agenci-ink-3)")}
                          >
                            Standard
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-(--agenci-ink-2)">
                        {m.description}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                        on
                          ? "border-(--agenci-ink) bg-(--agenci-ink)"
                          : "border-[#c9cfd5]",
                      )}
                    >
                      {on ? (
                        <CheckIcon
                          className="size-3 text-white dark:text-[#0b0c0e]"
                          strokeWidth={2.5}
                        />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </SettingsCard>

          {/* ── Personality ───────────────────────────────────────────── */}
          <SettingsCard
            id="bh-personality"
            icon={SmileIcon}
            title="Personlighet"
          >
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
              <div className="flex flex-col gap-6">
                <div>
                  <p className={cn(caption, "mb-2.5")}>Tone</p>
                  <div className="grid grid-cols-2 gap-2">
                    {TONES.map((t) => {
                      const on = (b.tone ?? "vennlig") === t.value;
                      const TIcon = t.icon;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          aria-pressed={on}
                          onClick={() => set({ tone: t.value })}
                          className={cn(
                            "flex items-center gap-3 rounded-[16px] border p-3 text-left transition-[border-color,box-shadow,background-color] duration-150 active:scale-[0.99]",
                            on
                              ? "border-(--agenci-ink) bg-[#f6f7f6] shadow-[0_0_0_1px_var(--agenci-ink)] dark:bg-white/[0.05]"
                              : "border-(--agenci-line) hover:border-(--agenci-ink-3)",
                          )}
                        >
                          <TIcon
                            className={cn(
                              "size-5 shrink-0",
                              on
                                ? "text-(--agenci-ink)"
                                : "text-(--agenci-ink-3)",
                            )}
                            {...ICON}
                          />
                          <span className="min-w-0">
                            <span className="block text-[14px] font-medium text-(--agenci-ink)">
                              {t.label}
                            </span>
                            <span className="block truncate text-[12.5px] text-(--agenci-ink-3)">
                              {t.description}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className={cn(caption, "mb-2.5")}>Svarlengde</p>
                    <Segment
                      label="Svarlengde"
                      options={[
                        { value: "kort", label: "Kort" },
                        { value: "balansert", label: "Balansert" },
                        { value: "utfyllende", label: "Grundig" },
                      ]}
                      value={b.length ?? "balansert"}
                      onChange={(v) => set({ length: v })}
                    />
                  </div>
                  <div>
                    <p className={cn(caption, "mb-2.5")}>Tiltale</p>
                    <Segment
                      label="Tiltale"
                      options={[
                        { value: "du", label: "Du" },
                        { value: "de", label: "De" },
                      ]}
                      value={b.formality ?? "du"}
                      onChange={(v) => set({ formality: v })}
                    />
                  </div>
                </div>
                <div className="divide-y divide-(--agenci-line) border-y border-(--agenci-line)">
                  <Row icon={LanguagesIcon} title="Språk">
                    <Segment
                      label="Språk"
                      options={[
                        { value: "bokmal", label: "Bokmål" },
                        { value: "nynorsk", label: "Nynorsk" },
                        { value: "kundens", label: "Kundens" },
                      ]}
                      value={b.language ?? "bokmal"}
                      onChange={(v) => set({ language: v })}
                    />
                  </Row>
                  <Row icon={SmilePlusIcon} title="Emojier">
                    <Toggle
                      checked={b.emoji !== false}
                      onChange={(v) => set({ emoji: v })}
                      label="Emojier"
                    />
                  </Row>
                </div>
              </div>

              {/* Style sample (DESIGN.md conversation) */}
              <aside className="flex flex-col rounded-[16px] bg-[#f6f7f6] p-4 dark:bg-white/[0.04]">
                <p className={cn(caption, "mb-3")}>Stilprøve</p>
                <div className="flex flex-1 flex-col justify-center gap-2.5">
                  <p className="ml-auto max-w-[85%] rounded-[18px] rounded-br-[6px] bg-(--agenci-ink) px-3.5 py-2.5 text-[14px] text-white dark:text-[#0b0c0e]">
                    Hva er åpningstidene?
                  </p>
                  <p
                    key={sampleAnswer(b)}
                    className="kb-card-in max-w-[92%] rounded-[18px] rounded-bl-[6px] border border-(--agenci-line) bg-white px-3.5 py-2.5 text-[15px] leading-[1.6] text-(--agenci-ink) [font-family:var(--font-agenci-voice)] dark:bg-transparent"
                  >
                    {sampleAnswer(b)}
                  </p>
                </div>
              </aside>
            </div>
          </SettingsCard>

          {/* ── Rules ─────────────────────────────────────────────────── */}
          <SettingsCard
            id="bh-rules"
            icon={ListChecksIcon}
            title="Regler"
            aside={
              <span className="rounded-full bg-[#f3f5f4] px-2.5 py-1 text-[12px] tabular-nums text-(--agenci-ink-2) [font-family:var(--font-agenci-data)] dark:bg-white/5">
                {rules.length}/20
              </span>
            }
          >
            {rules.length ? (
              <ol className="mb-4 overflow-hidden rounded-[16px] border border-(--agenci-line)">
                {rules.map((r, i) => (
                  <li
                    key={r.id}
                    className={cn(
                      "kb-card-in group flex items-center gap-3 px-4 py-3",
                      i > 0 && "border-t border-(--agenci-line)",
                      !r.enabled && "bg-[#fafbfa] dark:bg-white/[0.02]",
                    )}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f3f5f4] text-[12px] tabular-nums text-(--agenci-ink-2) [font-family:var(--font-agenci-data)] dark:bg-white/5">
                      {i + 1}
                    </span>
                    <input
                      value={r.text}
                      maxLength={240}
                      onChange={(e) =>
                        set({
                          rules: rules.map((x) =>
                            x.id === r.id ? { ...x, text: e.target.value } : x,
                          ),
                        })
                      }
                      aria-label={`Regel ${i + 1}`}
                      className={cn(
                        "min-w-0 flex-1 bg-transparent text-[14px] outline-none",
                        r.enabled
                          ? "text-(--agenci-ink)"
                          : "text-(--agenci-ink-3)",
                      )}
                    />
                    <button
                      type="button"
                      aria-label="Slett regel"
                      onClick={() =>
                        set({ rules: rules.filter((x) => x.id !== r.id) })
                      }
                      className="flex size-8 items-center justify-center rounded-full text-(--agenci-ink-3) opacity-0 transition-[opacity,color] duration-150 group-hover:opacity-100 hover:text-[#9A4B3F] focus-visible:opacity-100"
                    >
                      <Trash2Icon className="size-4" {...ICON} />
                    </button>
                    <Toggle
                      checked={r.enabled}
                      onChange={(v) =>
                        set({
                          rules: rules.map((x) =>
                            x.id === r.id ? { ...x, enabled: v } : x,
                          ),
                        })
                      }
                      label={r.enabled ? "Slå av regel" : "Slå på regel"}
                    />
                  </li>
                ))}
              </ol>
            ) : null}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addRule(newRule);
              }}
              className="flex gap-2"
            >
              <input
                ref={ruleInput}
                value={newRule}
                maxLength={240}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="Skriv en regel, f.eks. «Tilby alltid å ringe kunden tilbake»"
                aria-label="Ny regel"
                className={input}
              />
              <button
                type="submit"
                disabled={!newRule.trim()}
                className="group inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-(--agenci-ink) pr-4 pl-5 text-[14px] font-medium text-white transition-[opacity,transform] duration-150 active:scale-[0.97] disabled:opacity-40 dark:text-[#0b0c0e]"
              >
                Legg til
                <PlusIcon
                  className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  {...ICON}
                />
              </button>
            </form>

            <p className={cn(caption, "mt-6 mb-3")}>Maler</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {RULE_TEMPLATES.map((cat) => {
                const CIcon = cat.icon;
                const available = cat.rules.filter(
                  (t) => !rules.some((r) => r.text === t),
                );
                return (
                  <div
                    key={cat.category}
                    className="rounded-[16px] border border-(--agenci-line) p-3.5"
                  >
                    <p className="mb-2 flex items-center gap-2 text-[13px] font-medium text-(--agenci-ink)">
                      <CIcon
                        className="size-4 text-(--agenci-ink-3)"
                        {...ICON}
                      />
                      {cat.category}
                    </p>
                    {available.length ? (
                      <ul className="flex flex-col gap-1">
                        {available.map((t) => (
                          <li key={t}>
                            <button
                              type="button"
                              onClick={() => addRule(t)}
                              className="group flex w-full items-start gap-2 rounded-[10px] px-2 py-1.5 text-left text-[13px] leading-snug text-(--agenci-ink-2) transition-colors hover:bg-[#f6f7f6] hover:text-(--agenci-ink) dark:hover:bg-white/5"
                            >
                              <PlusIcon
                                className="mt-0.5 size-3.5 shrink-0 text-(--agenci-ink-3) group-hover:text-(--agenci-ink)"
                                {...ICON}
                              />
                              {t}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="flex items-center gap-1.5 px-2 py-1.5 text-[13px] text-(--agenci-ink-3)">
                        <CheckIcon className="size-3.5" {...ICON} />
                        Alle lagt til
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </SettingsCard>

          {/* ── Topics ────────────────────────────────────────────────── */}
          <SettingsCard id="bh-topics" icon={ShieldXIcon} title="Emner å unngå">
            <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-[10px] border border-[#d7dce2] bg-white p-1.5 transition-[border-color,box-shadow] focus-within:border-(--agenci-ink-3) focus-within:shadow-[0_0_0_3px_rgb(36_50_54/0.08)] dark:border-white/10 dark:bg-transparent">
              {topics.map((t) => (
                <span
                  key={t}
                  className="kb-card-in inline-flex items-center gap-1.5 rounded-full bg-[#f3f5f4] py-1 pr-1 pl-3 text-[13px] text-(--agenci-ink) dark:bg-white/10"
                >
                  <ShieldXIcon
                    className="size-3.5 text-(--agenci-ink-3)"
                    {...ICON}
                  />
                  {t}
                  <button
                    type="button"
                    aria-label={`Fjern ${t}`}
                    onClick={() =>
                      set({ avoidTopics: topics.filter((x) => x !== t) })
                    }
                    className="flex size-6 items-center justify-center rounded-full text-(--agenci-ink-3) transition-colors hover:bg-white hover:text-(--agenci-ink) dark:hover:bg-white/10"
                  >
                    <XIcon className="size-3.5" {...ICON} />
                  </button>
                </span>
              ))}
              <input
                value={newTopic}
                maxLength={60}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTopic(newTopic);
                  } else if (
                    e.key === "Backspace" &&
                    !newTopic &&
                    topics.length
                  ) {
                    set({ avoidTopics: topics.slice(0, -1) });
                  }
                }}
                placeholder={
                  topics.length
                    ? "Legg til emne …"
                    : "Skriv et emne og trykk Enter"
                }
                aria-label="Nytt emne"
                className="h-8 min-w-[160px] flex-1 bg-transparent px-2 text-[14px] text-(--agenci-ink) outline-none placeholder:text-(--agenci-ink-3)"
              />
            </div>
            {TOPIC_SUGGESTIONS.some((s) => !topics.includes(s)) ? (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[12.5px] text-(--agenci-ink-3)">
                  Forslag:
                </span>
                {TOPIC_SUGGESTIONS.filter((s) => !topics.includes(s)).map(
                  (s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addTopic(s)}
                      className="inline-flex items-center gap-1 rounded-full border border-(--agenci-line) px-3 py-1 text-[13px] text-(--agenci-ink-2) transition-[border-color,color,transform] duration-150 hover:border-(--agenci-ink-3) hover:text-(--agenci-ink) active:scale-[0.97]"
                    >
                      <PlusIcon className="size-3.5" {...ICON} />
                      {s}
                    </button>
                  ),
                )}
              </div>
            ) : null}
          </SettingsCard>

          {/* ── Hand-over ─────────────────────────────────────────────── */}
          <SettingsCard
            id="bh-handover"
            icon={HandIcon}
            title="Overlevering til menneske"
          >
            <div className="divide-y divide-(--agenci-line) border-b border-(--agenci-line)">
              <Row icon={UserRoundIcon} title="Kunden ber om et menneske">
                <Toggle
                  checked={esc.onHumanRequest !== false}
                  onChange={(v) =>
                    set({ escalation: { ...esc, onHumanRequest: v } })
                  }
                  label="Kunden ber om et menneske"
                />
              </Row>
              <Row icon={MessageSquareWarningIcon} title="Klager og misnøye">
                <Toggle
                  checked={esc.onComplaint ?? false}
                  onChange={(v) =>
                    set({ escalation: { ...esc, onComplaint: v } })
                  }
                  label="Klager og misnøye"
                />
              </Row>
              <Row icon={MessageCircleQuestionIcon} title="Agenten er usikker">
                <Toggle
                  checked={esc.onUncertain ?? false}
                  onChange={(v) =>
                    set({ escalation: { ...esc, onUncertain: v } })
                  }
                  label="Agenten er usikker"
                />
              </Row>
            </div>
            <label className="mt-5 block">
              <span className={cn(caption, "mb-2 block")}>
                Kontaktinformasjon agenten kan gi
              </span>
              <input
                value={esc.contact ?? ""}
                maxLength={160}
                onChange={(e) =>
                  set({ escalation: { ...esc, contact: e.target.value } })
                }
                placeholder="kundeservice@bedrift.no · 22 00 00 00 · hverdager 9–16"
                className={input}
              />
            </label>
          </SettingsCard>

          {/* ── Instructions (transparency) ───────────────────────────── */}
          <SettingsCard
            id="bh-instructions"
            icon={FileCode2Icon}
            title="Slik instrueres agenten"
          >
            <div className="overflow-hidden rounded-[16px] border border-(--agenci-line) bg-[#fafbfa] dark:bg-white/[0.02]">
              <div className="flex items-center gap-2 border-b border-(--agenci-line) px-4 py-2.5">
                <span className={caption}>Instruksjoner</span>
                <span className="text-[12px] text-(--agenci-ink-3)">
                  ·{" "}
                  {prompt ? `${prompt.split("\n").length} linjer` : "standard"}
                </span>
                {prompt ? (
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(prompt);
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1500);
                    }}
                    className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] text-(--agenci-ink-2) transition-colors hover:bg-white hover:text-(--agenci-ink) dark:hover:bg-white/10"
                  >
                    {copied ? (
                      <CheckIcon className="size-3.5" {...ICON} />
                    ) : (
                      <CopyIcon className="size-3.5" {...ICON} />
                    )}
                    {copied ? "Kopiert" : "Kopier"}
                  </button>
                ) : null}
              </div>
              <pre className="max-h-[360px] overflow-auto p-4 text-[13px] leading-[1.7] whitespace-pre-wrap text-(--agenci-ink-2)">
                {prompt ||
                  "Ingen tilpasninger ennå — agenten bruker standardreglene: vennlig, kort, bokmål og du-form."}
              </pre>
            </div>
          </SettingsCard>
        </div>
      </div>
    </ActiveSection.Provider>
  );
}
