"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BotIcon,
  BookOpenIcon,
  PaletteIcon,
  CodeIcon,
  CheckIcon,
  ChevronRightIcon,
  LoaderIcon,
  LinkIcon,
  UploadIcon,
  CopyIcon,
  ArrowRightIcon,
  XIcon,
  SparklesIcon,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@workspace/ui/lib/utils";

// ─── Embed script ─────────────────────────────────────────────────────────────
const EMBED_SCRIPT_SRC =
  process.env.NEXT_PUBLIC_WIDGET_EMBED_SCRIPT_URL?.trim() ||
  "https://agenci-embed.vercel.app/widget.iife.js";

function buildEmbedScript(orgId: string, agentId?: string) {
  const agentAttr = agentId ? ` data-agent-id="${agentId}"` : "";
  return `<script\n  src="${EMBED_SCRIPT_SRC}"\n  data-organization-id="${orgId}"${agentAttr}\n></script>`;
}

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Din agent",    icon: BotIcon },
  { id: 2, label: "Kunnskap",     icon: BookOpenIcon },
  { id: 3, label: "Utseende",     icon: PaletteIcon },
  { id: 4, label: "Integrasjon",  icon: CodeIcon },
] as const;

type StepId = (typeof STEPS)[number]["id"];

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({
  current,
  completed,
}: {
  current: StepId;
  completed: Set<StepId>;
}) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, idx) => {
        const done = completed.has(step.id);
        const active = step.id === current;
        const future = step.id > current && !done;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-200",
                  done &&
                    "border-teal-500 bg-teal-500 text-white",
                  active &&
                    !done &&
                    "border-teal-500 bg-teal-500 text-white shadow-[0_0_0_4px_rgba(20,184,166,0.15)]",
                  future &&
                    "border-zinc-200 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500",
                )}
              >
                {done ? (
                  <CheckIcon className="h-3.5 w-3.5" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium whitespace-nowrap",
                  (active || done) ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-500",
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "mb-5 h-px w-12 transition-colors duration-300 sm:w-16 md:w-20",
                  done || completed.has(STEPS[idx + 1]!.id) || step.id < current
                    ? "bg-teal-400"
                    : "bg-zinc-200 dark:bg-zinc-700",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Input component (shared style) ───────────────────────────────────────────
function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="text-teal-500">*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>
      )}
    </div>
  );
}

function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-teal-400",
        className,
      )}
      {...props}
    />
  );
}

function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-teal-400",
        className,
      )}
      {...props}
    />
  );
}

// ─── Error banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/15 dark:text-red-400">
      {message}
    </div>
  );
}

