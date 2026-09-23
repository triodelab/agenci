"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

const enterEase = [0.16, 1, 0.3, 1] as const;

type Ease = (v: number) => number;

/** Sidens inn-og-ut-kurve cubic-bezier(0.65, 0, 0.35, 1), som funksjon. */
const easeInOut: Ease = (v) =>
  v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
const easeOut: Ease = (v) => 1 - Math.pow(1 - v, 3);
const linear: Ease = (v) => v;

/**
 * Motion kjører scroll-verdier på nettleserens ScrollTimeline ved å gjøre
 * inndata-området om til WAAPI-offsets. Et delområde som [0.2, 1] ville da
 * interpolert fra `none` før 0.2, og én enkelt ease ville vridd hele
 * tidslinjen. Derfor: fyll ut til 0 og 1 og gi én ease per segment.
 */
function useScrollRange<T>(
  progress: MotionValue<number>,
  range: readonly number[],
  from: T,
  to: T,
  ease: Ease = linear,
) {
  const [start = 0, end = 1] = range;
  const input: number[] = [];
  const output: T[] = [];
  const eases: Ease[] = [];
  if (start > 0) {
    input.push(0);
    output.push(from);
    eases.push(linear);
  }
  input.push(start, end);
  output.push(from, to);
  eases.push(ease);
  if (end < 1) {
    input.push(1);
    output.push(to);
    eases.push(linear);
  }
  return useTransform(progress, input, output, { ease: eases });
}

/**
 * «Gjør mindre manuelt. Automatiser mer.» fortalt med formen, styrt av scroll:
 * sirkelen ved «manuelt» (a) krymper der den står til venstre, sirkelen ved
 * «Automatiser mer» (c) vokser der den står til høyre — ingen vandring.
 * Midtsirkelen (b) står fast og holder halsen mellom dem; a stopper på r 40,
 * ikke 37, så halsen til b aldri brytes i goo-filteret. Redusert bevegelse
 * viser sluttbildet.
 */
const BUBBLE_RADIUS = { a: [74, 40], c: [37, 74] };

/** Andel av seksjonens vei inn i bildet der tekst og form glir på plass. */
const ENTER = [0.2, 1];

/**
 * Designsystem: organisk form (maskot/metaball). Tre sirkler smeltet sammen
 * med en konkav "goo"-hals via SVG-filter. Kullgrå på lys bunn, aldri grønn —
 * grønn er forbeholdt handling. Filteret males bare på nytt mens man scroller
 * gjennom overføringen; ingen evig tomgangsanimasjon.
 */
