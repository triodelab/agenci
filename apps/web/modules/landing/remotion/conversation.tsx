import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ReactNode } from "react";
import { HERO_PRODUCT_IMAGE, heroStories } from "../hero-stories";
import type { HeroStoryId } from "../hero-stories";

type ConversationProps = { storyId: HeroStoryId };

type ConversationTimeline = {
  questionAt: number;
  firstTypingAt: number;
  firstTypingFor: number;
  responseAt: number;
  replyAt: number;
  secondTypingAt: number;
  secondTypingFor: number;
  resolutionAt: number;
  firstScroll: readonly [number, number];
  secondScroll: readonly [number, number];
  fade: readonly [number, number];
  productAt?: number;
};

const cityTimeline: ConversationTimeline = {
  questionAt: 8,
  firstTypingAt: 57,
  firstTypingFor: 18,
  responseAt: 75,
  replyAt: 200,
  secondTypingAt: 280,
  secondTypingFor: 20,
  resolutionAt: 300,
  firstScroll: [184, 202],
  secondScroll: [280, 300],
  fade: [405, 418],
};

const arneTimeline: ConversationTimeline = {
  questionAt: 18,
  firstTypingAt: 135,
  firstTypingFor: 24,
  responseAt: 159,
  replyAt: 300,
  secondTypingAt: 405,
  secondTypingFor: 22,
  resolutionAt: 430,
  firstScroll: [285, 310],
  secondScroll: [410, 435],
  fade: [485, 496],
};

const laptopTimeline: ConversationTimeline = {
  questionAt: 8,
  firstTypingAt: 45,
  firstTypingFor: 15,
  responseAt: 60,
  replyAt: 145,
  secondTypingAt: 220,
  secondTypingFor: 18,
  resolutionAt: 238,
  firstScroll: [128, 147],
  secondScroll: [220, 240],
  productAt: 258,
  fade: [300, 317],
};

const timelines: Record<HeroStoryId, ConversationTimeline> = {
  city: cityTimeline,
  call: arneTimeline,
  laptop: laptopTimeline,
};

function Message({
  name,
  children,
  customer = false,
}: {
  name: string;
  children: ReactNode;
  customer?: boolean;
}) {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name={name}
      style={{
        opacity: interpolate(frame, [0, 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame, [0, 16], ["0px 10px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        scale: interpolate(frame, [0, 16], [0.98, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        transformOrigin: "left bottom",
      }}
    >
      <div
        className={`agenci-story-message ${customer ? "is-customer" : "is-agent"}`}
      >
        <span className="agenci-story-speaker">{name}</span>
        <p>{children}</p>
      </div>
    </Interactive.Div>
  );
}

function TypingIndicator() {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Agenci skriver"
      style={{
        display: "flex",
        gap: 4,
        padding: "12px 16px",
        opacity: interpolate(frame, [0, 6], [0, 1], {
          extrapolateRight: "clamp",
        }),
      }}
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#59635f",
            opacity: 0.3 + 0.7 * ((Math.sin((frame - index * 5) / 5) + 1) / 2),
          }}
        />
      ))}
    </Interactive.Div>
  );
}

function ProductLinkCard() {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Produktlenke"
      style={{
        opacity: interpolate(frame, [0, 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame, [0, 16], ["0px 8px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      <div className="agenci-story-product-card">
        <Img
          src={staticFile(HERO_PRODUCT_IMAGE)}
          alt="Linskjorte i sand, størrelse M"
          className="agenci-story-product"
        />
        <div>
          <strong>Linskjorte i sand · M</strong>
          <span>På lager</span>
          <small>din-nettbuttik.no/lin-skjorte-m</small>
        </div>
      </div>
    </Interactive.Div>
  );
}

export function Conversation({ storyId }: ConversationProps) {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const timeline = timelines[storyId];
  const story =
    heroStories.find((item) => item.id === storyId) ?? heroStories[0];

  return (
    <AbsoluteFill
      className="agenci-story-composition"
      style={{
        overflow: "hidden",
        fontFamily: "var(--font-sans, Arial), sans-serif",
        color: "#202723",
        fontSize: width < 280 ? 14 : 16,
      }}
    >
      <Interactive.Div
        name="Samtalen"
        style={{
          position: "absolute",
          inset: 0,
          translate: interpolate(
            frame,
            [...timeline.firstScroll, ...timeline.secondScroll],
            ["0px 0px", "0px -128px", "0px -128px", "0px -256px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.4, 0, 0.2, 1),
            },
          ),
          opacity: interpolate(frame, [0, ...timeline.fade], [1, 1, 0], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div style={{ position: "absolute", top: 8, right: 0, left: 32 }}>
          <Sequence
            from={timeline.questionAt}
            layout="none"
            name="Kundens spørsmål"
          >
            <Message name={story.person} customer>
              {story.question}
            </Message>
          </Sequence>
        </div>
        <div style={{ position: "absolute", top: 136, left: 0, right: 24 }}>
          <Sequence
            from={timeline.firstTypingAt}
            durationInFrames={timeline.firstTypingFor}
            layout="none"
            name="Skriveindikator"
          >
            <TypingIndicator />
          </Sequence>
          <Sequence
            from={timeline.responseAt}
            layout="none"
            name="Agenci finner løsningen"
          >
            <Message name="Agenci">{story.response}</Message>
          </Sequence>
        </div>
        <div style={{ position: "absolute", top: 264, left: 48, right: 0 }}>
          <Sequence from={timeline.replyAt} layout="none" name="Kunden svarer">
            <Message name={story.person} customer>
              {story.reply}
            </Message>
          </Sequence>
        </div>
        <div style={{ position: "absolute", top: 360, left: 0, right: 24 }}>
          <Sequence
            from={timeline.secondTypingAt}
            durationInFrames={timeline.secondTypingFor}
            layout="none"
            name="Agenci utfører"
          >
            <TypingIndicator />
          </Sequence>
          <Sequence
            from={timeline.resolutionAt}
            layout="none"
            name="Agenci bekrefter"
          >
            <Message name="Agenci">{story.resolution}</Message>
          </Sequence>
        </div>
        {storyId === "laptop" && timeline.productAt !== undefined ? (
          <div style={{ position: "absolute", top: 450, left: 10, right: 24 }}>
            <Sequence
              from={timeline.productAt}
              layout="none"
              name="Produktlenke"
            >
              <ProductLinkCard />
            </Sequence>
          </div>
        ) : null}
      </Interactive.Div>
    </AbsoluteFill>
  );
}
