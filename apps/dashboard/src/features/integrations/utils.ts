import { EMBED_SCRIPT_SRC, PLATFORMS, type PlatformId } from "./constants";

/** Embed snippet for one agent on one platform (the widget answers as that agent). */
export function createScript(
  platformId: PlatformId,
  organizationId: string,
  agentId: string,
) {
  const platform = PLATFORMS.find((p) => p.id === platformId);
  if (platform?.kind === "next") {
    return `import Script from "next/script";

// Inne i <body> i app/layout.tsx:
<Script
  src="${EMBED_SCRIPT_SRC}"
  data-organization-id="${organizationId}"
  data-agent-id="${agentId}"
  strategy="afterInteractive"
/>`;
  }
  return `<script
  src="${EMBED_SCRIPT_SRC}"
  data-organization-id="${organizationId}"
  data-agent-id="${agentId}"
  async
></script>`;
}