// ─── STEP 1: Create agent ─────────────────────────────────────────────────────
function StepAgent({
  onComplete,
}: {
  onComplete: (agentId: Id<"agents">, agentName: string) => void;
}) {
  const createAgent = useMutation(api.private.agents.create);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { agentId } = await createAgent({ name: name.trim(), description: description.trim() || undefined });
      onComplete(agentId, name.trim());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message
        : typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Noe gikk galt. Prøv igjen.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/40">
          <BotIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Gi agenten et navn
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Agenten din svarer kundene dine automatisk — gi den et navn som
            gjenspeiler jobben den skal gjøre.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Field label="Agentnavn" required hint='F.eks. "Kundesupport", "Salgsassistent" eller "Triodelab-hjelper"'>
          <Input
            autoFocus
            placeholder="Kundesupport"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            maxLength={60}
          />
        </Field>

        <Field label="Beskrivelse" hint="Fortell kort hva agenten skal hjelpe med (vises kun internt)">
          <Textarea
            rows={3}
            placeholder="Hjelper kunder med spørsmål om produkter, priser og levering."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            maxLength={300}
          />
        </Field>
      </div>

      {error && <ErrorBanner message={error} />}

      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
        style={{ background: "#0d9488" }}
      >
        {loading ? (
          <LoaderIcon className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Opprett agent
            <ChevronRightIcon className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}

// ─── STEP 2: Add knowledge ────────────────────────────────────────────────────
function StepKnowledge({
  agentId,
  onComplete,
  onSkip,
}: {
  agentId: Id<"agents">;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const addWebpage = useAction(api.private.files.addWebpage);
  const addFile = useAction(api.private.files.addFile);

  const [tab, setTab] = useState<"url" | "file">("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionError, setSubscriptionError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setSubscriptionError(false);
    try {
      await addWebpage({ url: url.trim(), agentId });
      onComplete();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message
        : typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Noe gikk galt.";
      if (msg.toLowerCase().includes("abonnement") || msg.toLowerCase().includes("subscription")) {
        setSubscriptionError(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setSubscriptionError(false);
    try {
      await addFile({
        bytes: await file.arrayBuffer(),
        filename: file.name,
        mimeType: file.type || "text/plain",
        agentId,
      });
      onComplete();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message
        : typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Noe gikk galt.";
      if (msg.toLowerCase().includes("abonnement") || msg.toLowerCase().includes("subscription")) {
        setSubscriptionError(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/40">
          <BookOpenIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Legg til kunnskap
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Agenten bruker dette til å svare riktig på kundenes spørsmål. Legg
            til nettsiden din eller last opp et dokument.
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
        <button
          type="button"
          onClick={() => setTab("url")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition",
            tab === "url"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300",
          )}
        >
          <LinkIcon className="h-3.5 w-3.5" />
          Nettside-URL
        </button>
        <button
          type="button"
          onClick={() => setTab("file")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition",
            tab === "file"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300",
          )}
        >
          <UploadIcon className="h-3.5 w-3.5" />
          Last opp fil
        </button>
      </div>

      {subscriptionError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 dark:border-amber-800/40 dark:bg-amber-900/15">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Krever abonnement
          </p>
          <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-400">
            Opplasting av kunnskap krever et aktivt abonnement. Du kan legge til
            kunnskap fra Knowledge Base etter du har valgt en plan.
          </p>
          <Link
            href="/agents"
            className="mt-2.5 inline-flex items-center gap-1 text-sm font-medium text-amber-800 underline underline-offset-2 hover:text-amber-900 dark:text-amber-300"
            onClick={onSkip}
          >
            Gå til fakturering <ArrowRightIcon className="h-3 w-3" />
          </Link>
        </div>
      ) : tab === "url" ? (
        <form onSubmit={(e) => void handleUrl(e)} className="space-y-4">
          <Field
            label="Nettside-URL"
            hint="Vi henter innholdet og gjør det søkbart for agenten. Legg til flere sider fra Knowledge Base."
          >
            <Input
              type="url"
              autoFocus
              placeholder="https://dinbedrift.no/om-oss"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
          </Field>
          {error && <ErrorBanner message={error} />}
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            style={{ background: "#0d9488" }}
          >
            {loading ? (
              <LoaderIcon className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Hent innhold
                <ChevronRightIcon className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={(e) => void handleFile(e)} className="space-y-4">
          <Field
            label="Dokument"
            hint="Støttede formater: PDF, DOCX, TXT, Markdown"
          >
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
                "flex h-24 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition",
                file
                  ? "border-teal-400 bg-teal-50 dark:border-teal-600 dark:bg-teal-950/30"
                  : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600",
              )}
            >
              {file ? (
                <>
                  <CheckIcon className="h-5 w-5 text-teal-500" />
                  <span className="text-sm font-medium text-teal-700 dark:text-teal-400">
                    {file.name}
                  </span>
                </>
              ) : (
                <>
                  <UploadIcon className="h-5 w-5 text-zinc-400" />
                  <span className="text-sm text-zinc-500">
                    Klikk for å velge fil
                  </span>
                </>
              )}
            </button>
          </Field>
          {error && <ErrorBanner message={error} />}
          <button
            type="submit"
            disabled={loading || !file}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            style={{ background: "#0d9488" }}
          >
            {loading ? (
              <LoaderIcon className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Last opp
                <ChevronRightIcon className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={onSkip}
        className="w-full text-center text-sm text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-400"
      >
        Hopp over — legg til kunnskap senere
      </button>
    </div>
  );
}

// ─── STEP 3: Customize widget ─────────────────────────────────────────────────
function StepCustomize({
  agentId,
  agentName,
  onComplete,
  onSkip,
}: {
  agentId: Id<"agents">;
  agentName: string;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const upsertSettings = useMutation(api.private.widgetSettings.upsert);
  const [title, setTitle] = useState(agentName);
  const [greeting, setGreeting] = useState("Hei! Hvordan kan jeg hjelpe deg i dag?");
  const [headerColor, setHeaderColor] = useState("#0d9488");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await upsertSettings({
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
          headerColor,
          headerTextColor: "#ffffff",
        },
      });
      onComplete();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message
        : typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Noe gikk galt.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/40">
          <PaletteIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Tilpass widgeten
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Bestem hvordan chatwidgeten presenterer seg på nettsiden din. Du kan
            alltid endre dette fra Widget-innstillinger.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Field label="Widgettittel" hint="Vises øverst i chatvinduet">
          <Input
            autoFocus
            placeholder="Kundesupport"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            maxLength={50}
          />
        </Field>

        <Field label="Velkomstmelding" required hint="Første melding kunden ser når de åpner chatten">
          <Textarea
            rows={3}
            placeholder="Hei! Hvordan kan jeg hjelpe deg i dag?"
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            disabled={loading}
            maxLength={300}
          />
        </Field>

        <Field label="Primærfarge" hint="Fargen på widget-headeren og meldingsbobler">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={headerColor}
              onChange={(e) => setHeaderColor(e.target.value)}
              disabled={loading}
              className="h-10 w-14 cursor-pointer rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <Input
              value={headerColor}
              onChange={(e) => setHeaderColor(e.target.value)}
              disabled={loading}
              className="max-w-[140px] font-mono text-xs uppercase"
              placeholder="#0d9488"
            />
            {/* Mini widget preview */}
            <div className="ml-auto flex flex-col overflow-hidden rounded-xl shadow-md" style={{ width: 120, fontSize: 10 }}>
              <div className="flex items-center gap-1.5 px-2.5 py-2" style={{ background: headerColor }}>
                <div className="h-3.5 w-3.5 rounded-full bg-white/30" />
                <span className="font-medium text-white truncate">{title || agentName}</span>
              </div>
              <div className="space-y-1.5 bg-white p-2 dark:bg-zinc-900">
                <div className="rounded-lg px-2 py-1.5 text-white" style={{ background: headerColor, width: "70%" }}>
                  {greeting.slice(0, 30)}…
                </div>
              </div>
            </div>
          </div>
        </Field>
      </div>

      {error && <ErrorBanner message={error} />}

      <button
        type="submit"
        disabled={loading || !greeting.trim()}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
        style={{ background: "#0d9488" }}
      >
        {loading ? (
          <LoaderIcon className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Lagre innstillinger
            <ChevronRightIcon className="h-4 w-4" />
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onSkip}
        className="w-full text-center text-sm text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-400"
      >
        Hopp over — bruk standardinnstillinger
      </button>
    </form>
  );
}

// ─── STEP 4: Integration embed code ──────────────────────────────────────────
function StepIntegrate({
  orgId,
  agentId,
  agentName,
  onFinish,
}: {
  orgId: string;
  agentId: Id<"agents">;
  agentName: string;
  onFinish: () => void;
}) {
  const embedCode = buildEmbedScript(orgId, agentId);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/40">
          <CodeIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Legg til på nettsiden din
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Lim inn denne script-taggen rett før{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-zinc-800">
              &lt;/body&gt;
            </code>{" "}
            på nettsiden din. Widgeten starter automatisk.
          </p>
        </div>
      </div>

      {/* Code block */}
      <div className="relative">
        <pre className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-950 px-4 py-4 text-xs leading-relaxed text-zinc-300 dark:border-zinc-700">
          <code>{embedCode}</code>
        </pre>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className={cn(
            "absolute right-3 top-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
            copied
              ? "bg-teal-500 text-white"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
          )}
        >
          {copied ? (
            <>
              <CheckIcon className="h-3 w-3" />
              Kopiert!
            </>
          ) : (
            <>
              <CopyIcon className="h-3 w-3" />
              Kopier
            </>
          )}
        </button>
      </div>

      {/* Tips */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Hvor limer du inn koden?
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { label: "WordPress", hint: "Appearance → Theme Editor → footer.php" },
            { label: "Webflow", hint: "Project Settings → Custom Code → Footer" },
            { label: "Squarespace", hint: "Settings → Advanced → Code Injection" },
            { label: "Shopify", hint: "Online Store → Themes → Edit code → theme.liquid" },
          ].map((tip) => (
            <div
              key={tip.label}
              className="rounded-xl border border-zinc-100 bg-zinc-50 px-3.5 py-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{tip.label}</p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{tip.hint}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onFinish}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
        style={{ background: "#0d9488" }}
      >
        <SparklesIcon className="h-4 w-4" />
        Gå til dashboardet
        <ArrowRightIcon className="h-4 w-4" />
      </button>

      <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
        Du kan alltid finne integrasjonskoden under{" "}
        <Link
          href={`/agents/${agentId}/integrations`}
          className="underline underline-offset-2 hover:text-zinc-600"
        >
          Integrasjoner
        </Link>
        .
      </p>
    </div>
  );
}

// ─── Main onboarding view ─────────────────────────────────────────────────────
export const OnboardingView = () => {
  const router = useRouter();
  const { organization } = useOrganization();
  const agents = useQuery(api.private.agents.list);

  const [step, setStep] = useState<StepId>(1);
  const [completed, setCompleted] = useState<Set<StepId>>(new Set());
  const [agentId, setAgentId] = useState<Id<"agents"> | null>(null);
  const [agentName, setAgentName] = useState("");

  // Redirect users who already have agents
  useEffect(() => {
    if (agents !== undefined && agents !== null && agents.length > 0) {
      router.replace("/agents");
    }
  }, [agents, router]);

  const markDone = (s: StepId) =>
    setCompleted((prev) => new Set([...prev, s]));

  const goTo = (s: StepId) => setStep(s);

  const handleAgentCreated = (id: Id<"agents">, name: string) => {
    setAgentId(id);
    setAgentName(name);
    markDone(1);
    goTo(2);
  };

  const handleKnowledgeDone = () => {
    markDone(2);
    goTo(3);
  };

  const handleCustomizeDone = () => {
    markDone(3);
    goTo(4);
  };

  const handleFinish = () => {
    router.push(agentId ? `/agents/${agentId}` : "/agents");
  };

  const handleSkipAll = () => {
    router.push("/agents");
  };

  // Loading state while checking agents
  if (agents === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <LoaderIcon className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  const orgId = organization?.id ?? "";

  return (
    <div
      className="flex min-h-screen flex-col bg-white dark:bg-zinc-950"
      style={{
        backgroundImage:
          "radial-gradient(oklch(0.88 0 0) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-zinc-100 bg-white/80 px-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <Logo className="h-6 w-auto dark:brightness-0 dark:invert" />
        <button
          type="button"
          onClick={handleSkipAll}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <XIcon className="h-3.5 w-3.5" />
          Hopp over oppsett
        </button>
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col items-center px-4 py-10">
        {/* Intro text */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
            Velkommen til Agenci
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            La oss sette opp din AI-assistent
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            4 raske steg — du er i gang på under 5 minutter
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-8 w-full max-w-lg">
          <StepIndicator current={step} completed={completed} />
        </div>

        {/* Card */}
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]">
            {step === 1 && (
              <StepAgent onComplete={handleAgentCreated} />
            )}

            {step === 2 && agentId && (
              <StepKnowledge
                agentId={agentId}
                onComplete={handleKnowledgeDone}
                onSkip={handleKnowledgeDone}
              />
            )}

            {step === 3 && agentId && (
              <StepCustomize
                agentId={agentId}
                agentName={agentName}
                onComplete={handleCustomizeDone}
                onSkip={handleCustomizeDone}
              />
            )}

            {step === 4 && agentId && (
              <StepIntegrate
                orgId={orgId}
                agentId={agentId}
                agentName={agentName}
                onFinish={handleFinish}
              />
            )}
          </div>

          {/* Back nav (steps 2+) */}
          {step > 1 && step < 4 && (
            <button
              type="button"
              onClick={() => goTo((step - 1) as StepId)}
              className="mt-3 w-full text-center text-xs text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-400"
            >
              ← Tilbake
            </button>
          )}
        </div>

        {/* Step count */}
        <p className="mt-6 text-xs text-zinc-300 dark:text-zinc-600">
          Steg {step} av {STEPS.length}
        </p>
      </main>
    </div>
  );
};
