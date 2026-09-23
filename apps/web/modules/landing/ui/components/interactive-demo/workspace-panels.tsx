import {
  ArrowUpRight,
  BookOpen,
  Check,
  FileText,
  Globe,
  Plus,
} from "lucide-react";
import { useState, type Dispatch } from "react";
import type { DemoAction, DemoState, KnowledgeSource } from "./demo-state";
import s from "./interactive-demo.module.css";

function SourceEditor({
  source,
  dispatch,
  done,
}: {
  source: KnowledgeSource;
  dispatch: Dispatch<DemoAction>;
  done: () => void;
}) {
  const [title, setTitle] = useState(source.title);
  const [content, setContent] = useState(source.content);
  const [saved, setSaved] = useState(false);
  return (
    <form
      className={s.editor}
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        dispatch({
          type: "save-source",
          source: { ...source, title, content },
        });
        setSaved(true);
        done();
      }}
    >
      <div className={s.panelTitle}>
        <h4>{source.kind === "faq" ? "Spørsmål og svar" : "Kildeinnhold"}</h4>
        <BookOpen size={18} />
      </div>
      <label>
        Tittel
        <input
          required
          maxLength={80}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSaved(false);
          }}
        />
      </label>
      <label>
        Dette kan Agenci bruke i svarene
        <textarea
          required
          rows={7}
          maxLength={1200}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setSaved(false);
          }}
        />
      </label>
      <div className={s.editorFooter}>
        <small>
          {saved
            ? "Lagret i demoen"
            : "Prøv å endre teksten. Originalen påvirkes ikke."}
        </small>
        <button
          className={s.primaryButton}
          type="submit"
          disabled={!title.trim() || !content.trim()}
        >
          {saved ? <Check size={15} /> : null}Lagre i demoen
        </button>
      </div>
    </form>
  );
}

