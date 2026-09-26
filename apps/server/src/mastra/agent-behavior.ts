/**
 * Turns the customer's behaviour settings into instructions that are appended
 * to the fixed support prompt. Pure (no imports) so the dashboard can show
 * exactly the same text ("Slik instrueres agenten") via `server/agent-behavior`.
 *
 * The base prompt's safety rules (only company topics, search the knowledge
 * base first) always apply; these settings only shape tone, format and extra
 * rules on top.
 */

export type AgentBehaviorInput = {
  model?: string;
  tone?: "vennlig" | "profesjonell" | "uformell" | "presis";
  length?: "kort" | "balansert" | "utfyllende";
  formality?: "du" | "de";
  language?: "bokmal" | "nynorsk" | "kundens";
  emoji?: boolean;
  rules?: { id: string; text: string; enabled: boolean }[];
  avoidTopics?: string[];
  escalation?: {
    onHumanRequest?: boolean;
    onComplaint?: boolean;
    onUncertain?: boolean;
    contact?: string;
  };
};

export const DEFAULT_AGENT_MODEL = "openai/gpt-4o-mini";

const TONE: Record<NonNullable<AgentBehaviorInput["tone"]>, string> = {
  vennlig: "Varm, vennlig og imøtekommende — som en hyggelig ansatt.",
  profesjonell: "Profesjonell, saklig og høflig — tydelig og ryddig, uten å bli stiv.",
  uformell: "Uformell og avslappet — som en hjelpsom kollega, gjerne litt personlig.",
  presis: "Presis og effektiv — rett på sak, ingen utfylling.",
};

const LENGTH: Record<NonNullable<AgentBehaviorInput["length"]>, string> = {
  kort: "Svar svært kort: 1–2 setninger.",
  balansert: "Svar kort og konkret: 2–3 setninger.",
  utfyllende: "Svar grundig når det trengs: gjerne 3–6 setninger, og korte punktlister der det gjør svaret tydeligere.",
};

const LANGUAGE: Record<NonNullable<AgentBehaviorInput["language"]>, string> = {
  bokmal: "Svar alltid på norsk bokmål.",
  nynorsk: "Svar alltid på nynorsk.",
  kundens: "Svar på samme språk som kunden skriver på (norsk bokmål hvis du er usikker).",
};

/** Returns "" when nothing is customised (base prompt applies as-is). */
export function buildBehaviorInstructions(b: AgentBehaviorInput | undefined | null): string {
  if (!b) return "";
  const lines: string[] = [];

  const style: string[] = [];
  if (b.tone) style.push(TONE[b.tone]);
  if (b.length) style.push(LENGTH[b.length]);
  if (b.formality === "de") style.push("Bruk De-form (høflig tiltale), ikke du-form.");
  if (b.formality === "du") style.push("Bruk du-form.");
  if (b.emoji === false) style.push("Ikke bruk emojier.");
  if (b.emoji === true) style.push("Bruk gjerne én emoji der det passer naturlig.");
  if (b.language) style.push(LANGUAGE[b.language]);
  if (style.length) {
    lines.push("### Tone, stil og språk (erstatter «Tone og stil» over ved konflikt)");
    for (const s of style) lines.push(`- ${s}`);
  }

  const rules = (b.rules ?? []).filter((r) => r.enabled && r.text.trim());
  if (rules.length) {
    lines.push("", "### Bedriftens egne regler (følg alltid)");
    rules.forEach((r, i) => lines.push(`${i + 1}. ${r.text.trim()}`));
  }

  const avoid = (b.avoidTopics ?? []).map((t) => t.trim()).filter(Boolean);
  if (avoid.length) {
    lines.push(
      "",
      "### Emner du ikke skal gå inn på",
      `Hvis kunden spør om ${avoid.map((t) => `«${t}»`).join(", ")}: si høflig at du ikke kan hjelpe med det her, og tilby å hjelpe med noe annet.`,
    );
  }

  const e = b.escalation;
  if (e && (e.onHumanRequest || e.onComplaint || e.onUncertain || e.contact?.trim())) {
    const when: string[] = [];
    if (e.onHumanRequest) when.push("kunden ber om å snakke med et menneske");
    if (e.onComplaint) when.push("kunden klager eller er misfornøyd");
    if (e.onUncertain) when.push("du ikke finner et sikkert svar i kunnskapsbasen");
    lines.push("", "### Overlevering til et menneske");
    if (when.length) lines.push(`Tilby å sette kunden over til en ansatt når ${when.join(", eller når ")}.`);
    if (e.contact?.trim()) lines.push(`Kontaktinformasjon du kan gi kunden: ${e.contact.trim()}`);
  }

  return lines.length ? `\n## Tilpasninger fra bedriften\n${lines.join("\n")}\n` : "";
}
