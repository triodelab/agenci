const embedScriptSrc =
  import.meta.env.VITE_WIDGET_EMBED_SCRIPT_URL?.trim() ||
  "https://agenci-embed.vercel.app/widget.iife.js";

export const EMBED_SCRIPT_SRC = embedScriptSrc;

/**
 * Where the one embed script goes on each platform. Every platform uses the
 * same script; the steps (and Next.js' <Script>) differ. Logos are the
 * official Simple Icons marks in /public/integrations, tinted with the brand
 * colour.
 */
export const PLATFORMS = [
  {
    id: "html",
    title: "HTML",
    hint: "Egen nettside",
    logo: "html5",
    color: "#E34F26",
    file: "index.html",
    kind: "tag",
    steps: [
      "Åpne malen som ligger på alle sidene, ofte en felles footer.",
      "Lim inn koden rett før </body>.",
      "Last opp filen og åpne nettsiden.",
    ],
  },
  {
    id: "wordpress",
    title: "WordPress",
    hint: "Via WPCode eller tema",
    logo: "wordpress",
    color: "#21759B",
    file: "Footer",
    kind: "tag",
    steps: [
      "Installer den gratis utvidelsen WPCode (Plugins → Legg til ny).",
      "Gå til Code Snippets → Header & Footer og lim inn koden i «Footer».",
      "Trykk Lagre. Chatten vises på alle sider.",
    ],
  },
  {
    id: "shopify",
    title: "Shopify",
    hint: "theme.liquid",
    logo: "shopify",
    color: "#7AB55C",
    file: "layout/theme.liquid",
    kind: "tag",
    steps: [
      "Gå til Nettbutikk → Temaer → ⋯ → Rediger kode.",
      "Åpne layout/theme.liquid og lim inn koden rett før </body>.",
      "Lagre og åpne butikken.",
    ],
  },
  {
    id: "webflow",
    title: "Webflow",
    hint: "Custom code",
    logo: "webflow",
    color: "#146EF5",
    file: "Footer code",
    kind: "tag",
    steps: [
      "Åpne Site settings → Custom code.",
      "Lim inn koden i «Footer code» og trykk Save.",
      "Publiser nettstedet på nytt.",
    ],
  },
  {
    id: "wix",
    title: "Wix",
    hint: "Egendefinert kode",
    logo: "wix",
    color: "#0C6EFC",
    file: "Egendefinert kode",
    kind: "tag",
    steps: [
      "Gå til Innstillinger → Egendefinert kode → + Legg til kode.",
      "Lim inn koden, velg «Alle sider» og «Body – slutt».",
      "Bruk og publiser nettstedet.",
    ],
  },
  {
    id: "squarespace",
    title: "Squarespace",
    hint: "Code injection",
    logo: "squarespace",
    color: "#111111",
    file: "Footer",
    kind: "tag",
    steps: [
      "Gå til Innstillinger → Avansert → Code Injection.",
      "Lim inn koden i feltet «Footer».",
      "Lagre. Chatten vises på alle sider.",
    ],
  },
  {
    id: "framer",
    title: "Framer",
    hint: "Custom code",
    logo: "framer",
    color: "#0055FF",
    file: "End of <body> tag",
    kind: "tag",
    steps: [
      "Åpne Site Settings → General → Custom Code.",
      "Lim inn koden i «End of <body> tag».",
      "Publiser nettstedet.",
    ],
  },
  {
    id: "nextjs",
    title: "Next.js",
    hint: "app/layout.tsx",
    logo: "nextdotjs",
    color: "#000000",
    file: "app/layout.tsx",
    kind: "next",
    steps: [
      "Åpne rot-layouten app/layout.tsx.",
      "Legg <Script>-komponenten inne i <body>.",
      "Deploy som vanlig.",
    ],
  },
  {
    id: "react",
    title: "React",
    hint: "index.html",
    logo: "react",
    color: "#149ECA",
    file: "index.html",
    kind: "tag",
    steps: [
      "Åpne index.html (Vite) eller public/index.html (Create React App).",
      "Lim inn koden rett før </body>.",
      "Bygg og deploy appen.",
    ],
  },
] as const;

export type PlatformId = (typeof PLATFORMS)[number]["id"];

/** Deeper integrations on the roadmap (not available yet). */
export const COMING_SOON = [
  { id: "shopify-orders", name: "Shopify", category: "E-handel", what: "Agenten svarer på ordrestatus og sporing.", logo: "shopify", color: "#7AB55C" },
  { id: "hubspot", name: "HubSpot", category: "CRM", what: "Nye kontakter fra chatten havner rett i CRM.", logo: "hubspot", color: "#FF7A59" },
  { id: "slack", name: "Slack", category: "Varsler", what: "Få beskjed i Slack når en kunde trenger dere.", logo: "slack", color: "#4A154B" },
  { id: "gmail", name: "Gmail", category: "E-post", what: "Svar på e-post med samme agent og kunnskap.", logo: "gmail", color: "#EA4335" },
  { id: "google-calendar", name: "Google Kalender", category: "Booking", what: "Timer som bookes i chatten legges i kalenderen.", logo: "googlecalendar", color: "#4285F4" },
  { id: "zendesk", name: "Zendesk", category: "Support", what: "Saker agenten ikke løser blir en ticket.", logo: "zendesk", color: "#03363D" },
  { id: "stripe", name: "Stripe", category: "Betaling", what: "Svar om faktura og betaling fra ekte data.", logo: "stripe", color: "#635BFF" },
  { id: "zapier", name: "Zapier", category: "Automatisering", what: "Koble chatten til tusenvis av andre apper.", logo: "zapier", color: "#FF4F00" },
] as const;
