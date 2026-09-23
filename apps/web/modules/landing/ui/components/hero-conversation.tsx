"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef } from "react";
import {
  Check,
  MessageCircle,
  Pause,
  Phone,
  Play,
  RotateCcw,
} from "lucide-react";
import { AgenciNavWordmark } from "@/components/logo";
import { HERO_PRODUCT_IMAGE, heroStories } from "../../hero-stories";

const ConversationPlayer = dynamic(() => import("./hero-conversation-player"), {
  ssr: false,
  loading: () => (
    <div className="agenci-story-loading">
      Et lite spørsmål. En ting mindre å tenke på.
    </div>
  ),
});

export function HeroConversation({
  activeScene,
  playing,
  paused,
  reducedMotion,
  onSceneChange,
  onTogglePause,
  onComplete,
}: {
  activeScene: number;
  playing: boolean;
  paused: boolean;
  reducedMotion: boolean;
  onSceneChange: (index: number) => void;
  onTogglePause: () => void;
  onComplete: () => void;
}) {
  const story = heroStories[activeScene] ?? heroStories[0];
  const replay = useRef<(() => void) | null>(null);
  const setReplay = useCallback((callback: (() => void) | null) => {
    replay.current = callback;
  }, []);
  const ChannelIcon = story.id === "call" ? Phone : MessageCircle;

  return (
    <aside
      className="agenci-story"
      aria-label={`Eksempelsamtale med ${story.person}`}
    >
      <div className="agenci-story-heading">
        <AgenciNavWordmark surface="light" />
        <span className="agenci-story-channel">
          <ChannelIcon size={12} strokeWidth={1.5} /> {story.channel}
        </span>
        <span className="agenci-story-demo">Eksempel</span>
      </div>

      {reducedMotion ? (
        <div className="agenci-story-static">
          <div className="agenci-story-message is-customer">
            <span className="agenci-story-speaker">{story.person}</span>
            <p>{story.question}</p>
          </div>
          <div className="agenci-story-message is-agent">
            <span className="agenci-story-speaker">Agenci</span>
            <p>{story.response}</p>
          </div>
          {story.id === "laptop" ? (
            <div className="agenci-story-product-card">
              <img
                alt="Linskjorte i sand, størrelse M"
                className="agenci-story-product"
                src={HERO_PRODUCT_IMAGE}
              />
              <div>
                <strong>Linskjorte i sand · M</strong>
                <span>På lager</span>
                <small>din-nettbuttik.no/lin-skjorte-m</small>
              </div>
            </div>
          ) : null}
          <div className="agenci-story-static-outcome">
            <Check size={14} />
            <span>{story.outcome}</span>
          </div>
        </div>
      ) : (
        <>
          <div className="agenci-story-player" aria-hidden="true">
            <ConversationPlayer
              key={story.id}
              storyId={story.id}
              playing={playing}
              onComplete={onComplete}
              onReplayReady={setReplay}
            />
          </div>
          <div className="sr-only">
            <p>
              {story.person}: {story.question}
            </p>
            <p>Agenci: {story.response}</p>
            <p>
              {story.person}: {story.reply}
            </p>
            <p>Agenci: {story.resolution}</p>
            <p>
              {story.outcome}. {story.detail}.
            </p>
          </div>
        </>
      )}

      <div className="agenci-story-footer">
        <div
          className="agenci-story-scenes"
          role="group"
          aria-label="Velg eksempelsamtale"
        >
          {heroStories.map((item, index) => (
            <button
              type="button"
              key={item.id}
              onClick={() => onSceneChange(index)}
              aria-label={`Vis scene: ${item.label}`}
              aria-pressed={activeScene === index}
              className="agenci-story-scene"
            >
              <span>0{index + 1}</span>
            </button>
          ))}
        </div>
        <span className="agenci-story-scene-label">{story.label}</span>
        {!reducedMotion && (
          <div className="agenci-story-playback">
            <button
              type="button"
              className="agenci-story-control"
              onClick={() => replay.current?.()}
              aria-label="Spill samtalen fra starten"
            >
              <RotateCcw size={14} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className="agenci-story-control"
              onClick={onTogglePause}
              aria-label={
                paused ? "Spill av animasjonen" : "Sett animasjonen på pause"
              }
              aria-pressed={paused}
            >
              <span
                className={`agenci-story-control-icon ${paused ? "is-visible" : ""}`}
              >
                <Play size={14} strokeWidth={1.5} />
              </span>
              <span
                className={`agenci-story-control-icon ${!paused ? "is-visible" : ""}`}
              >
                <Pause size={14} strokeWidth={1.5} />
              </span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
