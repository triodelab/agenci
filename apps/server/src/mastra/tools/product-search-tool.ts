import prisma from "@agenci/db";
import { createTool } from "@mastra/core/tools";
import { ModelRouterEmbeddingModel } from "@mastra/core/llm";
import { embed } from "ai";
import { z } from "zod";
import { pgVector } from "../vector";
import { GRAPH_RAG_EMBEDDING_MODEL, GRAPH_RAG_INDEX } from "../rag-config";

const embedder = new ModelRouterEmbeddingModel(GRAPH_RAG_EMBEDDING_MODEL);

/**
 * Products work in two steps so the cards match what the customer asked:
 *   1. productSearchTool finds candidates (wide net, synonyms welcome);
 *   2. the agent judges them (colour, type, the exact product named) and
 *      calls showProductsTool with only the ones that fit — those become
 *      the cards under its reply.
 */
export const PRODUCT_SEARCH_TOOL = "productSearchTool";
export const PRODUCT_SHOW_TOOL = "showProductsTool";

const CANDIDATES = 15;

/**
 * Norwegian shoppers, English product names ("lyse" vs "Ash Blond"): each
 * hit adds the words shops actually use. `match` terms are also searched
 * literally in product names; `hint` terms only steer the semantic search
 * (too broad to match on: every wig has "wig").
 */
const SYNONYMS: { when: RegExp; match: string[]; hint?: string }[] = [
  { when: /\blys(e|t)?\b|blond|lyst hår/i, match: ["blond", "blonde", "ash", "honey", "platinum", "light"] },
  { when: /\bmørk(e|t)?\b|svart|sort|\bbrun(e|t)?\b/i, match: ["dark", "black", "brown", "chocolate"] },
  { when: /krøll|krus|bølge|wavy|curl/i, match: ["curly", "curl", "wave", "wavy", "kinky"] },
  { when: /\brett(e)?\b|glatt|straight/i, match: ["straight", "yaki"] },
  { when: /\bkort(e)?\b/i, match: ["bob", "pixie", "short"] },
  { when: /\blang(e)?\b/i, match: ["long"] },
  { when: /parykk/i, match: [], hint: "wig lace wig glueless wig" },
  { when: /hestehale/i, match: ["ponytail"] },
  { when: /hårforleng|extension|\bbunt|bundle/i, match: ["bundle", "extension"] },
];

function expandQuery(query: string) {
  const hits = SYNONYMS.filter((s) => s.when.test(query));
  const terms = [...new Set(hits.flatMap((h) => h.match))];
  const hint = hits.map((h) => [...h.match, h.hint ?? ""].join(" ")).join(" ").trim();
  return { semantic: hint ? `${query} (${hint})` : query, terms };
}
const MIN_SCORE = 0.2;
const MAX_CARDS = 6;

export const ProductCardSchema = z.object({
  title: z.string(),
  price: z.string().nullable(),
  image: z.string().nullable(),
  url: z.string(),
  inStock: z.boolean().nullable(),
});
export type ProductCard = z.infer<typeof ProductCardSchema>;

type ProductMeta = Record<string, unknown>;

function toCard(meta: ProductMeta): ProductCard | null {
  const url = typeof meta.productUrl === "string" ? meta.productUrl : null;
  const title = typeof meta.productTitle === "string" ? meta.productTitle : null;
  if (!url || !title) return null;
  return {
    title,
    url,
    price: typeof meta.productPrice === "string" ? meta.productPrice : null,
    image: typeof meta.productImage === "string" ? meta.productImage : null,
    inStock: typeof meta.productInStock === "boolean" ? meta.productInStock : null,
  };
}

