"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { useAuth, useOrganization } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  ArrowLeftIcon,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { AgenciNavWordmark } from "@/components/logo";
import { getWidgetPreviewUrl } from "@/lib/widget-preview-url";

const EMBED_SRC =
  process.env.NEXT_PUBLIC_WIDGET_EMBED_SCRIPT_URL?.trim() ||
  "https://agenci-embed.vercel.app/widget.iife.js";

function buildEmbed(orgId: string, agentId: string) {
  return `<script\n  src="${EMBED_SRC}"\n  data-organization-id="${orgId}"\n  data-agent-id="${agentId}"\n></script>`;
}

const STEPS = [
  {
    id: 1 as const,
    icon: BotIcon,
    label: "Din agent",
    desc: "Navn og beskrivelse",
  },
  {
    id: 2 as const,
    icon: DatabaseZapIcon,
    label: "Kunnskap",
    desc: "Nettside eller dokument",
  },
  {
    id: 3 as const,
    icon: Paintbrush2Icon,
    label: "Utseende",
    desc: "Farger og velkomst",
  },
  {
    id: 4 as const,
    icon: Code2Icon,
    label: "Integrasjon",
    desc: "Hent koden",
  },
];
type StepId = (typeof STEPS)[number]["id"];

// ─── Dark sidebar ───────────────────────────────────────────────────────────
function DarkSidebar({
  current,
  completed,
  onBack,
  onSkip,
}: {
  current: StepId;
  completed: Set<StepId>;
  onBack: (() => void) | null;
  onSkip: () => void;
}) {
  return (
    <aside className="hidden w-[300px] shrink-0 flex-col justify-between bg-zinc-950 px-8 py-7 text-zinc-100 lg:flex">
      <div className="space-y-10">
        {/* Top: back + logo */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack ?? undefined}
            disabled={!onBack}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg border border-white/10 transition-colors",
              onBack
                ? "text-zinc-300 hover:bg-white/5 hover:text-white"
                : "cursor-not-allowed text-zinc-700",
            )}
            aria-label="Tilbake"
          >
            <ArrowLeftIcon className="size-4" strokeWidth={1.75} />
          </button>
          <AgenciNavWordmark surface="dark" />
        </div>

        {/* Hero */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            0{current}{" "}
            <span className="text-zinc-600">av 0{STEPS.length}</span>
          </p>
          <h1 className="text-[26px] font-bold leading-[1.15] tracking-[-0.02em] text-white">
            Sett opp Agenci på 2 minutter
          </h1>
          <p className="text-[13px] leading-relaxed text-zinc-400">
            Lag agenten din, gi den kunnskap, og legg widgeten på nettsiden.
          </p>
        </div>

        {/* Step list */}
        <ul className="space-y-1">
          {STEPS.map((step) => {
            const done = completed.has(step.id);
            const active = step.id === current;
            const future = step.id > current && !done;
            const Icon = step.icon;

            return (
              <li
                key={step.id}
                className={cn(
                  "flex items-start gap-3.5 rounded-xl px-3 py-3 transition-colors",
                  active && "bg-white/[0.06]",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    done && "bg-emerald-500 text-zinc-950",
                    active && !done && "bg-white text-zinc-950",
                    future && "border border-white/10 bg-transparent text-zinc-500",
                  )}
                >
                  {done ? (
                    <CheckIcon className="size-4" strokeWidth={2.5} />
                  ) : (
                    <Icon className="size-4" strokeWidth={1.75} />
                  )}
                </span>
                <span className="min-w-0 flex-1 pt-0.5">
                  <span
                    className={cn(
                      "block text-[13.5px] font-semibold leading-tight",
                      active || done ? "text-white" : "text-zinc-400",
                    )}
                  >
                    {step.label}
                  </span>
                  <span
                    className={cn(
                      "mt-1 block text-[11.5px] leading-snug",
                      future ? "text-zinc-600" : "text-zinc-500",
                    )}
                  >
                    {step.desc}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="text-left text-[12px] text-zinc-500 transition-colors hover:text-zinc-300"
      >
        Hopp over oppsett →
      </button>
    </aside>
  );
}

function MobileStepBar({ current }: { current: StepId }) {
  return (
    <div className="flex items-center gap-1.5 lg:hidden">
      {STEPS.map((s) => (
        <div
          key={s.id}
          className={cn(
            "h-1 flex-1 rounded-full transition-all",
            s.id <= current ? "bg-foreground" : "bg-border",
          )}
        />
      ))}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-destructive/30 bg-destructive/8 px-3.5 py-2.5 text-[13px] text-destructive">
      {message}
    </p>
  );
}

function StepHeader({
  step,
  title,
  desc,
}: {
  step: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Steg {step} av 4
      </p>
      <h2 className="text-[26px] font-bold tracking-[-0.02em] text-foreground sm:text-[30px]">
        {title}
      </h2>
      <p className="max-w-prose text-[14px] leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}

// ─── Step 1 ─────────────────────────────────────────────────────────────────
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
    <form onSubmit={(e) => void submit(e)} className="space-y-8">
      <StepHeader
        step={1}
        title="Gi agenten et navn"
        desc="Agenten din svarer kunder automatisk — gi den et navn som gjenspeiler hva den gjør."
      />

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="agent-name" className="text-[13px] font-semibold">
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
            className="h-12 rounded-xl text-[14px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agent-desc" className="text-[13px] font-semibold">
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
            className="rounded-xl text-[14px]"
          />
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      <Button
        type="submit"
        className="h-12 w-full rounded-xl text-[14px] font-semibold"
        size="lg"
        disabled={busy || !name.trim()}
      >
        {busy ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <>
            Opprett agent <ArrowRightIcon className="ml-1.5 size-4" />
          </>
        )}
      </Button>
    </form>
  );
}

// ─── Step 2 ─────────────────────────────────────────────────────────────────
function Step2({
  agentId,
  onDone,
}: {
  agentId: Id<"agents">;
  onDone: () => void;
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
      await addWebpage({ url: url.trim(), agentId });
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
    <div className="space-y-8">
      <StepHeader
        step={2}
        title="Legg til kunnskap"
        desc="Agenten bruker dette til å svare riktig på kundenes spørsmål. Legg til en nettside eller last opp et dokument."
      />

      <div className="grid h-11 grid-cols-2 gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {(["url", "file"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg text-[13px] font-semibold transition-all",
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
            <Label htmlFor="kb-url" className="text-[13px] font-semibold">
              Nettside-URL
            </Label>
            <Input
              id="kb-url"
              type="url"
              autoFocus
              placeholder="https://dinbedrift.no"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={busy}
              className="h-12 rounded-xl text-[14px]"
            />
            <p className="text-[12px] text-muted-foreground">
              Vi henter innholdet og gjør det søkbart for agenten din.
            </p>
          </div>
          {error && <ErrorBox message={error} />}
          <Button
            type="submit"
            className="h-12 w-full rounded-xl text-[14px] font-semibold"
            size="lg"
            disabled={busy || !url.trim()}
          >
            {busy ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <>
                Hent innhold <ArrowRightIcon className="ml-1.5 size-4" />
              </>
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={(e) => void submitFile(e)} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-[13px] font-semibold">Dokument</Label>
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
                  <span className="text-[13px] font-medium text-foreground">
                    {file.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Klikk for å bytte fil
                  </span>
                </>
              ) : (
                <>
                  <FileTextIcon
                    className="size-5 text-muted-foreground/60"
                    strokeWidth={1.5}
                  />
                  <span className="text-[13px] text-muted-foreground">
                    Klikk for å velge fil
                  </span>
                  <span className="text-[11px] text-muted-foreground/60">
                    PDF, DOCX, TXT, Markdown
                  </span>
                </>
              )}
            </button>
          </div>
          {error && <ErrorBox message={error} />}
          <Button
            type="submit"
            className="h-12 w-full rounded-xl text-[14px] font-semibold"
            size="lg"
            disabled={busy || !file}
          >
            {busy ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <>
                Last opp <ArrowRightIcon className="ml-1.5 size-4" />
              </>
            )}
          </Button>
        </form>
      )}

      <button
        type="button"
        onClick={onDone}
        className="block w-full text-center text-[12px] text-muted-foreground/70 transition-colors hover:text-foreground"
      >
        Hopp over — legg til kunnskap senere
      </button>
    </div>
  );
}

