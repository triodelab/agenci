import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Inbox,
  LibraryBig,
  MessageCircle,
  Mic,
  Palette,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import type { ConversationStatus, DemoState, DemoView } from "./demo-state";
import { demoNavigation } from "./demo-navigation";
import s from "./interactive-demo.module.css";

function DemoCalendar() {
  const [month, setMonth] = useState(8);
  const [selectedDay, setSelectedDay] = useState(22);
  const year = 2026 + Math.floor(month / 12);
  const monthIndex = ((month % 12) + 12) % 12;
  const date = new Date(year, monthIndex, 1);
  const offset = (date.getDay() + 6) % 7;
  const days = new Date(year, monthIndex + 1, 0).getDate();
  return (
    <div className={s.calendar}>
      <span className={s.sectionLabel}>KALENDER</span>
      <div className={s.calendarTitle}>
        <strong>
          {date.toLocaleDateString("nb-NO", { month: "long", year: "numeric" })}
        </strong>
        <button
          aria-label="Forrige måned"
          onClick={() => {
            setMonth((m) => m - 1);
            setSelectedDay(1);
          }}
        >
          <ChevronLeft size={12} />
        </button>
        <button
          aria-label="Neste måned"
          onClick={() => {
            setMonth((m) => m + 1);
            setSelectedDay(1);
          }}
        >
          <ChevronRight size={12} />
        </button>
      </div>
      <div className={s.calendarGrid}>
        {["MA", "TI", "ON", "TO", "FR", "LØ", "SØ"].map((day) => (
          <small key={day}>{day}</small>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => (
          <button
            key={i}
            aria-label={`Velg ${i + 1}. ${date.toLocaleDateString("nb-NO", { month: "long" })}`}
            aria-pressed={selectedDay === i + 1}
            onClick={() => setSelectedDay(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <small className={s.calendarSelection}>
        Valgt: {selectedDay}.{" "}
        {date.toLocaleDateString("nb-NO", { month: "long" })}
      </small>
    </div>
  );
}

export function DemoOverview({
  state,
  navigate,
  openConversations,
}: {
  state: DemoState;
  navigate: (view: DemoView) => void;
  openConversations: (
    query?: string,
    filter?: ConversationStatus | "all",
  ) => void;
}) {
  const [tip, setTip] = useState(0);
  const open = state.conversations.filter((c) => c.status === "agenci").length;
  const escalated = state.conversations.filter(
    (c) => c.status === "team",
  ).length;
  const resolved =
    29 + state.conversations.filter((c) => c.status === "resolved").length;
  const metrics = [
    { title: "ÅPNE", value: open, icon: Inbox, filter: "agenci" },
    { title: "ESKALERT", value: escalated, icon: Sparkles, filter: "team" },
    { title: "LØST", value: resolved, icon: MessageCircle, filter: "resolved" },
  ] as const;
  const tips = [
    {
      title: "Sterkere treff i samtaler",
      text: "Oppdater kunnskapsbasen med FAQ og produkttekster. Jo tydeligere kilder, jo bedre svar.",
    },
    {
      title: "Hjelp som føles som dere",
      text: "Tilpass velkomstmeldingen og prøv widgeten før kundene møter den.",
    },
    {
      title: "Med teamet i ryggen",
      text: "Ta over en samtale når kunden trenger et menneske. Historikken følger med.",
    },
  ];
  return (
    <div className={s.realDashboard}>
      <div className={s.dashboardContent}>
        <header className={s.dashboardHeading}>
          <span className={s.sectionLabel}>OVERSIKT</span>
          <h3>Dashboard</h3>
          <p>Status for samtaler, kunnskapskilder og oppsett.</p>
        </header>
        <div className={s.sectionTitle}>
          <span className={s.sectionLabel}>SAMTALER</span>
          <button onClick={() => openConversations()}>
            Innboks <ArrowRight size={12} />
          </button>
        </div>
        <p className={s.snapshotNote}>
          Et øyeblikksbilde av eksempelsamtalene akkurat nå.
        </p>
        <div className={s.dashboardMetrics}>
          {metrics.map(({ title, value, icon: Icon, filter }) => (
            <button key={title} onClick={() => openConversations("", filter)}>
              <span className={s.sectionLabel}>{title}</span>
              <Icon size={17} />
              <strong>{value}</strong>
            </button>
          ))}
        </div>
        <span className={`${s.sectionLabel} ${s.blockLabel}`}>OPPSETT</span>
        <div className={s.setupGrid}>
          <button onClick={() => navigate("knowledge")}>
            <LibraryBig size={18} />
            <span>
              <small>KILDER</small>
              <strong>
                {state.sources.filter((source) => source.enabled).length}
              </strong>
            </span>
          </button>
          <button onClick={() => navigate("widget")}>
            <Palette size={18} />
            <span>
              <small>WIDGET</small>
              <strong>Lagret</strong>
            </span>
          </button>
          <button onClick={() => navigate("voice")}>
            <Mic size={18} />
            <span>
              <small>STEMME</small>
              <strong>
                {state.voiceConnected ? "Demo koblet til" : "Ikke koblet"}
              </strong>
            </span>
          </button>
        </div>
        <span className={`${s.sectionLabel} ${s.blockLabel}`}>SNARVEIER</span>
        <p className={s.snapshotNote}>Hopp rett inn i arbeidsflatene.</p>
        <div className={s.shortcutGrid}>
          {demoNavigation
            .filter((item) => item.id !== "overview")
            .sort(
              (a, b) => Number(a.id === "billing") - Number(b.id === "billing"),
            )
            .map(({ id, label, icon: Icon, description }) => (
              <button key={id} onClick={() => navigate(id)}>
                <div>
                  <strong>{label}</strong>
                  <Icon size={17} />
                </div>
                <small>{description}</small>
                <span>
                  Åpne <ArrowRight size={12} />
                </span>
              </button>
            ))}
        </div>
      </div>
      <aside className={s.dashboardRail}>
        <div className={s.liveCard}>
          <span className={s.sectionLabel}>
            <i /> LIVE DEMO
          </span>
          <strong>
            21:33<span>:58</span>
          </strong>
          <small>Tirsdag 22. september 2026</small>
          <button onClick={() => openConversations("", "agenci")}>
            <span>
              <strong>{open} åpne samtaler</strong>
              <small>Krever oppmerksomhet i innboksen.</small>
            </span>
            <ArrowRight size={13} />
          </button>
        </div>
        <DemoCalendar />
        <div className={s.tipCard}>
          <span className={s.sectionLabel}>NYTT & TIPS</span>
          <h4>{tips[tip]?.title}</h4>
          <p>{tips[tip]?.text}</p>
          <div className={s.tipDots}>
            {tips.map((item, index) => (
              <button
                key={item.title}
                aria-label={`Vis tips: ${item.title}`}
                aria-pressed={tip === index}
                onClick={() => setTip(index)}
              />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
