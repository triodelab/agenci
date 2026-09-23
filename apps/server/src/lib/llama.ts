import LlamaCloud, { toFile } from "@llamaindex/llama-cloud";
import { env } from "@agenci/env/server";

const LLAMA_EU_BASE_URL = "https://api.cloud.eu.llamaindex.ai";

export const llamaClient = new LlamaCloud({
  apiKey: env.LLAMA_API_KEY,
  baseURL: env.LLAMA_CLOUD_BASE_URL ?? LLAMA_EU_BASE_URL,
});

export class InvalidLlamaKeyError extends Error {
  constructor() {
    super(
      "Ugyldig LLAMA_API_KEY eller feil Llama Cloud-region (401). Nøkler er regionspesifikke — EU bruker https://api.cloud.eu.llamaindex.ai, NA bruker https://api.cloud.llamaindex.ai. Sett LLAMA_CLOUD_BASE_URL og start serveren på nytt.",
    );
    this.name = "InvalidLlamaKeyError";
  }
}

export function isInvalidLlamaKeyError(error: unknown): boolean {
  if (error instanceof InvalidLlamaKeyError) {
    return true;
  }
  if (!error || typeof error !== "object") {
    return false;
  }
  const err = error as {
    status?: number;
    statusCode?: number;
    error?: { detail?: string };
    message?: string;
  };
  const status = err.status ?? err.statusCode;
  const detail = `${err.error?.detail ?? ""} ${err.message ?? ""}`;
  return status === 401 || /invalid api key/i.test(detail);
}

const TEXT_PASSTHROUGH_EXTENSIONS = new Set([".txt", ".md", ".markdown"]);

/** LlamaParse-supported extensions (130+ formats). */
const LLAMA_PARSE_EXTENSIONS = new Set([
  ".abw", ".awt", ".azw", ".azw3", ".azw4", ".bmp", ".cb7", ".cbc", ".cbr",
  ".cbz", ".cgm", ".chm", ".csv", ".cwk", ".dbf", ".dif", ".djvu", ".doc",
  ".docm", ".docx", ".dot", ".dotm", ".dotx", ".epub", ".et", ".eth", ".fb2",
  ".fbz", ".fodg", ".fodp", ".fods", ".fodt", ".fopd", ".gif", ".heic", ".heif",
  ".htm", ".html", ".htmlz", ".hwp", ".jpeg", ".jpg", ".key", ".lit", ".lrf",
  ".lwp", ".m4a", ".mcw", ".md", ".mobi", ".mp3", ".mp4", ".mpeg", ".mpga",
  ".mw", ".mwd", ".numbers", ".odf", ".odg", ".odp", ".ods", ".odt", ".otg",
  ".otp", ".ots", ".ott", ".pages", ".pbd", ".pdb", ".pdf", ".pml", ".png",
  ".pot", ".potm", ".potx", ".ppt", ".pptm", ".pptx", ".prc", ".prn", ".psw",
  ".qpw", ".rb", ".rtf", ".sda", ".sdd", ".sdp", ".sdw", ".sgl", ".slk",
  ".snb", ".stc", ".std", ".sti", ".stw", ".svg", ".sxc", ".sxd", ".sxg",
  ".sxi", ".sxm", ".sxw", ".sylk", ".tcr", ".tif", ".tiff", ".tsv", ".txtz",
  ".uof", ".uop", ".uos", ".uos1", ".uos2", ".uot", ".vdx", ".vor", ".vsd",
  ".vsdm", ".vsdx", ".wav", ".wb1", ".wb2", ".wb3", ".webm", ".webp", ".wk1",
  ".wk2", ".wk3", ".wk4", ".wks", ".wn", ".wpd", ".wps", ".wpt", ".wq1",
  ".wq2", ".wri", ".xhtm", ".xlr", ".xls", ".xlsb", ".xlsm", ".xlsx", ".xlw",
  ".xml", ".yxmd", ".zabw",
]);

const MIME_TO_EXTENSION: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
  "application/rtf": ".rtf",
  "application/epub+zip": ".epub",
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/tiff": ".tiff",
  "image/heic": ".heic",
  "image/svg+xml": ".svg",
  "text/html": ".html",
  "text/csv": ".csv",
  "text/tab-separated-values": ".tsv",
  "text/markdown": ".md",
  "text/plain": ".txt",
  "audio/mpeg": ".mp3",
  "audio/mp4": ".m4a",
  "audio/wav": ".wav",
  "video/mp4": ".mp4",
};

export type ParseDocumentInput = {
  fileName?: string;
  mimeType?: string;
  /** LlamaParse tier. Default `cost_effective` so scans/images still OCR. */
  tier?: "fast" | "cost_effective" | "agentic" | "agentic_plus";
} & (
  | { file: File; bytes?: never; sourceUrl?: never }
  | { bytes: ArrayBuffer | Uint8Array; file?: never; sourceUrl?: never }
  | { sourceUrl: string; file?: never; bytes?: never }
);

