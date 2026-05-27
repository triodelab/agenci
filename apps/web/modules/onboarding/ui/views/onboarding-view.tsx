"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { useOrganization } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { AgenciNavWordmark } from "@/components/logo";

// ─── Embed script ─────────────────────────────────────────────────────────────
const EMBED_SRC =
  process.env.NEXT_PUBLIC_WIDGET_EMBED_SCRIPT_URL?.trim() ||
  "https://agenci-embed.vercel.app/widget.iife.js";

function buildEmbed(orgId: string, agentId: string) {
  return `<script\n  src="${EMBED_SRC}"\n  data-organization-id="${orgId}"\n  data-agent-id="${agentId}"\n></script>`;
}

// ─── Step config ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1 as const, icon: BotIcon,         label: "Din agent",   desc: "Navn og beskrivelse" },
  { id: 2 as const, icon: DatabaseZapIcon,  label: "Kunnskap",    desc: "Nettside eller dokument" },
  { id: 3 as const, icon: Paintbrush2Icon,  label: "Utseende",    desc: "Tilpass widgeten" },
  { id: 4 as const, icon: Code2Icon,        label: "Integrasjon", desc: "Hent koden" },
];
type StepId = (typeof STEPS)[number]["id"];

// ─── Left sidebar ─────────────────────────────────────────────────────────────
function Sidebar({
  current,
  completed,
  onSkip,
}: {
  current: StepId;
  completed: Set<StepId>;
  onSkip: () => void;
}) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col justify-between bg-zinc-950 p-8 lg:flex">
      <div>
        <AgenciNavWordmark surface="dark" className="text-white" />

        <div className="mt-10 space-y-1">
          {STEPS.map((step) => {
            const done    = completed.has(step.id);
            const active  = step.id === current;
            const future  = step.id > current && !done;
            const Icon    = step.icon;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3.5 rounded-xl px-3 py-3 transition-colors",
                  active  && "bg-white/[0.07]",
                  future  && "opacity-40",
                )}
              >
                {/* Icon box */}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    done   && "bg-white/90",
                    active && !done && "bg-white",
                    future && "border border-white/20 bg-transparent",
                  )}
                >
                  {done ? (
                    <CheckIcon className="h-4 w-4 text-zinc-950" />
                  ) : (
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        active  ? "text-zinc-950" : "text-white/50",
                      )}
                      strokeWidth={1.75}
                    />
                  )}
                </div>

                {/* Label */}
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-[13px] font-semibold leading-none",
                      active || done ? "text-white" : "text-white/50",
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-white/35">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="text-left text-[12px] text-white/30 transition-colors hover:text-white/60"
      >
        Hopp over oppsett →
      </button>
    </aside>
  );
}

// ─── Step header (mobile step bar) ────────────────────────────────────────────
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

// ─── Error box ────────────────────────────────────────────────────────────────
function ErrorBox({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-destructive/30 bg-destructive/8 px-3.5 py-2.5 text-[13px] text-destructive">
      {message}
    </p>
  );
}

// ─── Step 1: Create agent ─────────────────────────────────────────────────────
function Step1({
  onDone,
}: {
  onDone: (id: Id<"agents">, name: string) => void;
}) {
  const createAgent = useMutation(api.private.agents.create);
  const [name, setName]         = useState("");
  const [desc, setDesc]         = useState("");
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState<string | null>(null);

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
    <form onSubmit={(e) => void submit(e)} className="space-y-6">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Steg 1 av 4
        </p>
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
          Gi agenten et navn
        </h1>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Agenten din svarer kunder automatisk — gi den et navn som
          gjenspeiler hva den gjør.
        </p>
      </div>

      <div className="space-y-4">
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

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={busy || !name.trim()}
      >
        {busy ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <>
            Opprett agent
            <ArrowRightIcon />
          </>
        )}
      </Button>
    </form>
  );
}

