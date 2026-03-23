/**
 * Samme logikk som `apps/web/lib/convex-url.ts` – én Convex-deployment for hele monorepoet.
 */
export function parseConvexDeploymentUrl(raw: string | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed) {
    throw new Error(
      "Mangler NEXT_PUBLIC_CONVEX_URL i apps/widget/.env.local. Kopier NEXT_PUBLIC_CONVEX_URL fra apps/web/.env (samme verdi som CONVEX_URL i packages/backend/.env.local).",
    );
  }

  const match = trimmed.match(/https?:\/\/[^\s"'`<>]+/);
  if (!match) {
    throw new Error(
      `Ugyldig NEXT_PUBLIC_CONVEX_URL: må starte med https:// (kun URL-en, ikke «CONVEX_URL=...»). Verdi: ${JSON.stringify(trimmed.slice(0, 120))}`,
    );
  }

  const url = match[0].replace(/\/+$/, "");

  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    throw new Error(`Ugyldig URL: ${url}`);
  }

  if (
    hostname.includes("your-deployment") ||
    hostname === "example.convex.cloud"
  ) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL er fortsatt en plassholder. Sett den ekte https://….convex.cloud-adressen fra Convex Dashboard – samme linje som i apps/web/.env – i apps/widget/.env.local, og restart pnpm dev:widget.",
    );
  }

  return url;
}
