export const INTEGRATIONS = [
  { id: "html", title: "HTML", letter: "H", color: "#E34F26" },
  { id: "react", title: "React", letter: "R", color: "#61DAFB" },
  { id: "nextjs", title: "Next.js", letter: "N", color: "#111111" },
  { id: "javascript", title: "JavaScript", letter: "JS", color: "#F7DF1E" },
] as const;

export type IntegrationId = (typeof INTEGRATIONS)[number]["id"];

const embedScriptSrc =
  import.meta.env.VITE_WIDGET_EMBED_SCRIPT_URL?.trim() ||
  "https://agenci-embed.vercel.app/widget.iife.js";

export const HTML_SCRIPT = `<script src="${embedScriptSrc}" data-organization-id="{{ORGANIZATION_ID}}"></script>`;
export const REACT_SCRIPT = `<script src="${embedScriptSrc}" data-organization-id="{{ORGANIZATION_ID}}"></script>`;
export const NEXTJS_SCRIPT = `<script src="${embedScriptSrc}" data-organization-id="{{ORGANIZATION_ID}}"></script>`;
export const JAVASCRIPT_SCRIPT = `<script src="${embedScriptSrc}" data-organization-id="{{ORGANIZATION_ID}}"></script>`;
