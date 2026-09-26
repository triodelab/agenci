/**
 * Demo data for the agent overview — lets us see the tiles with realistic
 * volume before real traffic exists. Deterministic (seeded) so the page looks
 * the same on every load. Only used when the "Demodata" toggle is on; ids are
 * prefixed `demo-` so nothing links to a real conversation.
 */
import type { AgentDocument } from "@/features/agents/queries/agents-queries";
import type { ConversationSummary } from "@/features/conversations/queries/conversations-queries";

export const DEMO_PREFIX = "demo-";

export const isDemoId = (id: string) => id.startsWith(DEMO_PREFIX);

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES = [
  "Ingrid Solberg",
  "Magnus Haugen",
  "Sara Nilsen",
  "Jonas Berg",
  "Emma Larsen",
  "Henrik Dahl",
  "Nora Johansen",
  "Oskar Lie",
  "Ida Kristiansen",
  "Elias Moen",
];

const QUESTIONS = [
  "Hva er åpningstidene deres i helgen?",
  "Kan jeg endre bestillingen min?",
  "Hvor lang er leveringstiden til Bergen?",
  "Jeg har ikke fått ordrebekreftelse",
  "Tilbyr dere studentrabatt?",
  "Hvordan returnerer jeg en vare?",
  "Kan jeg betale med Vipps?",
  "Produktet kom skadet, hva gjør jeg?",
  "Har dere denne i størrelse M?",
  "Hvordan bytter jeg passord?",
];

const ANSWERS = [
  "Vi har åpent 10–16 på lørdager og stengt på søndager.",
  "Det kan du! Gå til Mine ordre og velg «Endre».",
  "Normalt 2–3 virkedager til Bergen.",
  "Jeg setter deg over til en av mine kolleger.",
  "Ja, studenter får 10 % med gyldig studentbevis.",
];

const LANGS = ["nb", "nb", "nb", "nb", "nn", "en-US", "sv"];

/** Chat volume by hour — busy mid-morning, after lunch and in the evening. */
const HOUR_WEIGHT = [
  0.2, 0.1, 0.05, 0.05, 0.05, 0.1, 0.3, 0.8, 1.4, 2.2, 2.6, 2.3, 1.8, 2.1, 2.4,
  2.0, 1.6, 1.3, 1.5, 2.0, 2.2, 1.7, 1.0, 0.5,
];

function pickHour(r: () => number) {
  const total = HOUR_WEIGHT.reduce((s, w) => s + w, 0);
  let x = r() * total;
  for (let h = 0; h < 24; h++) {
    x -= HOUR_WEIGHT[h] ?? 0;
    if (x <= 0) return h;
  }
  return 12;
}

