"use client";

import { motion, useReducedMotion } from "motion/react";
import { LayoutDashboard, Boxes, FolderOpen, Palette } from "lucide-react";
import {
  heroStats,
  podiumHeadline,
  podiumSupporting,
} from "@/modules/landing/content/hero";

const statIcons = [LayoutDashboard, Boxes, FolderOpen, Palette];

export function LandingHeroPodium() {
  const reduced = useReducedMotion();

  return (
    <section
      aria-labelledby="podium-heading"
      className="relative z-0 px-3 pb-12 md:px-4 md:pb-16"
      style={{ marginTop: "clamp(-110px, -14vw, -150px)" }}
    >
      <div
        className="relative mx-auto w-full max-w-[1400px] overflow-hidden rounded-[var(--radius-card-lg)] border border-[var(--podium-border)] px-5 pt-[clamp(150px,21vw,195px)] pb-8 md:px-8 md:pt-[clamp(185px,25vw,230px)] md:pb-10 lg:px-10"
        style={{
          background: "var(--podium-bg-fade)",
          boxShadow:
            "var(--podium-shadow), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(70% 50% at 12% 8%, rgba(255,255,255,0.08), transparent 72%), radial-gradient(65% 40% at 88% 5%, rgba(255,255,255,0.07), transparent 72%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "96px 96px",
          }}
        />

        <div className="relative z-10 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-10">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 10 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
            className="max-w-xl"
          >
            <motion.h2
              id="podium-heading"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4 }}
              className="text-balance text-4xl font-semibold leading-[1.08] lg:text-5xl"
              style={{ color: "var(--podium-text)" }}
            >
              {podiumHeadline}
            </motion.h2>
          </motion.div>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 6 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mt-4 max-w-xl text-base leading-relaxed md:text-lg"
            style={{ color: "var(--podium-muted)" }}
          >
            {podiumSupporting}
          </motion.p>
        </div>

        <div className="relative z-10 mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-9 lg:grid-cols-4 lg:gap-4">
          {heroStats.map((stat, i) => {
            const Icon = statIcons[i % statIcons.length]!;
            return (
              <motion.div
                key={stat.label}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.34, delay: 0.04 * i }}
                className="group"
              >
                <div
                  className="h-full rounded-2xl border border-[var(--podium-card-border)] p-5 transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: "var(--podium-card-bg)",
                    boxShadow: "var(--podium-card-shadow)",
                  }}
                >
                  <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-[var(--podium-card-border)] bg-white/[0.02]">
                    <Icon className="size-4" style={{ color: "var(--podium-card-text)" }} aria-hidden />
                  </div>
                  <p
                    className="text-2xl font-semibold tracking-tight"
                    style={{ color: "var(--podium-card-text)" }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: "var(--podium-card-muted)" }}
                  >
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
