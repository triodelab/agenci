"use client";

import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 21 21" className="h-4 w-4 shrink-0" aria-hidden>
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

const inputCls =
  "h-10 w-full rounded-lg border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600";

function clerkErrMsg(err: unknown): string {
  const e = err as { errors?: Array<{ code?: string; message?: string; longMessage?: string }> } | null;
  const first = e?.errors?.[0];
  const code  = first?.code ?? "";

  if (code === "form_password_incorrect" || code.includes("password_incorrect"))
    return "Feil passord. Prøv igjen.";
  if (code === "form_identifier_not_found" || code.includes("identifier_not_found"))
    return "Fant ingen konto med denne e-postadressen.";
  if (code === "too_many_requests")
    return "For mange forsøk. Vent litt og prøv igjen.";

  // Fall back to the raw message (already in Norwegian from Clerk if locale is set)
  return first?.longMessage ?? first?.message ?? "Innlogging mislyktes. Prøv igjen.";
}

export const SignInView = () => {
  const { userId }                      = useAuth();
  const { signIn, setActive, isLoaded } = useSignIn();
  const router                          = useRouter();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPwd,      setShowPwd]      = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "microsoft" | null>(null);
  const [error,        setError]        = useState<string | null>(null);

  // Already authenticated → go straight to dashboard
  useEffect(() => {
    if (userId) router.replace("/agents");
  }, [userId, router]);

  const handleOAuth = async (provider: "oauth_google" | "oauth_microsoft") => {
    if (!isLoaded) return;
    setOauthLoading(provider === "oauth_google" ? "google" : "microsoft");
    setError(null);
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl:         `${window.location.origin}/sso-callback`,
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
    setLoading(true);
    setError(null);

    try {
      // Attempt sign-in — Clerk may return "complete" immediately (most configs)
      // or "needs_first_factor" when the password must be submitted as a separate step.
      const attempt = await signIn.create({ identifier: email, password });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.push("/agents");
        return;
      }

      if (attempt.status === "needs_first_factor") {
        const factorResult = await signIn.attemptFirstFactor({
          strategy: "password",
          password,
        });
        if (factorResult.status === "complete") {
          await setActive({ session: factorResult.createdSessionId });
          router.push("/agents");
          return;
        }
      }

      setError("Innlogging mislyktes. Prøv igjen.");
    } catch (err: unknown) {
      setError(clerkErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const busy = loading || oauthLoading !== null;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[22px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Logg inn
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Velkommen tilbake til Agenci
        </p>
      </div>

      {/* OAuth */}
      <div className="grid grid-cols-2 gap-2.5">
        {(["google", "microsoft"] as const).map((p) => (
          <button
            key={p}
            type="button"
            disabled={busy}
            onClick={() =>
              void handleOAuth(
                p === "google" ? "oauth_google" : "oauth_microsoft",
              )
            }
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {oauthLoading === p ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : p === "google" ? (
              <GoogleIcon />
            ) : (
              <MicrosoftIcon />
            )}
            {p === "google" ? "Google" : "Microsoft"}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
        <span className="text-[11px] text-zinc-400">eller</span>
        <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3.5">
        <div className="space-y-1.5">
          <label
            htmlFor="si-email"
            className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300"
          >
            E-post
          </label>
          <input
            id="si-email"
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
          <div className="flex items-center justify-between">
            <label
              htmlFor="si-pwd"
              className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300"
            >
              Passord
            </label>
            <Link
              href="/sign-in/forgot-password"
              className="text-[12px] text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Glemt passord?
            </Link>
          </div>
          <div className="relative">
            <input
              id="si-pwd"
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={busy}
              className={`${inputCls} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              {showPwd ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600 dark:border-red-900/40 dark:bg-red-900/15 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading && <Loader2Icon className="h-4 w-4 animate-spin" />}
          Logg inn
        </button>
      </form>

      <p className="text-center text-[13px] text-zinc-500 dark:text-zinc-400">
        Ny bruker?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-zinc-900 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
        >
          Opprett konto
        </Link>
      </p>
    </div>
  );
};