export function demoConversations(now = new Date()): ConversationSummary[] {
  const r = rng(42);
  const out: ConversationSummary[] = [];
  const DAY = 86_400_000;
  for (let dayAgo = 44; dayAgo >= 0; dayAgo--) {
    // Slow growth over time, quieter weekends.
    const date = new Date(now.getTime() - dayAgo * DAY);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const base = 3 + (44 - dayAgo) * 0.12;
    const count = Math.round((base + r() * 3) * (weekend ? 0.55 : 1));
    for (let i = 0; i < count; i++) {
      const d = new Date(date);
      d.setHours(pickHour(r), Math.floor(r() * 60), 0, 0);
      if (d.getTime() > now.getTime()) continue;
      const anonymous = r() < 0.45;
      const name = anonymous
        ? null
        : (NAMES[Math.floor(r() * NAMES.length)] ?? null);
      const age = now.getTime() - d.getTime();
      const roll = r();
      const status: ConversationSummary["status"] =
        age > 2 * DAY
          ? roll < 0.82
            ? "resolved"
            : roll < 0.93
              ? "unresolved"
              : "escalated"
          : roll < 0.4
            ? "resolved"
            : roll < 0.85
              ? "unresolved"
              : "escalated";
      const messageCount = 2 + Math.floor(r() * 9);
      const updated = new Date(d.getTime() + messageCount * 45_000);
      const q = QUESTIONS[Math.floor(r() * QUESTIONS.length)] ?? "Hei";
      const lang = LANGS[Math.floor(r() * LANGS.length)] ?? "nb";
      out.push({
        threadId: `${DEMO_PREFIX}${out.length}`,
        status,
        contact: {
          contactSessionId: `${DEMO_PREFIX}s${out.length}`,
          name,
          email: name
            ? `${name.split(" ")[0]?.toLowerCase()}@eksempel.no`
            : null,
          anonymous,
          language: lang,
          timezone: "Europe/Oslo",
          userAgent: null,
          referrer: null,
          currentUrl: null,
          expiresAt: new Date(d.getTime() + DAY).toISOString(),
        },
        firstMessage: q,
        lastMessage: {
          id: `${DEMO_PREFIX}m${out.length}`,
          role: "assistant",
          text: ANSWERS[Math.floor(r() * ANSWERS.length)] ?? "",
          createdAt: updated.toISOString(),
        },
        messageCount,
        createdAt: d.toISOString(),
        updatedAt: updated.toISOString(),
      });
    }
  }
  return out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function demoDocuments(): AgentDocument[] {
  const pages = [
    "eksempel.no",
    "eksempel.no/om-oss",
    "eksempel.no/levering",
    "eksempel.no/retur",
    "eksempel.no/kontakt",
    "eksempel.no/faq",
    "eksempel.no/priser",
    "eksempel.no/vilkar",
    "eksempel.no/personvern",
    "eksempel.no/butikker",
    "eksempel.no/karriere",
    "eksempel.no/blogg",
    "eksempel.no/kampanjer",
    "eksempel.no/studentrabatt",
  ];
  const docs: AgentDocument[] = pages.map((p, i) => ({
    id: `${DEMO_PREFIX}w${i}`,
    type: "WEBPAGE",
    status: i === 13 ? "INDEXING" : "COMPLETED",
    documentName: null,
    webpageUrl: `https://${p}`,
  }));
  for (const [i, name] of [
    "Returpolicy.pdf",
    "Prisliste-2026.pdf",
    "Produktkatalog.pdf",
    "Leveringsvilkår.docx",
    "Garantibetingelser.pdf",
    "Gammel-prisliste.xlsx",
  ].entries()) {
    docs.push({
      id: `${DEMO_PREFIX}d${i}`,
      type: "DOCUMENT",
      status: i === 5 ? "FAILED" : "COMPLETED",
      documentName: name,
    });
  }
  docs.push(
    {
      id: `${DEMO_PREFIX}m0`,
      type: "MEDIA",
      status: "COMPLETED",
      documentName: null,
      mediaName: "Butikkvideo.mp4",
    },
    {
      id: `${DEMO_PREFIX}m1`,
      type: "MEDIA",
      status: "COMPLETED",
      documentName: null,
      mediaName: "Kundeservice-intro.mp3",
    },
  );
  return docs;
}

// ─── Demo conversations as a live-ish store ─────────────────────────────────
// Generated once per page load; status changes made in the demo are kept in
// memory so the inbox, the thread and the overview agree until reload.

const FOLLOW_UPS = [
  "Takk! Og hva med retur etter 30 dager?",
  "Ok, kan jeg få snakke med et menneske?",
  "Supert, det var det jeg lurte på.",
  "Gjelder det også i nettbutikken?",
  "Hvor finner jeg ordrenummeret?",
];

const REPLIES = [
  "Retur er gratis innen 30 dager. Etter det kan vi se på det fra sak til sak.",
  "Selvfølgelig — jeg har gitt beskjed til teamet, de tar kontakt så snart som mulig.",
  "Så bra! Er det noe annet jeg kan hjelpe deg med?",
  "Ja, det gjelder både i butikk og i nettbutikken.",
  "Ordrenummeret står øverst i bekreftelsen du fikk på e-post.",
];

let cachedList: ConversationSummary[] | null = null;
const statusOverrides = new Map<string, ConversationSummary["status"]>();

export function demoConversationList(): ConversationSummary[] {
  cachedList ??= demoConversations();
  return cachedList.map((c) => {
    const status = statusOverrides.get(c.threadId);
    return status ? { ...c, status } : c;
  });
}

export function setDemoConversationStatus(
  threadId: string,
  status: ConversationSummary["status"],
) {
  statusOverrides.set(threadId, status);
}

type DemoMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
};

export function demoConversationDetail(
  threadId: string,
  agentName: string,
):
  | (ConversationSummary & { agentName: string; messages: DemoMessage[] })
  | null {
  const c = demoConversationList().find((x) => x.threadId === threadId);
  if (!c) return null;
  const r = rng(Number(threadId.replace(/\D/g, "")) + 7);
  const start = new Date(c.createdAt).getTime();
  const step = Math.max(
    (new Date(c.updatedAt).getTime() - start) / Math.max(c.messageCount - 1, 1),
    20_000,
  );
  const messages: DemoMessage[] = [];
  for (let i = 0; i < c.messageCount; i++) {
    const role = i % 2 === 0 ? "user" : "assistant";
    const pick = (list: string[]) => list[Math.floor(r() * list.length)] ?? "";
    const text =
      i === 0
        ? (c.firstMessage ?? "Hei")
        : i === c.messageCount - 1 && role === "assistant" && c.lastMessage
          ? c.lastMessage.text
          : role === "assistant"
            ? i === 1
              ? pick(ANSWERS)
              : pick(REPLIES)
            : pick(FOLLOW_UPS);
    messages.push({
      id: `${threadId}-m${i}`,
      role,
      text,
      createdAt: new Date(start + i * step).toISOString(),
    });
  }
  return { ...c, agentName, messages };
}

