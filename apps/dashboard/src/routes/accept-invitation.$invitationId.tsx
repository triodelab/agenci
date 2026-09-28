import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckIcon, LoaderIcon, MailIcon, UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { rememberInvite } from "@/lib/pending-invite";

export const Route = createFileRoute("/accept-invitation/$invitationId")({
  component: AcceptInvitationPage,
});

const ROLE_LABEL: Record<string, string> = {
  owner: "eier",
  admin: "admin",
  member: "medlem",
};

type Invitation = {
  organizationName: string;
  organizationSlug: string;
  inviterEmail: string;
  role: string;
  email: string;
  status: string;
  expiresAt: Date | string;
};

const inkBtn =
  "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-(--agenci-ink) px-5 text-[14px] font-medium text-white transition-colors hover:bg-(--agenci-accent-hover) disabled:opacity-50 dark:text-[#0b0c0e]";
const ghostBtn =
  "inline-flex h-11 flex-1 items-center justify-center rounded-full border border-(--agenci-line) bg-white px-5 text-[14px] text-(--agenci-ink) transition-colors hover:bg-[#f6f7f6] disabled:opacity-50 dark:bg-transparent";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="dashboard-app-shell flex min-h-svh items-center justify-center bg-(--dash-shell-bg) px-4 py-10">
      <div className="w-full max-w-[440px]">
        <div className="mb-6 flex items-end justify-center" role="img" aria-label="Agenci">
          <img src="/AgenciLogo.png" alt="" className="size-9 dark:invert" />
          <span className="-ml-[3px] -translate-y-[3px] text-[22px] leading-none font-medium tracking-[-0.03em] text-(--agenci-ink)">
            genci
          </span>
        </div>
        <section className="rounded-[22px] border border-white/80 bg-white p-7 shadow-[0_1px_3px_rgb(5_6_7/0.06),0_24px_50px_-24px_rgb(5_6_7/0.25)] dark:border-white/5 dark:bg-(--card)">
          {children}
        </section>
      </div>
    </main>
  );
}

