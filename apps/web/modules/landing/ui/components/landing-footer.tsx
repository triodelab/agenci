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
} from "@/modules/landing/constants";
import { CookieSettingsButton } from "@/components/cookie-settings-button";

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
      className="border-t border-[#23252a] bg-[#010102] px-6 py-14 xl:px-8"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Top: logo + tagline */}
        <div className="flex flex-wrap items-start justify-between gap-10 border-b border-[#23252a] pb-12">
          <div className="max-w-xs space-y-3">
            <Link href="/" aria-label="Agenci — forsiden" className="inline-block">
              <Logo className="brightness-0 invert opacity-70" />
            </Link>
            <p className="text-[13px] leading-relaxed text-[#8a8f98]">
              KI-chat for nettsiden din — svar fra din kunnskap, samtaler i dashboard, mennesker i loop.
            </p>
          </div>
        </div>

        {/* Nav columns */}
        <nav
          className="grid grid-cols-2 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Footer"
        >
          {LANDING_FOOTER_NAV_GROUPS.map((group) => (
            <div key={group.name}>
              <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.4px] text-[#62666d]">
                {group.name}
              </h2>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[#8a8f98] transition-colors hover:text-[#f7f8f8]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.4px] text-[#62666d]">
              Konto
            </h2>
            <ul className="space-y-2.5">
              {accountLinksToShow.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-[#8a8f98] transition-colors hover:text-[#f7f8f8]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.4px] text-[#62666d]">
              Nyhetsbrev
            </h2>
            <p className="text-[13px] text-[#8a8f98]">
              Produktnyheter — ca. én gang i måneden.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="mt-4 w-full max-w-sm"
              aria-label="Nyhetsbrev"
              aria-busy={newsletterLoading}
            >
              <Label className="sr-only" htmlFor="footer-newsletter-email">
                E-post
              </Label>
              <Input
                id="footer-newsletter-email"
                className="h-9 rounded-[8px] border-[#23252a] bg-[#0f1011] text-[#d0d6e0] placeholder:text-[#62666d] focus-visible:border-[#5e6ad2] focus-visible:ring-2 focus-visible:ring-[#5e6ad2]/50"
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
                className="mt-2 h-9 w-full rounded-[8px] bg-[#5e6ad2] text-[13px] font-medium text-white transition-colors hover:bg-[#828fff]"
                disabled={newsletterLoading || newsletterSuccess}
                aria-busy={newsletterLoading}
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

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#23252a] pt-8 sm:flex-row">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-[12px] text-[#62666d]">&copy; Agenci {new Date().getFullYear()}</span>
            {LANDING_LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[12px] text-[#62666d] transition-colors hover:text-[#8a8f98]"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <CookieSettingsButton />
            <span className="text-[12px] text-[#62666d]">Alle rettigheter reservert</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
