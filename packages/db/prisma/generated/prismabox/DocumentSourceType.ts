import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const DocumentSourceType = t.Union(
  [t.Literal("DOCUMENT"), t.Literal("WEBPAGE"), t.Literal("MEDIA")],
  { additionalProperties: false },
);
