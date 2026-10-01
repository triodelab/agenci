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
  bokmal: "Skriv alle svar på norsk bokmål.",
  nynorsk:
    "Skriv ALLE svar på nynorsk (t.d. «kva», «ikkje», «eg», «tenester», «korleis»), også når spørsmålet, kunnskapsbasen eller dei faste formuleringane er på bokmål. Omset innhaldet til nynorsk.",
  kundens:
    "Svar på samme språk som kundens siste melding, også når kunnskapsbasen og instruksjonene er på norsk — oversett innholdet. Always reply in the language of the customer's latest message: if they write in English, your whole reply must be in English. Er du usikker, bruk norsk bokmål.",
};

/**
 * A non-default language also leads the instructions: the Norwegian base
 * prompt and knowledge otherwise pull the model back to bokmål.
 */
export function buildLanguageLead(b: AgentBehaviorInput | undefined | null): string {
  if (!b?.language || b.language === "bokmal") return "";
  return `VIKTIGST AV ALT — SPRÅK: ${LANGUAGE[b.language]}\n\n`;
}

const DAYPART: [number, string][] = [
  [5, "natt"],
  [10, "morgen"],
  [12, "formiddag"],
  [17, "ettermiddag"],
  [23, "kveld"],
  [24, "natt"],
];

/**
 * Per-turn system note, sent right next to the customer's message: the
 * current time in Norway, and the language rule again (small models drift
 * back to the Norwegian base prompt when it only sits in the instructions).
 */
export function buildTurnSystem(
  b: AgentBehaviorInput | undefined | null,
  now: Date = new Date(),
): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("nb-NO", {
      timeZone: "Europe/Oslo",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const hour = Number(parts.hour);
  const daypart = DAYPART.find(([end]) => hour < end)?.[1] ?? "dag";
  const lines = [
    `Akkurat nå i Norge: ${parts.weekday} ${parts.day}. ${parts.month} ${parts.year}, kl. ${parts.hour}:${parts.minute} (${daypart}).`,
    "Spør kunden hva klokka er, hvilken dag det er, eller om dere er åpne nå, svar direkte med dette (sammenlign med åpningstider fra kunnskapsbasen). Ellers: ikke nevn klokkeslettet. Hils «God morgen», «God dag» eller «God kveld» når det passer; om natten hilser du bare «Hei» (aldri «God natt» som hilsen).",
  ];
  if (b?.language && b.language !== "bokmal") lines.push(`Språk: ${LANGUAGE[b.language]}`);
  return lines.join("\n");
}

/** Whether any hand-over trigger is on (defaults match the dashboard). */
export function handoverEnabled(e: AgentBehaviorInput["escalation"]): boolean {
  return e?.onHumanRequest !== false || !!e?.onComplaint || !!e?.onUncertain;
}

/**
 * When the agent hands a chat to the team. Always part of the instructions
 * (the base prompt defers to it), so every dashboard toggle — on or off —
 * takes effect. Defaults match the dashboard: human request on, rest off.
 */
export function buildHandoverInstructions(e: AgentBehaviorInput["escalation"]): string {
  const contact = e?.contact?.trim();
  const orContact = contact ? ", og gi kontaktinformasjonen under" : "";
  const hand =
    "kall escalateConversationTool, og si deretter kort at saken er sendt videre og at noen fra teamet svarer her i chatten";
  const lines = [
    "### Overlevering til et menneske",
    `- Kunden ber om å snakke med et menneske: ${
      e?.onHumanRequest !== false
        ? hand
        : `ikke sett over til teamet; si vennlig at det ikke er noen fra teamet i chatten${orContact}`
    }.`,
    `- Kunden klager eller er misfornøyd: ${
      e?.onComplaint ? hand : `ta imot det vennlig og hjelp så godt du kan selv, uten å sette over til teamet${orContact}`
    }.`,
    `- Du finner ikke et sikkert svar i kunnskapsbasen: ${
      e?.onUncertain
        ? "si at du ikke fant noe om det, og spør om kunden vil bli satt over til noen fra [bedriften]; sier kunden ja, kall escalateConversationTool"
        : `si at du ikke fant noe om det${orContact}. Ikke tilby å sette over til teamet`
    }.`,
    "- «Ber om et menneske» betyr at kunden selv tydelig sier det, eller sier ja til et tilbud DU nettopp ga om å sette over. Et kort «ja», «ja takk» eller «ok» etter noe annet er ikke et ønske om et menneske.",
    "- Sett aldri over i andre situasjoner, heller ikke bare fordi kunden presiserer eller gjentar spørsmålet. Aldri ved nødsituasjoner eller medisinske spørsmål (se «Sikkerhet først»).",
  ];
  if (contact) lines.push(`Kontaktinformasjon du kan gi kunden: ${contact}`);
  return lines.join("\n");
}

/** Returns "" when nothing is customised (base prompt applies as-is). */
export function buildBehaviorInstructions(b: AgentBehaviorInput | undefined | null): string {
  if (!b) return "";
  const lines: string[] = [];

  const style: string[] = [];
  if (b.tone) style.push(TONE[b.tone]);
  if (b.length) style.push(LENGTH[b.length]);
  if (b.formality === "de")
    style.push("Bruk De-form (høflig tiltale), ikke du-form — også i de faste formuleringene over.");
  if (b.formality === "du") style.push("Bruk du-form.");
  if (b.emoji === false) style.push("Ikke bruk emojier, heller ikke i de faste formuleringene over.");
  if (b.emoji === true) style.push("Bruk gjerne én emoji der det passer naturlig.");
  // Language gets its own heading first: it overrides the Norwegian base prompt.
  if (b.language && b.language !== "bokmal")
    lines.push("### Språk (viktigst — gjelder hvert eneste svar)", `- ${LANGUAGE[b.language]}`, "");
  else if (b.language) style.push(LANGUAGE[b.language]);
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

  // Shown here once customised; otherwise the agent adds the defaults itself.
  if (b.escalation) lines.push("", buildHandoverInstructions(b.escalation));

  return lines.length ? `\n## Tilpasninger fra bedriften\n${lines.join("\n")}\n` : "";
}
