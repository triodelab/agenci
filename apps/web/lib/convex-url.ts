/**
 * Normaliserer NEXT_PUBLIC_CONVEX_URL når verdien er feil limt inn
 * (f.eks. hele linjen `CONVEX_URL=https://....convex.cloud`).
 */
export function parseConvexDeploymentUrl(raw: string | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed) {
    throw new Error(
      "Mangler NEXT_PUBLIC_CONVEX_URL. Sett kun deployment-URL i apps/web/.env.local, f.eks. NEXT_PUBLIC_CONVEX_URL=https://din-deployment.convex.cloud",
    );
  }

  const match = trimmed.match(/https?:\/\/[^\s"'`<>]+/);
  if (!match) {
    throw new Error(
      `Ugyldig NEXT_PUBLIC_CONVEX_URL: må starte med https:// (kun URL-en, ikke «CONVEX_URL=...»). Verdi: ${JSON.stringify(trimmed.slice(0, 120))}`,
    );
  }

  return match[0].replace(/\/+$/, "");
}
