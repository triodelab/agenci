export function parseConvexDeploymentUrl(raw: string | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed) {
    throw new Error(
      "Mangler NEXT_PUBLIC_CONVEX_URL. Sett kun deployment-URL, f.eks. https://din-deployment.convex.cloud",
    );
  }

  const match = trimmed.match(/https?:\/\/[^\s"'`<>]+/);
  if (!match) {
    throw new Error(
      `Ugyldig NEXT_PUBLIC_CONVEX_URL: må inneholde https:// ... Verdi: ${JSON.stringify(trimmed.slice(0, 120))}`,
    );
  }

  return match[0].replace(/\/+$/, "");
}
