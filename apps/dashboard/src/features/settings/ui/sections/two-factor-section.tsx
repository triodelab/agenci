import { CheckIcon, CopyIcon, LoaderIcon, ShieldCheckIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { renderSVG } from "uqr";
import { authClient } from "@/lib/auth-client";
import { Field, ghostBtn, inkBtn, inputClass, Section } from "../settings-ui";
import { PasswordInput } from "./security-settings";

type Step = "idle" | "password" | "scan" | "codes";

/** Better Auth answers in English; show Norwegian. */
function message(err: { message?: string } | null | undefined, fallback: string) {
  const m = err?.message ?? "";
  if (/password/i.test(m)) return "Passordet er feil.";
  if (/invalid.*(code|otp|totp)|code.*invalid/i.test(m)) return "Koden stemmer ikke. Prøv den neste koden i appen.";
  if (/too many|locked/i.test(m)) return "For mange forsøk. Vent litt og prøv igjen.";
  return fallback;
}

/**
 * Two-step login with an authenticator app (Google Authenticator, 1Password,
 * Microsoft Authenticator …). Required for Agenci's admin area.
 */
export function TwoFactorSection() {
  const { data: session, refetch } = authClient.useSession();
  const enabled = Boolean((session?.user as { twoFactorEnabled?: boolean } | undefined)?.twoFactorEnabled);
  const [step, setStep] = useState<Step>("idle");
  const [intent, setIntent] = useState<"enable" | "disable" | "codes">("enable");
  const [password, setPassword] = useState("");
  const [uri, setUri] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const secret = uri ? (new URL(uri).searchParams.get("secret") ?? "") : "";

  const reset = () => {
    setStep("idle");
    setPassword("");
    setCode("");
    setUri("");
  };

  const submitPassword = async () => {
    setBusy(true);
    try {
      if (intent === "enable") {
        const { data, error } = await authClient.twoFactor.enable({ password, issuer: "Agenci" });
        if (error || !data || data.method !== "totp") return toast.error(message(error, "Kunne ikke starte oppsettet."));
        setUri(data.totpURI);
        setCodes(data.backupCodes);
        setStep("scan");
      } else if (intent === "disable") {
        const { error } = await authClient.twoFactor.disable({ password });
        if (error) return toast.error(message(error, "Kunne ikke slå av to-trinns innlogging."));
        toast.success("To-trinns innlogging er slått av.");
        reset();
        void refetch();
      } else {
        const { data, error } = await authClient.twoFactor.generateBackupCodes({ password });
        if (error || !data) return toast.error(message(error, "Kunne ikke lage nye reservekoder."));
        setCodes(data.backupCodes);
        setStep("codes");
      }
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    const { error } = await authClient.twoFactor.verifyTotp({ code: code.replace(/\s/g, "") });
    setBusy(false);
    if (error) return toast.error(message(error, "Kunne ikke bekrefte koden."));
    toast.success("To-trinns innlogging er slått på.");
    setStep("codes");
    void refetch();
  };

  const copyCodes = async () => {
    await navigator.clipboard.writeText(codes.join("\n"));
    toast.success("Reservekodene er kopiert.");
  };

  return (
    <Section
      title="To-trinns innlogging"
      description="I tillegg til passordet skriver du en kode fra en app på telefonen. Da kommer ingen inn med bare passordet ditt."
    >
      {step === "idle" ? (
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={
              enabled
                ? "inline-flex items-center gap-1.5 rounded-full bg-[#e9f4ec] px-3 py-1 text-[13px] font-medium text-[#2f6b3c]"
                : "inline-flex items-center gap-1.5 rounded-full bg-(--dash-subtle) px-3 py-1 text-[13px] text-(--agenci-ink-2)"
            }
          >
            <ShieldCheckIcon className="size-4" strokeWidth={1.7} />
            {enabled ? "På" : "Av"}
          </span>
          <span className="ml-auto flex flex-wrap gap-2">
            {enabled ? (
              <>
                <button type="button" className={ghostBtn} onClick={() => { setIntent("codes"); setStep("password"); }}>
                  Nye reservekoder
                </button>
                <button type="button" className={ghostBtn} onClick={() => { setIntent("disable"); setStep("password"); }}>
                  Slå av
                </button>
              </>
            ) : (
              <button type="button" className={inkBtn} onClick={() => { setIntent("enable"); setStep("password"); }}>
                Slå på
              </button>
            )}
          </span>
        </div>
      ) : null}

      {step === "password" ? (
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submitPassword();
          }}
        >
          <Field label="Bekreft med passordet ditt">
            <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" />
          </Field>
          <div className="flex gap-2">
            <button type="submit" className={inkBtn} disabled={!password || busy}>
              {busy ? <LoaderIcon className="size-4 animate-spin" /> : null}
              Fortsett
            </button>
            <button type="button" className={ghostBtn} onClick={reset}>
              Avbryt
            </button>
          </div>
        </form>
      ) : null}

      {step === "scan" ? (
        <div className="grid gap-5 md:grid-cols-[200px_minmax(0,1fr)]">
          <div
            className="size-[200px] rounded-[16px] bg-white p-3 shadow-[inset_0_0_0_1px_rgb(5_6_7/0.08)] [&_svg]:size-full"
            // The SVG is generated locally from our own otpauth:// link.
            // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted, locally generated QR
            dangerouslySetInnerHTML={{ __html: renderSVG(uri, { border: 1 }) }}
          />
          <div className="grid content-start gap-4">
            <ol className="grid gap-1.5 text-[13.5px] text-(--agenci-ink)">
              <li>1. Åpne en app som Google Authenticator, Microsoft Authenticator eller 1Password.</li>
              <li>2. Skann QR-koden.</li>
              <li>3. Skriv inn den 6-sifrede koden appen viser.</li>
            </ol>
            <p className="text-[12.5px] text-(--agenci-ink-3)">
              Kan du ikke skanne? Skriv inn denne nøkkelen i appen:{" "}
              <span className="font-mono text-(--agenci-ink-2) select-all break-all">{secret}</span>
            </p>
            <form
              className="flex flex-wrap gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void verify();
              }}
            >
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={7}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123 456"
                className={`${inputClass} w-40 text-center font-mono tracking-[0.2em]`}
              />
              <button type="submit" className={inkBtn} disabled={code.replace(/\s/g, "").length !== 6 || busy}>
                {busy ? <LoaderIcon className="size-4 animate-spin" /> : null}
                Bekreft
              </button>
              <button type="button" className={ghostBtn} onClick={reset}>
                Avbryt
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {step === "codes" ? (
        <div className="grid gap-4">
          <p className="text-[13.5px] leading-relaxed text-(--agenci-ink)">
            <strong className="font-medium">Lagre disse reservekodene et trygt sted</strong>, for eksempel i en passordbehandler.
            Mister du telefonen, kan du logge inn med én av dem. Hver kode virker én gang, og de vises bare nå.
          </p>
          <div className="grid grid-cols-2 gap-2 rounded-[12px] bg-(--dash-subtle-2) p-4 font-mono text-[13.5px] text-(--agenci-ink) sm:grid-cols-5 dark:bg-white/5">
            {codes.map((c) => (
              <span key={c} className="select-all">
                {c}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" className={ghostBtn} onClick={() => void copyCodes()}>
              <CopyIcon className="size-4" strokeWidth={1.6} /> Kopier
            </button>
            <button type="button" className={inkBtn} onClick={reset}>
              <CheckIcon className="size-4" /> Jeg har lagret dem
            </button>
          </div>
        </div>
      ) : null}
    </Section>
  );
}
