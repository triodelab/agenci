import { type FormEvent, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { AuthShell, authButtonCls, authInputCls, authLabelCls, PasswordInput } from "@/components/auth-shell";
import { authClient } from "@/lib/auth-client";
import { takePendingInvite } from "@/lib/pending-invite";
import { errCls } from "@/lib/ui";

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
        onSuccess: () => {
          // Came from an invitation link: go back and accept it.
          const invite = takePendingInvite();
          return invite
            ? navigate({
                to: "/accept-invitation/$invitationId",
                params: { invitationId: invite },
              })
            : navigate({ to: "/" });
        },
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
      title="Velkommen tilbake"
      subtitle={
        <>
          Har du ikke konto?{" "}
          <button type="button" onClick={onSwitchToSignUp} className="font-medium text-(--agenci-ink) underline underline-offset-4 hover:no-underline">
            Opprett konto
          </button>
        </>
      }
    >
      <form onSubmit={(e) => void submit(e)} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className={authLabelCls}>
            E-post
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required className={authInputCls} placeholder="navn@bedrift.no" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className={authLabelCls}>
            Passord
          </label>
          <PasswordInput id="password" name="password" autoComplete="current-password" minLength={8} required />
        </div>
        {error ? <p className={errCls}>{error}</p> : null}
        <button type="submit" className={authButtonCls} disabled={isSubmitting}>
          {isSubmitting ? "Logger inn…" : "Logg inn"}
        </button>
      </form>
    </AuthShell>
  );
}
