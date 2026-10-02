"use client";

/**
 * Entry loader for the marketing site. It is in the server HTML, so nothing
 * shows half-loaded: the A fills as fonts, the images in the first screen
 * and the hero video load, then the page is revealed.
 *
 * Never blocks for long: it finishes after MAX_MS whatever is still loading,
 * and a CSS failsafe hides it even if this script never runs.
 */
import { useEffect, useRef, useState } from "react";
import styles from "./site-preloader.module.css";

const MIN_MS = 700;
const MAX_MS = 8000;
/** Per asset: a slow third-party file should not hold up the rest. */
const ASSET_TIMEOUT_MS = 6000;

function waitFor(target: EventTarget, events: string[], ms = ASSET_TIMEOUT_MS) {
  return new Promise<void>((resolve) => {
    const done = () => {
      for (const e of events) target.removeEventListener(e, done);
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(done, ms);
    for (const e of events) target.addEventListener(e, done, { once: true });
  });
}

/** What the first screen needs before it looks right. */
function criticalAssets(): Promise<void>[] {
  const fold = window.innerHeight * 1.25;
  const tasks: Promise<void>[] = [];
  tasks.push(document.fonts?.ready.then(() => undefined) ?? Promise.resolve());
  for (const img of Array.from(document.images)) {
    if (img.complete || img.loading === "lazy") continue;
    if (img.getBoundingClientRect().top > fold) continue;
    tasks.push(waitFor(img, ["load", "error"]));
  }
  for (const video of Array.from(document.querySelectorAll("video"))) {
    if (video.preload !== "auto" || video.readyState >= 3) continue;
    if (video.getBoundingClientRect().top > fold) continue;
    tasks.push(waitFor(video, ["canplay", "error"]));
  }
  if (document.readyState !== "complete") tasks.push(waitFor(window, ["load"], MAX_MS));
  return tasks;
}

export function SitePreloader() {
  const [state, setState] = useState<"loading" | "done" | "gone">("loading");
  const [shown, setShown] = useState(0);
  const target = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const started = performance.now();
    let finished = false;

    const tasks = criticalAssets();
    let settled = 0;
    const bump = () => {
      settled += 1;
      // Hold the last stretch until everything is in.
      target.current = Math.min(94, (settled / tasks.length) * 100);
    };
    for (const t of tasks) void t.then(bump);

    const finish = () => {
      if (finished) return;
      finished = true;
      target.current = 100;
    };
    const all = Promise.all(tasks);
    const cap = window.setTimeout(finish, MAX_MS);
    void all.then(() => {
      const wait = Math.max(0, MIN_MS - (performance.now() - started));
      window.setTimeout(finish, wait);
    });

    // Ease the number toward its target: smooth, never backwards.
    let raf = 0;
    let current = 0;
    const tick = () => {
      const goal = target.current;
      current += (goal - current) * (goal === 100 ? 0.22 : 0.08) + (goal > current ? 0.15 : 0);
      current = Math.min(current, goal);
      setShown(current);
      if (goal === 100 && current > 99.5) {
        setShown(100);
        setState("done");
        root.style.overflow = previousOverflow;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(cap);
      root.style.overflow = previousOverflow;
    };
  }, []);

  // Remove from the page once the fade-out has played.
  useEffect(() => {
    if (state !== "done") return;
    const t = window.setTimeout(() => setState("gone"), 700);
    return () => window.clearTimeout(t);
  }, [state]);

  if (state === "gone") return null;
  const pct = Math.round(shown);
  return (
    <div
      className={styles.overlay}
      data-state={state}
      role="status"
      aria-live="polite"
      aria-label={state === "done" ? "Siden er lastet" : `Laster siden, ${pct} prosent`}
      style={{ ["--p" as string]: `${shown}%` }}
    >
      <div className={styles.stack}>
        <div className={styles.mark} aria-hidden="true">
          <span className={styles.markBase} />
          <span className={styles.markFill} />
        </div>
        <div className={styles.meter} aria-hidden="true">
          <div className={styles.track}>
            <span className={styles.bar} />
          </div>
          <span className={styles.count}>{String(pct).padStart(2, "0")} %</span>
        </div>
      </div>
    </div>
  );
}
