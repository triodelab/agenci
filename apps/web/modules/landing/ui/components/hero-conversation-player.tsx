"use client";

import { useEffect, useRef, useState } from "react";
import { Player } from "@remotion/player";
import type { PlayerRef } from "@remotion/player";
import { HERO_STORY_FPS, heroStories } from "../../hero-stories";
import type { HeroStoryId } from "../../hero-stories";
import { CityConversation } from "../../remotion/scenes/city";
import { CallConversation } from "../../remotion/scenes/call";
import { LaptopConversation } from "../../remotion/scenes/laptop";

const compositions = {
  city: CityConversation,
  call: CallConversation,
  laptop: LaptopConversation,
};

export default function HeroConversationPlayer({
  storyId,
  playing,
  onComplete,
  onReplayReady,
}: {
  storyId: HeroStoryId;
  playing: boolean;
  onComplete: () => void;
  onReplayReady: (replay: (() => void) | null) => void;
}) {
  const player = useRef<PlayerRef>(null);
  const container = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(368);
  const story =
    heroStories.find((item) => item.id === storyId) ?? heroStories[0];

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width > 0) {
        setCanvasWidth(Math.round(entry.contentRect.width));
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const current = player.current;
    if (!current) return;
    current.addEventListener("ended", onComplete);
    onReplayReady(() => current.seekTo(0));
    return () => {
      current.removeEventListener("ended", onComplete);
      onReplayReady(null);
    };
  }, [onComplete, onReplayReady]);

  useEffect(() => {
    if (playing) player.current?.play();
    else player.current?.pause();
  }, [playing]);

  return (
    <div ref={container} style={{ width: "100%" }}>
      <Player
        ref={player}
        component={compositions[storyId]}
        durationInFrames={story.durationInFrames}
        fps={HERO_STORY_FPS}
        compositionWidth={canvasWidth}
        compositionHeight={304}
        style={{ width: "100%", background: "transparent" }}
        controls={false}
        clickToPlay={false}
        doubleClickToFullscreen={false}
        spaceKeyToPlayOrPause={false}
        moveToBeginningWhenEnded={false}
        numberOfSharedAudioTags={0}
        initiallyMuted
        errorFallback={() => (
          <p className="agenci-story-fallback">
            Agenci er her for å hjelpe deg.
          </p>
        )}
      />
    </div>
  );
}
