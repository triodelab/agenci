import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const DocumentStatus = t.Union(
  [
    t.Literal("PENDING"),
    t.Literal("PROCESSING"),
    t.Literal("INDEXING"),
    t.Literal("COMPLETED"),
    t.Literal("FAILED"),
  ],
  { additionalProperties: false },
);
