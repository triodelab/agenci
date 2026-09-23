"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { AgenciLoader } from "@/components/agenci-loader";
import {
  getProductDemoDimensions,
  type ProductDemoScene,
} from "../../product-demo-config";

const DemoPlayer = dynamic(() => import("./product-demo-player"), {
  ssr: false,
  loading: () => (
    <div className="agenci-demo-fallback">
      <AgenciLoader label="Laster produktvisning" />
    </div>
  ),
});

export function ProductDemo({
  scene,
  description,
  className = "",
}: {
  scene: ProductDemoScene;
  description: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [compact, setCompact] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const dimensions = getProductDemoDimensions(scene, compact);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(
      ([entry]) => {
        const active = entry?.isIntersecting ?? false;
        setVisible(active);
        if (active) setLoaded(true);
      },
      { threshold: 0.12 },
    );
    const resizeObserver = new ResizeObserver(([entry]) => {
      if (entry) setCompact(entry.contentRect.width < 560);
    });
    if (ref.current) {
      observer.observe(ref.current);
      resizeObserver.observe(ref.current);
    }
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);
  return (
    <div
      ref={ref}
      className={`agenci-product-demo ${scene === "inbox" ? "is-dashboard" : ""} ${className}`}
    >
      <div
        aria-hidden="true"
        className="agenci-demo-screen"
        style={{ aspectRatio: `${dimensions.width} / ${dimensions.height}` }}
      >
        {loaded ? (
          <DemoPlayer
            scene={scene}
            playing={visible && pageVisible && !paused && !reducedMotion}
            reducedMotion={reducedMotion}
            compact={compact}
          />
        ) : (
          <div className="agenci-demo-fallback">
            <AgenciLoader decorative />
          </div>
        )}
      </div>
      <p className="sr-only">
        {description} Dette er en illustrativ produktvisning.
      </p>
      <div className="agenci-demo-caption">
        <span>Eksempelvisning</span>
        {!reducedMotion && (
          <button
            type="button"
            onClick={() => setPaused(!paused)}
            aria-label={`${paused ? "Spill av" : "Pause"} animasjon: ${description}`}
            aria-pressed={paused}
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}