// ─── Step 3 ─────────────────────────────────────────────────────────────────
function Step3({
  agentId,
  agentName,
  onDone,
  onChange,
}: {
  agentId: Id<"agents">;
  agentName: string;
  onDone: () => void;
  onChange: () => void;
}) {
  const upsert = useMutation(api.private.widgetSettings.upsert);
  const [title, setTitle] = useState(agentName);
  const [greeting, setGreeting] = useState("Hei! Hvordan kan jeg hjelpe deg? 😊");
  const [color, setColor] = useState("#18181b");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-save + iframe reload on changes (debounced)
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        await upsert({
          forAgentId: agentId,
          widgetTitle: title.trim() || agentName,
          greetMessage: greeting.trim() || "Hei! Hvordan kan jeg hjelpe deg i dag?",
          defaultSuggestions: {
            suggestion1: undefined,
            suggestion2: undefined,
            suggestion3: undefined,
          },
          vapiSettings: { assistantId: undefined, phoneNumber: undefined },
          appearance: { headerColor: color, headerTextColor: "#ffffff" },
        });
        onChange();
      } catch {
        // Silent — submit-knappen viser feilen
      }
    }, 500);
    return () => clearTimeout(t);
  }, [agentId, agentName, color, greeting, title, upsert, onChange]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await upsert({
        forAgentId: agentId,
        widgetTitle: title.trim() || agentName,
        greetMessage:
          greeting.trim() || "Hei! Hvordan kan jeg hjelpe deg i dag?",
        defaultSuggestions: {
          suggestion1: undefined,
          suggestion2: undefined,
          suggestion3: undefined,
        },
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
    <form onSubmit={(e) => void submit(e)} className="space-y-8">
      <StepHeader
        step={3}
        title="Tilpass widgeten"
        desc="Endringer vises i sanntid i forhåndsvisningen til høyre."
      />

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="widget-title" className="text-[13px] font-semibold">
            Widgettittel
          </Label>
          <Input
            id="widget-title"
            placeholder={agentName}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={busy}
            maxLength={50}
            className="h-12 rounded-xl text-[14px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="greeting" className="text-[13px] font-semibold">
            Velkomstmelding <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="greeting"
            rows={3}
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            disabled={busy}
            maxLength={300}
            className="rounded-xl text-[14px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="header-color" className="text-[13px] font-semibold">
            Primærfarge
          </Label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              id="header-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              disabled={busy}
              className="h-12 w-16 cursor-pointer rounded-xl border border-border bg-transparent p-1"
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              disabled={busy}
              className="h-12 max-w-[150px] rounded-xl font-mono text-xs uppercase"
              placeholder="#18181b"
            />
            <div className="flex gap-2">
              {["#18181b", "#2563eb", "#10b981", "#f97316", "#a855f7"].map(
                (c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "size-9 rounded-xl border transition-transform hover:scale-110",
                      color.toLowerCase() === c
                        ? "border-foreground ring-2 ring-foreground/20"
                        : "border-border",
                    )}
                    style={{ background: c }}
                    aria-label={`Bruk farge ${c}`}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      <Button
        type="submit"
        className="h-12 w-full rounded-xl text-[14px] font-semibold"
        size="lg"
        disabled={busy || !greeting.trim()}
      >
        {busy ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <>
            Lagre og fortsett <ArrowRightIcon className="ml-1.5 size-4" />
          </>
        )}
      </Button>
    </form>
  );
}

