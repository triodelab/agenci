"use client";

import Image from "next/image";
import {
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import {
  featureCards,
  featureImageLoader,
  normalizeFeaturePosition,
  wrapFeatureIndex,
} from "../../feature-carousel-data";
import styles from "./landing-feature-carousel.module.css";

export function LandingFeatureCarousel() {
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState(1);
  const [stageWidth, setStageWidth] = useState<number>();
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef(1);
  const positionRef = useRef(1);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gesture = useRef<{ x: number; scrollLeft: number } | null>(null);
  const count = featureCards.length;
  const current = featureCards[active]!;
  const rotating =
    !paused && !hovered && visible && pageVisible && !reducedMotion;

  const updatePosition = useCallback(
    (value: number) => {
      positionRef.current = value;
      setPosition(value);
      setActive(wrapFeatureIndex(Math.round(value) - 1, count));
    },
    [count],
  );

  const finishScroll = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || gesture.current) return;
    const value = stage.scrollLeft / stepRef.current;
    const normalized = normalizeFeaturePosition(value, count);
    if (normalized !== value) {
      stage.scrollTo({
        left: normalized * stepRef.current,
        behavior: "instant",
      });
      updatePosition(normalized);
    }
  }, [count, updatePosition]);

  const scrollToPosition = useCallback(
    (value: number) => {
      stageRef.current?.scrollTo({
        left: value * stepRef.current,
        behavior: reducedMotion ? "instant" : "smooth",
      });
    },
    [reducedMotion],
  );

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const slides = stage.querySelectorAll<HTMLElement>("li");
      if (!slides[0] || !slides[1]) return;
      stepRef.current = slides[1].offsetLeft - slides[0].offsetLeft;
      setStageWidth(stage.clientWidth);
      const value = Math.round(positionRef.current);
      stage.scrollTo({ left: value * stepRef.current, behavior: "instant" });
      updatePosition(value);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => {
      observer.disconnect();
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, [updatePosition]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey)
        setPaused(true);
      // Horizontal trackpad input remains native. Shift + a mouse wheel is
      // supported without stealing ordinary vertical page scrolling.
      if (event.shiftKey && event.deltaX === 0 && event.deltaY !== 0) {
        event.preventDefault();
        const unit =
          event.deltaMode === 1
            ? 16
            : event.deltaMode === 2
              ? stage.clientWidth
              : 1;
        stage.scrollBy({ left: event.deltaY * unit, behavior: "instant" });
      }
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("scrollend", finishScroll);
    return () => {
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("scrollend", finishScroll);
    };
  }, [finishScroll]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? false),
      { threshold: 0.3 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    const onVisibility = () => setPageVisible(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => {
      scrollToPosition(
        Math.round(normalizeFeaturePosition(positionRef.current, count)) + 1,
      );
    }, 6500);
    return () => window.clearInterval(timer);
  }, [rotating, count, scrollToPosition]);

  function move(direction: number) {
    setPaused(true);
    scrollToPosition(
      Math.round(normalizeFeaturePosition(positionRef.current, count)) +
        direction,
    );
  }

  function handleKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setPaused(true);
    if (event.key === "Home") scrollToPosition(1);
    else if (event.key === "End") scrollToPosition(count);
    else move(event.key === "ArrowRight" ? 1 : -1);
  }

  function startGesture(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    setPaused(true);
    // Touch uses the browser's horizontal pan and momentum, including vertical
    // page scrolling; only a mouse needs a custom grab-to-scroll interaction.
    if (event.pointerType !== "mouse") return;
    gesture.current = {
      x: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function dragGesture(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    if (!start) return;
    event.currentTarget.scrollLeft =
      start.scrollLeft - (event.clientX - start.x);
  }

  function finishGesture() {
    if (!gesture.current) return;
    gesture.current = null;
    setDragging(false);
    scrollToPosition(Math.round(positionRef.current));
  }

  function handleScroll() {
    const stage = stageRef.current;
    if (!stage) return;
    updatePosition(stage.scrollLeft / stepRef.current);
    if (settleTimer.current) clearTimeout(settleTimer.current);
    // Fallback for browsers without scrollend.
    settleTimer.current = setTimeout(finishScroll, 180);
  }

  return (
    <section
      ref={sectionRef}
      id="agenci-features"
      className={styles.carousel}
      aria-labelledby="features-heading"
      aria-roledescription="karusell"
      data-landing-nav-surface="light"
      data-rotating={rotating}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={(event) => {
        if (
          !(event.target instanceof Element) ||
          !event.target.closest("[data-autoplay-toggle]")
        )
          setPaused(true);
      }}
    >
      <header className={styles.header}>
        <h2 id="features-heading">Agencis funksjoner</h2>
        <p>Hjelp, der hverdagen skjer.</p>
      </header>
      <div
        ref={stageRef}
        className={styles.stage}
        style={
          {
            "--stage-width": stageWidth ? `${stageWidth}px` : undefined,
          } as CSSProperties
        }
        data-dragging={dragging}
        tabIndex={0}
        role="group"
        aria-label="Utforsk funksjonene med piltastene, eller sveip mellom bildene"
        aria-describedby="feature-scroll-hint"
        onKeyDown={handleKey}
        onScroll={handleScroll}
        onPointerDown={startGesture}
        onPointerMove={dragGesture}
        onPointerUp={finishGesture}
        onPointerCancel={finishGesture}
        onLostPointerCapture={finishGesture}
      >
        <ol id="feature-photo-track" className={styles.track}>
          {Array.from({ length: count + 2 }, (_, trackIndex) => {
            const index = wrapFeatureIndex(trackIndex - 1, count);
            const card = featureCards[index]!;
            const offset = trackIndex - position;
            const isActive = Math.abs(offset) < 0.5;
            return (
              <li
                key={`${card.id}-${trackIndex}`}
                className={styles.slide}
                aria-hidden={!isActive}
                data-active={isActive}
                style={
                  {
                    "--offset": Math.max(-2, Math.min(2, offset)),
                  } as CSSProperties
                }
              >
                <article className={styles.card}>
                  {Math.abs(offset) <= 2.5 && (
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      loader={
                        card.image.startsWith("/")
                          ? undefined
                          : featureImageLoader
                      }
                      loading={Math.abs(offset) <= 1 ? "eager" : "lazy"}
                      sizes="(max-width: 700px) 76vw, (max-width: 1400px) 30vw, 420px"
                      draggable={false}
                      style={{ objectPosition: card.position }}
                    />
                  )}
                  <span className={styles.category}>{card.feature}</span>
                  <h3>{card.caption}</h3>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          aria-label="Forrige funksjon"
          aria-controls="feature-photo-track"
          onClick={() => move(-1)}
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <span className={styles.counter} aria-hidden="true">
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(count).padStart(2, "0")}
        </span>
        <button
          type="button"
          aria-label="Neste funksjon"
          aria-controls="feature-photo-track"
          onClick={() => move(1)}
        >
          <ArrowRight size={20} aria-hidden="true" />
        </button>
        {!reducedMotion && (
          <button
            type="button"
            data-autoplay-toggle
            aria-label={
              paused
                ? "Start automatisk bildebytte"
                : "Pause automatisk bildebytte"
            }
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? (
              <Play size={18} aria-hidden="true" />
            ) : (
              <Pause size={18} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      <p id="feature-scroll-hint" className={styles.scrollHint}>
        Sveip eller dra sideveis · Shift + rullehjul
      </p>
      <p
        className="sr-only"
        aria-live={rotating ? "off" : "polite"}
        aria-atomic="true"
      >
        {active + 1} av {count}: {current.feature}. {current.caption}
      </p>
      <p className={styles.credit}>
        Foto:{" "}
        <a href={current.credit.url} target="_blank" rel="noopener noreferrer">
          {current.credit.photographer} / {current.credit.provider}
        </a>
        {" · "}
        <a
          href={
            current.image.startsWith("/")
              ? current.image
              : featureImageLoader({ src: current.image, width: 3840 })
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          Vis i 4K
        </a>
        <span>Illustrative brukssituasjoner.</span>
      </p>
    </section>
  );
}
