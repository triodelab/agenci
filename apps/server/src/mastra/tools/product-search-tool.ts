import { createTool } from "@mastra/core/tools";
import { ModelRouterEmbeddingModel } from "@mastra/core/llm";
import { embed } from "ai";
import { z } from "zod";
import { pgVector } from "../vector";
import { GRAPH_RAG_EMBEDDING_MODEL, GRAPH_RAG_INDEX } from "../rag-config";

const embedder = new ModelRouterEmbeddingModel(GRAPH_RAG_EMBEDDING_MODEL);

/** Products scoring below this are not shown as cards. */
const MIN_SCORE = 0.25;
const MAX_PRODUCTS = 6;
/** Only cards close to the best match — no filler from weak matches. */
const MAX_GAP_FROM_BEST = 0.08;

export const PRODUCT_SEARCH_TOOL = "productSearchTool";

export const ProductCardSchema = z.object({
  title: z.string(),
  price: z.string().nullable(),
  image: z.string().nullable(),
  url: z.string(),
  inStock: z.boolean().nullable(),
});
export type ProductCard = z.infer<typeof ProductCardSchema>;

/**
 * Searches the product chunks a website crawl stored (`kind: "product"`).
 * The widget shows the result as product cards under the reply.
 */
export function createProductSearchTool(agentId: string) {
  return createTool({
    id: "search-products",
    description:
      "Søk etter produkter i bedriftens nettbutikk (navn, pris, bilde, lager, lenke). Bruk når kunden spør etter varer, vil ha anbefalinger, spør hva noe koster eller om noe er på lager. Treffene vises automatisk som produktkort under svaret ditt.",
    inputSchema: z.object({
      query: z
        .string()
        .min(1)
        .describe("Hva kunden leter etter, som en naturlig setning (f.eks. «blond parykk med naturlig hårfeste»)."),
    }),
    outputSchema: z.object({
      found: z.boolean(),
      products: z.array(ProductCardSchema),
      instruction: z.string(),
    }),
    execute: async ({ query }) => {
      const { embedding } = await embed({ model: embedder, value: query });
      const matches = await pgVector.query({
        indexName: GRAPH_RAG_INDEX,
        queryVector: embedding,
        topK: MAX_PRODUCTS * 2,
        filter: { agentId, kind: "product" },
      });
      const best = Math.max(0, ...matches.map((m) => m.score));
      const cutoff = Math.max(MIN_SCORE, best - MAX_GAP_FROM_BEST);
      const seen = new Set<string>();
      const products: ProductCard[] = [];
      for (const m of matches) {
        const meta = (m.metadata ?? {}) as Record<string, unknown>;
        const url = typeof meta.productUrl === "string" ? meta.productUrl : null;
        const title = typeof meta.productTitle === "string" ? meta.productTitle : null;
        if (!url || !title || m.score < cutoff || seen.has(url)) continue;
        seen.add(url);
        products.push({
          title,
          url,
          price: typeof meta.productPrice === "string" ? meta.productPrice : null,
          image: typeof meta.productImage === "string" ? meta.productImage : null,
          inStock: typeof meta.productInStock === "boolean" ? meta.productInStock : null,
        });
        if (products.length >= MAX_PRODUCTS) break;
      }
      return {
        found: products.length > 0,
        products,
        // Next to the data, where small models actually follow it.
        instruction:
          "Bekreft bare det som står i produktene over (navn, pris, lager). Spør kunden om en egenskap som ikke står der — f.eks. lengde, størrelse, farge eller materiale — svar at du ikke ser det i produktinformasjonen, og at produktsiden eller vi kan svare på det. Kortene med bilde, navn og pris vises rett under svaret ditt: IKKE list produktene i teksten. Skriv 1–2 korte setninger (f.eks. «Her er noen blonde parykker vi har på lager.»), gjerne med ett konkret tips.",
      };
    },
  });
}

/** Product cards from a live `generate()` result's tool results. */
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
 * Product cards from a stored assistant message's parts (the tool results
 * Mastra keeps in memory), so cards come back after a reload too.
 */
export function productsFromParts(parts: unknown): ProductCard[] {
  if (!Array.isArray(parts)) return [];
  const out: ProductCard[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    const inv = (part as { toolInvocation?: { toolName?: string; state?: string; result?: unknown } })
      ?.toolInvocation;
    if (inv?.toolName !== PRODUCT_SEARCH_TOOL || inv.state !== "result") continue;
    const parsed = z.object({ products: z.array(ProductCardSchema) }).safeParse(inv.result);
    for (const p of parsed.success ? parsed.data.products : []) {
      if (seen.has(p.url)) continue;
      seen.add(p.url);
      out.push(p);
    }
  }
  return out;
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
      const plain = line.replace(/[*_`"«»]/g, "").toLowerCase();
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
