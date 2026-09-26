/**
 * Dashboard (staff) side of widget customization. Stored in
 * `agent_widget_brands.settings`; the public `widgetSettings` route merges it
 * over the onboarding-extracted branding.
 */
import prisma from "@agenci/db";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { clearSitePreview, getSitePreview } from "@/lib/site-preview";
import { createPreviewSession } from "@/lib/site-proxy";
import { privateProcedure } from "@/routers/procedures";
import { brandToWidgetAppearance } from "./brand-appearance";
import { parseCustomization } from "./router";
import { WidgetAppearanceSchema, WidgetCustomizationSchema } from "./schema";

const BrandInfoSchema = z.object({
  logoUrl: z.string().nullable(),
  sourceUrl: z.string().nullable(),
  colorScheme: z.string().nullable(),
  primaryColor: z.string().nullable(),
  accentColor: z.string().nullable(),
  backgroundColor: z.string().nullable(),
  textPrimaryColor: z.string().nullable(),
  fontFamilyPrimary: z.string().nullable(),
  fontFamilyHeading: z.string().nullable(),
});

const CustomizationResponseSchema = z.object({
  organizationId: z.string(),
  agentId: z.string(),
  agentName: z.string(),
  brand: BrandInfoSchema.nullable(),
  /** What the widget looks like from onboarding branding alone. */
  defaults: WidgetAppearanceSchema.partial(),
  saved: WidgetCustomizationSchema,
  updatedAt: z.string().nullable(),
});

async function loadAgent(organizationId: string, agentId: string) {
  const agent = await prisma.agent.findFirst({
    where: { id: agentId, organizationId },
    select: { id: true, name: true, organizationId: true, widgetBrand: true },
  });
  if (!agent) {
    throw new ORPCError("NOT_FOUND", { message: "Agenten ble ikke funnet" });
  }
  return agent;
}

function toResponse(agent: Awaited<ReturnType<typeof loadAgent>>) {
  const b = agent.widgetBrand;
  return {
    organizationId: agent.organizationId,
    agentId: agent.id,
    agentName: agent.name,
    brand: b
      ? {
          logoUrl: b.logoUrl,
          sourceUrl: b.sourceUrl,
          colorScheme: b.colorScheme,
          primaryColor: b.primaryColor,
          accentColor: b.accentColor,
          backgroundColor: b.backgroundColor,
          textPrimaryColor: b.textPrimaryColor,
          fontFamilyPrimary: b.fontFamilyPrimary,
          fontFamilyHeading: b.fontFamilyHeading,
        }
      : null,
    defaults: brandToWidgetAppearance(b) ?? {},
    saved: parseCustomization(b?.settings),
    updatedAt: b?.updatedAt.toISOString() ?? null,
  };
}

/** The website entered at onboarding for this agent. */
async function onboardingUrl(organizationId: string, agentId: string) {
  const agent = await prisma.agent.findFirst({
    where: { id: agentId, organizationId },
    select: { widgetBrand: { select: { sourceUrl: true } } },
  });
  if (!agent) {
    throw new ORPCError("NOT_FOUND", { message: "Agenten ble ikke funnet" });
  }
  if (agent.widgetBrand?.sourceUrl) return agent.widgetBrand.sourceUrl;
  const firstPage = await prisma.document.findFirst({
    where: { agentId, organizationId, type: "WEBPAGE" },
    orderBy: { createdAt: "asc" },
    select: { documentName: true },
  });
  return firstPage?.documentName ?? null;
}

export const widgetCustomizationRouter = {
  /** The customer's real site for the live preview (iframe or screenshot). */
  site: privateProcedure
    .input(
      z.object({
        agentId: z.string().min(1),
        device: z.enum(["desktop", "mobile"]).default("desktop"),
        refresh: z.boolean().optional(),
      }),
    )
    .output(
      z.object({
        url: z.string().nullable(),
        frameable: z.boolean(),
        screenshotUrl: z.string().nullable(),
        capturedAt: z.string().nullable(),
        /** Isolated live-proxy URL for sites that refuse to be framed. */
        proxyUrl: z.string().nullable(),
      }),
    )
    .handler(async ({ input, context }) => {
      const url = await onboardingUrl(context.organizationId, input.agentId);
      if (!url || !/^https?:\/\//.test(url)) {
        return {
          url: null,
          frameable: false,
          screenshotUrl: null,
          capturedAt: null,
          proxyUrl: null,
        };
      }
      if (input.refresh) clearSitePreview(url);
      const preview = await getSitePreview(url, input.device);
      if (preview.frameable) return { ...preview, proxyUrl: null };
      // Blocks framing: serve it live through the isolated preview origin.
      const proxyUrl = await createPreviewSession(preview.url, {
        resolved: true,
      }).catch(() => null);
      if (proxyUrl) return { ...preview, proxyUrl };
      // Last resort: a (slow) screenshot.
      return {
        ...(await getSitePreview(url, input.device, { screenshot: true })),
        proxyUrl: null,
      };
    }),

  get: privateProcedure
    .input(z.object({ agentId: z.string().min(1) }))
    .output(CustomizationResponseSchema)
    .handler(async ({ input, context }) =>
      toResponse(await loadAgent(context.organizationId, input.agentId)),
    ),

  save: privateProcedure
    .input(
      z.object({
        agentId: z.string().min(1),
        settings: WidgetCustomizationSchema,
      }),
    )
    .output(CustomizationResponseSchema)
    .handler(async ({ input, context }) => {
      const agent = await loadAgent(context.organizationId, input.agentId);
      await prisma.agentWidgetBrand.upsert({
        where: { agentId: agent.id },
        update: { settings: input.settings },
        create: {
          agentId: agent.id,
          organizationId: context.organizationId,
          settings: input.settings,
        },
      });
      return toResponse(await loadAgent(context.organizationId, agent.id));
    }),
};
