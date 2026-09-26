import { type FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  btnPrimaryCls,
  btnSecondaryCls,
  errCls,
  inputCls,
  labelCls,
} from "@/lib/ui";

type InviteRole = "member" | "admin" | "owner";

export default function OrganizationInviteView() {
  const { data: org, refetch } = authClient.useActiveOrganization();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const invite = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLastInviteLink(null);
    try {
      const { data, error: inviteError } =
        await authClient.organization.inviteMember({
          email: email.trim(),
          role,
        });
      if (inviteError) {
        setError(inviteError.message ?? "Kunne ikke sende invitasjon.");
        return;
      }
      if (data?.id) {
        setLastInviteLink(
          `${window.location.origin}/accept-invitation/${data.id}`,
        );
      }
      setEmail("");
      await refetch();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Kunne ikke sende invitasjon.",
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelInvite = async (invitationId: string) => {
    setBusyId(invitationId);
    try {
      await authClient.organization.cancelInvitation({ invitationId });
      await refetch();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Organisasjon
        </h1>
        {org ? (
          <p className="mt-1 text-[14px] text-neutral-500">
            {org.name} <span className="text-neutral-400">({org.slug})</span>
          </p>
        ) : null}
      </div>

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-[15px] font-semibold text-neutral-900">
          Inviter medlem
        </h2>
        <p className="text-[13px] text-neutral-500">
          I lokal utvikling logges invitasjonslenken på serveren; den vises også
          her etter sending.
        </p>
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => void invite(e)}
        >
          <div className="flex-1 space-y-1.5">
            <label htmlFor="invite-email" className={labelCls}>
              E-post
            </label>
            <input
              id="invite-email"
              type="email"
              required
              className={inputCls}
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="kollega@firma.no"
            />
          </div>
          <div className="space-y-1.5 sm:w-36">
            <label htmlFor="invite-role" className={labelCls}>
              Rolle
            </label>
            <select
              id="invite-role"
              className={inputCls}
              value={role}
              disabled={loading}
              onChange={(e) =>
                setRole(e.currentTarget.value as InviteRole)
              }
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <button
            type="submit"
            className={`${btnPrimaryCls} sm:w-auto sm:px-5`}
            disabled={loading}
          >
            {loading ? "Sender…" : "Inviter"}
          </button>
        </form>
        {error ? <p className={errCls}>{error}</p> : null}
        {lastInviteLink ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-800">
            <p className="font-medium">Invitasjonslenke (del manuelt):</p>
            <a href={lastInviteLink} className="break-all underline">
              {lastInviteLink}
            </a>
          </div>
        ) : null}
      </section>

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-[15px] font-semibold text-neutral-900">
          Medlemmer
        </h2>
        <ul className="divide-y divide-neutral-100">
          {(org?.members ?? []).map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between py-2.5 text-[13px]"
            >
              <span>
                <span className="font-medium text-neutral-900">
                  {m.user?.name ?? m.userId}
                </span>{" "}
                <span className="text-neutral-400">{m.user?.email}</span>
              </span>
              <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-neutral-600">
                {m.role}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-[15px] font-semibold text-neutral-900">
          Ventende invitasjoner
        </h2>
        {(org?.invitations ?? []).length === 0 ? (
          <p className="text-[13px] text-neutral-500">
            Ingen ventende invitasjoner.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {(org?.invitations ?? []).map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between gap-3 py-2.5 text-[13px]"
              >
                <div>
                  <p className="font-medium text-neutral-900">{inv.email}</p>
                  <p className="text-neutral-400">
                    {inv.role} · {inv.status}
                  </p>
                </div>
                <button
                  type="button"
                  className={btnSecondaryCls}
                  disabled={busyId === inv.id}
                  onClick={() => void cancelInvite(inv.id)}
                >
                  Avbryt
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