// ─── Step 2: Add knowledge ────────────────────────────────────────────────────
function Step2({
  agentId,
  onDone,
}: {
  agentId: Id<"agents">;
  onDone: () => void;
}) {
  const addWebpage         = useAction(api.private.files.addWebpage);
  const generateUploadUrl  = useMutation(api.private.files.generateUploadUrl);
  const addFileByStorageId = useAction(api.private.files.addFileByStorageId);

  const [tab, setTab]                     = useState<"url" | "file">("url");
  const [url, setUrl]                     = useState("");
  const [file, setFile]                   = useState<File | null>(null);
  const [busy, setBusy]                   = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [planError, setPlanError]         = useState(false);
  const fileRef                           = useRef<HTMLInputElement>(null);

  const handleError = (err: unknown) => {
    const msg =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Noe gikk galt";
    if (
      msg.toLowerCase().includes("abonnement") ||
      msg.toLowerCase().includes("subscription")
    ) {
      setPlanError(true);
    } else {
      setError(msg);
    }
  };

  const submitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy(true);
    setError(null);
    setPlanError(false);
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
    setPlanError(false);
    try {
      const mimeType = file.type || "text/plain";
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": mimeType },
        body: file,
      });
      if (!res.ok) throw new Error(`Opplasting feilet: HTTP ${res.status}`);
      const { storageId } = await res.json() as { storageId: string };
      await addFileByStorageId({
        storageId: storageId as any,
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
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Steg 2 av 4
        </p>
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
          Legg til kunnskap
        </h1>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Agenten bruker dette til å svare riktig på kundenes spørsmål. Legg
          til en nettside eller last opp et dokument.
        </p>
      </div>

      {/* Tab toggle */}
      <div className="grid h-9 grid-cols-2 gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
        {(["url", "file"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-md text-[13px] font-medium transition-all",
              tab === t
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "url" ? (
              <><GlobeIcon className="size-3.5" /> Nettside-URL</>
            ) : (
              <><FileTextIcon className="size-3.5" /> Last opp fil</>
            )}
          </button>
        ))}
      </div>

      {planError ? (
        <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-5">
          <p className="text-[13px] font-semibold text-foreground">
            Krever aktivt abonnement
          </p>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Opplasting av kunnskap krever et aktivt abonnement. Du kan legge
            til innhold fra Knowledge Base etter du har valgt en plan.
          </p>
          <Button variant="outline" size="sm" onClick={onDone}>
            Fortsett uten kunnskap
          </Button>
        </div>
      ) : tab === "url" ? (
        <form onSubmit={(e) => void submitUrl(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kb-url">Nettside-URL</Label>
            <Input
              id="kb-url"
              type="url"
              autoFocus
              placeholder="https://dinbedrift.no/om-oss"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={busy}
            />
            <p className="text-[11px] text-muted-foreground">
              Vi henter innholdet og gjør det søkbart for agenten.
            </p>
          </div>
          {error && <ErrorBox message={error} />}
          <Button type="submit" className="w-full" size="lg" disabled={busy || !url.trim()}>
            {busy ? <Loader2Icon className="animate-spin" /> : <>Hent innhold <ArrowRightIcon /></>}
          </Button>
        </form>
      ) : (
        <form onSubmit={(e) => void submitFile(e)} className="space-y-4">
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
                "flex h-28 w-full flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed transition-colors",
                file
                  ? "border-border bg-muted/30"
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
                  <FileTextIcon className="size-5 text-muted-foreground/60" strokeWidth={1.5} />
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
          <Button type="submit" className="w-full" size="lg" disabled={busy || !file}>
            {busy ? <Loader2Icon className="animate-spin" /> : <>Last opp <ArrowRightIcon /></>}
          </Button>
        </form>
      )}

      <button
        type="button"
        onClick={onDone}
        className="w-full text-center text-[12px] text-muted-foreground/60 transition-colors hover:text-muted-foreground"
      >
        Hopp over — legg til kunnskap senere
      </button>
    </div>
  );
}

// ─── Step 3: Customize widget ─────────────────────────────────────────────────
function Step3({
  agentId,
  agentName,
  onDone,
}: {
  agentId: Id<"agents">;
  agentName: string;
  onDone: () => void;
}) {
  const upsert = useMutation(api.private.widgetSettings.upsert);
  const [title,    setTitle]   = useState(agentName);
  const [greeting, setGreeting] = useState("Hei! Hvordan kan jeg hjelpe deg? 😊");
  const [color,    setColor]   = useState("#18181b");
  const [busy,     setBusy]    = useState(false);
  const [error,    setError]   = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
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
        vapiSettings: {
          assistantId: undefined,
          phoneNumber: undefined,
        },
        appearance: {
          headerColor: color,
          headerTextColor: "#ffffff",
        },
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
    <form onSubmit={(e) => void submit(e)} className="space-y-6">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Steg 3 av 4
        </p>
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
          Tilpass widgeten
        </h1>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Sett opp hvordan chatwidgeten ser ut på nettsiden din. Du kan endre
          alt dette fra Widget-innstillinger senere.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="widget-title">Widgettittel</Label>
          <Input
            id="widget-title"
            placeholder={agentName}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={busy}
            maxLength={50}
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
            <div className="relative">
              <input
                id="header-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={busy}
                className="h-9 w-12 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
              />
            </div>
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              disabled={busy}
              className="max-w-[110px] font-mono text-xs uppercase"
              placeholder="#18181b"
            />
            {/* Mini preview */}
            <div className="ml-auto shrink-0 overflow-hidden rounded-lg border border-border shadow-xs" style={{ width: 100 }}>
              <div
                className="flex items-center gap-2 px-2.5 py-2"
                style={{ background: color }}
              >
                <div className="h-3.5 w-3.5 shrink-0 rounded-full bg-white/20" />
                <span className="truncate text-[10px] font-semibold text-white">
                  {title || agentName}
                </span>
              </div>
              <div className="bg-white p-2 dark:bg-zinc-900">
                <div
                  className="rounded-md px-2 py-1.5 text-[9px] font-medium text-white"
                  style={{ background: color, maxWidth: "80%" }}
                >
                  {greeting.slice(0, 22)}…
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      <Button type="submit" className="w-full" size="lg" disabled={busy || !greeting.trim()}>
        {busy ? <Loader2Icon className="animate-spin" /> : <>Lagre innstillinger <ArrowRightIcon /></>}
      </Button>

      <button
        type="button"
        onClick={onDone}
        className="w-full text-center text-[12px] text-muted-foreground/60 transition-colors hover:text-muted-foreground"
      >
        Hopp over — bruk standardinnstillinger
      </button>
    </form>
  );
}

