/**
 * Map Firecrawl `formats: ["branding"]` → AgentWidgetBrand columns.
 */
import { createPrismaClient } from "@agenci/db";

export type FirecrawlBranding = {
  colorScheme?: string | null;
  logo?: string | null;
  colors?: {
    primary?: string | null;
    secondary?: string | null;
    accent?: string | null;
    background?: string | null;
    textPrimary?: string | null;
    textSecondary?: string | null;
  } | null;
  typography?: {
    fontFamilies?: {
      primary?: string | null;
      heading?: string | null;
      code?: string | null;
    } | null;
  } | null;
  fonts?: Array<{ family?: string | null }> | null;
};

export type AgentWidgetBrandInput = {
  logoUrl: string | null;
  colorScheme: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  backgroundColor: string | null;
  textPrimaryColor: string | null;
  textSecondaryColor: string | null;
  fontFamilyPrimary: string | null;
  fontFamilyHeading: string | null;
  fontFamilyCode: string | null;
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export function mapFirecrawlBrandingToWidgetBrand(
  branding: FirecrawlBranding | null | undefined,
): AgentWidgetBrandInput {
  const colors = branding?.colors ?? null;
  const families = branding?.typography?.fontFamilies ?? null;
  const fallbackFont = asString(branding?.fonts?.[0]?.family);

  return {
    logoUrl: asString(branding?.logo),
    colorScheme: asString(branding?.colorScheme),
    primaryColor: asString(colors?.primary),
    secondaryColor: asString(colors?.secondary),
    accentColor: asString(colors?.accent),
    backgroundColor: asString(colors?.background),
    textPrimaryColor: asString(colors?.textPrimary),
    textSecondaryColor: asString(colors?.textSecondary),
    fontFamilyPrimary: asString(families?.primary) ?? fallbackFont,
    fontFamilyHeading: asString(families?.heading),
    fontFamilyCode: asString(families?.code),
  };
}

type UpsertWidgetBrandArgs = {
  agentId: string;
  organizationId: string;
  sourceUrl?: string | null;
  branding: AgentWidgetBrandInput;
  prisma?: ReturnType<typeof createPrismaClient>;
};

/** Upsert Firecrawl branding onto `AgentWidgetBrand` (1:1 with agent). */
export async function upsertAgentWidgetBrand({
  agentId,
  organizationId,
  sourceUrl,
  branding,
  prisma = createPrismaClient(),
}: UpsertWidgetBrandArgs) {
  return prisma.agentWidgetBrand.upsert({
    where: { agentId },
    create: {
      agentId,
      organizationId,
      sourceUrl: sourceUrl ?? null,
      ...branding,
      extractedAt: new Date(),
    },
    update: {
      organizationId,
      sourceUrl: sourceUrl ?? null,
      ...branding,
      extractedAt: new Date(),
    },
  });
}
