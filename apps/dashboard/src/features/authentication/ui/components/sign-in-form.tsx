import { type FormEvent, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { AuthShell } from "@/components/auth-shell";
import { authClient } from "@/lib/auth-client";
import { btnPrimaryCls, errCls, inputCls, labelCls } from "@/lib/ui";

const signInSchema = z.object({
  email: z.email("Ugyldig e-postadresse"),
  password: z.string().min(8, "Passordet må være minst 8 tegn"),
});

export default function SignInForm({
  onSwitchToSignUp,
}: {
  onSwitchToSignUp: () => void;
}) {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = signInSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!result.success) {
      setError(result.error.issues[0]?.message);
      return;
    }

    setIsSubmitting(true);
    setError(undefined);
    try {
      await authClient.signIn.email(result.data, {
        onSuccess: () => navigate({ to: "/" }),
        onError: ({ error: signInError }) => {
          setError(signInError.message);
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Logg inn"
      subtitle="Kom i gang med Agenci"
      footer={
        <>
          Har du ikke konto?{" "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="font-semibold text-neutral-900 hover:underline"
          >
            Opprett konto
          </button>
        </>
      }
    >
      <form onSubmit={(e) => void submit(e)} className="space-y-3.5">
        <div className="space-y-1.5">
          <label htmlFor="email" className={labelCls}>
            E-post
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className={labelCls}>
            Passord
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={8}
            required
            className={inputCls}
          />
        </div>
        {error ? <p className={errCls}>{error}</p> : null}
        <button type="submit" className={btnPrimaryCls} disabled={isSubmitting}>
          {isSubmitting ? "Logger inn…" : "Logg inn"}
        </button>
      </form>
    </AuthShell>
  );
}
