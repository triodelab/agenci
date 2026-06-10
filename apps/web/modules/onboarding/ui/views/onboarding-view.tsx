"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { useAuth, useOrganization } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BotIcon,
  CheckIcon,
  Code2Icon,
  DatabaseZapIcon,
  FileTextIcon,
  GlobeIcon,
  Loader2Icon,
  Paintbrush2Icon,
  CopyIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { AgenciNavWordmark } from "@/components/logo";
import { getWidgetPreviewUrl } from "@/lib/widget-preview-url";

// ─── Embed script ─────────────────────────────────────────────────────────────
const EMBED_SRC =
  process.env.NEXT_PUBLIC_WIDGET_EMBED_SCRIPT_URL?.trim() ||
  "https://agenci-embed.vercel.app/widget.iife.js";

function buildEmbed(orgId: string, agentId: string) {
  return `<script\n  src="${EMBED_SRC}"\n  data-organization-id="${orgId}"\n  data-agent-id="${agentId}"\n></script>`;
}

const STEPS = [
  { id: 1 as const, icon: BotIcon, label: "Din agent", desc: "Navn og beskrivelse" },
  { id: 2 as const, icon: DatabaseZapIcon, label: "Kunnskap", desc: "Nettside eller dokument" },
  { id: 3 as const, icon: Paintbrush2Icon, label: "Utseende", desc: "Tilpass widgeten" },
  { id: 4 as const, icon: Code2Icon, label: "Integrasjon", desc: "Hent koden" },
];
type StepId = (typeof STEPS)[number]["id"];

// ─── Top progress header ─────────────────────────────────────────────────────
function ProgressHeader({
  current,
  completed,
  onSkip,
}: {
  current: StepId;
  completed: Set<StepId>;
  onSkip: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-6 px-6 py-3.5 lg:px-10">
        <AgenciNavWordmark surface="light" className="shrink-0 text-foreground" />

        <nav className="hidden flex-1 items-center justify-center gap-2 md:flex" aria-label="Onboarding steg">
          {STEPS.map((step, i) => {
            const done = completed.has(step.id);
            const active = step.id === current;
            return (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-7 items-center gap-2 rounded-full pl-1 pr-3 text-[12px] font-medium transition-all",
                    active && "bg-foreground text-background shadow-sm",
                    done && !active && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                    !active && !done && "bg-muted/40 text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                      active && "bg-background/20 text-background",
                      done && !active && "bg-emerald-500 text-white",
                      !active && !done && "bg-background/60 text-muted-foreground",
                    )}
                  >
                    {done ? <CheckIcon className="size-3" strokeWidth={3} /> : step.id}
                  </span>
                  <span className="hidden lg:inline">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <span className={cn("hidden h-px w-4 lg:block", done ? "bg-emerald-500/40" : "bg-border")} />
                )}
              </div>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onSkip}
          className="ml-auto shrink-0 text-[12px] text-muted-foreground transition-colors hover:text-foreground md:ml-0"
        >
          Hopp over →
        </button>
      </div>
    </header>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-destructive/30 bg-destructive/8 px-3.5 py-2.5 text-[13px] text-destructive">
      {message}
    </p>
  );
}

function StepHeader({ step, title, desc }: { step: number; title: string; desc: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Steg {step} av 4
      </p>
      <h1 className="text-[24px] font-bold tracking-[-0.02em] text-foreground sm:text-[28px]">
        {title}
      </h1>
      <p className="text-[14px] leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}

// ─── Step 1 ──────────────────────────────────────────────────────────────────
function Step1({
  onDone,
}: {
  onDone: (id: Id<"agents">, name: string) => void;
}) {
  const createAgent = useMutation(api.private.agents.create);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const { agentId } = await createAgent({
        name: name.trim(),
        description: desc.trim() || undefined,
      });
      onDone(agentId, name.trim());
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err && "message" in err
            ? String((err as { message: unknown }).message)
            : "Noe gikk galt";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-7">
      <StepHeader
        step={1}
        title="Gi agenten et navn"
        desc="Agenten din svarer kunder automatisk — gi den et navn som gjenspeiler hva den gjør."
      />

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="agent-name">
            Agentnavn <span className="text-destructive">*</span>
          </Label>
          <Input
            id="agent-name"
            autoFocus
            placeholder='F.eks. "Kundesupport" eller "Salgsassistent"'
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
            maxLength={60}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agent-desc">
            Beskrivelse{" "}
            <span className="text-[11px] font-normal text-muted-foreground">
              (valgfritt)
            </span>
          </Label>
          <Textarea
            id="agent-desc"
            placeholder="Beskriv kort hva agenten skal hjelpe med"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            disabled={busy}
            rows={3}
            maxLength={300}
          />
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      <Button type="submit" className="w-full h-11" size="lg" disabled={busy || !name.trim()}>
        {busy ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <>
            Opprett agent <ArrowRightIcon />
          </>
        )}
      </Button>
    </form>
  );
}

