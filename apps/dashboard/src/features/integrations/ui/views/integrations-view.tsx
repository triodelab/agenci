import { cn } from "@workspace/ui/lib/utils";
import {
  ArrowUpRightIcon,
  BellIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  ExternalLinkIcon,
  MailIcon,
  ZapIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAgentsListQuery } from "@/features/agents/queries/agents-queries";
import { useConversationsQuery } from "@/features/conversations/queries/conversations-queries";
import { dataTextClass } from "@/features/conversations/ui/components/conversation-ui";
import { authClient } from "@/lib/auth-client";
import { getWidgetPreviewUrl } from "@/lib/widget-preview-url";
import { COMING_SOON, PLATFORMS, type PlatformId } from "../../constants";
import { createScript } from "../../utils";

const pillButton =
  "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-[background-color,color,transform] duration-150 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-40";

const cardClass =
  "rounded-[20px] border border-white/80 bg-white shadow-[0_1px_3px_rgb(5_6_7/0.06),0_14px_34px_-16px_rgb(5_6_7/0.2)] dark:border-white/5 dark:bg-(--card)";

const DAY = 86_400_000;

function ago(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 60) return `${Math.max(min, 1)} min siden`;
  if (min < 60 * 24) return `${Math.round(min / 60)} t siden`;
  return `${Math.round(min / 1440)} d siden`;
}

/** Official brand mark (Simple Icons SVG in /public/integrations), tinted. */
function BrandLogo({
  logo,
  color,
  size,
}: {
  logo: string;
  color: string;
  size: number;
}) {
  const mask = `url(/integrations/${logo}.svg) center / contain no-repeat`;
  return (
    <span
      aria-hidden
      className="block shrink-0 dark:!bg-white"
      style={{
        width: size,
        height: size,
        background: color,
        mask,
        WebkitMask: mask,
      }}
    />
  );
}

/** The logo on a white app-icon tile. */
function LogoTile({
  logo,
  color,
  size = 40,
}: {
  logo: string;
  color: string;
  size?: number;
}) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-[11px] border border-[#E9EBEA] bg-white shadow-[0_1px_2px_rgb(5_6_7/0.05)] dark:border-white/10 dark:bg-white/5"
      style={{ width: size, height: size }}
    >
      <BrandLogo logo={logo} color={color} size={Math.round(size * 0.52)} />
    </span>
  );
}

