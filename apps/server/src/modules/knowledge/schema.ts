import { z } from "zod";

export const KnowledgeSourceTypeSchema = z.enum([
	"DOCUMENT",
	"WEBPAGE",
	"MEDIA",
]);
export const KnowledgeSourceStatusSchema = z.enum([
	"PENDING",
	"PROCESSING",
	"INDEXING",
	"COMPLETED",
	"FAILED",
]);

/** A retrievable piece of knowledge (one embedded chunk). */
export const KnowledgeChunkSummarySchema = z.object({
	index: z.number(),
	title: z.string(),
	excerpt: z.string(),
	length: z.number(),
});

export const KnowledgeSourceSchema = z.object({
	id: z.string(),
	type: KnowledgeSourceTypeSchema,
	status: KnowledgeSourceStatusSchema,
	name: z.string(),
	url: z.string().nullable(),
	words: z.number(),
	chunkCount: z.number(),
	chunks: z.array(KnowledgeChunkSummarySchema),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const KnowledgeOverviewInputSchema = z.object({
	agentId: z.string().min(1),
});

export const KnowledgeOverviewResponseSchema = z.object({
	agent: z.object({
		id: z.string(),
		name: z.string(),
		description: z.string(),
		status: z.string(),
		modelLabel: z.string().nullable(),
		createdAt: z.string(),
		updatedAt: z.string(),
	}),
	brand: z
		.object({
			sourceUrl: z.string().nullable(),
			logoUrl: z.string().nullable(),
			colorScheme: z.string().nullable(),
			primaryColor: z.string().nullable(),
			accentColor: z.string().nullable(),
			backgroundColor: z.string().nullable(),
			textPrimaryColor: z.string().nullable(),
			fontFamilyPrimary: z.string().nullable(),
			fontFamilyHeading: z.string().nullable(),
			extractedAt: z.string(),
		})
		.nullable(),
	sources: z.array(KnowledgeSourceSchema),
	totals: z.object({
		sources: z.number(),
		chunks: z.number(),
		words: z.number(),
	}),
});

export const KnowledgeSourceInputSchema = z.object({
	agentId: z.string().min(1),
	documentId: z.string().min(1),
});

export const KnowledgeSourceDetailResponseSchema = z.object({
	source: z
		.object({
			id: z.string(),
			name: z.string(),
			url: z.string().nullable(),
			preview: z.string(),
			chunks: z.array(
				z.object({
					index: z.number(),
					title: z.string(),
					text: z.string(),
				}),
			),
		})
		.nullable(),
});

export const KnowledgeAskInputSchema = z.object({
	agentId: z.string().min(1),
	question: z.string().trim().min(1).max(1000),
	/** Focus the answer on one source (e.g. the one open in the panel). */
	documentId: z.string().min(1).optional(),
	/** Earlier turns, so follow-ups like "og hva med priser?" work. */
	history: z
		.array(
			z.object({
				role: z.enum(["user", "assistant"]),
				content: z.string().max(4000),
			}),
		)
		.max(8)
		.optional(),
});

export const KnowledgeCitationSchema = z.object({
	n: z.number(),
	documentId: z.string(),
	sourceName: z.string(),
	sourceType: KnowledgeSourceTypeSchema,
	chunkIndex: z.number(),
	title: z.string(),
	excerpt: z.string(),
	score: z.number().nullable(),
});

export const KnowledgeAskResponseSchema = z.object({
	answer: z.string(),
	mode: z.enum(["source", "search", "inventory"]),
	focusDocumentId: z.string().nullable(),
	citations: z.array(KnowledgeCitationSchema),
});
