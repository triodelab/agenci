import { useNavigate, useRouterState } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import { CheckIcon, CopyIcon, ImageIcon, LoaderIcon, LogOutIcon, TrashIcon } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  dangerBtn,
  Field,
  ghostBtn,
  inkBtn,
  initials,
  inputClass,
  Section,
  SettingsHeader,
  toSquareDataUrl,
} from "../settings-ui";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

export function OrganizationSettings() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: session } = authClient.useSession();
  const { data: org, refetch } = authClient.useActiveOrganization();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugState, setSlugState] = useState<"idle" | "checking" | "free" | "taken">("idle");
  const [copied, setCopied] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState<"leave" | "delete" | null>(null);

  useEffect(() => {
    if (org) {
      setName(org.name);
      setSlug(org.slug);
      setLogo(org.logo ?? null);
    }
  }, [org]);

  // Check that a new address is free before it can be saved.
  useEffect(() => {
    if (!org || !slug || slug === org.slug) {
      setSlugState("idle");
      return;
    }
    setSlugState("checking");
    const t = window.setTimeout(async () => {
      const { data, error } = await authClient.organization.checkSlug({ slug });
      setSlugState(!error && data?.status ? "free" : "taken");
    }, 400);
    return () => window.clearTimeout(t);
  }, [slug, org]);

  if (!org) return null;

  const myRole = org.members.find((m) => m.userId === session?.user.id)?.role;
  const canEdit = myRole === "owner" || myRole === "admin";
  const isOwner = myRole === "owner";
  const dirty = name.trim() !== org.name || slug !== org.slug || logo !== (org.logo ?? null);
  const slugOk = slug.length >= 2 && slugState !== "taken" && slugState !== "checking";

  const save = async () => {
    if (!name.trim()) return toast.error("Navnet kan ikke være tomt.");
    setSaving(true);
    const { error } = await authClient.organization.update({
      organizationId: org.id,
      data: { name: name.trim(), slug, logo: logo ?? "" },
    });
    setSaving(false);
    if (error) return toast.error(error.message ?? "Kunne ikke lagre.");
    await refetch();
    toast.success("Organisasjonen er oppdatert");
    if (slug !== org.slug) {
      // The address is part of every dashboard URL: move to the new one.
      await navigate({ to: pathname.replace(`/org/${org.slug}`, `/org/${slug}`) });
    }
  };

  const pickLogo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;
    try {
      setLogo(await toSquareDataUrl(file, 192));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke lese bildet.");
    }
  };

  return (
    <div className="grid gap-5">
      <SettingsHeader title="Organisasjon" description="Navnet, adressen og logoen til teamet ditt." />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickLogo} />

      <Section
        title="Generelt"
        description={canEdit ? "Endringer gjelder for hele teamet." : "Bare eiere og administratorer kan endre dette."}
        footer={
          canEdit ? (
            <>
              {dirty ? (
                <button
                  type="button"
                  className={ghostBtn}
                  onClick={() => {
                    setName(org.name);
                    setSlug(org.slug);
                    setLogo(org.logo ?? null);
                  }}
                >
                  Angre
                </button>
              ) : (
                <span className="mr-auto text-[12.5px] text-(--agenci-ink-3)">Alt er lagret</span>
              )}
              <button type="button" className={inkBtn} disabled={!dirty || !slugOk || saving} onClick={save}>
                {saving ? <LoaderIcon className="size-4 animate-spin" /> : null}
                Lagre endringer
              </button>
            </>
          ) : undefined
        }
      >
        <fieldset disabled={!canEdit} className="grid gap-5">
          <div className="flex flex-wrap items-center gap-4">
            {logo ? (
              <img src={logo} alt="" className="size-16 rounded-[16px] border border-(--agenci-line) object-cover" />
            ) : (
              <span className="flex size-16 items-center justify-center rounded-[16px] bg-(--dash-subtle) text-[19px] font-medium text-(--agenci-ink) dark:bg-white/10">
                {initials(name || org.name)}
              </span>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" className={ghostBtn} onClick={() => fileRef.current?.click()}>
                <ImageIcon className="size-4" strokeWidth={1.6} />
                {logo ? "Bytt logo" : "Last opp logo"}
              </button>
              {logo ? (
                <button type="button" className={cn(ghostBtn, "text-(--agenci-ink-2)")} onClick={() => setLogo(null)}>
                  Fjern
                </button>
              ) : null}
            </div>
          </div>
          <Field label="Navn">
            <input value={name} onChange={(e) => setName(e.currentTarget.value)} maxLength={80} className={inputClass} />
          </Field>
          <Field
            label="Adresse"
            hint={
              slugState === "taken"
                ? "Adressen er allerede i bruk. Prøv en annen."
                : slugState === "free"
                  ? "Ledig. Lenker med den gamle adressen slutter å virke."
                  : "Brukes i lenkene til dashbordet. Små bokstaver, tall og bindestrek."
            }
          >
            <span className="flex items-center overflow-hidden rounded-[12px] border border-(--agenci-line) bg-(--dash-surface) focus-within:border-(--agenci-ink) focus-within:shadow-[0_0_0_4px_rgb(36_50_54/0.08)] dark:bg-transparent">
              <span className="border-r border-(--agenci-line) bg-(--dash-subtle-2) px-3 py-3 text-[13px] text-(--agenci-ink-3) dark:bg-white/5">
                …/org/
              </span>
              <input
                value={slug}
                onChange={(e) => setSlug(slugify(e.currentTarget.value))}
                className="h-11 min-w-0 flex-1 bg-transparent px-3 text-[14px] text-(--agenci-ink) outline-none"
              />
              <span className="pr-3">
                {slugState === "checking" ? (
                  <LoaderIcon className="size-4 animate-spin text-(--agenci-ink-3)" />
                ) : slugState === "free" ? (
                  <CheckIcon className="size-4 text-(--dash-good)" strokeWidth={2.2} />
                ) : null}
              </span>
            </span>
          </Field>
        </fieldset>
      </Section>

      <Section title="Organisasjons-ID" description="Brukes i koden til chatten på nettsiden, og når du kontakter oss om kontoen.">
        <div className="flex items-center gap-2 rounded-[12px] border border-(--agenci-line) bg-(--dash-subtle-2) py-1.5 pr-1.5 pl-3.5 dark:bg-white/5">
          <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-(--agenci-ink)">{org.id}</code>
          <button
            type="button"
            className={ghostBtn}
            onClick={async () => {
              await navigator.clipboard.writeText(org.id);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <CheckIcon className="size-4 text-(--dash-good)" strokeWidth={2.2} /> : <CopyIcon className="size-4" strokeWidth={1.6} />}
            {copied ? "Kopiert" : "Kopier"}
          </button>
        </div>
      </Section>

      {isOwner ? (
        <Section
          tone="danger"
          title="Slett organisasjonen"
          description="Alle agenter, samtaler, kunnskap og medlemskap slettes for godt. Dette kan ikke angres."
        >
          <div className="grid gap-3">
            <Field label={`Skriv «${org.name}» for å bekrefte`}>
              <input value={confirmText} onChange={(e) => setConfirmText(e.currentTarget.value)} className={inputClass} />
            </Field>
            <div>
              <button
                type="button"
                className={dangerBtn}
                disabled={confirmText.trim() !== org.name || busy === "delete"}
                onClick={async () => {
                  setBusy("delete");
                  const { error } = await authClient.organization.delete({ organizationId: org.id });
                  setBusy(null);
                  if (error) return toast.error(error.message ?? "Kunne ikke slette organisasjonen.");
                  toast.success("Organisasjonen er slettet");
                  window.location.href = "/";
                }}
              >
                <TrashIcon className="size-4" strokeWidth={1.6} />
                Slett for godt
              </button>
            </div>
          </div>
        </Section>
      ) : (
        <Section tone="danger" title="Forlat organisasjonen" description="Du mister tilgangen til agentene og samtalene. En administrator kan invitere deg tilbake.">
          <button
            type="button"
            className={dangerBtn}
            disabled={busy === "leave"}
            onClick={async () => {
              if (!window.confirm(`Forlate ${org.name}?`)) return;
              setBusy("leave");
              const { error } = await authClient.organization.leave({ organizationId: org.id });
              setBusy(null);
              if (error) return toast.error(error.message ?? "Kunne ikke forlate organisasjonen.");
              window.location.href = "/";
            }}
          >
            <LogOutIcon className="size-4" strokeWidth={1.6} />
            Forlat {org.name}
          </button>
        </Section>
      )}
    </div>
  );
}
