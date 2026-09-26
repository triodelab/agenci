import {
  HTML_SCRIPT,
  type IntegrationId,
  JAVASCRIPT_SCRIPT,
  NEXTJS_SCRIPT,
  REACT_SCRIPT,
} from "./constants";

/** Embed snippet for one agent (the widget answers as that agent). */
export function createScript(
  integrationId: IntegrationId,
  organizationId: string,
  agentId: string,
) {
  const scripts: Record<IntegrationId, string> = {
    html: HTML_SCRIPT,
    react: REACT_SCRIPT,
    nextjs: NEXTJS_SCRIPT,
    javascript: JAVASCRIPT_SCRIPT,
  };

  return (scripts[integrationId] ?? "")
    .replaceAll("{{ORGANIZATION_ID}}", organizationId)
    .replaceAll("{{AGENT_ID}}", agentId);
}
