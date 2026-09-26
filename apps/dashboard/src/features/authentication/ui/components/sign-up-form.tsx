import { type FormEvent, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { AuthShell } from "@/components/auth-shell";
import { authClient } from "@/lib/auth-client";
import { btnPrimaryCls, errCls, inputCls, labelCls } from "@/lib/ui";

const signUpSchema = z.object({
  name: z.string().min(2, "Navn må være minst 2 tegn"),
  email: z.email("Ugyldig e-postadresse"),
  password: z.string().min(8, "Passordet må være minst 8 tegn"),
});

export default function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      password,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Ugyldig input.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: signUpError } = await authClient.signUp.email(parsed.data);
      if (signUpError) {
        setError(signUpError.message ?? "Kunne ikke opprette konto.");
        return;
      }
      await navigate({ to: "/org/create" });
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Kunne ikke opprette konto.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Opprett konto"
      subtitle="Kom i gang med Agenci"
      footer={
        <>
          Har du allerede konto?{" "}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="font-semibold text-neutral-900 hover:underline"
          >
            Logg inn
          </button>
        </>
      }
    >
      <form className="space-y-3.5" onSubmit={(e) => void onSubmit(e)}>
        <div className="space-y-1.5">
          <label htmlFor="name" className={labelCls}>
            Navn
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            className={inputCls}
            value={name}
            disabled={loading}
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Ditt navn"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className={labelCls}>
            E-post
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className={inputCls}
            value={email}
            disabled={loading}
            onChange={(e) => setEmail(e.currentTarget.value)}
            placeholder="din@epost.no"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className={labelCls}>
            Passord
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={inputCls}
            value={password}
            disabled={loading}
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="Minst 8 tegn"
          />
        </div>
        {error ? <p className={errCls}>{error}</p> : null}
        <button type="submit" className={btnPrimaryCls} disabled={loading}>
          {loading ? "Oppretter…" : "Opprett konto"}
        </button>
      </form>
    </AuthShell>
  );
}
