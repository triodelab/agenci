"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AgenciLoader } from "@/components/agenci-loader";
import s from "@/modules/landing/ui/views/kontakt.module.css";

const TOPICS = ["Demo", "Pris", "Oppsett", "Annet"] as const;

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; name: string }
  | { kind: "error"; message: string };

/** One field with a floating label: the label is the placeholder until you type. */
function Field({
  name,
  label,
  optional,
  type = "text",
  autoComplete,
  multiline,
  className,
}: {
  name: string;
  label: string;
  optional?: boolean;
  type?: string;
  autoComplete?: string;
  multiline?: boolean;
  className?: string;
}) {
  const id = `kontakt-${name}`;
  return (
    <div className={`${s.float} ${className ?? ""}`}>
      {multiline ? (
        <textarea id={id} name={name} placeholder=" " rows={5} />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          placeholder=" "
          autoComplete={autoComplete}
        />
      )}
      <label htmlFor={id}>
        {label}
        {optional ? <em>valgfritt</em> : null}
      </label>
    </div>
  );
}

/** The contact form on /kontakt, followed by a clear thank-you. */
export function ContactFormCard() {
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>(TOPICS[0]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    const first = get("firstName");
    const name = [first, get("lastName")].filter(Boolean).join(" ");
    const email = get("email");
    const message = get("message");
    const company = get("business");

    if (!first || !email || !message) {
      setStatus({
        kind: "error",
        message: "Fyll inn fornavn, e-post og en kort melding.",
      });
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: get("phone") || undefined,
          subject: topic,
          message: company
            ? `${message}\n\nBedrift / nettside: ${company}`
            : message,
          company: get("company"),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(
          res.status === 429
            ? "Du har sendt mange meldinger på kort tid. Prøv igjen om litt."
            : (data.error ?? "Meldingen ble ikke sendt. Prøv igjen."),
        );
      }
      setStatus({ kind: "sent", name: first });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Noe gikk galt.",
      });
    }
  }

  if (status.kind === "sent") {
    return (
      <div className={s.sent} role="status">
        <span className={s.sentIcon}>
          <Check size={22} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <h2>Takk, {status.name}.</h2>
        <p>
          Meldingen er kommet fram. Vi svarer deg på e-post innen én
          arbeidsdag.
        </p>
        <button
          type="button"
          className={s.again}
          onClick={() => setStatus({ kind: "idle" })}
        >
          Send en melding til
        </button>
      </div>
    );
  }

  const sending = status.kind === "sending";

  return (
    <form
      className={s.form}
      onSubmit={onSubmit}
      noValidate
      aria-label="Kontaktskjema"
      aria-busy={sending}
    >
      {/* Honeypot: hidden from people, tempting for bots. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className={s.honeypot}
      />

      <fieldset className={s.topics}>
        <legend>Hva gjelder det?</legend>
        <div>
          {TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={topic === t}
              onClick={() => setTopic(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <div className={s.fields}>
        <Field name="firstName" label="Fornavn" autoComplete="given-name" />
        <Field name="lastName" label="Etternavn" optional autoComplete="family-name" />
        <Field name="email" label="E-post" type="email" autoComplete="email" />
        <Field name="phone" label="Telefon" optional type="tel" autoComplete="tel" />
        <Field
          name="business"
          label="Bedrift eller nettside"
          optional
          autoComplete="organization"
          className={s.full}
        />
        <Field name="message" label="Melding" multiline className={s.full} />
      </div>

      {status.kind === "error" ? (
        <p className={s.error} role="alert">
          {status.message}
        </p>
      ) : null}

      <div className={s.foot}>
        <p>
          Vi bruker opplysningene bare til å svare deg. Les{" "}
          <Link href="/personvern">personvernerklæringen</Link>.
        </p>
        <button type="submit" className={s.submit} disabled={sending}>
          {sending ? (
            <>
              <AgenciLoader decorative /> Sender
            </>
          ) : (
            <>
              Send melding <ArrowRight size={16} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
