import { useState } from "react";
import {
  ArrowLeftIcon,
  CheckIcon,
  Code2Icon,
  GlobeIcon,
  Paintbrush2Icon,
} from "lucide-react";

import type { AgentDraft } from "@/features/agents/store/agent-draft-store";
import { useCreateAgentMutation } from "@/features/agents/queries/agents-queries";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";

const STEPS = [
  {
    id: 1 as const,
    label: "Kunnskap",
    desc: "Nettside å lære fra",
    icon: GlobeIcon,
  },
  {
    id: 2 as const,
    label: "Utseende",
    desc: "Widget-farger",
    icon: Paintbrush2Icon,
  },
  {
    id: 3 as const,
    label: "Integrasjon",
    desc: "Embed-kode",
    icon: Code2Icon,
  },
];

type StepId = (typeof STEPS)[number]["id"];

type CustomFacingOnboardingCardProps = {
  draft: AgentDraft;
  onBack: () => void;
};

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Name + description already live in `draft` (details form).
 * This card collects the website URL; submit runs `agents.create`
 * (scrape → ingest → Mastra agent with that name + description).
 */
export default function CustomFacingOnboardingCard({
  draft,
  onBack,
}: CustomFacingOnboardingCardProps) {
  const createAgent = useCreateAgentMutation();
  const [step, setStep] = useState<StepId>(1);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [headerColor, setHeaderColor] = useState("#1C1C1C");
  const [welcomeMessage, setWelcomeMessage] = useState(
    `Hei! Jeg er ${draft.name}. Hvordan kan jeg hjelpe?`,
  );

  const completed = new Set<StepId>(
    STEPS.filter((s) => s.id < step).map((s) => s.id),
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden flex-col gap-8 bg-zinc-950 px-6 py-7 text-zinc-100 lg:flex">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Kundevennlig agent
          </p>
          <p className="mt-2 truncate text-[15px] font-semibold">{draft.name}</p>
          <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-zinc-400">
            {draft.description}
          </p>
        </div>

        <ol className="space-y-3">
          {STEPS.map((item) => {
            const done = completed.has(item.id);
            const active = item.id === step;
            const Icon = item.icon;
            return (
              <li key={item.id} className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border",
                    active && "border-white bg-white text-zinc-950",
                    done && !active && "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
                    !active && !done && "border-white/10 text-zinc-500",
                  )}
                >
                  {done && !active ? (
                    <CheckIcon className="size-3.5" strokeWidth={2} />
                  ) : (
                    <Icon className="size-3.5" strokeWidth={1.75} />
                  )}
                </div>
                <div>
                  <p
                    className={cn(
                      "text-[13px] font-medium",
                      active ? "text-white" : "text-zinc-300",
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="text-[11px] text-zinc-500">{item.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </aside>

      <div className="flex min-h-[420px] flex-col p-6 md:p-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex w-fit items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" strokeWidth={1.75} />
          Endre agentdetaljer
        </button>

        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
          Steg {step} av {STEPS.length}
        </p>

        {step === 1 ? (
          <div className="mt-3 flex flex-1 flex-col">
            <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
              Kunnskapsbase
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Oppgi nettsiden agenten skal lære fra. Innholdet hentes når
              agenten opprettes.
            </p>
            <div className="mt-6 space-y-2">
              <Label htmlFor="customer-website">Nettside-URL</Label>
              <Input
                id="customer-website"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://eksempel.no"
                className="h-10 rounded-xl"
              />
            </div>
            <div className="mt-auto flex justify-end pt-8">
              <Button
                type="button"
                className="rounded-xl"
                disabled={!isHttpUrl(websiteUrl)}
                onClick={() => setStep(2)}
              >
                Fortsett
              </Button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-3 flex flex-1 flex-col">
            <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
              Widget-utseende
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Tilpass farger og velkomstmelding for chat-widgeten.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-[auto_1fr]">
              <div className="space-y-2">
                <Label htmlFor="header-color">Header-farge</Label>
                <Input
                  id="header-color"
                  type="color"
                  value={headerColor}
                  onChange={(e) => setHeaderColor(e.target.value)}
                  className="h-10 w-16 cursor-pointer rounded-xl p-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="welcome">Velkomstmelding</Label>
                <Input
                  id="welcome"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>
            </div>
            <div
              className="mt-6 overflow-hidden rounded-2xl border border-border/60"
              style={{ backgroundColor: headerColor }}
            >
              <div className="px-4 py-3 text-[13px] font-semibold text-white">
                {draft.name}
              </div>
              <div className="bg-card px-4 py-5 text-[13px] text-muted-foreground">
                {welcomeMessage}
              </div>
            </div>
            <div className="mt-auto flex justify-between gap-2 pt-8">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setStep(1)}
              >
                Tilbake
              </Button>
              <Button
                type="button"
                className="rounded-xl"
                onClick={() => setStep(3)}
              >
                Fortsett
              </Button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-3 flex flex-1 flex-col">
            <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
              Klar for nettsiden
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Vi lagrer navn og beskrivelse, henter innhold fra nettsiden, og
              starter kundeserviceagenten når kunnskapsbasen er klar.
            </p>
            <div className="mt-6 rounded-xl border border-dashed border-border/70 bg-muted/30 px-4 py-5">
              <p className="font-mono text-[12px] leading-relaxed text-muted-foreground">
                {`<script src="…" data-agent-name="${draft.name}"></script>`}
              </p>
            </div>
            <ul className="mt-4 space-y-1.5 text-[12px] text-muted-foreground">
              <li>• Nettside: {websiteUrl || "Ikke satt"}</li>
              <li>• Header: {headerColor}</li>
            </ul>
            <div className="mt-auto flex justify-between gap-2 pt-8">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setStep(2)}
              >
                Tilbake
              </Button>
              <Button
                type="button"
                className="rounded-xl"
                disabled={createAgent.isPending || !isHttpUrl(websiteUrl)}
                onClick={() =>
                  createAgent.mutate({
                    name: draft.name,
                    description: draft.description,
                    url: websiteUrl,
                  })
                }
              >
                {createAgent.isPending ? "Oppretter…" : "Opprett agent"}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