export function createProductSearchTool(agentId: string) {
  return createTool({
    id: "search-products",
    description:
      "Finn kandidater blant produktene i nettbutikken (navn, pris, lager, kategori, beskrivelse). Bruk når kunden spør etter varer, en bestemt vare, anbefalinger, pris eller lager. Viser INGENTING til kunden — velg deretter de som passer og kall showProductsTool.",
    inputSchema: z.object({
      query: z
        .string()
        .min(1)
        .describe(
          "Hva kunden leter etter, med synonymer og ordene butikken selv bruker — også engelske produktord (f.eks. «lyse parykker» → «lys blond blonde light wig parykk»; «krøllete» → «curly krøllete wave»).",
        ),
    }),
    outputSchema: z.object({
      candidates: z.array(
        z.object({
          url: z.string(),
          title: z.string(),
          price: z.string().nullable(),
          inStock: z.boolean().nullable(),
          about: z.string(),
        }),
      ),
      instruction: z.string(),
    }),
    execute: async ({ query }) => {
      const { semantic, terms } = expandQuery(query);
      const { embedding } = await embed({ model: embedder, value: semantic });
      const semanticHits = await pgVector.query({
        indexName: GRAPH_RAG_INDEX,
        queryVector: embedding,
        topK: CANDIDATES * 2,
        filter: { agentId, kind: "product" },
      });
      // Products whose name says it outright ("Curly", "Blond") always make the list.
      const named = terms.length
        ? await prisma.$queryRaw<{ metadata: ProductMeta }[]>`
            select metadata from embeddings
            where metadata->>'agentId' = ${agentId}
              and metadata->>'kind' = 'product'
              and metadata->>'productTitle' ~* ${`\\m(${terms.join("|")})`}`
        : [];
      const matches = [
        ...named.map((r) => ({ score: 1, metadata: r.metadata })),
        ...semanticHits,
      ];
      const seen = new Set<string>();
      const candidates = [];
      for (const m of matches) {
        if (m.score < MIN_SCORE) continue;
        const meta = (m.metadata ?? {}) as ProductMeta;
        const card = toCard(meta);
        if (!card || seen.has(card.url)) continue;
        seen.add(card.url);
        candidates.push({
          url: card.url,
          title: card.title,
          price: card.price,
          inStock: card.inStock,
          about: typeof meta.text === "string" ? meta.text.slice(0, 400) : "",
        });
        if (candidates.length >= CANDIDATES) break;
      }
      return {
        candidates,
        instruction:
          "Dette er kandidater, ikke svar. Et produkt skal bare med når det oppfyller ALLE kravene i spørsmålet — både type og egenskap (f.eks. «lyse parykker» = en parykk/wig OG lys). Typen: parykk = wig; bundles, ponytails og crochet er IKKE parykker. Fargen må stå i title/about: lyse = blond/blonde/ash/honey/platinum, mørke = black/dark/brown/chocolate. Er produktet mest blondt med mørk rot, er det lyst, ikke mørkt. Står ikke fargen der, ta det ikke med. Ta med ALLE som passer (høyst 6, best først), ikke bare ett. Spør kunden om ett bestemt produkt, velg akkurat det — og vis kortet for det. Kall showProductsTool med url-ene til de valgte. Passer ingen, ikke kall det, og si ærlig at du ikke fant noe som passer. Bekreft aldri egenskaper som ikke står i title/about.",
      };
    },
  });
}

export function createShowProductsTool(agentId: string) {
  return createTool({
    id: "show-products",
    description:
      "Vis produktkort (bilde, navn, pris, knapp) under svaret ditt. Bruk url-er du har fått fra productSearchTool, kun de som passer kunden.",
    inputSchema: z.object({
      urls: z.array(z.string()).min(1).max(MAX_CARDS).describe("Url-ene til produktene som skal vises, best først."),
    }),
    outputSchema: z.object({ products: z.array(ProductCardSchema), instruction: z.string() }),
    execute: async ({ urls }) => {
      const rows = await prisma.$queryRaw<{ metadata: ProductMeta }[]>`
        select metadata from embeddings
        where metadata->>'agentId' = ${agentId}
          and metadata->>'kind' = 'product'
          and metadata->>'productUrl' = any(${urls})`;
      const byUrl = new Map<string, ProductCard>();
      for (const r of rows) {
        const card = toCard(r.metadata);
        if (card) byUrl.set(card.url, card);
      }
      // Keep the agent's order; ignore anything it made up.
      const products = urls.map((u) => byUrl.get(u)).filter((p): p is ProductCard => !!p);
      return {
        products,
        instruction:
          "Kortene vises rett under svaret ditt, hver med en «Se produkt»-knapp. IKKE list produktene i teksten, og ikke skriv «klikk på lenkene» eller «se mer her»: skriv 1–2 korte setninger, gjerne med ett konkret tips.",
      };
    },
  });
}

