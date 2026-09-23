"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AgenciLoader } from "@/components/agenci-loader";
import { AgenciNavWordmark } from "@/components/logo";
import { useUser } from "@/lib/auth-compat";
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

  /* Knappeteksten tones mykt over ved hvert tilstandsbytte (ikke ved lasting). */
  const newsletterState = newsletterLoading
    ? "loading"
    : newsletterSuccess
      ? "success"
      : "idle";

  return (
    <footer data-landing-nav-surface="light" className="agenci-fresh-footer">
      <div className="agenci-footer-top">
        <Link href="/?from=marketing" aria-label="Agenci — forsiden">
          <AgenciNavWordmark surface="light" />
        </Link>
        <p>
          Gode samtaler.
          <br />
          Litt enklere hverdag.
        </p>
        <a href="mailto:hei@agenci.no" className="agenci-text-link">
          Si hei <ArrowUpRight size={18} />
        </a>
      </div>
      <nav className="agenci-footer-nav" aria-label="Footer">
        {LANDING_FOOTER_NAV_GROUPS.map((group) => (
          <div key={group.name}>
            <h2>{group.name === "Forside" ? "Agenci" : "Utforsk"}</h2>
            <ul>
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h2>Din Agenci</h2>
          <ul>
            {accountLinksToShow.map((link) => (
              <li key={link.label}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
            <li>
              <a href="mailto:hei@agenci.no">hei@agenci.no</a>
            </li>
          </ul>
        </div>
        <div>
          <h2>Litt nytt fra oss</h2>
          <p>
            Produktnyheter og gode idéer.
            <br />
            Omtrent én gang i måneden.
          </p>
          <form
            onSubmit={handleNewsletterSubmit}
            aria-label="Nyhetsbrev"
            aria-busy={newsletterLoading}
          >
            <label className="sr-only" htmlFor="footer-newsletter-email">
              E-post
            </label>
            <input
              id="footer-newsletter-email"
              type="email"
              required
              name="email"
              autoComplete="email"
              placeholder="Din e-postadresse"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              disabled={newsletterLoading || newsletterSuccess}
            />
            <button
              type="submit"
              disabled={newsletterLoading || newsletterSuccess}
            >
              <span
                key={newsletterState}
                className={
                  newsletterState === "idle"
                    ? undefined
                    : "agenci-footer-label-swap"
                }
              >
                {newsletterLoading ? (
                  <>
                    <AgenciLoader decorative /> Sender
                  </>
                ) : newsletterSuccess ? (
                  "Du er på listen!"
                ) : (
                  "Meld meg på"
                )}
              </span>
            </button>
          </form>
        </div>
      </nav>
      <Link
        className="agenci-footer-wordmark"
        href="/?from=marketing"
        aria-label="Agenci — tilbake til forsiden"
      >
        Agenci
      </Link>
      <div className="agenci-footer-bottom">
        <div>
          <span>© Agenci {new Date().getFullYear()}</span>
          {LANDING_LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <div>
          <CookieSettingsButton />
          <span>Laget for gode samtaler.</span>
        </div>
      </div>
    </footer>
  );
}
