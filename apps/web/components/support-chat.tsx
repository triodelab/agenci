import Script from "next/script";

/**
 * Agenci's own support agent on agenci.no (the chat in the corner).
 * The ids are public — they're in every embed snippet. Env vars override them.
 */
const ORG_ID = process.env.NEXT_PUBLIC_WIDGET_ORG_ID || "N5zumaVizWadxyo8h6gMQ0BwBtqYvGo7";
const AGENT_ID = process.env.NEXT_PUBLIC_WIDGET_AGENT_ID || "cmur61gc0000101l51y0c894n";

export function SupportChat() {
  return (
    <Script
      id="agenci-support-chat"
      src="https://widget.agenci.no/widget.iife.js"
      data-organization-id={ORG_ID}
      data-agent-id={AGENT_ID}
      strategy="afterInteractive"
    />
  );
}
