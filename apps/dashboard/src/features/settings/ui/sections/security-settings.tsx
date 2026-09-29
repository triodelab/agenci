import { cn } from "@workspace/ui/lib/utils";
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  LaptopIcon,
  LoaderIcon,
  LogOutIcon,
  MonitorSmartphoneIcon,
  SmartphoneIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Field, ghostBtn, inkBtn, inputClass, Section, SettingsHeader } from "../settings-ui";

function strength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-ZÆØÅ]/.test(pw) && /[a-zæøå]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9ÆØÅæøå]/.test(pw)) score++;
  const level = pw ? Math.min(4, Math.max(1, score)) : 0;
  return {
    level,
    label: ["", "Svakt", "Greit", "Sterkt", "Veldig sterkt"][level] ?? "",
    color: ["", "bg-[#D9493E]", "bg-[#E49A62]", "bg-[#5FA06F]", "bg-[#2F7D46]"][level] ?? "",
  };
}

export function PasswordInput({ value, onChange, autoComplete }: { value: string; onChange: (v: string) => void; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative block">
      <input
        type={show ? "text" : "password"}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.currentTarget.value)}
        className={cn(inputClass, "pr-11")}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Skjul passord" : "Vis passord"}
        className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-(--agenci-ink-3) hover:bg-(--dash-subtle) hover:text-(--agenci-ink)"
      >
        {show ? <EyeOffIcon className="size-4" strokeWidth={1.6} /> : <EyeIcon className="size-4" strokeWidth={1.6} />}
      </button>
    </span>
  );
}

type SessionRow = {
  id: string;
  token: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  updatedAt: Date | string;
  createdAt: Date | string;
};

function describe(ua?: string | null) {
  const s = ua ?? "";
  const browser = /Edg\//.test(s) ? "Edge" : /Chrome\//.test(s) ? "Chrome" : /Firefox\//.test(s) ? "Firefox" : /Safari\//.test(s) ? "Safari" : "Nettleser";
  const os = /iPhone|iPad/.test(s)
    ? "iOS"
    : /Android/.test(s)
      ? "Android"
      : /Mac OS X/.test(s)
        ? "macOS"
        : /Windows/.test(s)
          ? "Windows"
          : /Linux/.test(s)
            ? "Linux"
            : "ukjent system";
  return { label: `${browser} på ${os}`, mobile: /Mobile|iPhone|Android/.test(s), known: !!s };
}

function ago(v: Date | string) {
  const min = Math.round((Date.now() - new Date(v).getTime()) / 60_000);
  if (min < 2) return "Aktiv nå";
  if (min < 60) return `${min} min siden`;
  if (min < 1440) return `${Math.round(min / 60)} t siden`;
  return `${Math.round(min / 1440)} d siden`;
}