export type ParsedMarkdown = {
  markdown: string;
  pageCount: number;
  fileName: string;
  jobId: string | null;
};

function extensionFromName(fileName: string) {
  const dot = fileName.lastIndexOf(".");
  if (dot < 0) {
    return "";
  }
  return fileName.slice(dot).toLowerCase();
}

function fileNameFromUrl(url: string) {
  try {
    const path = new URL(url).pathname;
    const last = path.split("/").filter(Boolean).pop();
    return last ? decodeURIComponent(last) : "document";
  } catch {
    return "document";
  }
}

function resolveFileName(input: ParseDocumentInput) {
  if (input.fileName?.trim()) {
    return input.fileName.trim();
  }
  if (input.file?.name) {
    return input.file.name;
  }
  if (input.sourceUrl) {
    return fileNameFromUrl(input.sourceUrl);
  }
  const ext = input.mimeType ? (MIME_TO_EXTENSION[input.mimeType] ?? "") : "";
  return ext ? `document${ext}` : "document";
}

function resolveExtension(fileName: string, mimeType?: string) {
  const fromName = extensionFromName(fileName);
  if (fromName) {
    return fromName;
  }
  if (mimeType && MIME_TO_EXTENSION[mimeType]) {
    return MIME_TO_EXTENSION[mimeType];
  }
  return "";
}

function markdownFromParseResult(result: {
  job?: { id?: string; status?: string; error_message?: string | null };
  markdown_full?: string | null;
  markdown?: {
    pages: Array<{ success: true; markdown: string } | { success?: false }>;
  } | null;
}): { markdown: string; pageCount: number; jobId: string | null } {
  if (result.job?.status === "FAILED") {
    throw new Error(
      result.job.error_message?.trim() || "LlamaParse klarte ikke å lese dokumentet",
    );
  }

  const successfulPages =
    result.markdown?.pages.filter(
      (page): page is { success: true; markdown: string } =>
        page.success === true && typeof page.markdown === "string",
    ) ?? [];

  if (result.markdown_full?.trim()) {
    return {
      markdown: result.markdown_full.trim(),
      pageCount: successfulPages.length || 1,
      jobId: result.job?.id ?? null,
    };
  }

  const markdown = successfulPages
    .map((page) => page.markdown.trim())
    .filter((text) => text.length > 0)
    .join("\n\n");

  return {
    markdown,
    pageCount: successfulPages.length,
    jobId: result.job?.id ?? null,
  };
}

/**
 * Parse any LlamaParse-supported document (PDF, Office, images, audio, …)
 * into markdown. Plain `.txt` / `.md` is returned as-is.
 */
export async function parseDocumentToMarkdown(
  input: ParseDocumentInput,
): Promise<ParsedMarkdown> {
  const fileName = resolveFileName(input);
  const mimeType = input.mimeType ?? input.file?.type;
  const extension = resolveExtension(fileName, mimeType);

  if (TEXT_PASSTHROUGH_EXTENSIONS.has(extension)) {
    let text = "";
    if (input.file) {
      text = await input.file.text();
    } else if (input.bytes) {
      text = new TextDecoder().decode(
        input.bytes instanceof Uint8Array
          ? input.bytes
          : new Uint8Array(input.bytes),
      );
    } else if (input.sourceUrl) {
      const response = await fetch(input.sourceUrl);
      if (!response.ok) {
        throw new Error(`Kunne ikke hente dokumentet (${response.status})`);
      }
      text = await response.text();
    }

    const markdown = text.trim();
    if (!markdown) {
      throw new Error("Dokumentet inneholder ingen tekst");
    }

    return { markdown, pageCount: 1, fileName, jobId: null };
  }

  if (extension && !LLAMA_PARSE_EXTENSIONS.has(extension)) {
    throw new Error(`Filtypen ${extension} støttes ikke av LlamaParse`);
  }

  const parseOptions = {
    tier: input.tier ?? "cost_effective",
    version: "latest" as const,
    expand: ["markdown"],
  };

  let result;
  try {
    result = input.sourceUrl
      ? await llamaClient.parsing.parse({
          ...parseOptions,
          source_url: input.sourceUrl,
        })
      : await llamaClient.parsing.parse({
          ...parseOptions,
          upload_file: input.file
            ? input.file
            : await toFile(input.bytes as ArrayBuffer | Uint8Array, fileName, {
                type: mimeType,
              }),
        });
  } catch (error) {
    if (isInvalidLlamaKeyError(error)) {
      throw new InvalidLlamaKeyError();
    }
    throw error;
  }

  const parsed = markdownFromParseResult(result);
  if (!parsed.markdown.trim()) {
    throw new Error(`LlamaParse returnerte ingen markdown for ${fileName}`);
  }

  return {
    markdown: parsed.markdown,
    pageCount: parsed.pageCount,
    fileName,
    jobId: parsed.jobId,
  };
}
