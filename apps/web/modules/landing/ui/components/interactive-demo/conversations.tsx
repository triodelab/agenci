import { ArrowLeft, Check, Send, Users } from "lucide-react";
import { useEffect, useRef, useState, type Dispatch } from "react";
import {
  statusLabels,
  type ConversationStatus,
  type DemoAction,
  type DemoConversation,
  type DemoState,
} from "./demo-state";
import s from "./interactive-demo.module.css";

function ConversationDetail({
  conversation: c,
  dispatch,
  back,
}: {
  conversation: DemoConversation;
  dispatch: Dispatch<DemoAction>;
  back: () => void;
}) {
  const [draft, setDraft] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const messages = messagesRef.current;
    if (messages) messages.scrollTop = messages.scrollHeight;
  }, [c.messages.length]);
  return (
    <div className={s.conversationDetail}>
      <header className={s.conversationHeader}>
        <button
          className={s.backButton}
          onClick={back}
          aria-label="Til samtalelisten"
        >
          <ArrowLeft size={18} />
        </button>
        <span className={s.avatar}>{c.name.slice(0, 1)}</span>
        <div>
          <strong>{c.name}</strong>
          <small>{c.topic}</small>
        </div>
        <span className={s.status}>{statusLabels[c.status]}</span>
      </header>
      <div
        ref={messagesRef}
        className={s.messages}
        aria-label={`Samtale med ${c.name}`}
        tabIndex={0}
      >
        <p className={s.dateLabel}>I dag · Eksempelsamtale</p>
        {c.messages.map((message, index) => (
          <div
            key={`${index}-${message.sender}`}
            className={`${s.message} ${message.sender === "customer" ? s.customerMessage : s.agentMessage}`}
          >
            <small>
              {message.sender === "customer"
                ? c.name
                : message.sender === "maria"
                  ? "Maria · deg"
                  : "Agenci"}
            </small>
            <p>{message.text}</p>
          </div>
        ))}
        {c.id === "booking" && (
          <div className={s.booking}>
            <small>
              {c.booking
                ? `Valgt demotid: fredag ${c.booking}`
                : "Prøv en ledig demotid på fredag"}
            </small>
            <div>
              {["10.30", "13.00", "14.30"].map((slot) => (
                <button
                  key={slot}
                  disabled={!!c.booking}
                  aria-pressed={c.booking === slot}
                  onClick={() => dispatch({ type: "book", id: c.id, slot })}
                >
                  {c.booking === slot && <Check size={13} />}
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className={s.conversationActions}>
        <button
          disabled={c.status === "team"}
          onClick={() => dispatch({ type: "status", id: c.id, status: "team" })}
        >
          <Users size={14} />
          {c.status === "team" ? "Tildelt Maria" : "Ta over samtalen"}
        </button>
        <button
          onClick={() =>
            dispatch({
              type: "status",
              id: c.id,
              status: c.status === "resolved" ? "team" : "resolved",
            })
          }
        >
          <Check size={14} />
          {c.status === "resolved" ? "Åpne igjen" : "Marker som løst"}
        </button>
      </div>
      <form
        className={s.composer}
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          dispatch({ type: "reply", id: c.id, text: draft });
          setDraft("");
        }}
      >
        <input
          aria-label={`Svar til ${c.name}`}
          placeholder="Skriv et svar som Maria …"
          value={draft}
          maxLength={600}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          className={s.sendButton}
          type="submit"
          disabled={!draft.trim()}
          aria-label="Send demosvar"
        >
          <Send size={16} />
        </button>
      </form>
      <small className={s.localNote}>
        Svar vises bare her. Ingenting blir sendt.
      </small>
    </div>
  );
}

export function DemoConversations({
  state,
  dispatch,
  query,
  setQuery,
  initialFilter,
}: {
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
  query: string;
  setQuery: (query: string) => void;
  initialFilter: ConversationStatus | "all";
}) {
  const [filter, setFilter] = useState(initialFilter);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOnMobile, setDetailOnMobile] = useState(false);
  const filtered = state.conversations.filter(
    (c) =>
      (filter === "all" || c.status === filter) &&
      `${c.name} ${c.topic} ${c.messages.map((m) => m.text).join(" ")}`
        .toLocaleLowerCase("nb")
        .includes(query.trim().toLocaleLowerCase("nb")),
  );
  const selected =
    state.conversations.find((c) => c.id === selectedId) ?? filtered[0];
  return (
    <div className={`${s.inbox} ${detailOnMobile ? s.mobileDetailOpen : ""}`}>
      <div className={s.conversationList}>
        <h3>Chat logs</h3>
        <small>Samtaler</small>
        <input
          type="search"
          aria-label="Søk i samtalelisten"
          placeholder="Søk etter navn eller spørsmål"
          value={query}
          maxLength={100}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedId(null);
          }}
        />
        <select
          aria-label="Filtrer samtaler"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as typeof filter);
            setSelectedId(null);
          }}
        >
          <option value="all">Alle samtaler</option>
          <option value="agenci">Besvart av Agenci</option>
          <option value="team">Til teamet</option>
          <option value="resolved">Løst</option>
        </select>
        <div className={s.conversationRows}>
          {filtered.map((c) => (
            <button
              key={c.id}
              className={s.conversationRow}
              aria-pressed={selected?.id === c.id}
              onClick={() => {
                setSelectedId(c.id);
                setDetailOnMobile(true);
              }}
            >
              <span>
                <strong>{c.name}</strong>
                <small>{c.time}</small>
              </span>
              <span>{c.topic}</span>
              <small>{statusLabels[c.status]}</small>
            </button>
          ))}
        </div>
        {!filtered.length && (
          <p className={s.empty}>
            Ingen samtaler funnet. Prøv et annet søk eller filter.
          </p>
        )}
        <small className={s.localNote}>
          Et utvalg på fire eksempelsamtaler
        </small>
      </div>
      {selected && (filtered.length > 0 || detailOnMobile) ? (
        <>
          <ConversationDetail
            key={selected.id}
            conversation={selected}
            dispatch={dispatch}
            back={() => setDetailOnMobile(false)}
          />
          <aside className={s.customerRail}>
            <details open>
              <summary>STATUS</summary>
              <small>Status</small>
              <strong>{statusLabels[selected.status]}</strong>
              <small>Tildelt</small>
              <strong>{selected.status === "team" ? "Maria" : "Agenci"}</strong>
            </details>
            <details open>
              <summary>KUNDE</summary>
              <small>Navn</small>
              <strong>{selected.name}</strong>
              <small>E-post</small>
              <strong>{selected.name.toLowerCase()}@example.com</strong>
              <small>Telefon</small>
              <strong>Ikke oppgitt</strong>
            </details>
            <details open>
              <summary>SAMTALE</summary>
              <small>Emne</small>
              <strong>{selected.topic}</strong>
              <small>Språk</small>
              <strong>Norsk</strong>
            </details>
            <details>
              <summary>TEKNISK</summary>
              <small>Datakilde</small>
              <strong>Lokalt eksempeldatasett</strong>
            </details>
          </aside>
        </>
      ) : (
        <div className={s.empty}>Velg en samtale for å se innholdet.</div>
      )}
    </div>
  );
}
