import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const AgentVertical = t.Union(
  [t.Literal("ECOMMERCE"), t.Literal("HEALTHCARE")],
  {
    additionalProperties: false,
    description: `Runtime Mastra vertical for customer-facing support agents.`,
  },
);
