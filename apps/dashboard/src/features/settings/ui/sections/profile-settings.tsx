import { cn } from "@workspace/ui/lib/utils";
import { CameraIcon, LoaderIcon, LockIcon, TrashIcon } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { PasswordInput } from "./security-settings";
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

const ROLE_LABEL: Record<string, string> = { owner: "Eier", admin: "Admin", member: "Medlem" };

export function ProfileSettings() {
  const { data: session, refetch } = authClient.useSession();
  const { data: org } = authClient.useActiveOrganization();
  const user = session?.user;
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setImage(user.image ?? null);
    }
  }, [user]);

  if (!user) return null;
  const dirty = name.trim() !== (user.name ?? "") || image !== (user.image ?? null);
  const role = org?.members.find((m) => m.userId === user.id)?.role;
  const display = name.trim() || user.email;

  const save = async () => {
    if (!name.trim()) return toast.error("Navnet kan ikke være tomt.");
    setSaving(true);
    const { error } = await authClient.updateUser({ name: name.trim(), image: image ?? "" });
    setSaving(false);
    if (error) return toast.error(error.message ?? "Kunne ikke lagre profilen.");
    await refetch();
    toast.success("Profilen er lagret");
  };

  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast.error("Bildet er større enn 10 MB.");
    try {
      setImage(await toSquareDataUrl(file));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke lese bildet.");
    }
  };

  return (
    <div className="grid gap-5">
      <SettingsHeader title="Profil" description="Slik ser teamet deg, og slik vises du når du svarer kunder selv." />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pick} />

      <Section
        title="Profilbilde"
        description="Vises i sidemenyen, i medlemslisten og i samtaler der du svarer."
      >
        <div className="flex flex-wrap items-center gap-4">
          {image ? (
            <img src={image} alt="" className="size-16 rounded-full object-cover" />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-full bg-(--dash-subtle) text-[19px] font-medium text-(--agenci-ink) dark:bg-white/10">
              {initials(display)}
            </span>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={ghostBtn} onClick={() => fileRef.current?.click()}>
              <CameraIcon className="size-4" strokeWidth={1.6} />
              {image ? "Bytt bilde" : "Last opp bilde"}
            </button>
            {image ? (
              <button type="button" className={cn(ghostBtn, "text-(--agenci-ink-2)")} onClick={() => setImage(null)}>
                Fjern
              </button>
            ) : null}
          </div>
          <p className="w-full text-[12.5px] text-(--agenci-ink-3)">JPG eller PNG, opptil 10 MB. Vi beskjærer det til en sirkel.</p>
        </div>
      </Section>

      <Section
        title="Personlig informasjon"
        description="Navnet brukes overalt i Agenci. E-posten er det du logger inn med."
        footer={
          <>
            {dirty ? (
              <button
                type="button"
                className={ghostBtn}
                onClick={() => {
                  setName(user.name ?? "");
                  setImage(user.image ?? null);
                }}
              >
                Angre
              </button>
            ) : (
              <span className="mr-auto text-[12.5px] text-(--agenci-ink-3)">Alt er lagret</span>
            )}
            <button type="button" className={inkBtn} disabled={!dirty || saving} onClick={save}>
              {saving ? <LoaderIcon className="size-4 animate-spin" /> : null}
              Lagre endringer
            </button>
          </>
        }
      >
        <div className="grid gap-5">
          <Field label="Navn">
            <input value={name} onChange={(e) => setName(e.currentTarget.value)} autoComplete="name" maxLength={80} className={inputClass} />
          </Field>
          <Field
            label="E-post"
            hint={
              <>
                Vil du bytte e-post?{" "}
                <a href="mailto:post@triodelab.no?subject=Bytte%20e-post%20p%C3%A5%20Agenci" className="text-(--agenci-ink) underline underline-offset-4">
                  Si fra til oss
                </a>
                .
              </>
            }
          >
            <span className="relative block">
              <input value={user.email} disabled className={cn(inputClass, "pr-10")} />
              <LockIcon className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-(--agenci-ink-3)" strokeWidth={1.6} />
            </span>
          </Field>
          <dl className="grid gap-3 rounded-[12px] bg-(--dash-subtle-2) px-4 py-3 text-[13px] sm:grid-cols-2 dark:bg-white/5">
            <div>
              <dt className="text-(--agenci-ink-3)">Rolle</dt>
              <dd className="mt-0.5 text-(--agenci-ink)">
                {role ? `${ROLE_LABEL[role] ?? role} i ${org?.name}` : "–"}
              </dd>
            </div>
            <div>
              <dt className="text-(--agenci-ink-3)">Medlem siden</dt>
              <dd className="mt-0.5 text-(--agenci-ink)">
                {new Date(user.createdAt).toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" })}
              </dd>
            </div>
          </dl>
        </div>
      </Section>

      <DeleteAccount />
    </div>
  );
}

/**
 * Delete your own account. Better Auth checks the password, and refuses
 * while you are the only owner of an organization (the message says which).
 */
function DeleteAccount() {
  const [password, setPassword] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    const { error } = await authClient.deleteUser({ password });
    setBusy(false);
    if (error) {
      return toast.error(
        /invalid password|incorrect/i.test(error.message ?? "")
          ? "Passordet er feil."
          : (error.message ?? "Kunne ikke slette kontoen."),
      );
    }
    toast.success("Kontoen er slettet");
    window.location.href = "/login";
  };

  return (
    <Section
      tone="danger"
      title="Slett kontoen"
      description="Profilen, innloggingene og medlemskapene dine slettes for godt. Er du eneste eier av en organisasjon, må du slette den eller gjøre noen andre til eier først."
      footer={
        <button
          type="button"
          className={dangerBtn}
          disabled={!password || !understood || busy}
          onClick={remove}
        >
          {busy ? <LoaderIcon className="size-4 animate-spin" /> : <TrashIcon className="size-4" strokeWidth={1.6} />}
          Slett kontoen for godt
        </button>
      }
    >
      <div className="grid gap-4">
        <Field label="Bekreft med passordet ditt">
          <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" />
        </Field>
        <label className="flex cursor-pointer items-start gap-3 rounded-[12px] bg-(--dash-subtle-2) px-3.5 py-3 dark:bg-white/5">
          <input
            type="checkbox"
            checked={understood}
            onChange={(e) => setUnderstood(e.currentTarget.checked)}
            className="mt-0.5 size-4 accent-(--agenci-ink)"
          />
          <span className="text-[13.5px] text-(--agenci-ink)">
            Jeg forstår at dette ikke kan angres.
          </span>
        </label>
      </div>
    </Section>
  );
}
