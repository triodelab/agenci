"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { AuthAwareLink } from "@/components/auth-aware-link";
import { heroStories } from "../../hero-stories";
import { HeroConversation } from "./hero-conversation";
import {
  LANDING_AUTH_PATHS,
  LANDING_NAV_TONE_BOUNDARY_ID,
  landingSectionHref,
} from "@/modules/landing/constants";

/** The conversation's Remotion timeline owns scene changes for film + UI. */
export function LandingHeroSection() {
  const [activeScene, setActiveScene] = useState(0);
  const [playingScene, setPlayingScene] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  /**
   * Takeover (stingray.no): while the hero scrolls out, the film and the copy
   * lag behind the page — film at ~0.45×, copy at ~0.6× — so the mascot lid
   * below slides over them and the copy drifts up past the film. The hero's
   * overflow clip hides what the lid has covered. Full transform strings on
   * HTML elements, so Motion runs them on the native ScrollTimeline.
   */
  const { scrollYProgress: heroExit } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const filmParallax = useTransform(
    heroExit,
    [0, 1],
    ["translate3d(0, 0%, 0)", "translate3d(0, 55%, 0)"],
  );
  const copyParallax = useTransform(
    heroExit,
    [0, 1],
    ["translate3d(0, 0%, 0)", "translate3d(0, 40%, 0)"],
  );
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const playing = !reducedMotion && !paused && visible;
  const nextScene = useCallback(
    () => setActiveScene((scene) => (scene + 1) % heroStories.length),
    [],
  );
  const togglePause = useCallback(() => setPaused((value) => !value), []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    let inViewport = true;
    const updateVisibility = () => setVisible(inViewport && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry?.isIntersecting ?? false;
        updateVisibility();
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    document.addEventListener("visibilitychange", updateVisibility);
    updateVisibility();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) {
        return;
      }

      if (!playing || index !== activeScene) {
        video.pause();

        if (index !== activeScene) {
          video.currentTime = 0;
        }

        return;
      }

      void video.play().catch(() => undefined);
    });
  }, [activeScene, playing]);

  return (
    <section
      ref={sectionRef}
      id={LANDING_NAV_TONE_BOUNDARY_ID}
      className="agenci-cinematic-hero relative isolate overflow-hidden bg-[#090909] text-white"
      aria-labelledby="landing-hero-heading"
      data-landing-nav-surface="dark"
    >
      <motion.div
        className="absolute inset-0"
        aria-hidden="true"
        style={reducedMotion ? undefined : { transform: filmParallax }}
      >
        {heroStories.map((scene, index) => (
          <div key={scene.id} className="absolute inset-0">
            <img
              alt=""
              className={`agenci-cinematic-poster ${
                activeScene === index ? "is-active" : ""
              }`}
              src={scene.posterSrc}
              style={{ objectPosition: scene.position }}
            />
            <video
              ref={(node) => {
                videoRefs.current[index] = node;
              }}
              className={`agenci-cinematic-film ${
                activeScene === index &&
                playingScene === index &&
                !reducedMotion
                  ? "is-active"
                  : ""
              }`}
              poster={scene.posterSrc}
              preload={index === 0 ? "auto" : "metadata"}
              muted
              playsInline
              style={{ objectPosition: scene.position }}
              onPlaying={() => setPlayingScene(index)}
            >
              <source src={scene.videoSrc} type="video/mp4" />
            </video>
          </div>
        ))}
      </motion.div>

      <div
        className="agenci-cinematic-scrim absolute inset-0"
        aria-hidden="true"
      />

      <motion.div
        className="agenci-cinematic-stage"
        style={reducedMotion ? undefined : { transform: copyParallax }}
      >
        <div className="agenci-cinematic-intro">
          <h1
            id="landing-hero-heading"
            className="agenci-cinematic-title max-w-[11.5ch] text-[clamp(3rem,5.4vw,5.25rem)] leading-[1] text-white"
          >
            Svar som føles menneskelige.
          </h1>

          <p
            className="agenci-cinematic-copy mt-5 max-w-[38ch] text-[1.0625rem] leading-8 text-white/76 sm:text-[1.125rem]"
          >
            Agenci er der når kundene trenger svar — i en samtale, på farten
            eller hjemme i sofaen.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <AuthAwareLink
              href={LANDING_AUTH_PATHS.signUp}
              loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
              className="agenci-cinematic-primary group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[0.94rem] font-medium"
            >
              Kom i gang gratis
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </AuthAwareLink>
            <Link
              href={landingSectionHref("contact")}
              className="agenci-cinematic-secondary group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[0.94rem] font-medium"
            >
              Snakk med oss
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        <HeroConversation
          activeScene={activeScene}
          playing={playing}
          paused={paused}
          reducedMotion={reducedMotion}
          onSceneChange={setActiveScene}
          onTogglePause={togglePause}
          onComplete={nextScene}
        />
      </motion.div>
    </section>
  );
}
