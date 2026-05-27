"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { EyeIcon, EyeOffIcon, LoaderIcon } from "lucide-react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 21 21" className="h-4 w-4" aria-hidden>
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

const inputCls =
  "w-full rounded-[8px] border border-[#d4d0cb] bg-white px-3.5 py-2.5 text-[14px] text-[#1C1C1C] placeholder-[#a09d98] outline-none transition focus:border-[#b8b3ae] focus:ring-2 focus:ring-[#1C1C1C]/8 disabled:opacity-50";

type Step = "form" | "verify";

export const SignUpView = () => {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [step, setStep] = useState<Step>("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "microsoft" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = async (provider: "oauth_google" | "oauth_microsoft") => {
    if (!isLoaded) return;
    setOauthLoading(provider === "oauth_google" ? "google" : "microsoft");
    setError(null);
    try {
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: "/agents",
      });
    } catch {
      setError("Noe gikk galt. Prøv igjen.");
      setOauthLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);
    try {
      await signUp.create({ firstName, lastName, emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message?: string; longMessage?: string }[] };
      const msg = clerkError?.errors?.[0]?.longMessage ?? clerkError?.errors?.[0]?.message;
      setError(msg || "Registrering mislyktes. Prøv igjen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/org-selection");
      } else {
        setError(`Feil (${result.status}): Prøv igjen.`);
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message?: string }[] };
      const msg = clerkError?.errors?.[0]?.message;
      setError(msg || "Feil kode. Prøv igjen.");
    } finally {
      setIsLoading(false);
    }
  };

  const busy = isLoading || oauthLoading !== null;

  if (step === "verify") {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[#1C1C1C]">
            Sjekk e-posten din
          </h2>
          <p className="text-[14px] text-[#6b7280]">
            Vi sendte en 6-sifret kode til{" "}
            <span className="font-medium text-[#4b5563]">{email}</span>
          </p>
        </div>

        <form onSubmit={(e) => void handleVerify(e)} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="code" className="text-[13px] font-medium text-[#4b5563]">
              Verifikasjonskode
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              disabled={busy}
              className="w-full rounded-[8px] border border-[#d4d0cb] bg-white px-3.5 py-2.5 text-center text-lg font-semibold tracking-[0.3em] text-[#1C1C1C] outline-none transition focus:border-[#b8b3ae] focus:ring-2 focus:ring-[#1C1C1C]/8 disabled:opacity-50"
            />
          </div>

          {error && (
            <p className="rounded-[8px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || code.length < 6}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[#1C1C1C] text-[14px] font-semibold text-white transition hover:bg-[#2a2a2a] disabled:opacity-50"
          >
            {isLoading && <LoaderIcon className="h-4 w-4 animate-spin" />}
            Bekreft konto
          </button>
        </form>

        <button
          type="button"
          onClick={() => setStep("form")}
          className="w-full text-center text-[13px] text-[#6b7280] transition-colors hover:text-[#4b5563]"
        >
          ← Gå tilbake
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[#1C1C1C]">
          Opprett konto
        </h2>
        <p className="text-[14px] text-[#6b7280]">
          Kom i gang med Agenci gratis
        </p>
      </div>

      {/* OAuth buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleOAuth("oauth_google")}
          className="flex h-10 items-center justify-center gap-2 rounded-[8px] border border-[#d4d0cb] bg-white text-[13px] font-medium text-[#4b5563] transition hover:border-[#b8b3ae] hover:text-[#1C1C1C] disabled:opacity-50"
        >
          {oauthLoading === "google" ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Google
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleOAuth("oauth_microsoft")}
          className="flex h-10 items-center justify-center gap-2 rounded-[8px] border border-[#d4d0cb] bg-white text-[13px] font-medium text-[#4b5563] transition hover:border-[#b8b3ae] hover:text-[#1C1C1C] disabled:opacity-50"
        >
          {oauthLoading === "microsoft" ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            <MicrosoftIcon />
          )}
          Microsoft
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#d4d0cb]" />
        <span className="text-[11px] text-[#a09d98]">eller</span>
        <div className="h-px flex-1 bg-[#d4d0cb]" />
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="text-[13px] font-medium text-[#4b5563]">
              Fornavn
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ola"
              disabled={busy}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="lastName" className="text-[13px] font-medium text-[#4b5563]">
              Etternavn
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nordmann"
              disabled={busy}
              className={inputCls}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[13px] font-medium text-[#4b5563]">
            E-post
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="din@epost.no"
            disabled={busy}
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-[13px] font-medium text-[#4b5563]">
            Passord
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minst 8 tegn"
              disabled={busy}
              className={inputCls + " pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09d98] hover:text-[#4b5563]"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-[8px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">
            {error}
          </p>
        )}

        <div id="clerk-captcha" />

        <button
          type="submit"
          disabled={busy}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[#1C1C1C] text-[14px] font-semibold text-white transition hover:bg-[#2a2a2a] disabled:opacity-50"
        >
          {isLoading && <LoaderIcon className="h-4 w-4 animate-spin" />}
          Opprett konto
        </button>

        <p className="text-center text-[11px] leading-relaxed text-[#4b5563]">
          Ved å opprette konto godtar du våre{" "}
          <Link href="/vilkar" className="text-[#4b5563] underline underline-offset-2 hover:text-[#1C1C1C]">
            vilkår
          </Link>{" "}
          og{" "}
          <Link href="/personvern" className="text-[#4b5563] underline underline-offset-2 hover:text-[#1C1C1C]">
            personvernerklæring
          </Link>
          .
        </p>
      </form>

      <p className="text-center text-[13px] text-[#6b7280]">
        Har du allerede konto?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-[#1C1C1C] transition-colors hover:text-[#2a2a2a]"
        >
          Logg inn
        </Link>
      </p>
    </div>
  );
};
