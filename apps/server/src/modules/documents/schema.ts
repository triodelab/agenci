import { z } from "zod";

/** Same list as the dashboard's file picker; enforced here, not just there. */
const ALLOWED_EXTENSIONS = new Set([
  "pdf", "doc", "docx", "txt", "md", "markdown", "rtf", "odt",
  "ppt", "pptx", "xls", "xlsx", "csv", "html", "htm", "epub",
  "png", "jpg", "jpeg", "webp",
]);
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const extensionOf = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

export const uploadDocumentInput = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size > 0, "Filen er tom.")
    .refine((f) => f.size <= MAX_UPLOAD_BYTES, "Filen er større enn 50 MB.")
    .refine((f) => f.name.length <= 255, "Filnavnet er for langt.")
    .refine((f) => ALLOWED_EXTENSIONS.has(extensionOf(f.name)), "Denne filtypen støttes ikke."),
  agentId: z.string().min(1).max(64),
});

export const uploadDocumentOutput = z.object({
  url: z.string(),
});
