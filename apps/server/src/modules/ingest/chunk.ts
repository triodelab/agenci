import { MDocument } from "@mastra/rag";

export type MarkdownChunk = {
  text: string;
  section: string | null;
};

/**
 * Split Firecrawl markdown into retrieval chunks (Mastra recursive splitter).
 * @see https://mastra.ai/reference/rag/graph-rag-guide
 */
export async function chunkMarkdown(markdown: string): Promise<MarkdownChunk[]> {
  const doc = MDocument.fromMarkdown(markdown);
  const chunks = await doc.chunk({
    strategy: "recursive",
    maxSize: 512,
    overlap: 50,
    separators: ["\n"],
  });

  return chunks
    .map((chunk) => {
      const text = typeof chunk.text === "string" ? chunk.text.trim() : "";
      const metadata =
        chunk.metadata && typeof chunk.metadata === "object"
          ? (chunk.metadata as Record<string, unknown>)
          : {};
      const sectionValue = metadata.section ?? metadata.title ?? metadata.header;
      const section =
        typeof sectionValue === "string" && sectionValue.trim().length > 0
          ? sectionValue.trim()
          : null;

      return { text, section };
    })
    .filter((chunk) => chunk.text.length > 0);
}
