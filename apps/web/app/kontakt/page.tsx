import { SupportChat } from "@/components/support-chat";
import type { Metadata } from "next";
import Image from "next/image";
import { ContactFormCard } from "@/modules/landing/ui/components/contact-form-card";
import { LandingNav } from "@/modules/landing/ui/components/landing-nav";
import s from "@/modules/landing/ui/views/kontakt.module.css";

export const metadata: Metadata = {
  title: "Kontakt oss",
  description:
    "Book en demo, spør om pris eller få hjelp med oppsettet. Vi svarer innen én arbeidsdag.",
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  return (
    <>
      <LandingNav variant="auto" />
      <main
        className={`${s.page} landing-warp overflow-x-clip antialiased`}
        data-agenci-product-sections
        data-landing-nav-surface="light"
      >
        <section className={s.left} aria-labelledby="kontakt-heading">
          <div className={s.inner}>
            <span className={s.eyebrow}>
              <i aria-hidden="true" />
              Vi svarer innen én arbeidsdag
            </span>
            <h1 id="kontakt-heading" className={s.title}>
              La oss ta en prat.
              <br />
              <span>Uten forpliktelser.</span>
            </h1>
            <p className={s.lead}>
              Lurer du på om Agenci passer for dere, hva det koster med ditt
              volum, eller vil du ha hjelp med oppsettet? Skriv noen linjer, så
              tar vi det derfra.
            </p>
            <ul className={s.direct}>
              <li>
                <a href="mailto:post@triodelab.no">post@triodelab.no</a>
              </li>
              <li>Demo på video, ca. 20 minutter</li>
            </ul>

            <ContactFormCard />
          </div>
        </section>

        <figure className={s.media}>
          <div className={s.frame}>
            <Image
              src="/images/agenci-kontakt-glass.webp"
              alt="Glassfasade på et moderne bygg som speiler skyene mot blå himmel."
              fill
              priority
              sizes="(max-width: 980px) 100vw, 50vw"
              className={s.photo}
            />
          </div>
          <span className={s.shade} aria-hidden="true" />
          <figcaption className={s.credit}>
            Foto:{" "}
            <a
              href="https://www.pexels.com/@imjimmyqian/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Longxiang Qian / Pexels
            </a>
          </figcaption>
        </figure>
      </main>
      <SupportChat />
    </>
  );
}
