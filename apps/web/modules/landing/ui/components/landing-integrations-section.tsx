"use client";

import { LANDING_SECTION_IDS } from "@/modules/landing/constants";
import {
  Gemini,
  Replit,
  MagicUI,
  VSCodium,
  MediaWiki,
  GooglePaLM,
} from "@/components/logos";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider";
import { AuthAwareLink } from "@/components/auth-aware-link";
import { motion, useReducedMotion } from "motion/react";

export function LandingIntegrationsSection() {
  const reduced = useReducedMotion();
  const integrationLogos = [
    VSCodium,
    MediaWiki,
    GooglePaLM,
    Gemini,
    Replit,
    MagicUI,
    Gemini,
    Replit,
    VSCodium,
    MediaWiki,
  ];

  return (
    <section
      id={LANDING_SECTION_IDS.integrations}
      aria-labelledby="integrations-heading"
    >
      <div className="relative overflow-hidden bg-background py-24 md:py-36">
        <div
          aria-hidden
          className="landing-section-mesh pointer-events-none absolute inset-0 -z-10 opacity-70"
        />
        <div className="relative mx-auto max-w-5xl px-6">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="relative left-1/2 mt-2 w-screen -translate-x-1/2 px-4 sm:px-6"
          >
            <div className="relative mx-auto w-full max-w-[1400px] py-8 md:py-10">
              <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
                <InfiniteSlider gap={28} speed={22} speedOnHover={12}>
                  {integrationLogos.map((Logo, idx) => (
                    <IntegrationCard key={`${idx}-${Logo.name}`} className="size-14 md:size-16">
                      <Logo />
                    </IntegrationCard>
                  ))}
                </InfiniteSlider>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="mx-auto mt-14 max-w-3xl space-y-6 rounded-[2rem] border border-border/50 bg-card/80 p-10 text-center shadow-[0_24px_80px_-40px_rgba(15,23,42,0.2)] backdrop-blur-md dark:bg-card/50 dark:shadow-[0_24px_80px_-40px_rgba(0,0,0,0.45)] md:mt-16 md:p-12"
          >
            <motion.h2
              id="integrations-heading"
              className="text-balance text-4xl font-semibold tracking-tight lg:text-[2.75rem]"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.12 }}
            >
              Integrasjoner som{" "}
              <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                vokser med deg
              </span>
            </motion.h2>
            <motion.p
              className="text-balance text-base text-muted-foreground md:text-lg"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.18 }}
            >
              Koble Agenci til verktøyene dere bruker. API og webhooks er klar –
              flere integrasjoner kommer snart.
            </motion.p>

            <motion.div
              className="flex flex-col items-center justify-center gap-3 sm:flex-row"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.24 }}
            >
              <Button size="default" asChild className="rounded-xl shadow-md">
                <AuthAwareLink>Kom i gang</AuthAwareLink>
              </Button>
              <Button variant="outline" size="default" asChild className="rounded-xl bg-background/80">
                <Link href={`/#${LANDING_SECTION_IDS.contact}`}>Ta kontakt</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function IntegrationCard({
  children,
  className,
  isCenter = false,
}: {
  children: React.ReactNode;
  className?: string;
  isCenter?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative z-20 flex size-12 shrink-0 items-center justify-center rounded-full border border-border/80 bg-background shadow-md ring-4 ring-background/80 transition-transform hover:scale-105",
        className
      )}
    >
      <div className={cn("size-fit *:size-5", isCenter && "*:size-8")}>
        {children}
      </div>
    </div>
  );
}