export function DemoKnowledge({
  state,
  dispatch,
}: {
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
}) {
  const [selectedId, setSelectedId] = useState("faq");
  const [newSource, setNewSource] = useState<KnowledgeSource | null>(null);
  const selected =
    newSource ??
    state.sources.find((source) => source.id === selectedId) ??
    state.sources[0];
  return (
    <div className={s.featurePage}>
      <div className={s.featureHeading}>
        <div>
          <h3>Kunnskap</h3>
          <p>
            {state.sources.filter((source) => source.enabled).length} aktive
            kilder. Deres kunnskap, samlet.
          </p>
        </div>
        <button
          className={s.primaryButton}
          disabled={!!newSource || state.sources.length >= 8}
          onClick={() =>
            setNewSource({
              id: `faq-${state.sources.length}`,
              kind: "faq",
              title: "",
              content: "",
              enabled: true,
            })
          }
        >
          <Plus size={15} />
          Legg til svar
        </button>
      </div>
      <div className={s.knowledgeGrid}>
        <div className={s.sourceList}>
          {state.sources.map((source) => {
            const Icon =
              source.kind === "web"
                ? Globe
                : source.kind === "file"
                  ? FileText
                  : BookOpen;
            return (
              <div
                className={s.sourceRow}
                key={source.id}
                data-selected={!newSource && selectedId === source.id}
              >
                <button
                  onClick={() => {
                    setSelectedId(source.id);
                    setNewSource(null);
                  }}
                >
                  <Icon size={18} />
                  <span>
                    <strong>{source.title}</strong>
                    <small>
                      {source.enabled ? "Klar til bruk" : "Satt på pause"}
                    </small>
                  </span>
                </button>
                <input
                  type="checkbox"
                  aria-label={`Bruk ${source.title}`}
                  checked={source.enabled}
                  onChange={() =>
                    dispatch({ type: "toggle-source", id: source.id })
                  }
                />
              </div>
            );
          })}
          <p className={s.localNote}>
            Velg en kilde for å lese eller redigere. Slå kilder av og på med
            avkryssingen.
          </p>
        </div>
        {selected && (
          <SourceEditor
            key={selected.id}
            source={selected}
            dispatch={dispatch}
            done={() => {
              setSelectedId(selected.id);
              setNewSource(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export function DemoTeam({
  state,
  dispatch,
  openConversations,
}: {
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
  openConversations: () => void;
}) {
  return (
    <div className={s.featurePage}>
      <div className={s.featureHeading}>
        <div>
          <h3>Teknologi. Med folk i ryggen.</h3>
          <p>Se hvem som hjelper kundene videre.</p>
        </div>
      </div>
      <div className={s.teamList}>
        <div className={s.teamRow}>
          <span className={s.avatar}>A</span>
          <div>
            <strong>Agenci</strong>
            <small>Tar de vanlige spørsmålene</small>
          </div>
          <span className={s.status}>
            {state.automatic ? "Automatiske svar på" : "Automatiske svar av"}
          </span>
        </div>
        <div className={s.teamRow}>
          <span className={s.avatar}>M</span>
          <div>
            <strong>Maria · deg</strong>
            <small>
              {state.available
                ? "Klar til å ta over"
                : "Ikke tilgjengelig akkurat nå"}
            </small>
          </div>
          <label className={s.toggle}>
            <input
              type="checkbox"
              role="switch"
              checked={state.available}
              onChange={(e) =>
                dispatch({ type: "availability", available: e.target.checked })
              }
            />
            <span>Tilgjengelig</span>
          </label>
        </div>
        <div className={s.teamRow}>
          <span className={s.avatar}>E</span>
          <div>
            <strong>Erik</strong>
            <small>Kundeservice</small>
          </div>
          <span className={s.status}>Tilbake senere</span>
        </div>
      </div>
      <button className={s.nudge} onClick={openConversations}>
        <span>
          <strong>
            {state.conversations.filter((c) => c.status === "team").length}{" "}
            demosamtaler trenger teamet
          </strong>
          <small>Åpne innboksen og prøv å svare selv.</small>
        </span>
        <ArrowUpRight size={20} className={s.chevron} />
      </button>
    </div>
  );
}

export function DemoSettings({
  state,
  dispatch,
}: {
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
}) {
  const [tone, setTone] = useState(state.tone);
  const [automatic, setAutomatic] = useState(state.automatic);
  const [saved, setSaved] = useState(false);
  return (
    <div className={s.featurePage}>
      <div className={s.featureHeading}>
        <div>
          <span className={s.sectionLabel}>KONTO</span>
          <h3>Agenter</h3>
          <p>
            Deres måte å si det på. Prøv en tone og se hvordan svaret endrer
            seg.
          </p>
        </div>
      </div>
      <div className={s.settingsGrid}>
        <form
          className={s.editor}
          onSubmit={(e) => {
            e.preventDefault();
            dispatch({ type: "settings", tone, automatic });
            setSaved(true);
          }}
        >
          <fieldset className={s.toneOptions}>
            <legend>Slik snakker vi</legend>
            {[
              { value: "warm", label: "Varm og personlig" },
              { value: "concise", label: "Kort og godt" },
            ].map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name="demo-tone"
                  value={option.value}
                  checked={tone === option.value}
                  onChange={() => {
                    setTone(option.value as typeof tone);
                    setSaved(false);
                  }}
                />
                {option.label}
              </label>
            ))}
          </fieldset>
          <label className={s.toggle}>
            <input
              type="checkbox"
              role="switch"
              checked={automatic}
              onChange={(e) => {
                setAutomatic(e.target.checked);
                setSaved(false);
              }}
            />
            <span>Automatiske svar</span>
          </label>
          <p className={s.localNote}>
            Disse innstillingene gjelder bare demoen.
          </p>
          <button className={s.primaryButton} type="submit">
            {saved && <Check size={15} />}
            {saved ? "Lagret i demoen" : "Lagre innstillinger"}
          </button>
        </form>
        <div className={s.tonePreview}>
          <span className={s.status}>Forhåndsvisning</span>
          <div className={`${s.message} ${s.customerMessage}`}>
            <small>Kunde</small>
            <p>Hvor lenge kan jeg returnere en vare?</p>
          </div>
          <div className={`${s.message} ${s.agentMessage}`} aria-live="polite">
            <small>{automatic ? "Agenci" : "Teamet"}</small>
            <p>
              {!automatic
                ? "Automatiske svar er satt på pause. Spørsmålet sendes videre til teamet i denne demoen."
                : tone === "warm"
                  ? "Hei! Du har 30 dagers åpent kjøp, så lenge varen er ubrukt. Jeg hjelper deg gjerne med å finne ut hvordan du sender den tilbake."
                  : "Du har 30 dagers åpent kjøp. Varen må være ubrukt."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