/** Strings in the snippet get the accent colour; everything else stays calm. */
function Highlighted({ code }: { code: string }) {
  return (
    <>
      {code.split(/("[^"\n]*")/g).map((part, i) =>
        part.startsWith('"') ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: static split of one string
          <span key={i} className="text-[#F2B48A]">
            {part}
          </span>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: static split of one string
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function IntegrationsView({ agentId }: { agentId: string }) {
  const { data: organization } = authClient.useActiveOrganization();
  const { data: agents } = useAgentsListQuery();
  const { data: conversations = [] } = useConversationsQuery(agentId);
  const agent = agents?.find((a) => a.id === agentId);
  const [platformId, setPlatformId] = useState<PlatformId>("html");
  const [copied, setCopied] = useState<string | null>(null);

  const platform = PLATFORMS.find((p) => p.id === platformId) ?? PLATFORMS[0];
  const snippet = organization
    ? createScript(platform.id, organization.id, agentId)
    : "";

  // "Live" when the agent has had a conversation in the last 30 days.
  const lastSeen = useMemo(() => {
    const latest = conversations[0]?.updatedAt;
    return latest && Date.now() - new Date(latest).getTime() < 30 * DAY
      ? latest
      : null;
  }, [conversations]);

  const flash = async (text: string, what: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} er kopiert`);
      setCopied(key);
      window.setTimeout(() => setCopied((k) => (k === key ? null : k)), 1800);
    } catch {
      toast.error("Kunne ikke kopiere. Marker teksten og kopier manuelt.");
    }
  };

  const previewUrl = organization
    ? getWidgetPreviewUrl(organization.id, { agentId })
    : null;
  const website = agent?.websiteUrl
    ?.replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const mailto = `mailto:?subject=${encodeURIComponent(
    "Kan du legge chatten vår på nettsiden?",
  )}&body=${encodeURIComponent(
    `Hei!\n\nKan du legge Agenci-chatten på nettsiden vår? Den ligger på ${platform.title}:\n\n${platform.steps
      .map((s, i) => `${i + 1}. ${s}`)
      .join("\n")}\n\nKoden:\n\n${snippet}\n\nTakk!`,
  )}`;

  const ids = [
    { key: "org", label: "Organisasjons-ID", value: organization?.id },
    { key: "agent", label: "Agent-ID", value: agentId },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-8">
      {/* Header */}
      <header className="flex shrink-0 flex-wrap items-end gap-x-6 gap-y-3 px-1">
        <div className="min-w-0">
          <h1 className="[font-family:var(--font-agenci-title)] text-[24px] leading-[1.15] font-medium tracking-[-0.03em] text-(--agenci-ink)">
            Integrasjoner
          </h1>
          <p className="mt-1.5 text-[13.5px] text-(--agenci-ink-2)">
            Sett{" "}
            <span className="text-(--agenci-ink)">
              {agent?.name ?? "agenten"}
            </span>{" "}
            på nettsiden. Det tar et par minutter, og du trenger ingen utvikler.
          </p>
        </div>
        <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!previewUrl}
            onClick={() =>
              previewUrl &&
              window.open(previewUrl, "_blank", "noopener,noreferrer")
            }
            className={cn(
              pillButton,
              "bg-(--agenci-ink) text-white hover:bg-(--agenci-accent-hover) dark:text-[#0b0c0e]",
            )}
          >
            <ExternalLinkIcon
              className="size-4"
              strokeWidth={1.5}
              absoluteStrokeWidth
            />
            Forhåndsvis chatten
          </button>
        </div>
      </header>

      {/* Status strip */}
      <section
        className={cn(
          cardClass,
          "flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3.5",
        )}
      >
        <div className="flex items-center gap-3">
          <span className="relative flex size-2.5">
            {lastSeen ? (
              <span className="absolute inset-0 animate-ping rounded-full bg-[#5FA06F]/50" />
            ) : null}
            <span
              className={cn(
                "relative size-2.5 rounded-full",
                lastSeen ? "bg-[#5FA06F]" : "bg-[#C9CDCB]",
              )}
            />
          </span>
          <p className="text-[13.5px] text-(--agenci-ink)">
            {lastSeen ? "Live på nettsiden" : "Ikke i bruk ennå"}
            <span className="ml-2 text-(--agenci-ink-3)">
              {lastSeen
                ? `Siste samtale ${ago(lastSeen)}`
                : "Vises som live når den første kunden skriver"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          {ids.map((row) => (
            <button
              key={row.key}
              type="button"
              disabled={!row.value}
              title={row.value}
              onClick={() =>
                row.value && void flash(row.value, row.label, row.key)
              }
              className="group inline-flex h-8 items-center gap-2 rounded-full bg-[#f5f6f5] pr-2.5 pl-3 text-[12px] text-(--agenci-ink-3) transition-colors hover:bg-[#eef0ef] dark:bg-white/5"
            >
              {row.label}
              <span
                className={cn(
                  dataTextClass,
                  "max-w-[9rem] truncate text-(--agenci-ink)",
                )}
              >
                {row.value ?? "…"}
              </span>
              {copied === row.key ? (
                <CheckIcon
                  className="size-3.5 text-[#2F7D46]"
                  strokeWidth={2.2}
                />
              ) : (
                <CopyIcon
                  className="size-3.5 text-(--agenci-ink-3) group-hover:text-(--agenci-ink)"
                  strokeWidth={1.6}
                />
              )}
            </button>
          ))}
          {website ? (
            <a
              href={agent?.websiteUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-(--agenci-line) px-3 text-[12px] text-(--agenci-ink) transition-colors hover:bg-[#f6f7f6]"
            >
              Test på {website}
              <ArrowUpRightIcon className="size-3.5" strokeWidth={1.6} />
            </a>
          ) : null}
        </div>
      </section>

      {/* Install */}
      <section
        className={cn(
          cardClass,
          "grid shrink-0 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)]",
        )}
      >
        <div className="border-b border-[#EEF0EF] p-3 lg:border-r lg:border-b-0 dark:border-white/5">
          <p className="px-2.5 pt-2 pb-2 text-[12px] font-medium tracking-[0.06em] text-(--agenci-ink-3) uppercase">
            Hvor ligger nettsiden?
          </p>
          <div
            role="radiogroup"
            aria-label="Plattform"
            className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1"
          >
            {PLATFORMS.map((p) => {
              const active = p.id === platformId;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setPlatformId(p.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-[14px] px-2.5 py-2 text-left transition-[background-color,box-shadow] duration-150",
                    active
                      ? "bg-[#f3f4f3] shadow-[inset_0_0_0_1px_rgb(36_50_54/0.12)] dark:bg-white/10"
                      : "hover:bg-[#f7f8f7] dark:hover:bg-white/5",
                  )}
                >
                  <LogoTile logo={p.logo} color={p.color} size={36} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium text-(--agenci-ink)">
                      {p.title}
                    </span>
                    <span className="block truncate text-[12px] text-(--agenci-ink-3)">
                      {p.hint}
                    </span>
                  </span>
                  {active ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-(--agenci-ink) text-white dark:text-[#0b0c0e]">
                      <CheckIcon className="size-3" strokeWidth={2.4} />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 p-5 md:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <LogoTile logo={platform.logo} color={platform.color} size={48} />
            <div className="min-w-0">
              <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-(--agenci-ink)">
                Legg chatten på {platform.id === "html" ? "nettsiden din" : platform.title}
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-(--agenci-ink-3)">
                <ClockIcon className="size-3.5" strokeWidth={1.6} />
                Ca. 2 minutter
              </p>
            </div>
            <a
              href={mailto}
              className={cn(
                pillButton,
                "ml-auto border border-(--agenci-line) bg-white text-(--agenci-ink) hover:bg-[#f6f7f6] dark:bg-transparent",
                !snippet && "pointer-events-none opacity-40",
              )}
            >
              <MailIcon
                className="size-4"
                strokeWidth={1.5}
                absoluteStrokeWidth
              />
              Send til utvikler
            </a>
          </div>

          <ol className="mt-6 space-y-4">
            {platform.steps.map((step, i) => (
              <li key={step} className="flex gap-3.5">
                <span
                  className={cn(
                    dataTextClass,
                    "flex size-7 shrink-0 items-center justify-center rounded-full border border-(--agenci-line) text-[12.5px] text-(--agenci-ink)",
                  )}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-[14px] leading-relaxed text-(--agenci-ink)">
                    {step}
                  </p>
                  {i === 1 ? (
                    <div className="mt-3 overflow-hidden rounded-[14px] bg-[#16181A] text-[#E7E9E8] shadow-[0_18px_40px_-22px_rgb(5_6_7/0.55)]">
                      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5">
                        <span className="flex gap-1.5" aria-hidden>
                          <span className="size-2.5 rounded-full bg-white/15" />
                          <span className="size-2.5 rounded-full bg-white/15" />
                          <span className="size-2.5 rounded-full bg-white/15" />
                        </span>
                        <span
                          className={cn(
                            dataTextClass,
                            "ml-2 truncate text-[12px] text-white/55",
                          )}
                        >
                          {platform.file}
                        </span>
                        <button
                          type="button"
                          disabled={!snippet}
                          onClick={() =>
                            void flash(snippet, "Koden", "snippet")
                          }
                          className={cn(
                            "ml-auto inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-colors",
                            copied === "snippet"
                              ? "bg-[#E2F2E5] text-[#2F7D46]"
                              : "bg-white text-[#16181A] hover:bg-white/85",
                          )}
                        >
                          {copied === "snippet" ? (
                            <CheckIcon className="size-3.5" strokeWidth={2.2} />
                          ) : (
                            <CopyIcon className="size-3.5" strokeWidth={1.8} />
                          )}
                          {copied === "snippet" ? "Kopiert" : "Kopier kode"}
                        </button>
                      </div>
                      <pre className="overflow-x-auto px-5 py-4 font-mono text-[12.5px] leading-[1.75] whitespace-pre">
                        {snippet ? (
                          <Highlighted code={snippet} />
                        ) : (
                          <span className="text-white/40">Laster koden…</span>
                        )}
                      </pre>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-6 flex items-center gap-2 border-t border-[#EEF0EF] pt-4 text-[12.5px] text-(--agenci-ink-3) dark:border-white/5">
            <ZapIcon className="size-3.5" strokeWidth={1.6} />
            Koden lastes i bakgrunnen og gjør ikke nettsiden tregere.
          </p>
        </div>
      </section>

      {/* Roadmap */}
      <section className="mt-3 shrink-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1">
          <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-(--agenci-ink)">
            Flere integrasjoner på vei
          </h2>
          <span className="rounded-full bg-[#f1f2f1] px-2.5 py-0.5 text-[11.5px] text-(--agenci-ink-2) dark:bg-white/10">
            Kommer snart
          </span>
          <p className="w-full text-[13px] text-(--agenci-ink-3)">
            Si fra hvilke du vil ha, så vet vi hva vi skal bygge først.
          </p>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {COMING_SOON.map((i) => (
            <article
              key={i.id}
              className={cn(
                cardClass,
                "flex flex-col p-5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5",
              )}
            >
              <div className="flex items-start justify-between">
                <LogoTile logo={i.logo} color={i.color} size={46} />
                <span className="rounded-full bg-[#f3f4f3] px-2.5 py-0.5 text-[11.5px] text-(--agenci-ink-2) dark:bg-white/10">
                  {i.category}
                </span>
              </div>
              <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.01em] text-(--agenci-ink)">
                {i.name}
              </h3>
              <p className="mt-1 flex-1 text-[13px] leading-relaxed text-(--agenci-ink-2)">
                {i.what}
              </p>
              <a
                href={`mailto:post@triodelab.no?subject=${encodeURIComponent(`Varsle meg om ${i.name}-integrasjonen`)}`}
                className="mt-4 inline-flex h-8 w-fit items-center gap-1.5 rounded-full border border-(--agenci-line) px-3 text-[12.5px] text-(--agenci-ink) transition-colors hover:bg-[#f6f7f6] dark:hover:bg-white/5"
              >
                <BellIcon className="size-3.5" strokeWidth={1.6} />
                Varsle meg
              </a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
