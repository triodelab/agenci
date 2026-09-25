/**
 * What an agent knows: its profile, brand, every source (documents /
 * webpages) and the embedded chunks the agent retrieves from. Chunks are read
 * from Mastra's `embeddings` vector table (metadata only).
 *
 * `ask` is a staff-facing knowledge assistant: it retrieves real chunks (the
 * same vector search the customer agent uses, or a whole source) and explains
 * them, citing the chunks it used.
 */
import prisma from "@agenci/db";
import { Agent } from "@mastra/core/agent";
import { ModelRouterEmbeddingModel } from "@mastra/core/llm";
import { ORPCError } from "@orpc/server";
import { embed } from "ai";
import {
	GRAPH_RAG_EMBEDDING_MODEL,
	GRAPH_RAG_INDEX,
} from "@/mastra/rag-config";
import { CUSTOMER_AGENT_MODEL } from "@/mastra/store";
import { pgVector } from "@/mastra/vector";
import { isInvalidOpenAIKeyError } from "@/modules/ingest/embedding";
import { privateProcedure } from "@/routers/procedures";
import {
	KnowledgeAskInputSchema,
	KnowledgeAskResponseSchema,
	KnowledgeOverviewInputSchema,
	KnowledgeOverviewResponseSchema,
	KnowledgeSourceDetailResponseSchema,
	KnowledgeSourceInputSchema,
} from "./schema";

const embedder = new ModelRouterEmbeddingModel(GRAPH_RAG_EMBEDDING_MODEL);
const SEARCH_TOP_K = 8;
const MIN_SCORE = 0.35;
const SOURCE_MAX_CHUNKS = 40;
const SOURCE_MAX_CHARS = 24_000;

const TYPE_LABEL: Record<string, string> = {
	WEBPAGE: "nettside",
	DOCUMENT: "dokument",
	MEDIA: "lyd/video",
};
const STATUS_LABEL: Record<string, string> = {
	PENDING: "venter",
	PROCESSING: "leses",
	INDEXING: "indekseres",
	COMPLETED: "klar",
	FAILED: "feilet",
};

const ASSISTANT_INSTRUCTIONS = `Du er Kunnskapsassistenten i Agenci-dashbordet. Du hjelper bedriftens ansatte å forstå hva deres AI-kundeagent vet.

Regler:
- Svar alltid på norsk bokmål, kort, tydelig og vennlig.
- Bruk KUN informasjonen i KONTEKST og KILDEOVERSIKT. Ikke finn på noe.
- Når du bruker en kunnskapsbit, henvis til den med nummeret i hakeparentes, f.eks. [1] eller [2][3].
- Blir du spurt om hva agenten vet om en kilde: oppsummer hovedtemaene i punktliste med henvisninger, og nevn hvis noe viktig ser ut til å mangle.
- Blir du spurt om noe konteksten ikke dekker: si tydelig at agenten ikke har kunnskap om dette ennå, og foreslå hvilken type kilde (nettside eller dokument) som bør legges til.
- Spørsmål om antall kilder, status eller hva som feilet besvares fra KILDEOVERSIKT.
- Bruk gjerne korte punktlister. Ingen overskrifter større enn fet tekst.`;

const MAX_CHUNKS_PER_SOURCE = 200;

type ChunkRow = { documentId: string; chunkIndex: number; text: string };