// ─── Step 4 ─────────────────────────────────────────────────────────────────
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
    <div className="space-y-8">
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
            "absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all",
            copied
              ? "border-transparent bg-foreground text-background"
              : "border-white/10 bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
          )}
        >
          {copied ? (
            <>
              <CheckIcon className="size-3" /> Kopiert
            </>
          ) : (
            <>
              <CopyIcon className="size-3" /> Kopier
            </>
          )}
        </button>
      </div>

      <div className="space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Hvor limer du inn koden?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["WordPress", "Appearance → Theme Editor → footer.php"],
            ["Webflow", "Project Settings → Custom Code → Footer"],
            ["Squarespace", "Settings → Advanced → Code Injection"],
            ["Shopify", "Online Store → Themes → theme.liquid"],
          ].map(([platform, hint]) => (
            <div
              key={platform}
              className="rounded-xl border border-border bg-muted/20 px-3.5 py-3"
            >
              <p className="text-[12px] font-semibold text-foreground">
                {platform}
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                {hint}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Button
        className="h-12 w-full rounded-xl text-[14px] font-semibold"
        size="lg"
        onClick={onFinish}
      >
        Gå til dashboardet
        <ArrowRightIcon className="ml-1.5 size-4" />
      </Button>

      <p className="text-center text-[11px] text-muted-foreground/70">
        Finn koden igjen under{" "}
        <Link
          href={`/agents/${agentId}/integrations`}
          className="underline underline-offset-2 hover:text-foreground"
        >
          Integrasjoner
        </Link>
      </p>
    </div>
  );
}

