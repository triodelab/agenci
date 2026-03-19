"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

export function LandingHeroShowcase() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start end", "start 18%"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.65, 1], [89.8, 46, 0]);
  const translateY = useTransform(scrollYProgress, [0, 1], [420, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.62, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0.08, 0.74, 1]);

  return (
    <div
      ref={wrapperRef}
      className="relative z-20 mx-auto w-full max-w-[1100px] px-4 md:px-6"
      style={{
        marginTop: "clamp(12px, 2.5vw, 28px)",
        marginBottom: "clamp(-40px, -7vw, -72px)",
      }}
    >
      {/* Laptop/preview – ingen hvit ramme, kant matcher bakgrunn */}
      <motion.div
        style={
          reduced
            ? undefined
            : {
                transformPerspective: 2200,
                rotateX,
                y: translateY,
                scale,
                opacity,
              }
        }
        className="origin-top will-change-transform"
      >
        <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-[#e8e6e3] shadow-[0_48px_120px_-28px_rgba(15,23,42,0.18),0_0_0_1px_rgba(255,255,255,0.4)_inset] ring-1 ring-black/[0.04] dark:border-white/[0.08] dark:bg-[#141414] dark:shadow-[0_48px_120px_-28px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)] dark:ring-white/[0.06]">
        {/* Browser / laptop top bar – fyller helt, kant matcher – lys og dark */}
        <div className="flex w-full min-w-0 shrink-0 items-center gap-3 bg-[#d4d2cf] px-4 py-3 dark:bg-[#1c1c1c]">
          <div className="flex shrink-0 gap-2">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" aria-hidden />
            <span className="size-2.5 rounded-full bg-[#febc2e]" aria-hidden />
            <span className="size-2.5 rounded-full bg-[#28c840]" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 flex justify-center">
            <span className="text-xs text-black/50 dark:text-white/50 truncate">dashboard.agenci.no</span>
          </div>
        </div>
        {/* Screen: 16:10 – passer for dashboard-screenshot, bildet får riktig proporsjon */}
        <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden bg-[#e5e3e0] dark:bg-[#0f0f0f]">
          <div className="relative h-full w-full dark:hidden">
            <Image
              src="/widget.png"
              alt="Agenci widget – chatbot og tilpasning i dashboard"
              fill
              className="object-contain object-center"
              sizes="(max-width: 1024px) 100vw, 1100px"
              priority
            />
          </div>
          <div className="relative hidden h-full w-full dark:block">
            <Image
              src="/widgetDarkmode.png"
              alt="Agenci widget – dark mode"
              fill
              className="object-contain object-center"
              sizes="(max-width: 1024px) 100vw, 1100px"
              priority
            />
          </div>
        </div>
        </div>
      </motion.div>
    </div>
  );
}