// ─── Step 2 ──────────────────────────────────────────────────────────────────
function Step2({
  agentId,
  onDone,
  onUrlSubmitted,
}: {
  agentId: Id<"agents">;
  onDone: () => void;
  onUrlSubmitted: (url: string) => void;
}) {
  const addWebpage = useAction(api.private.files.addWebpage);
  const generateUploadUrl = useMutation(api.private.files.generateUploadUrl);
  const addFileByStorageId = useAction(api.private.files.addFileByStorageId);

  const [tab, setTab] = useState<"url" | "file">("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleError = (err: unknown) => {
    const msg =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Noe gikk galt";
    setError(msg);
  };

  const submitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const trimmed = url.trim();
      onUrlSubmitted(trimmed);
      await addWebpage({ url: trimmed, agentId });
      onDone();
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  const submitFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const mimeType = file.type || "text/plain";
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": mimeType },
        body: file,
      });
      if (!res.ok) throw new Error(`Opplasting feilet: HTTP ${res.status}`);
      const { storageId } = (await res.json()) as { storageId: string };
      await addFileByStorageId({
        storageId: storageId as Id<"_storage">,
        filename: file.name,
        mimeType,
        agentId,
      });
      onDone();
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <StepHeader
        step={2}
        title="Legg til kunnskap"
        desc="Agenten bruker dette til å svare riktig på kundenes spørsmål. Vi henter også farger fra nettsiden din automatisk."
      />

      <div className="grid h-10 grid-cols-2 gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {(["url", "file"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg text-[13px] font-medium transition-all",
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "url" ? (
              <>
                <GlobeIcon className="size-3.5" /> Nettside-URL
              </>
            ) : (
              <>
                <FileTextIcon className="size-3.5" /> Last opp fil
              </>
            )}
          </button>
        ))}
      </div>

      {tab === "url" ? (
        <form onSubmit={(e) => void submitUrl(e)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="kb-url">Nettside-URL</Label>
            <Input
              id="kb-url"
              type="url"
              autoFocus
              placeholder="https://dinbedrift.no"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={busy}
              className="h-11"
            />
            <p className="text-[11.5px] text-muted-foreground">
              Vi henter innholdet og bruker det som kunnskapsbase. Vi prøver
              også å finne primærfargen fra siden din.
            </p>
          </div>
          {error && <ErrorBox message={error} />}
          <Button type="submit" className="w-full h-11" size="lg" disabled={busy || !url.trim()}>
            {busy ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <>
                Hent innhold <ArrowRightIcon />
              </>
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={(e) => void submitFile(e)} className="space-y-5">
          <div className="space-y-2">
            <Label>Dokument</Label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={cn(
                "flex h-32 w-full flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed transition-colors",
                file
                  ? "border-foreground/40 bg-muted/30"
                  : "border-border hover:border-foreground/30 hover:bg-muted/20",
              )}
            >
              {file ? (
                <>
                  <CheckIcon className="size-5 text-foreground" />
                  <span className="text-[13px] font-medium text-foreground">{file.name}</span>
                  <span className="text-[11px] text-muted-foreground">Klikk for å bytte fil</span>
                </>
              ) : (
                <>
                  <FileTextIcon className="size-5 text-muted-foreground/60" strokeWidth={1.5} />
                  <span className="text-[13px] text-muted-foreground">Klikk for å velge fil</span>
                  <span className="text-[11px] text-muted-foreground/60">PDF, DOCX, TXT, Markdown</span>
                </>
              )}
            </button>
          </div>
          {error && <ErrorBox message={error} />}
          <Button type="submit" className="w-full h-11" size="lg" disabled={busy || !file}>
            {busy ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <>
                Last opp <ArrowRightIcon />
              </>
            )}
          </Button>
        </form>
      )}

      <button
        type="button"
        onClick={onDone}
        className="block w-full text-center text-[12px] text-muted-foreground/60 transition-colors hover:text-muted-foreground"
      >
        Hopp over — legg til kunnskap senere
      </button>
    </div>
  );
}

