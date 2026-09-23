"use client";

import Image from "next/image";
import { Moon, RotateCcw, Sun } from "lucide-react";
import { useReducer, useState } from "react";
import {
  createDemoState,
  demoReducer,
  type ConversationStatus,
  type DemoAction,
  type DemoView,
} from "./demo-state";
import { demoNavigation } from "./demo-navigation";
import { DemoOverview } from "./overview";
import { DemoConversations } from "./conversations";
import {
  DemoAgents,
  DemoBilling,
  DemoIntegrations,
  DemoKnowledgeWorkspace,
  DemoVoice,
  DemoWidgetSettings,
} from "./product-workspaces";
import s from "./interactive-demo.module.css";

export function InteractiveProductDemo() {
  const [state, reduce] = useReducer(demoReducer, undefined, createDemoState);
  const [view, setView] = useState<DemoView>("overview");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ConversationStatus | "all">("all");
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState("");
  const [dark, setDark] = useState(false);
  const [workspace, setWorkspace] = useState("Agenci");
  const currentView =
    demoNavigation.find((item) => item.id === view) ?? demoNavigation[0];
  function dispatch(action: DemoAction) {
    reduce(action);
    const messages: Record<DemoAction["type"], string> = {
      reset: "Demoen er nullstilt.",
      reply: "Demosvaret er lagt til i samtalen.",
      status: "Samtalestatus oppdatert.",
      book: "Demotiden er valgt. Ingen ekte bestilling er gjort.",
      "toggle-source": "Kildens status er oppdatert.",
      "save-source": "Kilden er lagret i demoen.",
      settings: "Innstillingene er lagret i demoen.",
      availability: "Tilgjengeligheten er oppdatert.",
      widget: "Widgeten er lagret i demoen.",
      voice: "Demooppsettet er oppdatert.",
      integration: "Demotilkoblingen er oppdatert.",
      model: "Demomodellen er valgt.",
      instructions: "Utkastet er lagret i demoen.",
    };
    setNotice(messages[action.type]);
  }
  function openConversations(
    search = "",
    nextFilter: ConversationStatus | "all" = "all",
  ) {
    setQuery(search);
    setFilter(nextFilter);
    setView("conversations");
    setRevision((value) => value + 1);
  }
  function navigate(next: DemoView) {
    setView(next);
    setNotice("");
  }
  return (
    <div className={`${s.landscape} ${s.scene}`}>
      <Image
        src="/images/agenci-meet-norwegian-valley-v2.webp"
        alt=""
        fill
        sizes="(max-width: 1500px) 100vw, 1380px"
        className={s.wallpaper}
        draggable={false}
      />
      <div
        className={s.app}
        data-theme={dark ? "dark" : "light"}
        style={{
          backdropFilter: "var(--demo-frost, blur(6px) saturate(110%))",
          WebkitBackdropFilter: "var(--demo-frost, blur(6px) saturate(110%))",
        }}
        role="region"
        aria-label="Interaktiv Agenci-demo"
        aria-describedby="agenci-demo-disclaimer"
      >
        <aside className={s.sidebar}>
          <div className={s.brandLockup}>
            <Image src="/AgenciLogo.png" alt="Agenci" width={31} height={31} />
            <div>
              <strong>Agenci</strong>
              <small>Arbeidsflate</small>
            </div>
          </div>
          <label className={s.workspaceSelect}>
            <span className={s.srOnly}>Demoarbeidsområde</span>
            <select
              aria-label="Demoarbeidsområde"
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
            >
              <option>Agenci</option>
              <option>Nordstrand Sport</option>
            </select>
          </label>
          <nav className={s.navigation} aria-label="Utforsk Agenci-appen">
            {["KUNDESTØTTE", "TILPASNING", "KONTO"].map((group) => (
              <div className={s.navGroup} key={group}>
                <span className={s.sectionLabel}>{group}</span>
                {demoNavigation
                  .filter((item) => item.group === group)
                  .map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      id={`agenci-demo-nav-${id}`}
                      aria-label={label}
                      aria-current={view === id ? "page" : undefined}
                      onClick={() => navigate(id)}
                    >
                      <Icon size={15} />
                      <span>{label}</span>
                    </button>
                  ))}
              </div>
            ))}
          </nav>
          <div className={s.sidebarBottom}>
            <button
              className={s.themeToggle}
              onClick={() => setDark((value) => !value)}
              aria-label={dark ? "Bruk lyst demotema" : "Bruk mørkt demotema"}
            >
              <span>Tema</span>
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <div className={s.profile}>
              <span className={s.avatar}>D</span>
              <div>
                <strong>Demobruker</strong>
                <small>{workspace}</small>
              </div>
            </div>
          </div>
        </aside>
        <div className={s.main}>
          <div className={s.topbar}>
            <span>
              {workspace} <span className={s.slash}>/</span>{" "}
              <strong>{currentView.label}</strong>
            </span>
            <div>
              <span className={s.demoLabel}>
                <i />
                Interaktiv demo
              </span>
              <button
                type="button"
                aria-label="Nullstill demoen"
                title="Nullstill demoen"
                onClick={() => {
                  dispatch({ type: "reset" });
                  setView("overview");
                  setQuery("");
                  setFilter("all");
                  setWorkspace("Agenci");
                  setDark(false);
                  setRevision((value) => value + 1);
                }}
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>
          <div
            key={`${view}-${revision}`}
            className={s.view}
            id="agenci-demo-panel"
            role="region"
            aria-label={`${currentView.label} i demoen`}
            tabIndex={0}
          >
            {view === "overview" && (
              <DemoOverview
                state={state}
                navigate={navigate}
                openConversations={openConversations}
              />
            )}
            {view === "conversations" && (
              <DemoConversations
                state={state}
                dispatch={dispatch}
                query={query}
                setQuery={setQuery}
                initialFilter={filter}
              />
            )}
            {view === "knowledge" && (
              <DemoKnowledgeWorkspace state={state} dispatch={dispatch} />
            )}
            {view === "widget" && (
              <DemoWidgetSettings state={state} dispatch={dispatch} />
            )}
            {view === "integrations" && (
              <DemoIntegrations state={state} dispatch={dispatch} />
            )}
            {view === "voice" && (
              <DemoVoice state={state} dispatch={dispatch} />
            )}
            {view === "billing" && <DemoBilling />}
            {view === "agents" && (
              <DemoAgents state={state} dispatch={dispatch} />
            )}
          </div>
          <div className={s.footer}>
            <span id="agenci-demo-disclaimer">
              Eksempeldata · Endringer lagres bare i denne demoen
            </span>
            <span role="status" className={s.notice}>
              {notice}
            </span>
          </div>
        </div>
      </div>
      {/* Decorative scenery sits in front of the window, never in the hit-test path. */}
      <div className={s.foreground} aria-hidden="true">
        <Image
          src="/images/agenci-meet-norwegian-valley-v2.webp"
          alt=""
          fill
          sizes="(max-width: 1500px) 100vw, 1380px"
          className={s.foregroundPhoto}
          draggable={false}
        />
      </div>
    </div>
  );
}