// ─── Step 4: Integration ──────────────────────────────────────────────────────
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
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Steg 4 av 4
        </p>
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
          Legg til på nettsiden din
        </h1>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Lim inn denne script-taggen rett før{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
            &lt;/body&gt;
          </code>{" "}
          på nettsiden din. Widgeten starter automatisk.
        </p>
      </div>

      {/* Code block */}
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
            <><CheckIcon className="size-3" /> Kopiert!</>
          ) : (
            <><CopyIcon className="size-3" /> Kopier</>
          )}
        </button>
      </div>

      {/* CMS tips */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Hvor limer du inn koden?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["WordPress",   "Appearance → Theme Editor → footer.php"],
            ["Webflow",     "Project Settings → Custom Code → Footer"],
            ["Squarespace", "Settings → Advanced → Code Injection"],
            ["Shopify",     "Online Store → Themes → theme.liquid"],
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

      <Button className="w-full" size="lg" onClick={onFinish}>
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

// ─── Main view ────────────────────────────────────────────────────────────────
export const OnboardingView = () => {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const isNewIntent  = searchParams.get("new") === "1";
  const { organization } = useOrganization();
  const agents       = useQuery(api.private.agents.list);

  const [step,      setStep]      = useState<StepId>(1);
  const [completed, setCompleted] = useState<Set<StepId>>(new Set());
  const [agentId,   setAgentId]   = useState<Id<"agents"> | null>(null);
  const [agentName, setAgentName] = useState("");

  // Redirect back if user already has agents — unless they explicitly navigated
  // here to create a new one (?new=1) or have already started the wizard.
  useEffect(() => {
    if (isNewIntent || agentId !== null) return;
    if (agents !== undefined && agents !== null && agents.length > 0) {
      router.replace("/agents");
    }
  }, [agents, router, agentId, isNewIntent]);

  const done = (s: StepId) =>
    setCompleted((prev) => new Set([...prev, s]));

  if (agents === undefined) {
    return (
      <div className="dashboard-app-shell flex min-h-screen items-center justify-center bg-background">
        <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const orgId = organization?.id ?? "";

  return (
    <div className="dashboard-app-shell flex h-screen overflow-hidden bg-background">
      {/* ── Left sidebar ── */}
      <Sidebar
        current={step}
        completed={completed}
        onSkip={() => router.push("/agents")}
      />

      {/* ── Right content ── */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b border-border px-5 py-3.5 lg:hidden">
          <AgenciNavWordmark surface="dark" className="text-foreground dark:text-white" />
          <button
            type="button"
            onClick={() => router.push("/agents")}
            className="text-[12px] text-muted-foreground hover:text-foreground"
          >
            Hopp over
          </button>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile progress bar */}
            <MobileStepBar current={step} />

            {/* Step content */}
            {step === 1 && (
              <Step1
                onDone={(id, name) => {
                  setAgentId(id);
                  setAgentName(name);
                  done(1);
                  setStep(2);
                }}
              />
            )}

            {step === 2 && agentId && (
              <Step2
                agentId={agentId}
                onDone={() => { done(2); setStep(3); }}
              />
            )}

            {step === 3 && agentId && (
              <Step3
                agentId={agentId}
                agentName={agentName}
                onDone={() => { done(3); setStep(4); }}
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

            {/* Back button */}
            {step > 1 && step < 4 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as StepId)}
                className="mx-auto block text-[12px] text-muted-foreground/60 hover:text-muted-foreground"
              >
                ← Tilbake
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
