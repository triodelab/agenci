/**
 * Organisasjonsnummer: checksum (mod 11) and a lookup in Enhetsregisteret
 * (Brønnøysundregistrene's open API, no key needed).
 */

const WEIGHTS = [3, 2, 7, 6, 5, 4, 3, 2];

export function normalizeOrgNumber(input: string) {
  return input.replace(/\D/g, "");
}

/** 9 digits with a valid mod-11 check digit. */
export function isValidOrgNumber(orgNumber: string) {
  if (!/^\d{9}$/.test(orgNumber)) return false;
  const digits = orgNumber.split("").map(Number);
  const sum = WEIGHTS.reduce((acc, w, i) => acc + w * (digits[i] ?? 0), 0);
  const rest = sum % 11;
  const check = rest === 0 ? 0 : 11 - rest;
  return check !== 10 && check === digits[8];
}

export type CompanyLookup =
  | { ok: true; orgNumber: string; name: string; form: string | null; address: string | null }
  | { ok: false; reason: "invalid" | "not_found" | "inactive" | "unavailable"; message: string };

type Enhet = {
  organisasjonsnummer: string;
  navn: string;
  organisasjonsform?: { beskrivelse?: string };
  forretningsadresse?: { adresse?: string[]; postnummer?: string; poststed?: string };
  konkurs?: boolean;
  underAvvikling?: boolean;
  underTvangsavviklingEllerTvangsopplosning?: boolean;
  slettedato?: string;
};

export async function lookupCompany(input: string): Promise<CompanyLookup> {
  const orgNumber = normalizeOrgNumber(input);
  if (!isValidOrgNumber(orgNumber)) {
    return { ok: false, reason: "invalid", message: "Det er ikke et gyldig organisasjonsnummer (9 siffer)." };
  }
  let res: Response;
  try {
    res = await fetch(`https://data.brreg.no/enhetsregisteret/api/enheter/${orgNumber}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { ok: false, reason: "unavailable", message: "Brønnøysundregistrene svarer ikke akkurat nå. Prøv igjen om litt." };
  }
  // 410: the unit has been deleted from the register.
  if (res.status === 404 || res.status === 410) {
    return { ok: false, reason: "not_found", message: "Fant ikke organisasjonsnummeret i Enhetsregisteret." };
  }
  if (!res.ok) {
    return { ok: false, reason: "unavailable", message: "Brønnøysundregistrene svarer ikke akkurat nå. Prøv igjen om litt." };
  }
  const e = (await res.json()) as Enhet;
  if (e.slettedato || e.konkurs || e.underAvvikling || e.underTvangsavviklingEllerTvangsopplosning) {
    return { ok: false, reason: "inactive", message: `${e.navn} er ikke et aktivt foretak (slettet, konkurs eller under avvikling).` };
  }
  const a = e.forretningsadresse;
  return {
    ok: true,
    orgNumber,
    name: e.navn,
    form: e.organisasjonsform?.beskrivelse ?? null,
    address: a ? [a.adresse?.join(", "), [a.postnummer, a.poststed].filter(Boolean).join(" ")].filter(Boolean).join(", ") : null,
  };
}