// ─── Live preview ──────────────────────────────────────────────────────────
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
    <div className="hidden h-full min-h-0 flex-col border-l border-border/60 bg-gradient-to-b from-muted/20 to-muted/5 xl:flex">
      <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Forhåndsvisning
          </p>
          <p className="text-[14px] font-semibold text-foreground">
            Slik ser widgeten ut
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
            active
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              : "bg-muted text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              active
                ? "animate-pulse bg-emerald-500"
                : "bg-muted-foreground/40",
            )}
          />
          {active ? "Live" : "Venter"}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center p-8">
        {url && active ? (
          <div className="w-full max-w-[400px] overflow-hidden rounded-3xl border border-border/70 bg-background shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)]">
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
          <div className="flex w-full max-w-[400px] flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border/70 bg-background/40 px-6 py-20 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-background">
              <BotIcon
                className="size-5 text-muted-foreground/60"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-[14px] font-semibold text-foreground">
              Klar når du er
            </p>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Når agenten er opprettet viser vi widgeten her med dine farger,
              tittel og velkomstmelding.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main view ─────────────────────────────────────────────────────────────
export const OnboardingView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewIntent = searchParams.get("new") === "1";
  const { organization } = useOrganization();
  const agents = useQuery(api.private.agents.list);

  const [step, setStep] = useState<StepId>(1);
  const [completed, setCompleted] = useState<Set<StepId>>(new Set());
  const [agentId, setAgentId] = useState<Id<"agents"> | null>(null);
  const [agentName, setAgentName] = useState("");
  const [previewReloadKey, setPreviewReloadKey] = useState(0);

  useEffect(() => {
    if (isNewIntent || agentId !== null) return;
    if (agents !== undefined && agents !== null && agents.length > 0) {
      router.replace("/agents");
    }
  }, [agents, router, agentId, isNewIntent]);

  const done = (s: StepId) =>
    setCompleted((prev) => new Set([...prev, s]));

  const { getToken } = useAuth();

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

  const reloadPreview = useCallback(() => setPreviewReloadKey((k) => k + 1), []);

  const goBack = step > 1 && step < 4 ? () => setStep((s) => (s - 1) as StepId) : null;

  return (
    <div className="dashboard-app-shell flex h-screen overflow-hidden bg-background">
      <DarkSidebar
        current={step}
        completed={completed}
        onBack={goBack}
        onSkip={() => router.push("/agents")}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
        {/* Form column */}
        <div className="flex min-h-0 flex-col overflow-y-auto">
          {/* Mobile header */}
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-background/90 px-5 py-3 backdrop-blur lg:hidden">
            <AgenciNavWordmark surface="light" className="text-foreground" />
            <button
              type="button"
              onClick={() => router.push("/agents")}
              className="text-[12px] text-muted-foreground hover:text-foreground"
            >
              Hopp over
            </button>
          </header>

          <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col px-6 py-10 lg:px-12 lg:py-16">
            <MobileStepBar current={step} />
            <div className="mt-6 lg:mt-0">
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
                />
              )}
              {step === 3 && agentId && (
                <Step3
                  agentId={agentId}
                  agentName={agentName}
                  onChange={reloadPreview}
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
                  onFinish={() =>
                    router.push(agentId ? `/agents/${agentId}` : "/agents")
                  }
                />
              )}
            </div>
          </div>
        </div>

        <LivePreview
          orgId={orgId}
          agentId={agentId}
          reloadKey={previewReloadKey}
          active={step === 3 && agentId !== null}
        />
      </div>
    </div>
  );
};
