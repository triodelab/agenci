import Image from "next/image";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Folder,
  Mic,
  RotateCcw,
  Send,
} from "lucide-react";
import { useEffect, useRef, useState, type Dispatch } from "react";
import type { DemoAction, DemoMessage, DemoState } from "./demo-state";
import { DemoKnowledge, DemoSettings } from "./workspace-panels";
import s from "./interactive-demo.module.css";

function getDemoAnswer(question: string, state: DemoState): string {
  if (!state.automatic)
    return "Automatiske svar er satt på pause. Teamet kan ta over samtalen i denne demoen.";
  const q = question.toLocaleLowerCase("nb");
  const id = /retur|bytt|gave/.test(q)
    ? "returns"
    : /åp|steng|lever|pakke/.test(q)
      ? "website"
      : "faq";
  const source = state.sources.find((item) => item.id === id && item.enabled);
  if (!source)
    return "Denne kilden er satt på pause. Aktiver den under Administrer kilder for å prøve igjen.";
  return `${state.tone === "warm" ? "Hei! Jeg hjelper deg gjerne. " : ""}${source.content}`;
}

export function LiveDemoWidget({
  state,
  welcome = state.welcome,
}: {
  state: DemoState;
  welcome?: string;
}) {
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [draft, setDraft] = useState("");
  const messageList = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messageList.current)
      messageList.current.scrollTop = messageList.current.scrollHeight;
  }, [messages]);
  function send(text: string) {
    if (!text.trim()) return;
    setMessages((previous) =>
      [
        ...previous,
        { sender: "customer" as const, text: text.trim() },
        { sender: "agenci" as const, text: getDemoAnswer(text, state) },
      ].slice(-8),
    );
    setDraft("");
  }
  return (
    <div className={s.widgetPreview}>
      <header>
        <Image src="/AgenciLogo.png" alt="" width={22} height={22} />
        <strong>Agenci</strong>
        <button
          aria-label="Start testsamtalen på nytt"
          onClick={() => setMessages([])}
        >
          <RotateCcw size={14} />
        </button>
      </header>
      <div
        ref={messageList}
        className={s.widgetMessages}
        tabIndex={0}
        role="log"
        aria-live="polite"
        aria-label="Testsamtale med Agenci"
      >
        <div className={`${s.message} ${s.agentMessage}`}>
          <p>{welcome}</p>
        </div>
        {!messages.length && (
          <button
            className={s.exampleQuestion}
            onClick={() => send("Hvordan returnerer jeg en vare?")}
          >
            Hvordan returnerer jeg en vare? <ChevronRight size={12} />
          </button>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${s.message} ${message.sender === "customer" ? s.customerMessage : s.agentMessage}`}
          >
            <small>
              {message.sender === "customer" ? "Deg" : "Agenci · demosvar"}
            </small>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      <form
        className={s.composer}
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        <input
          aria-label="Skriv til testwidgeten"
          placeholder="Skriv en melding …"
          value={draft}
          maxLength={300}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          className={s.sendButton}
          disabled={!draft.trim()}
          aria-label="Send testmelding"
        >
          <Send size={14} />
        </button>
      </form>
      <small className={s.widgetDisclaimer}>
        Forhåndsskrevne demosvar · Ingen KI-tilkobling
      </small>
    </div>
  );
}

export function DemoKnowledgeWorkspace({
  state,
  dispatch,
}: {
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
}) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [folder, setFolder] = useState("Knowledge Training");
  const [instructions, setInstructions] = useState(state.instructions);
  const [saved, setSaved] = useState(false);
  const [compared, setCompared] = useState(false);
  if (sourcesOpen)
    return (
      <div className={s.sourcesPage}>
        <button className={s.returnLink} onClick={() => setSourcesOpen(false)}>
          <ArrowLeft size={14} />
          Tilbake til kunnskapstrening
        </button>
        <DemoKnowledge state={state} dispatch={dispatch} />
      </div>
    );
  return (
    <div className={s.knowledgeWorkspace}>
      <aside className={s.datasetRail}>
        <span className={s.sectionLabel}>KUNNSKAP</span>
        <h4>Knowledge</h4>
        <button className={s.returnLink} onClick={() => setSourcesOpen(true)}>
          + Dataset …
        </button>
        {["Knowledge Training", "General"].map((name) => (
          <button
            className={s.dataset}
            key={name}
            aria-pressed={folder === name}
            onClick={() => setFolder(name)}
          >
            <Folder size={16} />
            {name}
          </button>
        ))}
      </aside>
      <div className={s.trainingPanel}>
        <span className={s.sectionLabel}>PLAYGROUND</span>
        <h3>Kunnskapstrening</h3>
        <p>
          Konfigurer kontekst og test widgeten.{" "}
          <button
            className={s.inlineButton}
            onClick={() => setSourcesOpen(true)}
          >
            Administrer kilder
          </button>
        </p>
        <div className={s.trainingCard}>
          <strong>
            <i className={s.readyDot} />
            Indeks klar
          </strong>
          <small>
            {state.sources.filter((source) => source.enabled).length} aktive
            kilder · {folder}
          </small>
        </div>
        <div className={s.trainingCard}>
          <div className={s.panelTitle}>
            <strong>Sammenlign AI-modeller</strong>
            <button
              className={s.secondaryButton}
              onClick={() => setCompared(!compared)}
            >
              {compared ? "Lukk" : "Sammenlign"}
            </button>
          </div>
          {compared && (
            <p>
              Dette er en lokal demo. Modellvalg endrer ikke svarene her; ingen
              modell blir kontaktet.
            </p>
          )}
        </div>
        <label className={s.trainingCard}>
          <span className={s.sectionLabel}>MODELL</span>
          <select
            aria-label="Demomodell"
            value={state.model}
            onChange={(e) =>
              dispatch({
                type: "model",
                model: e.target.value as DemoState["model"],
              })
            }
          >
            <option>GPT-4o mini</option>
            <option>GPT-4o</option>
          </select>
          <small>Modellvalg er illustrativt i denne demoen.</small>
        </label>
        <form
          className={s.trainingCard}
          onSubmit={(e) => {
            e.preventDefault();
            dispatch({ type: "instructions", text: instructions });
            setSaved(true);
          }}
        >
          <label>
            <span className={s.sectionLabel}>INSTRUKSJONER (SYSTEMPROMPT)</span>
            <textarea
              aria-label="Demoinstruksjoner"
              maxLength={1200}
              value={instructions}
              onChange={(e) => {
                setInstructions(e.target.value);
                setSaved(false);
              }}
              rows={6}
            />
          </label>
          <button className={s.secondaryButton} type="submit">
            {saved ? "Utkast lagret lokalt" : "Lagre utkast"}
          </button>
        </form>
      </div>
      <div className={s.previewCanvas}>
        <div className={s.previewHeading}>
          <span className={s.sectionLabel}>FORHÅNDSVISNING</span>
          <strong>Live widget</strong>
        </div>
        <LiveDemoWidget state={state} />
      </div>
    </div>
  );
}

export function DemoWidgetSettings({
  state,
  dispatch,
}: {
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
}) {
  const [welcome, setWelcome] = useState(state.welcome);
  const [saved, setSaved] = useState(false);
  return (
    <div className={s.customization}>
      <div className={s.trainingPanel}>
        <span className={s.sectionLabel}>TILPASNING</span>
        <h3>Widget-tilpasning</h3>
        <p>Samme uttrykk. Deres måte å si det på.</p>
        <form
          className={s.editor}
          onSubmit={(e) => {
            e.preventDefault();
            dispatch({ type: "widget", welcome });
            setSaved(true);
          }}
        >
          <label>
            Velkomstmelding
            <textarea
              required
              maxLength={300}
              rows={5}
              value={welcome}
              onChange={(e) => {
                setWelcome(e.target.value);
                setSaved(false);
              }}
            />
          </label>
          <button className={s.primaryButton}>
            {saved ? "Lagret i demoen" : "Lagre widget"}
          </button>
        </form>
        <p className={s.localNote}>
          Forhåndsvisningen oppdateres mens du skriver.
        </p>
      </div>
      <div className={s.previewCanvas}>
        <LiveDemoWidget state={state} welcome={welcome} />
      </div>
    </div>
  );
}

export function DemoIntegrations({
  state,
  dispatch,
}: {
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
}) {
  const connected = state.integrations;
  return (
    <div className={s.featurePage}>
      <div className={s.featureHeading}>
        <div>
          <span className={s.sectionLabel}>TILPASNING</span>
          <h3>Integrasjoner</h3>
          <p>Prøv oppsettet. Ingen eksterne tjenester kobles til.</p>
        </div>
      </div>
      <div className={s.integrationList}>
        {["Nettside", "Shopify", "WordPress"].map((name) => (
          <div className={s.trainingCard} key={name}>
            <strong>{name}</strong>
            <small>
              {connected.includes(name)
                ? "Koblet til i demoen"
                : "Legg Agenci til på nettsiden"}
            </small>
            <button
              className={s.secondaryButton}
              onClick={() => dispatch({ type: "integration", name })}
            >
              {connected.includes(name) ? (
                <>
                  <Check size={13} />
                  Koble fra demo
                </>
              ) : (
                "Prøv tilkobling"
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DemoVoice({
  state,
  dispatch,
}: {
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
}) {
  const [preview, setPreview] = useState(false);
  return (
    <div className={s.featurePage}>
      <div className={s.featureHeading}>
        <div>
          <span className={s.sectionLabel}>TILPASNING</span>
          <h3>Stemmeassistent</h3>
          <p>Et eksempel på oppsett for tale inn og ut.</p>
        </div>
      </div>
      <div className={s.voiceSetup}>
        <Mic size={32} />
        <h4>
          {state.voiceConnected
            ? "Demostemmen er klar"
            : "Ingen stemme koblet til"}
        </h4>
        <p>
          Ingen mikrofon, telefonsamtale eller ekstern tilkobling blir startet.
        </p>
        <button
          className={s.primaryButton}
          onClick={() =>
            dispatch({ type: "voice", connected: !state.voiceConnected })
          }
        >
          {state.voiceConnected ? "Koble fra demo" : "Prøv demooppsett"}
        </button>
        {state.voiceConnected && (
          <button
            className={s.secondaryButton}
            onClick={() => setPreview(!preview)}
          >
            {preview ? "Skjul eksempel" : "Se eksempel på samtale"}
          </button>
        )}
        {state.voiceConnected && preview && (
          <div className={s.trainingCard}>
            <small>Eksempeltranskripsjon</small>
            <p>Kunde: Når stenger dere?</p>
            <p>Agenci: Vi holder åpent til klokken 17 på hverdager.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function DemoBilling() {
  const [tab, setTab] = useState("plan");
  return (
    <div className={s.featurePage}>
      <div className={s.featureHeading}>
        <div>
          <span className={s.sectionLabel}>KONTO</span>
          <h3>Plan og faktura</h3>
          <p>Illustrativ kontovisning. Ingen betalinger kan gjøres her.</p>
        </div>
      </div>
      <div className={s.billingTabs}>
        <button aria-pressed={tab === "plan"} onClick={() => setTab("plan")}>
          Abonnement
        </button>
        <button
          aria-pressed={tab === "invoices"}
          onClick={() => setTab("invoices")}
        >
          Fakturaer
        </button>
      </div>
      <div className={s.trainingCard}>
        {tab === "plan" ? (
          <>
            <h4>Demoarbeidsområde</h4>
            <p>
              Utforsk Agenci med eksempeldata. Denne visningen har ingen
              tilknyttet betalingsmåte eller aktivt abonnement.
            </p>
          </>
        ) : (
          <>
            <h4>Ingen fakturaer</h4>
            <p>Fakturaene dine vil vises her i et ekte arbeidsområde.</p>
          </>
        )}
      </div>
    </div>
  );
}

export function DemoAgents({
  state,
  dispatch,
}: {
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
}) {
  return <DemoSettings state={state} dispatch={dispatch} />;
}