/** Strip markdown noise (images, link targets, emphasis) to readable text. */
function cleanMarkdown(md: string) {
	return md
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/<[^>]+>/g, " ")
		.replace(/^#{1,6}\s*/gm, "")
		.replace(/[*_`>|]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function truncate(text: string, max: number) {
	return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** First markdown heading of a chunk, else its first sentence. */
function chunkTitle(text: string, index: number) {
	const heading = text
		.split("\n")
		.map((l) => l.trim())
		.find((l) => /^#{1,6}\s+\S/.test(l));
	const source = heading ? cleanMarkdown(heading) : cleanMarkdown(text);
	const sentence = source.split(/(?<=[.!?])\s/)[0] ?? source;
	return truncate(sentence, 70) || `Kunnskapsbit ${index + 1}`;
}

function countWords(md: string | null) {
	if (!md) return 0;
	const clean = cleanMarkdown(md);
	return clean ? clean.split(" ").length : 0;
}

function sourceName(type: string, documentName: string | null) {
	if (!documentName) return "Uten navn";
	if (type !== "WEBPAGE") return documentName;
	try {
		const u = new URL(documentName);
		return `${u.host.replace(/^www\./, "")}${u.pathname === "/" ? "" : u.pathname}`;
	} catch {
		return documentName;
	}
}

async function loadAgent(organizationId: string, agentId: string) {
	const agent = await prisma.agent.findFirst({
		where: { id: agentId, organizationId },
		include: { widgetBrand: true },
	});
	if (!agent) {
		throw new ORPCError("NOT_FOUND", { message: "Agenten ble ikke funnet" });
	}
	return agent;
}

/** Chunks for an agent (optionally one document), ordered by position. */
async function loadChunks(
	organizationId: string,
	agentId: string,
	documentId?: string,
): Promise<ChunkRow[]> {
	try {
		const rows = await prisma.$queryRaw<ChunkRow[]>`
      SELECT metadata->>'documentId' AS "documentId",
             COALESCE((metadata->>'chunkIndex')::int, 0) AS "chunkIndex",
             COALESCE(metadata->>'text', '') AS "text"
      FROM embeddings
      WHERE metadata->>'organizationId' = ${organizationId}
        AND metadata->>'agentId' = ${agentId}
        AND (${documentId ?? null}::text IS NULL OR metadata->>'documentId' = ${documentId ?? null})
      ORDER BY 1, 2`;
		return rows;
	} catch {
		// Vector table not created yet (no ingestion has run) — no chunks.
		return [];
	}
}

/** Number of embedded chunks per document for one agent. */
async function loadChunkCounts(organizationId: string, agentId: string) {
	try {
		const rows = await prisma.$queryRaw<
			{ documentId: string; count: number }[]
		>`
      SELECT metadata->>'documentId' AS "documentId", COUNT(*)::int AS "count"
      FROM embeddings
      WHERE metadata->>'organizationId' = ${organizationId}
        AND metadata->>'agentId' = ${agentId}
      GROUP BY 1`;
		return new Map(rows.map((r) => [r.documentId, r.count]));
	} catch {
		return new Map<string, number>();
	}
}

export const knowledgeRouter = {
	overview: privateProcedure
		.input(KnowledgeOverviewInputSchema)
		.output(KnowledgeOverviewResponseSchema)
		.handler(async ({ input, context }) => {
			const agent = await loadAgent(context.organizationId, input.agentId);
			const [documents, chunks] = await Promise.all([
				prisma.document.findMany({
					where: { agentId: agent.id, organizationId: context.organizationId },
					orderBy: { createdAt: "desc" },
					select: {
						id: true,
						type: true,
						status: true,
						documentName: true,
						markdownContent: true,
						createdAt: true,
						updatedAt: true,
					},
				}),
				loadChunks(context.organizationId, agent.id),
			]);

			const byDocument = new Map<string, ChunkRow[]>();
			for (const c of chunks) {
				const list = byDocument.get(c.documentId) ?? [];
				list.push(c);
				byDocument.set(c.documentId, list);
			}

			const sources = documents.map((d) => {
				const docChunks = byDocument.get(d.id) ?? [];
				return {
					id: d.id,
					type: d.type,
					status: d.status,
					name: sourceName(d.type, d.documentName),
					url: d.type === "WEBPAGE" ? d.documentName : null,
					words: countWords(d.markdownContent),
					chunkCount: docChunks.length,
					chunks: docChunks.slice(0, MAX_CHUNKS_PER_SOURCE).map((c) => {
						const clean = cleanMarkdown(c.text);
						return {
							index: c.chunkIndex,
							title: chunkTitle(c.text, c.chunkIndex),
							excerpt: truncate(clean, 220),
							length: clean.length,
						};
					}),
					createdAt: d.createdAt.toISOString(),
					updatedAt: d.updatedAt.toISOString(),
				};
			});

			const b = agent.widgetBrand;
			return {
				agent: {
					id: agent.id,
					name: agent.name,
					description: agent.description,
					status: agent.status,
					modelLabel: agent.modelLabel,
					createdAt: agent.createdAt.toISOString(),
					updatedAt: agent.updatedAt.toISOString(),
				},
				brand: b
					? {
							sourceUrl: b.sourceUrl,
							logoUrl: b.logoUrl,
							colorScheme: b.colorScheme,
							primaryColor: b.primaryColor,
							accentColor: b.accentColor,
							backgroundColor: b.backgroundColor,
							textPrimaryColor: b.textPrimaryColor,
							fontFamilyPrimary: b.fontFamilyPrimary,
							fontFamilyHeading: b.fontFamilyHeading,
							extractedAt: b.extractedAt.toISOString(),
						}
					: null,
				sources,
				totals: {
					sources: sources.length,
					chunks: chunks.length,
					words: sources.reduce((s, x) => s + x.words, 0),
				},
			};
		}),

	source: privateProcedure
		.input(KnowledgeSourceInputSchema)
		.output(KnowledgeSourceDetailResponseSchema)
		.handler(async ({ input, context }) => {
			const agent = await loadAgent(context.organizationId, input.agentId);
			const doc = await prisma.document.findFirst({
				where: {
					id: input.documentId,
					agentId: agent.id,
					organizationId: context.organizationId,
				},
				select: {
					id: true,
					type: true,
					documentName: true,
					markdownContent: true,
				},
			});
			if (!doc) return { source: null };
			const chunks = await loadChunks(context.organizationId, agent.id, doc.id);
			return {
				source: {
					id: doc.id,
					name: sourceName(doc.type, doc.documentName),
					url: doc.type === "WEBPAGE" ? doc.documentName : null,
					preview: truncate(cleanMarkdown(doc.markdownContent ?? ""), 4000),
					chunks: chunks.map((c) => ({
						index: c.chunkIndex,
						title: chunkTitle(c.text, c.chunkIndex),
						text: cleanMarkdown(c.text),
					})),
				},
			};
		}),

	ask: privateProcedure
		.input(KnowledgeAskInputSchema)
		.output(KnowledgeAskResponseSchema)
		.handler(async ({ input, context }) => {
			const agent = await loadAgent(context.organizationId, input.agentId);
			const docs = await prisma.document.findMany({
				where: { agentId: agent.id, organizationId: context.organizationId },
				orderBy: { createdAt: "desc" },
				select: { id: true, type: true, status: true, documentName: true },
			});
			const counts = await loadChunkCounts(context.organizationId, agent.id);
			const named = docs.map((d) => ({
				...d,
				name: sourceName(d.type, d.documentName),
			}));
			const byId = new Map(named.map((d) => [d.id, d]));

			// Focus: the source open in the panel, or one the question names.
			const q = input.question.toLowerCase();
			const mentioned = named.find((d) => {
				const base = d.name.toLowerCase().replace(/\.[a-z0-9]+$/, "");
				return base.length >= 4 && q.includes(base);
			});
			const focus =
				(input.documentId && byId.get(input.documentId)) || mentioned;

			type Ctx = {
				documentId: string;
				chunkIndex: number;
				text: string;
				score: number | null;
			};
			let mode: "source" | "search" | "inventory" = "inventory";
			let ctx: Ctx[] = [];

			if (focus) {
				mode = "source";
				let chars = 0;
				for (const c of await loadChunks(
					context.organizationId,
					agent.id,
					focus.id,
				)) {
					const text = cleanMarkdown(c.text);
					if (
						ctx.length >= SOURCE_MAX_CHUNKS ||
						chars + text.length > SOURCE_MAX_CHARS
					)
						break;
					chars += text.length;
					ctx.push({
						documentId: focus.id,
						chunkIndex: c.chunkIndex,
						text,
						score: null,
					});
				}
			} else {
				try {
					const { embedding } = await embed({
						model: embedder,
						value: input.question,
					});
					const matches = await pgVector.query({
						indexName: GRAPH_RAG_INDEX,
						queryVector: embedding,
						topK: SEARCH_TOP_K,
						filter: { agentId: agent.id },
					});
					ctx = matches
						.map((m) => {
							const md = (m.metadata ?? {}) as Record<string, unknown>;
							return {
								documentId: String(md.documentId ?? ""),
								chunkIndex: Number(md.chunkIndex ?? 0),
								text: cleanMarkdown(String(md.text ?? "")),
								score: m.score ?? 0,
							};
						})
						.filter(
							(c) =>
								c.text && byId.has(c.documentId) && (c.score ?? 0) >= MIN_SCORE,
						);
				} catch (error) {
					if (isInvalidOpenAIKeyError(error)) {
						throw new ORPCError("BAD_REQUEST", {
							message: "OpenAI-nøkkelen er ugyldig",
						});
					}
					// Vector index missing (nothing ingested yet) — answer from inventory.
					ctx = [];
				}
				if (ctx.length) mode = "search";
			}

			const inventory = named.length
				? named
						.map(
							(d) =>
								`- ${d.name} (${TYPE_LABEL[d.type] ?? d.type}, ${STATUS_LABEL[d.status] ?? d.status}, ${counts.get(d.id) ?? 0} kunnskapsbiter)`,
						)
						.join("\n")
				: "- (ingen kilder ennå)";
			const contextBlock = ctx.length
				? ctx
						.map(
							(c, i) =>
								`[${i + 1}] Fra «${byId.get(c.documentId)?.name ?? "ukjent"}»:\n${c.text}`,
						)
						.join("\n\n")
				: "(Ingen relevante kunnskapsbiter funnet.)";

			const prompt = [
				`AGENT: ${agent.name}`,
				focus ? `FOKUSKILDE: ${focus.name}` : null,
				`KILDEOVERSIKT:\n${inventory}`,
				input.history?.length
					? `TIDLIGERE SAMTALE:\n${input.history.map((m) => `${m.role === "user" ? "Bruker" : "Assistent"}: ${m.content}`).join("\n")}`
					: null,
				`KONTEKST:\n${contextBlock}`,
				`SPØRSMÅL: ${input.question}`,
			]
				.filter(Boolean)
				.join("\n\n");

			const assistant = new Agent({
				id: "knowledge-assistant",
				name: "Kunnskapsassistent",
				instructions: ASSISTANT_INSTRUCTIONS,
				model: CUSTOMER_AGENT_MODEL,
			});

			let answer: string;
			try {
				const result = await assistant.generate(prompt);
				answer = result.text.trim();
			} catch (error) {
				if (isInvalidOpenAIKeyError(error)) {
					throw new ORPCError("BAD_REQUEST", {
						message: "OpenAI-nøkkelen er ugyldig",
					});
				}
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Assistenten kunne ikke svare akkurat nå. Prøv igjen.",
				});
			}

			// Return the chunks the answer actually cites (fallback: top 3).
			const cited = new Set(
				[...answer.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])),
			);
			const citations = ctx
				.map((c, i) => ({ c, n: i + 1 }))
				.filter(({ n }) => (cited.size ? cited.has(n) : n <= 3))
				.map(({ c, n }) => {
					const doc = byId.get(c.documentId);
					return {
						n,
						documentId: c.documentId,
						sourceName: doc?.name ?? "Ukjent kilde",
						sourceType: doc?.type ?? "DOCUMENT",
						chunkIndex: c.chunkIndex,
						title: chunkTitle(c.text, c.chunkIndex),
						excerpt: truncate(c.text, 220),
						score: c.score,
					};
				});

			return {
				answer,
				mode,
				focusDocumentId: focus?.id ?? null,
				citations,
			};
		}),
};