function AcceptInvitationPage() {
  const { invitationId } = Route.useParams();
  const navigate = useNavigate();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"accept" | "reject" | null>(null);
  const [done, setDone] = useState<"rejected" | null>(null);

  useEffect(() => {
    if (sessionPending) return;
    if (!session) {
      rememberInvite(invitationId);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error: err } = await authClient.organization.getInvitation({
        query: { id: invitationId },
      });
      if (cancelled) return;
      if (err || !data) {
        setError(
          err?.status === 403 || /recipient/i.test(err?.message ?? "")
            ? "wrong-account"
            : "not-found",
        );
      } else {
        setInvitation(data as Invitation);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [invitationId, session, sessionPending]);

  const accept = async () => {
    if (!invitation) return;
    setBusy("accept");
    const { data, error: err } = await authClient.organization.acceptInvitation({
      invitationId,
    });
    if (err || !data) {
      setBusy(null);
      setError("accept-failed");
      return;
    }
    await authClient.organization.setActive({
      organizationSlug: invitation.organizationSlug,
    });
    await navigate({
      to: "/org/$orgSlug/agents",
      params: { orgSlug: invitation.organizationSlug },
    });
  };

  const reject = async () => {
    setBusy("reject");
    await authClient.organization.rejectInvitation({ invitationId });
    setBusy(null);
    setDone("rejected");
  };

  if (loading || sessionPending) {
    return (
      <Shell>
        <p className="flex items-center justify-center gap-2 py-6 text-[14px] text-(--agenci-ink-2)">
          <LoaderIcon className="size-4 animate-spin" /> Henter invitasjonen…
        </p>
      </Shell>
    );
  }

  if (!session) {
    return (
      <Shell>
        <span className="flex size-11 items-center justify-center rounded-full bg-[#f3f4f3] text-(--agenci-ink)">
          <MailIcon className="size-5" strokeWidth={1.6} />
        </span>
        <h1 className="mt-4 text-[20px] font-semibold tracking-[-0.02em] text-(--agenci-ink)">
          Du er invitert til Agenci
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-(--agenci-ink-2)">
          Logg inn med e-posten invitasjonen ble sendt til. Har du ikke konto
          ennå, lager du en på under et minutt. Du kommer rett tilbake hit
          etterpå.
        </p>
        <div className="mt-6 flex gap-2">
          <button type="button" className={inkBtn} onClick={() => navigate({ to: "/login" })}>
            Logg inn eller lag konto
          </button>
        </div>
      </Shell>
    );
  }

  if (done === "rejected") {
    return (
      <Shell>
        <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-(--agenci-ink)">
          Invitasjonen er avslått
        </h1>
        <p className="mt-2 text-[14px] text-(--agenci-ink-2)">
          Du blir ikke lagt til i teamet. Du kan lukke denne siden.
        </p>
        <div className="mt-6 flex">
          <button type="button" className={ghostBtn} onClick={() => navigate({ to: "/" })}>
            Gå til dashbordet
          </button>
        </div>
      </Shell>
    );
  }

  if (error || !invitation) {
    const wrongAccount = error === "wrong-account";
    return (
      <Shell>
        <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-(--agenci-ink)">
          {wrongAccount
            ? "Invitasjonen gjelder en annen konto"
            : error === "accept-failed"
              ? "Vi fikk ikke lagt deg til"
              : "Invitasjonen finnes ikke lenger"}
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-(--agenci-ink-2)">
          {wrongAccount
            ? `Du er logget inn som ${session.user.email}. Logg ut og logg inn med e-posten invitasjonen ble sendt til.`
            : error === "accept-failed"
              ? "Invitasjonen kan ha utløpt eller blitt trukket tilbake. Be den som inviterte deg om å sende en ny."
              : "Den kan ha utløpt, blitt brukt eller trukket tilbake. Be den som inviterte deg om å sende en ny."}
        </p>
        <div className="mt-6 flex gap-2">
          {wrongAccount ? (
            <button
              type="button"
              className={inkBtn}
              onClick={async () => {
                rememberInvite(invitationId);
                await authClient.signOut();
                await navigate({ to: "/login" });
              }}
            >
              Logg ut og bytt konto
            </button>
          ) : null}
          <button type="button" className={ghostBtn} onClick={() => navigate({ to: "/" })}>
            Gå til dashbordet
          </button>
        </div>
      </Shell>
    );
  }

  const expired = new Date(invitation.expiresAt).getTime() < Date.now();
  const role = ROLE_LABEL[invitation.role] ?? invitation.role;

  return (
    <Shell>
      <span className="flex size-11 items-center justify-center rounded-full bg-[#f3f4f3] text-(--agenci-ink)">
        <UsersIcon className="size-5" strokeWidth={1.6} />
      </span>
      <h1 className="mt-4 text-[20px] font-semibold tracking-[-0.02em] text-(--agenci-ink)">
        Bli med i {invitation.organizationName}
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-(--agenci-ink-2)">
        {invitation.inviterEmail} har invitert deg som{" "}
        <span className="font-medium text-(--agenci-ink)">{role}</span>. Du får
        tilgang til agentene og samtalene til teamet.
      </p>
      <dl className="mt-5 space-y-2 rounded-[14px] bg-[#f5f6f5] px-4 py-3 text-[13px] dark:bg-white/5">
        <div className="flex justify-between gap-3">
          <dt className="text-(--agenci-ink-3)">Invitasjon til</dt>
          <dd className="truncate text-(--agenci-ink)">{invitation.email}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-(--agenci-ink-3)">Gyldig til</dt>
          <dd className="text-(--agenci-ink)">
            {new Date(invitation.expiresAt).toLocaleDateString("nb-NO", {
              day: "numeric",
              month: "long",
            })}
          </dd>
        </div>
      </dl>
      {expired || invitation.status !== "pending" ? (
        <p className="mt-5 rounded-[12px] bg-[#F9E2DF] px-4 py-3 text-[13.5px] text-[#B2463A]">
          Invitasjonen er ikke lenger gyldig. Be om en ny.
        </p>
      ) : (
        <div className="mt-6 flex gap-2">
          <button type="button" className={ghostBtn} disabled={!!busy} onClick={reject}>
            Avslå
          </button>
          <button type="button" className={inkBtn} disabled={!!busy} onClick={accept}>
            {busy === "accept" ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : (
              <CheckIcon className="size-4" strokeWidth={2.2} />
            )}
            Bli med
          </button>
        </div>
      )}
    </Shell>
  );
}
