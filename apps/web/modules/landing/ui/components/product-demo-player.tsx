"use client";

import { useEffect, useRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { ProductDemoComposition } from "../../remotion/product-demos";
import {
  PRODUCT_DEMO_DURATION,
  PRODUCT_DEMO_FPS,
  getProductDemoDimensions,
  type ProductDemoScene,
} from "../../product-demo-config";

export default function ProductDemoPlayer({
  scene,
  playing,
  reducedMotion,
  compact,
}: {
  scene: ProductDemoScene;
  playing: boolean;
  reducedMotion: boolean;
  compact: boolean;
}) {
  const ref = useRef<PlayerRef>(null);
  const dimensions = getProductDemoDimensions(scene, compact);
  useEffect(() => {
    if (reducedMotion) {
      ref.current?.pause();
      ref.current?.seekTo(260);
    } else if (playing) ref.current?.play();
    else ref.current?.pause();
  }, [playing, reducedMotion]);
  return (
    <Player
      ref={ref}
      component={ProductDemoComposition}
      inputProps={{ scene }}
      compositionWidth={dimensions.width}
      compositionHeight={dimensions.height}
      fps={PRODUCT_DEMO_FPS}
      durationInFrames={PRODUCT_DEMO_DURATION}
      initialFrame={reducedMotion ? 260 : 0}
      loop
      controls={false}
      clickToPlay={false}
      doubleClickToFullscreen={false}
      spaceKeyToPlayOrPause={false}
      numberOfSharedAudioTags={0}
      initiallyMuted
      style={{ width: "100%" }}
      errorFallback={() => (
        <div className="agenci-demo-fallback">
          Eksempelvisningen kunne ikke lastes. Prøv å laste siden på nytt.
        </div>
      )}
    />
  );
}
