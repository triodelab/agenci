import { type FormEvent, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { nanoid } from "nanoid";

import { AuthShell } from "@/components/auth-shell";
import { authClient } from "@/lib/auth-client";
import { slugify } from "@/lib/ui";
import { btnPrimaryCls, errCls, inputCls, labelCls } from "./org-shared-ui";

export default function CreateOrganizationForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: createError } = await authClient.organization.create({
        name: name.trim(),
        slug: nanoid(6),
      });
      if (createError) {
        setError(createError.message ?? "Kunne ikke opprette organisasjon.");
        return;
      }
      if (data?.id) {
        await authClient.organization.setActive({ organizationId: data.id });
      }
      if (data?.slug) {
        await navigate({
          to: "/org/$orgSlug",
          params: { orgSlug: data.slug },
        });
        return;
      }
      await navigate({ to: "/" });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Kunne ikke opprette organisasjon.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Opprett organisasjon"
      subtitle="Du trenger en organisasjon før du kan bruke dashbordet."
    >
      <form className="space-y-3.5" onSubmit={(e) => void onSubmit(e)}>
        <div className="space-y-1.5">
          <label htmlFor="org-name" className={labelCls}>
            Organisasjonsnavn
          </label>
          <input
            id="org-name"
            type="text"
            required
            className={inputCls}
            value={name}
            disabled={loading}
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="F.eks. Nordlys AS"
          />
          {name.trim() ? (
            <p className="text-[12px] text-neutral-400">
              URL-slug: {slugify(name)}
            </p>
          ) : null}
        </div>
        {error ? <p className={errCls}>{error}</p> : null}
        <button
          type="submit"
          className={btnPrimaryCls}
          disabled={loading || !name.trim()}
        >
          {loading ? "Oppretter…" : "Fortsett"}
        </button>
      </form>
    </AuthShell>
  );
}
