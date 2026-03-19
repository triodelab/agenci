"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Logo } from "@/components/logo";
import { useUser } from "@clerk/nextjs";
import {
  LANDING_AUTH_PATHS,
  LANDING_FOOTER_NAV_GROUPS,
} from "@/modules/landing/constants";

const guestAccountLinks = [
  { href: LANDING_AUTH_PATHS.signIn, label: "Logg inn" },
  { href: LANDING_AUTH_PATHS.signUp, label: "Registrer deg" },
] as const;

const signedInAccountLinks = [
  { href: LANDING_AUTH_PATHS.appHome, label: "Dashboard" },
  { href: "/", label: "Hjem" },
] as const;

export function LandingFooter() {
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const accountLinksToShow =
    mounted && isLoaded && user ? signedInAccountLinks : guestAccountLinks;

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const handleNewsletterSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!newsletterEmail || newsletterLoading) return;
    setNewsletterLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Kunne ikke melde deg på");
      setNewsletterSuccess(true);
      setNewsletterEmail("");
      toast.success("Du er nå påmeldt nyhetsbrevet!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Noe gikk galt");
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <footer className="relative px-3 pb-4 pt-16 md:px-5 md:pb-6 md:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-border/50 bg-gradient-to-b from-card/90 to-card/70 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.12)] backdrop-blur-sm dark:from-card/50 dark:to-card/30 dark:shadow-[0_24px_80px_-40px_rgba(0,0,0,0.4)]">
        <div className="space-y-14 px-6 py-14 md:px-10 md:py-16">
          <div className="flex flex-wrap items-start justify-between gap-8 border-b border-border/50 pb-10">
            <div className="max-w-sm space-y-3">
              <Link href="/" aria-label="Agenci – Gå til forsiden">
                <Logo />
              </Link>
              <p className="text-sm leading-relaxed text-muted-foreground">
                AI-drevet kundeservice som føles menneskelig — widget, dashboard og kontroll i én
                plattform.
              </p>
            </div>
          </div>

          <nav
            className="grid grid-cols-2 gap-10 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Footer navigasjon"
          >
            {LANDING_FOOTER_NAV_GROUPS.map((linksGroup) => (
              <div key={linksGroup.name}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {linksGroup.name}
                </h2>
                <ul className="mt-5 space-y-3">
                  {linksGroup.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-foreground/80 transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Konto
              </h2>
              <ul className="mt-5 space-y-3">
                {accountLinksToShow.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 lg:col-span-1">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Nyhetsbrev
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Produktnyheter og tips — ca. én gang i måneden.
              </p>
              <form
                onSubmit={handleNewsletterSubmit}
                className="mt-5 w-full max-w-sm"
                aria-label="Abonner på nyhetsbrev"
              >
                <div className="space-y-2">
                  <Label className="sr-only" htmlFor="newsletter-email">
                    E-post
                  </Label>
                  <Input
                    className="h-11 rounded-xl border-border/60 bg-background/80"
                    placeholder="din@epost.no"
                    type="email"
                    id="newsletter-email"
                    required
                    name="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    disabled={newsletterLoading || newsletterSuccess}
                    aria-required="true"
                    aria-describedby="newsletter-description"
                  />
                  <span id="newsletter-description" className="sr-only">
                    Skriv inn din e-postadresse for å abonnere på nyhetsbrev
                  </span>
                </div>
                <Button
                  type="submit"
                  className="mt-3 rounded-xl"
                  disabled={newsletterLoading || newsletterSuccess}
                  aria-label="Abonner på nyhetsbrev"
                >
                  <span>
                    {newsletterLoading
                      ? "Sender..."
                      : newsletterSuccess
                        ? "Påmeldt!"
                        : "Abonner"}
                  </span>
                </Button>
              </form>
            </div>
          </nav>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 text-sm text-muted-foreground sm:flex-row">
            <span className="text-foreground/90">&copy; Agenci {new Date().getFullYear()}</span>
            <span>Alle rettigheter reservert</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