// ─── Demo knowledge (knowledge base page) ───────────────────────────────────

const TOPICS: Record<string, string[]> = {
  "": [
    "Om oss",
    "Våre tjenester",
    "Kontakt kundeservice",
    "Åpningstider",
    "Nyheter",
  ],
  "om-oss": ["Historien vår", "Verdiene våre", "Teamet", "Bærekraft"],
  levering: [
    "Leveringstid",
    "Fraktpriser",
    "Levering til Svalbard",
    "Hente i butikk",
    "Sporing av pakke",
  ],
  retur: [
    "Returfrist 30 dager",
    "Slik returnerer du",
    "Refusjon",
    "Bytte av vare",
    "Skadet vare",
  ],
  kontakt: ["Telefon og e-post", "Chat", "Adresse"],
  faq: [
    "Betaling med Vipps",
    "Glemt passord",
    "Endre bestilling",
    "Gavekort",
    "Kundeklubb",
    "Faktura",
  ],
  priser: ["Prisliste", "Rabatter", "Prisgaranti"],
  vilkar: ["Kjøpsvilkår", "Angrerett", "Reklamasjon"],
  personvern: ["Informasjonskapsler", "Dine rettigheter", "Lagring av data"],
  butikker: ["Oslo sentrum", "Bergen", "Trondheim", "Stavanger"],
  karriere: ["Ledige stillinger", "Livet hos oss"],
  blogg: ["Sesongens nyheter", "Stellråd", "Guide til riktig størrelse"],
  kampanjer: ["Black Week", "Sommersalg"],
};

const DOC_TOPICS: Record<string, string[]> = {
  "Returpolicy.pdf": [
    "Returfrist",
    "Tilstand ved retur",
    "Returlapp",
    "Unntak fra retur",
  ],
  "Prisliste-2026.pdf": [
    "Standardpriser",
    "Tilleggstjenester",
    "Bedriftsavtaler",
    "Frakt",
    "Montering",
  ],
  "Produktkatalog.pdf": [
    "Sofaer",
    "Bord",
    "Stoler",
    "Belysning",
    "Tekstiler",
    "Oppbevaring",
    "Utemøbler",
    "Materialer",
  ],
  "Leveringsvilkår.docx": ["Leveringsområder", "Bæring inn", "Forsinkelser"],
  "Garantibetingelser.pdf": ["Garantitid", "Hva dekkes", "Slik melder du feil"],
};

const MEDIA_TOPICS: Record<string, string[]> = {
  "Butikkvideo.mp4": ["Omvisning i butikken", "Slik finner du oss"],
  "Kundeservice-intro.mp3": ["Velkommen", "Hvordan vi hjelper deg"],
};

export function demoKnowledge() {
  const docs = demoDocuments();
  const r = rng(99);
  const created = Date.now() - 20 * 86_400_000;
  const sources = docs.map((d, i) => {
    const path = d.webpageUrl?.replace(/^https?:\/\/[^/]+\/?/, "") ?? "";
    const topics =
      d.type === "WEBPAGE"
        ? (TOPICS[path] ?? ["Innhold"])
        : d.type === "MEDIA"
          ? (MEDIA_TOPICS[d.mediaName ?? ""] ?? ["Innhold"])
          : (DOC_TOPICS[d.documentName ?? ""] ?? ["Innhold"]);
    const ready = d.status === "COMPLETED";
    const chunks = ready
      ? topics.flatMap((t, ti) =>
          Array.from({ length: 1 + Math.floor(r() * 3) }, (_, k) => ({
            index: ti * 3 + k,
            title: k === 0 ? t : `${t} (del ${k + 1})`,
            excerpt: `${t}: her står det agenten vet om ${t.toLowerCase()} — brukt når kunder spør om dette.`,
            length: 300 + Math.floor(r() * 900),
          })),
        )
      : [];
    const at = new Date(created + i * 36 * 3_600_000).toISOString();
    return {
      id: d.id,
      type: d.type,
      status: d.status,
      name:
        d.webpageUrl?.replace(/^https?:\/\//, "") ??
        d.documentName ??
        d.mediaName ??
        "Uten navn",
      url: d.webpageUrl ?? null,
      words: ready
        ? chunks.reduce((s, c) => s + Math.round(c.length / 6), 0)
        : 0,
      chunkCount: chunks.length,
      chunks,
      createdAt: at,
      updatedAt: at,
    };
  });
  return {
    sources,
    totals: {
      sources: sources.length,
      chunks: sources.reduce((s, x) => s + x.chunkCount, 0),
      words: sources.reduce((s, x) => s + x.words, 0),
    },
  };
}
