import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { internalAction } from "../../_generated/server";

/**
 * Diagnose: sjekk at `OPENAI_API_KEY` er satt på deploymenten og at `gpt-4o-mini` svarer.
 *
 * ```bash
 * cd packages/backend && npx convex run system/ai/pingMini:ping '{}'
 * ```
 *
 * Nøkkel må være på Convex (Dashboard → Settings → Environment variables eller
 * `npx convex env set OPENAI_API_KEY "sk-..."`). Lokalt: `packages/backend/.env.local`.
 */
export const ping = internalAction({
  args: {},
  handler: async () => {
    const key = process.env.OPENAI_API_KEY;
    if (!key?.trim()) {
      return {
        ok: false as const,
        step: "env" as const,
        error: "OPENAI_API_KEY is not set on this Convex deployment",
      };
    }

    try {
      const response = await generateText({
        model: openai("gpt-4o-mini"),
        messages: [
          {
            role: "user",
            content: "Reply with exactly one word: pong. No punctuation or other text.",
          },
        ],
        maxTokens: 32,
      });

      return {
        ok: true as const,
        model: "gpt-4o-mini" as const,
        reply: response.text.trim(),
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return {
        ok: false as const,
        step: "openai" as const,
        error: message,
      };
    }
  },
});