function AgenciMetaball({ transfer }: { transfer: MotionValue<number> }) {
  const filterId = useId();
  const options = { ease: easeInOut };
  const aRadius = useTransform(transfer, [0, 1], BUBBLE_RADIUS.a, options);
  const cRadius = useTransform(transfer, [0, 1], BUBBLE_RADIUS.c, options);
  return (
    <svg
      className="agenci-metaball block w-full"
      viewBox="0 0 400 240"
      aria-hidden="true"
      style={{ filter: "drop-shadow(0 16px 32px rgba(36,50,54,0.12))" }}
    >
      <defs>
        <filter id={filterId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
          />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`} fill="#243236">
        <motion.circle cx="145" cy="150" r={aRadius} />
        <circle cx="238" cy="105" r="52" />
        <motion.circle cx="292" cy="150" r={cRadius} />
      </g>
    </svg>
  );
}

function TypingStatus({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.span
      aria-hidden
      initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 8 }}
      transition={{
        delay: reduceMotion ? 0 : 0.22,
        duration: reduceMotion ? 0.16 : 0.28,
        ease: enterEase,
      }}
      viewport={{ amount: 0.6, once: true }}
      whileInView={
        reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }
      }
      className="absolute top-[25%] right-[5%] z-20 flex items-center gap-1 rounded-full border border-[var(--agenci-border)] bg-white/55 px-2.5 py-1.5 shadow-[0_8px_24px_rgb(36_50_54_/_0.08)] backdrop-blur-sm"
    >
      {[0, 1, 2].map((dot) => (
        <motion.i
          key={dot}
          initial={reduceMotion ? false : { opacity: 0.35, y: 0 }}
          viewport={{ amount: 0.6, once: true }}
          whileInView={
            reduceMotion
              ? { opacity: 0.6 }
              : { opacity: [0.35, 1, 0.35], y: [0, -2, 0] }
          }
          className="block size-1 rounded-full bg-[var(--agenci-muted)]"
          transition={
            reduceMotion
              ? { duration: 0.16 }
              : {
                  delay: 0.38 + dot * 0.1,
                  duration: 0.48,
                  ease: "easeInOut",
                  repeat: 2,
                }
          }
        />
      ))}
    </motion.span>
  );
}

export function LandingMascotPromiseSection() {
  /**
   * Motion sin useReducedMotion() leser matchMedia synkront ved første
   * klient-render, mens den alltid returnerer null på serveren. Når enheten
   * faktisk har redusert bevegelse på, gir det to ulike verdier å rendre med
   * og en hydration mismatch (server: full bevegelse, klient: redusert).
   * Samme mønster som landing-hero-section.tsx: start i "redusert" (matcher
   * server), oppdater fra matchMedia først etter mount.
   */
  const [reduceMotion, setReduceMotion] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  /* Inngang: fra seksjonen dukker opp til den er helt synlig. Rene transform-/
     opacity-verdier på HTML, så Motion kjører dem på native ScrollTimeline. */
  const { scrollYProgress: entry } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"],
  });
  /* Overføringen: mens formen står midt i bildet. SVG-attributter går via JS,
     så her får de en spring for den seige, organiske følelsen. */
  const { scrollYProgress: story } = useScroll({
    target: sectionRef,
    offset: ["start 50%", "start 5%"],
  });
  const transferred = useSpring(story, {
    damping: 30,
    mass: 0.25,
    stiffness: 140,
  });
  const settled = useMotionValue(1);

  const leftText = useScrollRange(
    entry,
    ENTER,
    "translate3d(48%, 0, 0)",
    "translate3d(0%, 0, 0)",
    easeOut,
  );
  const rightText = useScrollRange(
    entry,
    ENTER,
    "translate3d(-48%, 0, 0)",
    "translate3d(0%, 0, 0)",
    easeOut,
  );
  const figureOpacity = useScrollRange(entry, ENTER, 0, 1);
  const figureTransform = useScrollRange(
    entry,
    ENTER,
    "translate3d(0, 30px, 0) scale(0.82)",
    "translate3d(0, 0px, 0) scale(1)",
    easeOut,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  const transfer = reduceMotion ? settled : transferred;
  const dropletOpacity = useTransform(transfer, [0, 0.3], [0.8, 0]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="mascot-promise-heading"
      className="agenci-mascot-lid overflow-x-clip bg-[#FAFAFA] text-[var(--agenci-ink)] lg:h-[60svh] lg:min-h-[30rem]"
      data-landing-nav-surface="light"
      id="agenci-mascot-scene"
    >
      <div className="agenci-bleed-row mx-auto grid h-full max-w-[1600px] items-center gap-7 px-6 py-16 sm:gap-10 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,25rem)_minmax(0,1fr)] lg:gap-6 lg:py-0">
        <motion.div
          style={reduceMotion ? undefined : { transform: leftText }}
        >
          <h2
            id="mascot-promise-heading"
            className="agenci-cinematic-title max-w-[11ch] text-[clamp(2.85rem,4.45vw,4.5rem)] leading-[0.9]"
          >
            Gjør mindre manuelt.
          </h2>
        </motion.div>

        <motion.figure
          className="relative mx-auto w-full max-w-[25rem]"
          style={
            reduceMotion
              ? undefined
              : { opacity: figureOpacity, transform: figureTransform }
          }
        >
          <TypingStatus reduceMotion={reduceMotion} />
          {/* Dråpen ved den manuelle sirkelen fordamper først. */}
          <motion.span
            aria-hidden
            className="absolute top-[31%] left-[12%] z-20 size-2.5 rounded-full bg-[var(--agenci-subtle)]"
            style={{ opacity: dropletOpacity }}
          />
          <AgenciMetaball transfer={transfer} />
        </motion.figure>

        <motion.div
          style={reduceMotion ? undefined : { transform: rightText }}
        >
          <p className="agenci-cinematic-title max-w-[11ch] text-[clamp(2.85rem,4.45vw,4.5rem)] leading-[0.9] lg:ml-auto">
            Automatiser mer.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
