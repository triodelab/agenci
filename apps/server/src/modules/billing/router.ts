/**
 * Billing for the dashboard. Everyone in the organization can see the state;
 * only owners and admins can register the company or touch the payment.
 */
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import prisma from "@agenci/db";
import { base, privateProcedure } from "@/routers/procedures";
import { env } from "@agenci/env/server";
import { lookupCompany } from "./brreg";
import { NEXI_CHECKOUT_JS, nexiConfigured } from "./nexi";
import { sellerVatRegistered } from "./seller";
import { PLAN_IDS, type PlanId, PLANS, planAmounts, TRIAL_DAYS } from "./plans";
import {
  changePlan,
  canPay,
  confirmCheckout,
  conversationsThisMonth,
  getBillingState,
  getInvoice,
  listPayments,
  registerCompany,
  setCancelAtPeriodEnd,
  startCardUpdate,
  startCheckout,
} from "./service";

const PlanSchema = z.enum(PLAN_IDS as [PlanId, ...PlanId[]]);

/**
 * The session carries no role (Better Auth doesn't set activeOrganizationRole),
 * so read it from the membership itself.
 */
async function requireManager(context: { userId: string; organizationId: string }) {
  const member = await prisma.member.findFirst({
    where: { userId: context.userId, organizationId: context.organizationId },
    select: { role: true },
  });
  const roles = (member?.role ?? "").split(",").map((r) => r.trim());
  if (!roles.includes("owner") && !roles.includes("admin")) {
    throw new ORPCError("FORBIDDEN", { message: "Bare eiere og administratorer kan endre betaling." });
  }
}

const CheckoutResponse = z.object({ paymentId: z.string(), checkoutKey: z.string(), scriptUrl: z.string() });

export const billingRouter = {
  status: privateProcedure.handler(async ({ context }) => {
    const [state, used] = await Promise.all([
      getBillingState(context.organizationId),
      conversationsThisMonth(context.organizationId),
    ]);
    return {
      ...state,
      conversationsThisMonth: used,
      /** False while Nexi is in test mode, except for the developers. */
      canPay: canPay(context.user.email),
      checkout: nexiConfigured() ? { checkoutKey: env.NEXI_CHECKOUT_KEY as string, scriptUrl: NEXI_CHECKOUT_JS } : null,
      trialDays: TRIAL_DAYS,
      plans: Object.values(PLANS).map((p) => ({ ...p, priceWithVat: planAmounts(p.id).gross })),
      vatRegistered: sellerVatRegistered(),
    };
  }),

  /**
   * Live lookup while typing the org number (shows the company name). Public
   * register data only, so it also works before the organization exists.
   */
  lookupCompany: base
    .input(z.object({ orgNumber: z.string().min(1).max(20) }))
    .handler(async ({ input }) => lookupCompany(input.orgNumber)),

  registerCompany: privateProcedure
    .input(z.object({ orgNumber: z.string().min(9).max(20) }))
    .handler(async ({ input, context }) => {
      await requireManager(context);
      return registerCompany(context.organizationId, input.orgNumber);
    }),

  startCheckout: privateProcedure
    .input(z.object({ plan: PlanSchema }))
    .output(CheckoutResponse)
    .handler(async ({ input, context }) => {
      await requireManager(context);
      return startCheckout(context.organizationId, input.plan, context.user.email);
    }),

  startCardUpdate: privateProcedure.output(CheckoutResponse).handler(async ({ context }) => {
    await requireManager(context);
    return startCardUpdate(context.organizationId, context.user.email);
  }),

  confirmCheckout: privateProcedure
    .input(z.object({ paymentId: z.string().min(8).max(64) }))
    .handler(async ({ input, context }) => confirmCheckout(context.organizationId, input.paymentId)),

  changePlan: privateProcedure.input(z.object({ plan: PlanSchema })).handler(async ({ input, context }) => {
    await requireManager(context);
    await changePlan(context.organizationId, input.plan);
    return { ok: true };
  }),

  setCancel: privateProcedure.input(z.object({ cancel: z.boolean() })).handler(async ({ input, context }) => {
    await requireManager(context);
    await setCancelAtPeriodEnd(context.organizationId, input.cancel);
    return { ok: true };
  }),

  payments: privateProcedure.handler(async ({ context }) => listPayments(context.organizationId)),

  invoice: privateProcedure
    .input(z.object({ id: z.string().min(1) }))
    .handler(async ({ input, context }) => getInvoice(context.organizationId, input.id)),
};
