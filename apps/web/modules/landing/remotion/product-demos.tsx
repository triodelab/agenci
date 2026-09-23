import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  CheckCheck,
  FileText,
  Globe,
  Inbox,
  MessageCircle,
  Search,
  Settings2,
  Users,
} from "lucide-react";
import { AgenciLoader } from "../../../components/agenci-loader";
import type { ProductDemoScene } from "../product-demo-config";

// Match the scoped marketing palette, including standalone Studio renders.
const ink = "var(--agenci-demo-ink, #181c1a)";
const muted = "var(--agenci-demo-muted, #505b54)";
const line = "var(--agenci-demo-line, #dfe5e1)";
const paper = "var(--agenci-demo-paper, #f1f4f2)";
const row: CSSProperties = { display: "flex", alignItems: "center", gap: 10 };
const panel: CSSProperties = {
  background: "var(--agenci-demo-panel, #fff)",
  border: `1px solid ${line}`,
  borderRadius: 16,
  padding: 20,
  boxSizing: "border-box",
  backdropFilter: "var(--agenci-demo-panel-blur, none)",
  WebkitBackdropFilter: "var(--agenci-demo-panel-blur, none)",
  boxShadow: "var(--agenci-demo-panel-shadow, none)",
};
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

function Label({ children }: { children: ReactNode }) {
  return (
    <div style={{ ...row, fontSize: 15, color: muted, marginBottom: 17 }}>
      {children}
    </div>
  );
}
function Chip({
  children,
  dark = false,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <span
      style={{
        ...row,
        display: "inline-flex",
        fontSize: 15,
        padding: "7px 11px",
        borderRadius: 30,
        background: dark ? ink : paper,
        color: dark ? "#fff" : ink,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
function Reveal({
  children,
  name,
  at = 0,
  style,
  className,
}: {
  children: ReactNode;
  name: string;
  at?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name={name}
      className={className}
      style={{
        ...style,
        opacity: interpolate(frame, [at, at + 18], [0, 1], clamp),
        translate: `0 ${interpolate(frame, [at, at + 18], [12, 0], clamp)}px`,
      }}
    >
      {children}
    </Interactive.Div>
  );
}
function Thinking({ from, to }: { from: number; to: number }) {
  const frame = useCurrentFrame();
  return frame >= from && frame < to ? (
    <div
      className="agenci-demo-thinking"
      style={{
        ...row,
        position: "absolute",
        zIndex: 1,
        color: muted,
        padding: "12px 4px",
        fontSize: 14,
      }}
    >
      <AgenciLoader decorative frame={frame} />
      <span>Agenci ser på det</span>
    </div>
  ) : null;
}
function Graph({ frame, height = 110 }: { frame: number; height?: number }) {
  return (
    <svg
      viewBox="0 0 390 130"
      preserveAspectRatio="none"
      style={{ width: "100%", height, overflow: "visible" }}
    >
      {[30, 70, 110].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="390"
          y2={y}
          stroke={line}
          strokeDasharray="3 5"
        />
      ))}
      <path
        d="M0 112L48 105L94 84L143 91L190 57L239 65L291 27L340 36L390 12"
        fill="none"
        stroke="#516b73"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={interpolate(frame, [30, 120], [1, 0], clamp)}
      />
    </svg>
  );
}

function Dashboard() {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const mobile = width < 700;
  return (
    <Interactive.Div
      name="Agenci – samlet oversikt"
      style={{
        ...panel,
        height: "100%",
        padding: 0,
        display: "flex",
        overflow: "hidden",
        borderRadius: 16,
      }}
    >
      {!mobile && (
        <div
          style={{
            width: 182,
            flexShrink: 0,
            padding: "28px 18px",
            background: "#f7f9f9",
            borderRight: `1px solid ${line}`,
          }}
        >
          <div
            style={{
              fontSize: 29,
              letterSpacing: -1.5,
              fontWeight: 650,
              marginBottom: 40,
            }}
          >
            Agenci
          </div>
          <Label>ARBEIDSOMRÅDE</Label>
          {[
            { icon: BarChart3, name: "Oversikt" },
            { icon: MessageCircle, name: "Samtaler" },
            { icon: BookOpen, name: "Kunnskap" },
            { icon: Users, name: "Teamet" },
          ].map(({ icon: Icon, name }, i) => (
            <div
              key={name}
              style={{
                ...row,
                padding: "12px 10px",
                borderRadius: 8,
                marginBottom: 5,
                fontSize: 15,
                color: i === 0 ? ink : muted,
                background: i === 0 ? "#e4ebed" : "transparent",
              }}
            >
              <Icon size={17} />
              {name}
            </div>
          ))}
          <div style={{ ...row, color: muted, fontSize: 13, marginTop: 145 }}>
            <Settings2 size={15} /> Innstillinger
          </div>
        </div>
      )}
      <div style={{ padding: 24, flex: 1, minWidth: 0 }}>
        <div
          style={{ ...row, justifyContent: "space-between", marginBottom: 20 }}
        >
          <div style={{ fontSize: 24, fontWeight: 500 }}>
            God morgen, Maria.
          </div>
          <span style={{ fontSize: 12, color: muted }}>Eksempeldata</span>
        </div>
        <div
          style={{
            ...row,
            border: `1px solid ${line}`,
            borderRadius: 10,
            padding: "14px 16px",
            color: muted,
            fontSize: 15,
            marginBottom: 16,
          }}
        >
          <Search size={17} /> Finn samtaler og spørsmål
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 17,
          }}
        >
          {[
            ["Samtaler", "248"],
            ["Besvart av Agenci", "186"],
            ["Til teamet", "12"],
          ].map(([label, value], i) => (
            <Reveal
              name={`Nøkkeltall ${label}`}
              at={10 + i * 12}
              key={label}
              style={{ ...panel, padding: mobile ? "16px 11px" : "17px 15px" }}
            >
              <div
                style={{
                  color: muted,
                  fontSize: mobile ? 12 : 13,
                  marginBottom: 12,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 32,
                  letterSpacing: -1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {Math.round(
                  Number(value) * interpolate(frame, [15, 65], [0, 1], clamp),
                )}
              </div>
            </Reveal>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "1.15fr 1fr",
            gap: 16,
          }}
        >
          <div style={{ ...panel, padding: 18 }}>
            <Label>Samtaler denne uken</Label>
            <Graph frame={frame} height={mobile ? 115 : 95} />
            <div
              style={{
                ...row,
                justifyContent: "space-between",
                fontSize: 11,
                color: muted,
                marginTop: 12,
              }}
            >
              <span>Man</span>
              <span>Ons</span>
              <span>Fre</span>
              <span>Søn</span>
            </div>
          </div>
          <div
            style={{
              ...panel,
              padding: 18,
              display: mobile ? "none" : "block",
            }}
          >
            <Label>Kundene spør om</Label>
            {[
              ["Levering", 78],
              ["Retur og bytte", 55],
              ["Åpningstider", 38],
            ].map(([name, amount], i) => (
              <div key={name} style={{ marginBottom: 13 }}>
                <div
                  style={{
                    ...row,
                    justifyContent: "space-between",
                    fontSize: 13,
                    marginBottom: 6,
                  }}
                >
                  <span>{name}</span>
                  <span style={{ color: muted }}>{amount}</span>
                </div>
                <div style={{ height: 5, background: paper, borderRadius: 5 }}>
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 5,
                      background: ["#516b73", "#899da3", "#bdcbd0"][i],
                      width: `${Number(amount) * interpolate(frame, [45 + i * 10, 100 + i * 10], [0, 1], clamp)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <Reveal
          name="Spørsmål til oppfølging"
          at={130}
          style={{
            ...row,
            justifyContent: "space-between",
            background: paper,
            padding: "17px 18px",
            borderRadius: 12,
            marginTop: 17,
          }}
        >
          <div style={{ ...row }}>
            <BookOpen size={20} />
            <div style={{ fontSize: 14 }}>
              Flere spør om levering i helgen.
              <div style={{ fontSize: 12, color: muted, marginTop: 5 }}>
                Et godt sted å oppdatere kunnskapsbasen.
              </div>
            </div>
          </div>
          <ArrowUpRight size={18} />
        </Reveal>
      </div>
    </Interactive.Div>
  );
}

function Knowledge() {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Kilder blir til svar"
      style={{ padding: "26px 20px" }}
    >
      <Label>
        <BookOpen size={17} /> Kunnskapsbase
      </Label>
      {[
        { icon: Globe, name: "Nettsiden deres" },
        { icon: FileText, name: "Returvilkår.pdf" },
        { icon: MessageCircle, name: "Vanlige spørsmål" },
      ].map(({ icon: Icon, name }, i) => (
        <Reveal
          key={name}
          name={name}
          at={i * 18}
          style={{
            ...panel,
            ...row,
            padding: "13px 15px",
            marginBottom: 8,
            fontSize: 18,
          }}
        >
          <Icon size={18} />
          <span style={{ flex: 1 }}>{name}</span>
          <Check
            size={17}
            style={{
              opacity: interpolate(
                frame,
                [65 + i * 10, 75 + i * 10],
                [0, 1],
                clamp,
              ),
            }}
          />
        </Reveal>
      ))}
      <Reveal
        name="Svar med kilde"
        at={110}
        style={{
          marginTop: 19,
          padding: "15px 16px",
          borderLeft: "2px solid #899da3",
          fontSize: 18,
          background: "#ffffffa0",
          borderRadius: "0 12px 12px 0",
        }}
      >
        Du har 30 dagers åpent kjøp.
        <div style={{ ...row, fontSize: 12, color: muted, marginTop: 8 }}>
          <FileText size={13} /> Kilde: Returvilkår.pdf
        </div>
      </Reveal>
    </Interactive.Div>
  );
}
function Tickets() {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Rutinehenvendelser i innboksen"
      style={{ padding: "26px 20px" }}
    >
      <Label>
        <Inbox size={17} /> Innboks{" "}
        <span style={{ marginLeft: "auto", fontSize: 12 }}>3 nye</span>
      </Label>
      {[
        "Når stenger dere?",
        "Hvordan returnerer jeg?",
        "Jeg trenger litt mer hjelp.",
      ].map((text, i) => (
        <Reveal
          name={`Henvendelse ${i + 1}`}
          key={text}
          at={i * 20}
          style={{ ...panel, padding: "14px 15px", marginBottom: 10 }}
        >
          <div style={{ fontSize: 17, marginBottom: 12 }}>{text}</div>
          <div
            style={{
              ...row,
              fontSize: 13,
              color: frame > 65 + i * 35 ? ink : muted,
            }}
          >
            {frame > 65 + i * 35 ? (
              <>
                <CheckCheck size={15} />
                {i === 2 ? "Sendt til teamet" : "Besvart av Agenci"}
              </>
            ) : (
              <>
                <AgenciLoader
                  decorative
                  frame={frame}
                  className="agenci-demo-loader"
                />{" "}
                Ser på spørsmålet
              </>
            )}
          </div>
        </Reveal>
      ))}
    </Interactive.Div>
  );
}
function Conversation() {
  return (
    <Interactive.Div name="AI-chat med sammenheng" style={{ padding: "20px" }}>
      <Label>
        <MessageCircle size={17} /> Samtale, ikke menyvalg
      </Label>
      <div style={{ ...panel, marginLeft: 27, padding: 12, fontSize: 18 }}>
        Kan jeg bytte en gave uten kvittering?
      </div>
      <Thinking from={25} to={80} />
      <Reveal
        name="Et relevant oppfølgingsspørsmål"
        at={80}
        style={{
          padding: "14px 16px",
          marginTop: 14,
          background: ink,
          color: "#fff",
          borderRadius: "15px 15px 15px 4px",
          fontSize: 18,
          lineHeight: 1.45,
        }}
      >
        <div style={{ fontSize: 12, color: "#c7d2d5", marginBottom: 6 }}>
          Agenci
        </div>
        Ja, med byttelapp. Har du den som fulgte med gaven?
      </Reveal>
      <Reveal
        name="Kunden fortsetter samtalen"
        at={155}
        style={{
          ...panel,
          margin: "14px 0 0 115px",
          padding: "13px 16px",
          fontSize: 17,
        }}
      >
        Ja, det har jeg.
      </Reveal>
    </Interactive.Div>
  );
}
function Insights() {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Se hva som kan bli bedre"
      style={{ padding: "26px 20px" }}
    >
      <Label>
        <BarChart3 size={17} /> Samtaleinnsikt
      </Label>
      <div style={{ ...panel, padding: 17 }}>
        <div style={{ fontSize: 15 }}>Dette spør kundene om</div>
        <Graph frame={frame} height={93} />
        <div
          style={{
            ...row,
            justifyContent: "space-between",
            fontSize: 11,
            color: muted,
            marginTop: 8,
          }}
        >
          <span>Denne uken</span>
          <span>Eksempeldata</span>
        </div>
      </div>
      <Reveal
        name="Et konkret forbedringspunkt"
        at={100}
        style={{ ...panel, marginTop: 12, padding: "15px 17px" }}
      >
        <div style={{ fontSize: 16, marginBottom: 6 }}>
          Leverer dere på lørdager?
        </div>
        <div style={{ fontSize: 13, color: muted }}>
          Mangler et tydelig svar i kunnskapsbasen.
        </div>
        <div style={{ ...row, marginTop: 12, fontSize: 13 }}>
          <BookOpen size={15} /> Oppdater kunnskapen{" "}
          <ArrowUpRight size={14} style={{ marginLeft: "auto" }} />
        </div>
      </Reveal>
    </Interactive.Div>
  );
}
function Handoff() {
  return (
    <Interactive.Div
      name="Fra Agenci til Maria"
      style={{ padding: "20px 14px" }}
    >
      <div style={{ ...panel, fontSize: 18, marginLeft: 26 }}>
        Kan jeg snakke med noen?
      </div>
      <Thinking from={20} to={70} />
      <Reveal
        name="Samtalen følger med"
        at={70}
        style={{ ...panel, marginTop: 14, padding: 18 }}
      >
        <Label>
          <Users size={17} /> Til kundeservice
        </Label>
        <div style={{ fontSize: 18, lineHeight: 1.45 }}>
          Nora trenger hjelp med en retur.
        </div>
        <div style={{ ...row, marginTop: 15, fontSize: 13, color: muted }}>
          <CheckCheck size={16} /> Samtalehistorikk vedlagt
        </div>
      </Reveal>
      <Reveal
        name="Maria tar over"
        at={135}
        style={{
          ...row,
          borderRadius: 12,
          background: ink,
          color: "#fff",
          padding: "15px 18px",
          marginTop: 12,
        }}
      >
        <span
          style={{
            border: "1px solid #ffffff60",
            borderRadius: "50%",
            padding: "7px 9px",
            fontSize: 13,
          }}
        >
          M
        </span>
        <div style={{ fontSize: 17 }}>
          Maria har tatt over.
          <div style={{ fontSize: 12, color: "#c7d2d5", marginTop: 3 }}>
            Hei Nora! Jeg hjelper deg videre.
          </div>
        </div>
      </Reveal>
    </Interactive.Div>
  );
}
function Booking() {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Finn en time i samtalen"
      style={{ padding: "20px 18px" }}
    >
      <div
        style={{ ...panel, padding: "15px 18px", fontSize: 19, marginLeft: 95 }}
      >
        Har dere en ledig time på fredag?
      </div>
      <Reveal
        name="Ledige tider"
        at={45}
        style={{ ...panel, margin: "18px 50px 0 0", padding: 22 }}
      >
        <Label>
          <CalendarDays size={18} /> Fredag 25. september
        </Label>
        <div style={{ fontSize: 20, marginBottom: 17 }}>
          Ja! Hvilken tid passer best?
        </div>
        <div style={{ ...row, gap: 12 }}>
          {["10.30", "13.00", "15.30"].map((time, i) => (
            <div
              key={time}
              style={{
                padding: "12px 19px",
                borderRadius: 9,
                fontSize: 18,
                border: `1px solid ${i === 1 && frame >= 100 ? ink : line}`,
                background: i === 1 && frame >= 100 ? ink : paper,
                color: i === 1 && frame >= 100 ? "#fff" : ink,
              }}
            >
              {time}
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal
        name="Bestillingen er bekreftet"
        at={145}
        style={{ ...panel, ...row, padding: "12px 16px", width: "fit-content", margin: "17px 0 0 24px", color: ink, fontSize: 18 }}
      >
        <CheckCheck size={20} /> Da sees vi fredag kl. 13.00.
      </Reveal>
    </Interactive.Div>
  );
}
function Brand() {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const compact = width < 600;
  return (
    <Interactive.Div
      name="Din stemme fra oppsett til samtale"
      style={{
        padding: compact ? "15px 12px" : "28px 20px",
        display: "grid",
        gridTemplateColumns: compact ? "1fr" : "1fr 1fr",
        gap: 17,
        alignItems: "center",
      }}
    >
      <div style={{ ...panel, padding: 22, marginTop: compact ? 0 : 28 }}>
        <Label>
          <Settings2 size={17} /> Slik snakker vi
        </Label>
        <div style={{ fontSize: 22, letterSpacing: -0.5, marginBottom: 18 }}>
          Varm. Tydelig. Hjelpsom.
        </div>
        <div style={{ ...row, flexWrap: "wrap", gap: 7 }}>
          <Chip dark>Personlig</Chip>
          <Chip>Kort og godt</Chip>
        </div>
        <div
          style={{ fontSize: 14, lineHeight: 1.6, color: muted, marginTop: 18 }}
        >
          «Bruk enkelt språk. Still et spørsmål når du trenger å vite litt mer.»
        </div>
      </div>
      <Reveal
        name="Test samtalen"
        className="agenci-demo-glass"
        at={45}
        style={{
          ...panel,
          padding: 21,
        }}
      >
        <Label>
          <MessageCircle size={17} /> Prøv Agenci
        </Label>
        <div
          style={{
            fontSize: 18,
            lineHeight: 1.4,
            padding: "13px 15px",
            background: paper,
            borderRadius: 12,
          }}
        >
          Hei! Jeg er litt usikker på størrelsen.
        </div>
        <Thinking from={55} to={100} />
        <Reveal
          name="Et svar i deres tone"
          at={100}
          style={{ marginTop: 20, fontSize: 18, lineHeight: 1.55 }}
        >
          <div style={{ fontWeight: 500, fontSize: 12, marginBottom: 8 }}>
            Agenci
          </div>
          Det finner vi ut av sammen. Hvilket plagg ser du på?
        </Reveal>
        <div
          style={{
            ...row,
            marginTop: 20,
            borderTop: `1px solid ${line}`,
            paddingTop: 13,
            fontSize: 12,
            color: muted,
            opacity: interpolate(frame, [150, 165], [0, 1], clamp),
          }}
        >
          <Check size={15} /> Basert på instruksjonene deres
        </div>
      </Reveal>
    </Interactive.Div>
  );
}
function Presence() {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Agenci på nettsiden din"
      style={{ padding: "16px 12px" }}
    >
      <div
        style={{
          ...panel,
          height: 320,
          padding: 18,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            ...row,
            justifyContent: "space-between",
            borderBottom: `1px solid ${line}`,
            paddingBottom: 15,
          }}
        >
          <span style={{ fontSize: 12, letterSpacing: 1.5 }}>DIN BEDRIFT</span>
          <div
            style={{ width: 28, height: 4, background: line, borderRadius: 2 }}
          />
        </div>
        <div
          style={{
            width: "65%",
            height: 15,
            background: "#dce5e8",
            borderRadius: 4,
            marginTop: 27,
          }}
        />
        <div
          style={{
            width: "45%",
            height: 8,
            background: paper,
            borderRadius: 4,
            marginTop: 12,
          }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                background: i === 1 ? "#c7d2d5" : "#e4ebed",
                height: 110,
                flex: 1,
                borderRadius: 8,
              }}
            />
          ))}
        </div>
        <Reveal
          name="En vennlig velkomst"
          className="agenci-demo-glass"
          at={60}
          style={{
            position: "absolute",
            bottom: 62,
            left: 43,
            right: 12,
            padding: "17px 18px",
            borderRadius: "15px 15px 4px 15px",
            background: "#ffffffd9",
            border: "1px solid white",
            boxShadow: "0 10px 35px #24323620",
            // The outer website panel already carries the frosted material.
            // Avoid a second backdrop filter inside it.
            fontSize: 18,
            lineHeight: 1.45,
          }}
        >
          <div style={{ fontSize: 12, marginBottom: 5, color: muted }}>
            Agenci
          </div>
          Hei! Hva kan vi hjelpe deg med?
        </Reveal>
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            ...row,
            background: ink,
            color: "#fff",
            borderRadius: 30,
            padding: "11px 15px",
            fontSize: 14,
            scale: interpolate(frame, [10, 30], [0.85, 1], clamp),
          }}
        >
          <MessageCircle size={17} /> Spør oss
        </div>
      </div>
    </Interactive.Div>
  );
}

export function ProductDemoComposition({ scene }: { scene: ProductDemoScene }) {
  const frame = useCurrentFrame();
  const scenes: Record<ProductDemoScene, ReactNode> = {
    inbox: <Dashboard />,
    knowledge: <Knowledge />,
    tickets: <Tickets />,
    conversation: <Conversation />,
    insights: <Insights />,
    handoff: <Handoff />,
    booking: <Booking />,
    brand: <Brand />,
    presence: <Presence />,
  };
  return (
    <AbsoluteFill
      style={{
        color: ink,
        fontFamily: "var(--font-agenci-body, Arial), sans-serif",
        lineHeight: 1.4,
        opacity: interpolate(frame, [0, 10, 312, 329], [0.6, 1, 1, 0.6], clamp),
      }}
    >
      {scenes[scene]}
    </AbsoluteFill>
  );
}

export function InboxComposition() {
  return <ProductDemoComposition scene="inbox" />;
}
export function KnowledgeComposition() {
  return <ProductDemoComposition scene="knowledge" />;
}
export function TicketsComposition() {
  return <ProductDemoComposition scene="tickets" />;
}
export function ConversationComposition() {
  return <ProductDemoComposition scene="conversation" />;
}
export function HandoffComposition() {
  return <ProductDemoComposition scene="handoff" />;
}
export function BookingComposition() {
  return <ProductDemoComposition scene="booking" />;
}
export function InsightsComposition() {
  return <ProductDemoComposition scene="insights" />;
}
export function BrandComposition() {
  return <ProductDemoComposition scene="brand" />;
}
export function PresenceComposition() {
  return <ProductDemoComposition scene="presence" />;
}
