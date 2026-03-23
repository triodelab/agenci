import { createClerkClient } from "@clerk/backend";
import { ConvexError, v } from "convex/values";
import { action } from "../_generated/server";

export const validate = action({
  args: {
    organizationId: v.string(),
  },
  handler: async (_, args) => {
    const secretKey = process.env.CLERK_SECRET_KEY?.trim();
    if (!secretKey) {
      throw new ConvexError({
        code: "BAD_CONFIGURATION",
        message:
          "CLERK_SECRET_KEY mangler på Convex-deploymenten. Samme nøkkel som i apps/web (Clerk Secret Key): cd packages/backend && npx convex env set CLERK_SECRET_KEY \"sk_test_...\"",
      });
    }

    const clerkClient = createClerkClient({ secretKey });

    const organization = await clerkClient.organizations.getOrganization({
      organizationId: args.organizationId,
    });
    
    if (organization) {
    return { valid: true }
    } else {
      return { valid: false, reason: "Organization not valid" };
    }
  },
});
