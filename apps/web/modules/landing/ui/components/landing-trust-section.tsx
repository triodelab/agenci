"use client";

import { LANDING_SECTION_IDS } from "@/modules/landing/constants";
import React, { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";

type Badge = {
  label: string;
  description: string;
  kind: "gdpr" | "security" | "control" | "server";
};

/** Stable infinite loop — same object shape every time so Motion doesn’t restart the animation every render. */
const infiniteLoop = { repeat: Infinity, repeatType: "loop" as const };
const easeInOut = [0.42, 0, 0.58, 1] as const;

function getIconWrapperAnimation(kind: Badge["kind"]) {
  if (kind === "gdpr") {
    return {
      animate: { rotate: [0, -4, 0, 4, 0], y: [0, -2, 0] },
      transition: { duration: 3.2, ease: easeInOut, ...infiniteLoop },
    };
  }

  if (kind === "security") {
    return {
      animate: { scale: [1, 1.06, 1], y: [0, -1, 0] },
      transition: { duration: 2.2, ease: easeInOut, ...infiniteLoop },
    };
  }

  if (kind === "control") {
    return {
      animate: { x: [0, 3, 0, -3, 0] },
      transition: { duration: 2.6, ease: easeInOut, ...infiniteLoop },
    };
  }

  return {
    animate: { y: [0, -3, 0], scale: [1, 1.03, 1] },
    transition: { duration: 2.4, ease: easeInOut, ...infiniteLoop },
  };
}

const trustBadges: Badge[] = [
  {
    label: "GDPR",
    description: "Databeskyttelse i tråd med EU-regelverket",
    kind: "gdpr",
  },
  {
    label: "Sikkerhetsstandarder",
    description: "TLS 1.3, kryptering i ro og under overføring",
    kind: "security",
  },
  {
    label: "Kontroll",
    description: "Du bestemmer innhold og policy for AI-agenten",
    kind: "control",
  },
  {
    label: "Norske servere",
    description: "Data lagres i EU/EØS for maksimal compliance",
    kind: "server",
  },
];

function TrustIcon({ kind, reduced }: { kind: Badge["kind"]; reduced: boolean }) {
  if (kind === "gdpr") {
    return (
      <svg viewBox="0 0 96 96" className="size-full text-foreground/45">
        <motion.rect
          x="23"
          y="18"
          width="34"
          height="48"
          rx="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          initial={false}
          animate={reduced ? undefined : { rx: [6, 8, 6] }}
          transition={{ duration: 2.4, ease: easeInOut, repeat: Infinity }}
        />
        <motion.path
          d="M31 32 H49 M31 40 H49 M31 48 H43"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={false}
          animate={reduced ? undefined : { opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 2.4, ease: easeInOut, repeat: Infinity }}
        />
        <motion.circle
          cx="66"
          cy="34"
          r="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          initial={false}
          animate={reduced ? undefined : { r: [10.5, 12, 10.5] }}
          transition={{ duration: 2.2, ease: easeInOut, repeat: Infinity }}
        />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.circle
            key={i}
            cx={66 + Math.cos((i / 6) * Math.PI * 2) * 9}
            cy={34 + Math.sin((i / 6) * Math.PI * 2) * 9}
            r="1.1"
            fill="currentColor"
            initial={false}
            animate={reduced ? undefined : { opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.8, ease: easeInOut, repeat: Infinity, delay: i * 0.08 }}
          />
        ))}
      </svg>
    );
  }

  if (kind === "security") {
    return (
      <svg viewBox="0 0 96 96" className="size-full text-foreground/45">
        <motion.circle
          cx="48"
          cy="48"
          r="19"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          initial={false}
          animate={reduced ? undefined : { r: [18, 20, 18], opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 2.4, ease: easeInOut, repeat: Infinity }}
        />
        <motion.circle
          cx="48"
          cy="48"
          r="11"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          initial={false}
          animate={reduced ? undefined : { r: [10.5, 12, 10.5], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 2.1, ease: easeInOut, repeat: Infinity }}
        />
        <motion.path
          d="M43 52 L47 56 L54 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={reduced ? undefined : { pathLength: [0.2, 1, 1, 0.2], opacity: [0.35, 1, 1, 0.35] }}
          transition={{ duration: 2.2, ease: easeInOut, repeat: Infinity }}
        />
        {([0, 1, 2] as const).map((i) => {
          const ys = [33, 48, 63] as const;
          const starts = [36, 60, 42] as const;
          const ends = [60, 36, 58] as const;
          const y = ys[i];
          const start = starts[i];
          const end = ends[i];
          return (
            <motion.circle
              key={i}
              cx={start}
              cy={y}
              r="2.1"
              fill="currentColor"
              initial={false}
              animate={
                reduced
                  ? undefined
                  : { cx: [start, end, start], opacity: [0.35, 0.95, 0.35] }
              }
              transition={{
                duration: 2.4 + i * 0.2,
                ease: easeInOut,
                repeat: Infinity,
              }}
            />
          );
        })}
      </svg>
    );
  }

  if (kind === "control") {
    return (
      <svg viewBox="0 0 96 96" className="size-full text-foreground/45">
        <motion.path
          d="M22 30 H74 M22 48 H74 M22 66 H74"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {([0, 1, 2] as const).map((i) => {
          const cy = 30 + i * 18;
          const starts = [34, 58, 46] as const;
          const mids = [46, 42, 60] as const;
          const start = starts[i];
          const mid = mids[i];
          return (
            <motion.circle
              key={i}
              cx={start}
              cy={cy}
              r="4.2"
              fill="currentColor"
              initial={false}
              animate={reduced ? undefined : { cx: [start, mid, start] }}
              transition={{
                duration: 2.1 + i * 0.2,
                ease: easeInOut,
                repeat: Infinity,
              }}
            />
          );
        })}
      </svg>
    );
  }

  if (kind === "server") {
    return (
      <svg viewBox="0 0 96 96" className="size-full text-foreground/45">
        {[0, 1, 2].map((i) => (
          <motion.rect
            key={i}
            x="22"
            y={24 + i * 14}
            width="36"
            height="10"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            initial={false}
            animate={reduced ? undefined : { width: [36, 34, 36] }}
            transition={{ duration: 2.1, ease: easeInOut, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
        <motion.path
          d="M67 27 C72 27 76 31 76 36 C76 44 67 51 67 51 C67 51 58 44 58 36 C58 31 62 27 67 27 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          initial={false}
          animate={
            reduced
              ? undefined
              : {
                  d: [
                    "M67 27 C72 27 76 31 76 36 C76 44 67 51 67 51 C67 51 58 44 58 36 C58 31 62 27 67 27 Z",
                    "M67 29 C71 29 75 32 75 37 C75 43 67 49 67 49 C67 49 59 43 59 37 C59 32 63 29 67 29 Z",
                    "M67 27 C72 27 76 31 76 36 C76 44 67 51 67 51 C67 51 58 44 58 36 C58 31 62 27 67 27 Z",
                  ],
                }
          }
          transition={{ duration: 2.4, ease: easeInOut, repeat: Infinity }}
        />
        <motion.circle
          cx="67"
          cy="36"
          r="2.2"
          fill="currentColor"
          initial={false}
          animate={reduced ? undefined : { opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.7, ease: easeInOut, repeat: Infinity }}
        />
      </svg>
    );
  }

  return null;
}

/** Memoized so `animate` / `transition` stay referentially stable — avoids restarting the loop on every parent re-render. */
function AnimatedTrustIconWrapper({
  kind,
  reduced,
}: {
  kind: Badge["kind"];
  reduced: boolean;
}) {
  const { animate, transition } = useMemo(() => getIconWrapperAnimation(kind), [kind]);

  return (
    <motion.div
      className="flex size-24 items-center justify-center md:size-28"
      style={{ willChange: reduced ? undefined : "transform" }}
      initial={false}
      animate={reduced ? undefined : animate}
      transition={reduced ? undefined : transition}
    >
      <TrustIcon kind={kind} reduced={reduced} />
    </motion.div>
  );
}

export function LandingTrustSection() {
  const reduced = !!useReducedMotion();

  return (
    <section
      id={LANDING_SECTION_IDS.trust}
      aria-labelledby="trust-heading"
      className="relative overflow-hidden bg-background py-28 md:py-40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border)/0.45) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)/0.45) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
        }}
      />
      <div
        aria-hidden
        className="landing-section-mesh pointer-events-none absolute inset-0 -z-10 opacity-50"
      />

      <div className="mx-auto max-w-[1500px] px-6 lg:px-10">
        <div className="rounded-[2rem] border border-border/50 bg-gradient-to-b from-card/95 to-card/80 p-6 shadow-[0_32px_100px_-48px_rgba(15,23,42,0.25)] backdrop-blur-xl dark:shadow-[0_32px_100px_-48px_rgba(0,0,0,0.5)] md:p-12">
          <div className="grid gap-8 pb-8 md:grid-cols-3 md:pb-10">
            <motion.h2
              id="trust-heading"
              initial={reduced ? false : { opacity: 0, y: 14 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="text-balance text-4xl font-semibold tracking-tight md:col-span-2 lg:text-5xl"
            >
              Trygghet og sikkerhet
            </motion.h2>
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 14 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
              className="text-base leading-relaxed text-muted-foreground md:pt-2"
            >
              Bygget for B2B med fokus på databeskyttelse og compliance.
            </motion.p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {trustBadges.map((badge, idx) => (
              <motion.article
                key={badge.label}
                initial={reduced ? false : { opacity: 0, y: 18 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.42, ease: "easeOut", delay: idx * 0.06 }}
                className="rounded-2xl border border-border/60 bg-card/90 p-7 shadow-sm transition-all duration-300 hover:border-border hover:shadow-md md:p-8"
              >
                <div className="mb-6 flex min-h-[150px] items-center justify-center rounded-2xl border border-border/60 bg-gradient-to-b from-muted/40 to-muted/10">
                  <AnimatedTrustIconWrapper kind={badge.kind} reduced={reduced} />
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">{badge.label}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {badge.description}
                </p>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 18 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
            className="mt-10 rounded-2xl border border-border/50 bg-muted/20 p-8 md:p-10 dark:bg-muted/10"
          >
            <h3 className="text-2xl font-semibold tracking-tight">Hvordan vi håndterer data</h3>
            <ul className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">Lagring:</span> Data lagres i EU/EØS.
                Du velger innhold som AI-agenten trenes på.
              </li>
              <li>
                <span className="font-semibold text-foreground">Kryptering:</span> Kryptering i ro
                (at-rest) og under overføring (TLS 1.3).
              </li>
              <li>
                <span className="font-semibold text-foreground">Compliance:</span> GDPR-fokusert
                design. Du har full kontroll over hvilke data som brukes og slettes ved forespørsel.
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