// ─── Step 3 ──────────────────────────────────────────────────────────────────
function Step3({
  agentId,
  agentName,
  initialColor,
  colorSource,
  onChange,
  onDone,
}: {
  agentId: Id<"agents">;
  agentName: string;
  initialColor: string;
  colorSource: "extracted" | "default";
  onChange: (next: { title: string; greeting: string; color: string }) => void;
  onDone: () => void;
}) {
  const upsert = useMutation(api.private.widgetSettings.upsert);
  const [title, setTitle] = useState(agentName);
  const [greeting, setGreeting] = useState("Hei! Hvordan kan jeg hjelpe deg? 😊");
  const [color, setColor] = useState(initialColor);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setColor(initialColor);
  }, [initialColor]);

  useEffect(() => {
    onChange({ title, greeting, color });
  }, [title, greeting, color, onChange]);

  // Auto-save with debounce so preview iframe reflects changes
  useEffect(() => {
    const t = setTimeout(() => {
      void upsert({
        forAgentId: agentId,
        widgetTitle: title.trim() || agentName,
        greetMessage: greeting.trim() || "Hei! Hvordan kan jeg hjelpe deg i dag?",
        defaultSuggestions: { suggestion1: undefined, suggestion2: undefined, suggestion3: undefined },
        vapiSettings: { assistantId: undefined, phoneNumber: undefined },
        appearance: { headerColor: color, headerTextColor: "#ffffff" },
      }).catch(() => undefined);
    }, 600);
    return () => clearTimeout(t);
  }, [agentId, agentName, color, greeting, title, upsert]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await upsert({
        forAgentId: agentId,
        widgetTitle: title.trim() || agentName,
        greetMessage: greeting.trim() || "Hei! Hvordan kan jeg hjelpe deg i dag?",
        defaultSuggestions: { suggestion1: undefined, suggestion2: undefined, suggestion3: undefined },
        vapiSettings: { assistantId: undefined, phoneNumber: undefined },
        appearance: { headerColor: color, headerTextColor: "#ffffff" },
      });
      onDone();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err && "message" in err
            ? String((err as { message: unknown }).message)
            : "Noe gikk galt";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-7">
      <StepHeader
        step={3}
        title="Tilpass widgeten"
        desc="Endringer vises i sanntid i forhåndsvisningen til høyre."
      />

      {colorSource === "extracted" && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3.5 py-2.5">
          <SparklesIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-[12.5px] text-emerald-700 dark:text-emerald-300">
            Vi fant primærfargen fra nettsiden din og brukte den her.
          </p>
        </div>
      )}

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="widget-title">Widgettittel</Label>
          <Input
            id="widget-title"
            placeholder={agentName}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={busy}
            maxLength={50}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="greeting">
            Velkomstmelding <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="greeting"
            rows={3}
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            disabled={busy}
            maxLength={300}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="header-color">Primærfarge</Label>
          <div className="flex items-center gap-3">
            <input
              id="header-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              disabled={busy}
              className="h-11 w-14 cursor-pointer rounded-xl border border-border bg-transparent p-1"
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              disabled={busy}
              className="h-11 max-w-[140px] font-mono text-xs uppercase"
              placeholder="#18181b"
            />
            <div className="ml-auto flex gap-1.5">
              {["#18181b", "#2563eb", "#10b981", "#f97316", "#a855f7"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "size-7 rounded-lg border transition-transform hover:scale-110",
                    color.toLowerCase() === c ? "border-foreground ring-2 ring-foreground/20" : "border-border",
                  )}
                  style={{ background: c }}
                  aria-label={`Bruk farge ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      <Button type="submit" className="w-full h-11" size="lg" disabled={busy || !greeting.trim()}>
        {busy ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <>
            Lagre og fortsett <ArrowRightIcon />
          </>
        )}
      </Button>
    </form>
  );
}

// ─── Step 4 ──────────────────────────────────────────────────────────────────
function Step4({
  orgId,
  agentId,
  onFinish,
}: {
  orgId: string;
  agentId: Id<"agents">;
  onFinish: () => void;
}) {
  const code = buildEmbed(orgId, agentId);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-7">
      <StepHeader
        step={4}
        title="Legg til på nettsiden din"
        desc="Lim inn denne script-taggen rett før </body> på nettsiden din. Widgeten starter automatisk."
      />

      <div className="relative">
        <pre className="overflow-x-auto rounded-xl border border-border bg-zinc-950 px-5 py-4 text-[12px] leading-relaxed text-zinc-300">
          <code>{code}</code>
        </pre>
        <button
          type="button"
          onClick={() => void copy()}
          className={cn(
            "absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all",
            copied
              ? "border-transparent bg-foreground text-background"
              : "border-white/10 bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
          )}
        >
          {copied ? (
            <>
              <CheckIcon className="size-3" /> Kopiert!
            </>
          ) : (
            <>
              <CopyIcon className="size-3" /> Kopier
            </>
          )}
        </button>
      </div>

      <div className="space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Hvor limer du inn koden?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["WordPress", "Appearance → Theme Editor → footer.php"],
            ["Webflow", "Project Settings → Custom Code → Footer"],
            ["Squarespace", "Settings → Advanced → Code Injection"],
            ["Shopify", "Online Store → Themes → theme.liquid"],
          ].map(([platform, hint]) => (
            <div key={platform} className="rounded-xl border border-border bg-muted/20 px-3.5 py-3">
              <p className="text-[12px] font-semibold text-foreground">{platform}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{hint}</p>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full h-11" size="lg" onClick={onFinish}>
        Gå til dashboardet
        <ArrowRightIcon />
      </Button>

      <p className="text-center text-[11px] text-muted-foreground/60">
        Finn koden igjen under{" "}
        <Link
          href={`/agents/${agentId}/integrations`}
          className="underline underline-offset-2 hover:text-muted-foreground"
        >
          Integrasjoner
        </Link>
      </p>
    </div>
  );
}

// ─── Live preview ────────────────────────────────────────────────────────────
function LivePreview({
  orgId,
  agentId,
  reloadKey,
  active,
}: {
  orgId: string;
  agentId: Id<"agents"> | null;
  reloadKey: number;
  active: boolean;
}) {
  const url = useMemo(() => {
    if (!orgId) return null;
    return getWidgetPreviewUrl(orgId, {
      playground: true,
      agentId: agentId ?? undefined,
    });
  }, [orgId, agentId]);

  return (
    <div className="hidden h-full min-h-0 flex-col bg-gradient-to-b from-muted/30 to-muted/10 lg:flex">
      <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-6 py-3.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Forhåndsvisning
          </p>
          <p className="text-[13px] font-semibold text-foreground">Slik ser widgeten ut</p>
        </div>
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide",
          active ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground",
        )}>
          <span className={cn(
            "size-1.5 rounded-full",
            active ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40",
          )} />
          {active ? "Live" : "Venter"}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center p-8">
        {url && active ? (
          <div className="w-full max-w-[400px] overflow-hidden rounded-2xl border border-border/70 bg-background shadow-2xl">
            <iframe
              key={reloadKey}
              src={url}
              title="Widget-forhåndsvisning"
              allow="clipboard-read; clipboard-write; microphone"
              className="block h-[min(640px,calc(100dvh-12rem))] w-full border-0 bg-background"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : (
          <div className="flex w-full max-w-[400px] flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border/70 bg-background/40 px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-background">
              <SparklesIcon className="size-5 text-muted-foreground/60" strokeWidth={1.5} />
            </div>
            <p className="text-[13.5px] font-semibold text-foreground">Klar når du er</p>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Når du har laget agenten, viser vi widget-en din her med dine farger, tittel og velkomstmelding.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main view ───────────────────────────────────────────────────────────────
export const OnboardingView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewIntent = searchParams.get("new") === "1";
  const { organization } = useOrganization();
  const agents = useQuery(api.private.agents.list);
  const extractThemeColor = useAction(api.private.themeColor.extractThemeColor);

  const [step, setStep] = useState<StepId>(1);
  const [completed, setCompleted] = useState<Set<StepId>>(new Set());
  const [agentId, setAgentId] = useState<Id<"agents"> | null>(null);
  const [agentName, setAgentName] = useState("");
  const [extractedColor, setExtractedColor] = useState<string | null>(null);
  const [colorSource, setColorSource] = useState<"extracted" | "default">("default");
  const [previewReloadKey, setPreviewReloadKey] = useState(0);

  // Redirect if already has agents
  useEffect(() => {
    if (isNewIntent || agentId !== null) return;
    if (agents !== undefined && agents !== null && agents.length > 0) {
      router.replace("/agents");
    }
  }, [agents, router, agentId, isNewIntent]);

  const done = (s: StepId) => setCompleted((prev) => new Set([...prev, s]));

  const { getToken } = useAuth();

  // Clerk/Convex JWT sync after org creation
  useEffect(() => {
    if (!organization || agents !== null) return;
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    if (params.get("_r")) return;
    void getToken({ template: "convex", skipCache: true }).then(() => {
      const url = new URL(window.location.href);
      url.searchParams.set("_r", "1");
      window.location.replace(url.toString());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization, agents]);

  if (agents == null || !organization) {
    return (
      <div className="dashboard-app-shell flex min-h-screen items-center justify-center bg-background">
        <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const orgId = organization?.id ?? "";

  const handleUrlSubmitted = (url: string) => {
    void extractThemeColor({ url })
      .then((r) => {
        if (r.color) {
          setExtractedColor(r.color);
          setColorSource("extracted");
        }
      })
      .catch(() => undefined);
  };

  const reloadPreview = () => setPreviewReloadKey((k) => k + 1);

  return (
    <div className="dashboard-app-shell flex h-screen flex-col overflow-hidden bg-background">
      <ProgressHeader
        current={step}
        completed={completed}
        onSkip={() => router.push("/agents")}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Form column */}
        <div className="flex min-h-0 flex-col overflow-y-auto">
          <div className="mx-auto flex w-full max-w-[520px] flex-col px-6 py-10 lg:py-14">
            {step === 1 && (
              <Step1
                onDone={(id, name) => {
                  setAgentId(id);
                  setAgentName(name);
                  done(1);
                  setStep(2);
                  reloadPreview();
                }}
              />
            )}

            {step === 2 && agentId && (
              <Step2
                agentId={agentId}
                onDone={() => {
                  done(2);
                  setStep(3);
                  reloadPreview();
                }}
                onUrlSubmitted={handleUrlSubmitted}
              />
            )}

            {step === 3 && agentId && (
              <Step3
                agentId={agentId}
                agentName={agentName}
                initialColor={extractedColor ?? "#18181b"}
                colorSource={colorSource}
                onChange={() => reloadPreview()}
                onDone={() => {
                  done(3);
                  setStep(4);
                  reloadPreview();
                }}
              />
            )}

            {step === 4 && agentId && (
              <Step4
                orgId={orgId}
                agentId={agentId}
                onFinish={() => router.push(agentId ? `/agents/${agentId}` : "/agents")}
              />
            )}

            {step > 1 && step < 4 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as StepId)}
                className="mx-auto mt-8 block text-[12px] text-muted-foreground/60 hover:text-muted-foreground"
              >
                ← Tilbake
              </button>
            )}
          </div>
        </div>

        {/* Live preview column */}
        <LivePreview
          orgId={orgId}
          agentId={agentId}
          reloadKey={previewReloadKey}
          active={agentId !== null}
        />
      </div>
    </div>
  );
};
