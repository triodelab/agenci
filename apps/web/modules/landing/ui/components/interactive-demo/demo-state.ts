export type DemoView =
  | "overview"
  | "conversations"
  | "knowledge"
  | "widget"
  | "integrations"
  | "voice"
  | "billing"
  | "agents";
export type ConversationStatus = "agenci" | "team" | "resolved";
export type DemoMessage = {
  sender: "customer" | "agenci" | "maria";
  text: string;
};
export type DemoConversation = {
  id: string;
  name: string;
  topic: string;
  time: string;
  status: ConversationStatus;
  messages: DemoMessage[];
  booking?: string;
};
export type KnowledgeSource = {
  id: string;
  title: string;
  kind: "web" | "file" | "faq";
  enabled: boolean;
  content: string;
};
export type DemoState = {
  conversations: DemoConversation[];
  sources: KnowledgeSource[];
  tone: "warm" | "concise";
  automatic: boolean;
  available: boolean;
  welcome: string;
  voiceConnected: boolean;
  integrations: string[];
  model: "GPT-4o mini" | "GPT-4o";
  instructions: string;
};

/** Entirely local, fictional data. This demo has no backend or persistence. */
export function createDemoState(): DemoState {
  return {
    tone: "warm",
    automatic: true,
    available: true,
    welcome:
      "Hei! Velkommen til Agenci. Spør meg om produkter, levering eller retur — jeg hjelper deg gjerne.",
    voiceConnected: false,
    integrations: [],
    model: "GPT-4o mini",
    instructions:
      "### Bedriftskontekst\nHjelp kunden med produkter, levering og retur.\n\n### Prioriteringer\nBruk alltid kunnskapsbasen før du svarer. La teamet ta over når du er usikker.",
    sources: [
      {
        id: "website",
        title: "Nettsiden deres",
        kind: "web",
        enabled: true,
        content:
          "Vi holder åpent mandag–fredag kl. 09–17. Levering tar vanligvis 2–4 virkedager. Vi sender ikke ut bestillinger i helgen.",
      },
      {
        id: "returns",
        title: "Returvilkår.pdf",
        kind: "file",
        enabled: true,
        content:
          "Du har 30 dagers åpent kjøp. Varen må være ubrukt. Gaver kan byttes med byttelapp. Kontakt teamet hvis kvittering eller byttelapp mangler.",
      },
      {
        id: "faq",
        title: "Vanlige spørsmål",
        kind: "faq",
        enabled: true,
        content:
          "Leverer dere på lørdager?\nVi sender bestillinger på hverdager. Transportørens leveringstid kan variere. Teamet kan hjelpe deg med å følge pakken.",
      },
    ],
    conversations: [
      {
        id: "delivery",
        name: "Emma",
        topic: "Levering i helgen",
        time: "Nå",
        status: "agenci",
        messages: [
          { sender: "customer", text: "Hei! Leverer dere også på lørdager?" },
          {
            sender: "agenci",
            text: "Hei Emma! Vi sender bestillinger på hverdager. Levering tar vanligvis 2–4 virkedager. Vil du at teamet sjekker pakken din?",
          },
        ],
      },
      {
        id: "return",
        name: "Sofie",
        topic: "Retur og bytte",
        time: "4 min",
        status: "agenci",
        messages: [
          {
            sender: "customer",
            text: "Kan jeg bytte en gave uten kvittering?",
          },
          {
            sender: "agenci",
            text: "Ja, med byttelapp. Har du den som fulgte med gaven?",
          },
          {
            sender: "customer",
            text: "Jeg finner ikke byttelappen. Kan noen hjelpe meg?",
          },
        ],
      },
      {
        id: "booking",
        name: "Arne",
        topic: "Flytte en time",
        time: "8 min",
        status: "agenci",
        messages: [
          {
            sender: "customer",
            text: "Hei, jeg må flytte timen min. Har dere noe ledig på fredag?",
          },
          {
            sender: "agenci",
            text: "Hei Arne! I denne demoen kan du prøve å velge en av de ledige tidene på fredag.",
          },
        ],
      },
      {
        id: "hours",
        name: "Jonas",
        topic: "Åpningstider",
        time: "12 min",
        status: "resolved",
        messages: [
          { sender: "customer", text: "Når stenger dere i dag?" },
          {
            sender: "agenci",
            text: "Vi holder åpent til klokken 17 på hverdager. Velkommen innom!",
          },
          { sender: "customer", text: "Supert, takk for hjelpen!" },
        ],
      },
    ],
  };
}

export type DemoAction =
  | { type: "reset" }
  | { type: "reply"; id: string; text: string }
  | { type: "status"; id: string; status: ConversationStatus }
  | { type: "book"; id: string; slot: string }
  | { type: "toggle-source"; id: string }
  | { type: "save-source"; source: KnowledgeSource }
  | { type: "settings"; tone: DemoState["tone"]; automatic: boolean }
  | { type: "widget"; welcome: string }
  | { type: "voice"; connected: boolean }
  | { type: "integration"; name: string }
  | { type: "model"; model: DemoState["model"] }
  | { type: "instructions"; text: string }
  | { type: "availability"; available: boolean };

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "reset":
      return createDemoState();
    case "reply": {
      const text = action.text.trim().slice(0, 600);
      if (!text) return state;
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.id
            ? {
                ...c,
                status: "team",
                messages: [
                  ...c.messages,
                  { sender: "maria" as const, text },
                ].slice(-30),
              }
            : c,
        ),
      };
    }
    case "status":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.id ? { ...c, status: action.status } : c,
        ),
      };
    case "book":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.id
            ? {
                ...c,
                booking: action.slot,
                status: "resolved",
                messages: [
                  ...c.messages,
                  {
                    sender: "agenci" as const,
                    text: `Demotimen er flyttet til fredag kl. ${action.slot}. Ingen ekte bestilling er gjort.`,
                  },
                ],
              }
            : c,
        ),
      };
    case "toggle-source":
      return {
        ...state,
        sources: state.sources.map((s) =>
          s.id === action.id ? { ...s, enabled: !s.enabled } : s,
        ),
      };
    case "save-source": {
      const source = {
        ...action.source,
        title: action.source.title.trim().slice(0, 80),
        content: action.source.content.trim().slice(0, 1200),
      };
      if (!source.title || !source.content) return state;
      return {
        ...state,
        sources: state.sources.some((s) => s.id === source.id)
          ? state.sources.map((s) => (s.id === source.id ? source : s))
          : [...state.sources, source],
      };
    }
    case "settings":
      return { ...state, tone: action.tone, automatic: action.automatic };
    case "widget":
      return {
        ...state,
        welcome: action.welcome.trim().slice(0, 300) || state.welcome,
      };
    case "voice":
      return { ...state, voiceConnected: action.connected };
    case "integration":
      return {
        ...state,
        integrations: state.integrations.includes(action.name)
          ? state.integrations.filter((name) => name !== action.name)
          : [...state.integrations, action.name],
      };
    case "model":
      return { ...state, model: action.model };
    case "instructions":
      return { ...state, instructions: action.text.slice(0, 1200) };
    case "availability":
      return { ...state, available: action.available };
  }
}

export const statusLabels: Record<ConversationStatus, string> = {
  agenci: "Besvart av Agenci",
  team: "Til teamet",
  resolved: "Løst",
};
