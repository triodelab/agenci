/**
 * Sign-up via Better Auth email/password.
 */
"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";

const inputCls =
  "h-10 w-full rounded-[8px] border border-[#d4d0cb] bg-white px-3.5 text-[14px] text-[#1C1C1C] placeholder-[#a09d98] outline-none transition focus:border-[#b8b3ae] focus:ring-2 focus:ring-[#1C1C1C]/8 disabled:opacity-50";

export const SignUpView = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) router.replace("/onboarding");
  }, [session?.user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: signUpError } = await authClient.signUp.email({
        name,
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message ?? "Kunne ikke opprette konto.");
        return;
      }
      router.push("/onboarding");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kunne ikke opprette konto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[#1C1C1C]">
          Opprett konto
        </h2>
        <p className="text-[14px] text-[#6b7280]">
          Kom i gang med Agenci
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3.5">
        <div className="space-y-1.5">
          <label htmlFor="su-name" className="text-[13px] font-medium text-[#4b5563]">
            Navn
          </label>
          <input
            id="su-name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ditt navn"
            disabled={loading}
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="su-email" className="text-[13px] font-medium text-[#4b5563]">
            E-post
          </label>
          <input
            id="su-email"
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

        <div className="space-y-1.5">
          <label htmlFor="su-pwd" className="text-[13px] font-medium text-[#4b5563]">
            Passord
          </label>
          <div className="relative">
            <input
              id="su-pwd"
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
              {showPwd ? (
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

        <button
          type="submit"
          disabled={loading}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[#1C1C1C] text-[14px] font-semibold text-white transition hover:bg-[#2a2a2a] disabled:opacity-50"
        >
          {loading && <Loader2Icon className="h-4 w-4 animate-spin" />}
          Opprett konto
        </button>
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
