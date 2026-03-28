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
  LANDING_LEGAL_LINKS,
  LANDING_SECTION_IDS,
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
    <footer
      data-landing-nav-surface="dark"
      className="scroll-mt-24 border-t border-white/10 bg-black px-4 py-16 text-zinc-300 md:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-12 border-b border-white/10 pb-14">
          <div className="max-w-sm space-y-4">
            <Link href="/" aria-label="Agenci — forsiden" className="inline-block">
              <Logo className="brightness-0 invert" />
            </Link>
            <p className="text-sm leading-relaxed text-zinc-400">
              AI-drevet kundeservice — widget, dashboard og kontroll i én plattform.
            </p>
          </div>
        </div>

        <nav
          className="grid grid-cols-2 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Footer"
        >
          {LANDING_FOOTER_NAV_GROUPS.map((group) => (
            <div key={group.name}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                {group.name}
              </h2>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-300 transition-colors hover:text-[#2DD4BF]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Konto
            </h2>
            <ul className="mt-5 space-y-3">
              {accountLinksToShow.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-300 transition-colors hover:text-[#2DD4BF]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Nyhetsbrev
            </h2>
            <p className="mt-3 text-sm text-zinc-400">
              Produktnyheter — ca. én gang i måneden.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="mt-5 w-full max-w-sm"
              aria-label="Nyhetsbrev"
            >
              <Label className="sr-only" htmlFor="footer-newsletter-email">
                E-post
              </Label>
              <Input
                id="footer-newsletter-email"
                className="h-11 rounded-xl border-white/15 bg-white/5 text-white placeholder:text-zinc-500"
                placeholder="din@epost.no"
                type="email"
                required
                name="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={newsletterLoading || newsletterSuccess}
              />
              <Button
                type="submit"
                className="mt-3 w-full rounded-xl bg-[#2DD4BF] font-semibold text-neutral-950 hover:bg-[#2DD4BF]/90"
                disabled={newsletterLoading || newsletterSuccess}
              >
                {newsletterLoading
                  ? "Sender..."
                  : newsletterSuccess
                    ? "Påmeldt!"
                    : "Abonner"}
              </Button>
            </form>
          </div>
        </nav>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-10 text-sm text-zinc-500 sm:flex-row">
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <span className="text-zinc-400">&copy; Agenci {new Date().getFullYear()}</span>
            <nav aria-label="Juridisk" className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-start">
              {LANDING_LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-zinc-400 transition-colors hover:text-[#2DD4BF]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <span className="text-center sm:text-right">Alle rettigheter reservert</span>
        </div>
      </div>
    </footer>
  );
}