/** Cards shown in a live `generate()` result. */
export function productsFromSteps(steps: unknown): ProductCard[] {
  if (!Array.isArray(steps)) return [];
  const parts = steps.flatMap((step) =>
    ((step as { toolResults?: unknown[] }).toolResults ?? []).map((r) => {
      const tr = r as { payload?: { toolName?: string; result?: unknown }; toolName?: string; result?: unknown; output?: unknown };
      return {
        toolInvocation: {
          toolName: tr.payload?.toolName ?? tr.toolName,
          state: "result",
          result: tr.payload?.result ?? tr.result ?? tr.output,
        },
      };
    }),
  );
  return productsFromParts(parts);
}

/**
 * Cards from a stored assistant message's parts (the tool results Mastra
 * keeps in memory), so cards come back after a reload too.
 */
export function productsFromParts(parts: unknown): ProductCard[] {
  if (!Array.isArray(parts)) return [];
  const out: ProductCard[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    const inv = (part as { toolInvocation?: { toolName?: string; state?: string; result?: unknown } })
      ?.toolInvocation;
    if (inv?.toolName !== PRODUCT_SHOW_TOOL || inv.state !== "result") continue;
    const parsed = z.object({ products: z.array(ProductCardSchema) }).safeParse(inv.result);
    for (const p of parsed.success ? parsed.data.products : []) {
      if (seen.has(p.url)) continue;
      seen.add(p.url);
      out.push(p);
    }
  }
  return out.slice(0, MAX_CARDS);
}

const GENERIC_LINK = /^(se (mer|produkt(et)?|her)|les mer|her|klikk her|se mer her|kjøp|kjøp her)$/i;

/**
 * Images never belong in a chat bubble, and links to products already shown
 * as cards would only repeat them: a descriptive link keeps its text, a
 * generic one ("Se mer") goes.
 */
export function tidyReply(text: string, products: { url: string; title?: string }[]) {
  const shown = new Set(products.map((p) => p.url.replace(/\/$/, "")));
  const titles = products
    .map((p) => p.title?.toLowerCase().trim())
    .filter((t): t is string => !!t && t.length > 3);
  // The cards already list the products: drop list items that only repeat one.
  if (titles.length > 0) {
    const lines = text.split("\n");
    const kept = lines.filter((line) => {
      const plain = line
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/[*_`"«»]/g, "")
        .toLowerCase();
      const title = titles.find((t) => plain.includes(t));
      if (!title) return true;
      // A list item, or a line that is little more than "<name> – <price>".
      const rest = plain.replace(title, "").replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim();
      return !(/^\s*(?:[-*•]|\d+[.)])\s+/.test(line) || rest.length < 28);
    });
    if (kept.length < lines.length) {
      text = kept
        .join("\n")
        .replace(/:\s*(\n|$)/g, ".$1");
    }
  }
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (all, label: string, href: string) =>
      shown.has(href.replace(/\/$/, "")) ? (GENERIC_LINK.test(label.trim()) ? "" : label) : all,
    )
    .replace(/\(\s*\)|[ \t]+([.,!?])/g, "$1")
    .replace(/\.(\s*\.)+/g, ".")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
