"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";

const inputCls =
  "h-10 w-full rounded-[8px] border border-[#d4d0cb] bg-white px-3.5 text-[14px] text-[#1C1C1C] placeholder-[#a09d98] outline-none transition focus:border-[#b8b3ae] focus:ring-2 focus:ring-[#1C1C1C]/8 disabled:opacity-50";

type Step = "email" | "reset";

function clerkErrMsg(err: unknown): string {
  const e = err as { errors?: Array<{ code?: string; message?: string; longMessage?: string }> } | null;
  const first = e?.errors?.[0];
  const code = first?.code ?? "";
  if (code === "form_identifier_not_found" || code.includes("identifier_not_found"))
    return "Fant ingen konto med denne e-postadressen.";
  if (code === "too_many_requests")
    return "For mange forsøk. Vent litt og prøv igjen.";
  if (code.includes("incorrect_code") || code.includes("invalid_code"))
    return "Feil kode. Sjekk e-posten og prøv igjen.";
  if (code.includes("expired"))
    return "Koden har utløpt. Start på nytt.";
  return first?.longMessage ?? first?.message ?? "Noe gikk galt. Prøv igjen.";
}

export const ForgotPasswordView = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError(null);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep("reset");
    } catch (err) {
      setError(clerkErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/agents");
      } else {
        setError("Tilbakestilling mislyktes. Prøv igjen.");
      }
    } catch (err) {
      setError(clerkErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  if (step === "reset") {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[#1C1C1C]">
            Sett nytt passord
          </h2>
          <p className="text-[14px] text-[#6b7280]">
            Vi sendte en kode til{" "}
            <span className="font-medium text-[#4b5563]">{email}</span>
          </p>
        </div>

        <form onSubmit={(e) => void handleReset(e)} className="space-y-3.5">
          <div className="space-y-1.5">
            <label htmlFor="fp-code" className="text-[13px] font-medium text-[#4b5563]">
              Kode fra e-post
            </label>
            <input
              id="fp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              disabled={loading}
              className="w-full rounded-[8px] border border-[#d4d0cb] bg-white px-3.5 py-2.5 text-center text-lg font-semibold tracking-[0.3em] text-[#1C1C1C] outline-none transition focus:border-[#b8b3ae] focus:ring-2 focus:ring-[#1C1C1C]/8 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="fp-pwd" className="text-[13px] font-medium text-[#4b5563]">
              Nytt passord
            </label>
            <div className="relative">
              <input
                id="fp-pwd"
                type={showPwd ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minst 8 tegn"
                disabled={loading}
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09d98] hover:text-[#4b5563]"
              >
                {showPwd ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-[8px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.length < 6 || password.length < 8}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[#1C1C1C] text-[14px] font-semibold text-white transition hover:bg-[#2a2a2a] disabled:opacity-50"
          >
            {loading && <Loader2Icon className="h-4 w-4 animate-spin" />}
            Sett nytt passord
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setStep("email"); setError(null); setCode(""); setPassword(""); }}
          className="w-full text-center text-[13px] text-[#6b7280] transition-colors hover:text-[#4b5563]"
        >
          ← Prøv en annen e-postadresse
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[#1C1C1C]">
          Glemt passord?
        </h2>
        <p className="text-[14px] text-[#6b7280]">
          Skriv inn e-postadressen din, så sender vi en kode.
        </p>
      </div>

      <form onSubmit={(e) => void handleRequestCode(e)} className="space-y-3.5">
        <div className="space-y-1.5">
          <label htmlFor="fp-email" className="text-[13px] font-medium text-[#4b5563]">
            E-post
          </label>
          <input
            id="fp-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="din@epost.no"
            disabled={loading}
            className={inputCls}
          />
        </div>

        {error && (
          <p className="rounded-[8px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[#1C1C1C] text-[14px] font-semibold text-white transition hover:bg-[#2a2a2a] disabled:opacity-50"
        >
          {loading && <Loader2Icon className="h-4 w-4 animate-spin" />}
          Send tilbakestillingskode
        </button>
      </form>

      <p className="text-center text-[13px] text-[#6b7280]">
        Husker du passordet?{" "}
        <Link href="/sign-in" className="font-semibold text-[#1C1C1C] transition-colors hover:text-[#2a2a2a]">
          Logg inn
        </Link>
      </p>
    </div>
  );
};