export function SecuritySettings() {
  const { data: session } = authClient.useSession();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [others, setOthers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const load = async () => {
    const { data } = await authClient.listSessions();
    setSessions(((data ?? []) as SessionRow[]).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  };
  useEffect(() => {
    void load();
  }, []);

  const pw = strength(next);
  const error = next && next.length < 8 ? "Minst 8 tegn." : confirm && next !== confirm ? "Passordene er ikke like." : null;
  const canSave = !!current && next.length >= 8 && next === confirm && !saving;
  const currentToken = session?.session.token;
  const otherSessions = (sessions ?? []).filter((s) => s.token !== currentToken);

  const save = async () => {
    setSaving(true);
    const { error: err } = await authClient.changePassword({ currentPassword: current, newPassword: next, revokeOtherSessions: others });
    setSaving(false);
    if (err) {
      return toast.error(/invalid|incorrect/i.test(err.message ?? "") ? "Nåværende passord er feil." : (err.message ?? "Kunne ikke bytte passord."));
    }
    setCurrent("");
    setNext("");
    setConfirm("");
    toast.success(others ? "Passordet er byttet, og andre enheter er logget ut" : "Passordet er byttet");
    void load();
  };

  return (
    <div className="grid gap-5">
      <SettingsHeader title="Sikkerhet" description="Passordet ditt, og hvor du er logget inn." />

      <Section
        title="Passord"
        description="Bruk minst 8 tegn. En setning du husker er ofte både sterkere og lettere enn et kort passord."
        footer={
          <button type="button" className={inkBtn} disabled={!canSave} onClick={save}>
            {saving ? <LoaderIcon className="size-4 animate-spin" /> : null}
            Bytt passord
          </button>
        }
      >
        <div className="grid gap-5">
          <Field label="Nåværende passord">
            <PasswordInput value={current} onChange={setCurrent} autoComplete="current-password" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nytt passord">
              <PasswordInput value={next} onChange={setNext} autoComplete="new-password" />
            </Field>
            <Field label="Gjenta nytt passord">
              <PasswordInput value={confirm} onChange={setConfirm} autoComplete="new-password" />
            </Field>
          </div>
          {next ? (
            <div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <span key={i} className={cn("h-1.5 flex-1 rounded-full bg-(--dash-subtle)", i <= pw.level && pw.color)} />
                ))}
              </div>
              <p className="mt-1.5 text-[12.5px] text-(--agenci-ink-2)">{error ?? pw.label}</p>
            </div>
          ) : null}
          <label className="flex cursor-pointer items-start gap-3 rounded-[12px] bg-(--dash-subtle-2) px-3.5 py-3 dark:bg-white/5">
            <input type="checkbox" checked={others} onChange={(e) => setOthers(e.currentTarget.checked)} className="mt-0.5 size-4 accent-(--agenci-ink)" />
            <span>
              <span className="block text-[13.5px] text-(--agenci-ink)">Logg ut av alle andre enheter</span>
              <span className="block text-[12.5px] text-(--agenci-ink-3)">Anbefalt hvis du tror noen andre kjenner passordet.</span>
            </span>
          </label>
        </div>
      </Section>

      <Section
        title="Innloggede enheter"
        description="Ser du en enhet du ikke kjenner igjen, logg den ut og bytt passord."
        footer={
          otherSessions.length ? (
            <button
              type="button"
              className={ghostBtn}
              disabled={revoking === "others"}
              onClick={async () => {
                setRevoking("others");
                await authClient.revokeOtherSessions();
                setRevoking(null);
                toast.success("Alle andre enheter er logget ut");
                void load();
              }}
            >
              <LogOutIcon className="size-4" strokeWidth={1.6} />
              Logg ut av alle andre
            </button>
          ) : undefined
        }
      >
        {sessions === null ? (
          <p className="flex items-center gap-2 text-[13.5px] text-(--agenci-ink-2)">
            <LoaderIcon className="size-4 animate-spin" /> Henter enheter…
          </p>
        ) : (
          <ul className="divide-y divide-(--agenci-line) rounded-[12px] border border-(--agenci-line)">
            {sessions.map((s) => {
              const d = describe(s.userAgent);
              const isCurrent = s.token === currentToken;
              const Icon = d.mobile ? SmartphoneIcon : d.known ? LaptopIcon : MonitorSmartphoneIcon;
              return (
                <li key={s.id} className="flex items-center gap-3.5 px-4 py-3.5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--dash-subtle) text-(--agenci-ink) dark:bg-white/10">
                    <Icon className="size-4.5" strokeWidth={1.6} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 text-[13.5px] font-medium text-(--agenci-ink)">
                      {d.label}
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-(--dash-good-bg) px-2 py-px text-[11.5px] font-medium text-(--dash-good)">
                          <CheckIcon className="size-3" strokeWidth={2.4} /> Denne enheten
                        </span>
                      ) : null}
                    </span>
                    <span className="block truncate text-[12.5px] text-(--agenci-ink-3)">
                      {isCurrent ? "Aktiv nå" : ago(s.updatedAt)}
                      {s.ipAddress ? ` · ${s.ipAddress}` : ""}
                    </span>
                  </span>
                  {isCurrent ? null : (
                    <button
                      type="button"
                      disabled={revoking === s.token}
                      onClick={async () => {
                        setRevoking(s.token);
                        await authClient.revokeSession({ token: s.token });
                        setRevoking(null);
                        toast.success("Enheten er logget ut");
                        void load();
                      }}
                      className="inline-flex h-8 items-center rounded-full px-3 text-[12.5px] text-(--agenci-ink-2) hover:bg-(--dash-subtle) hover:text-(--agenci-ink) disabled:opacity-40"
                    >
                      Logg ut
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </div>
  );
}
