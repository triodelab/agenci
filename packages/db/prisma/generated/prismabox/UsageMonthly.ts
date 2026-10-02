import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const UsageMonthlyPlain = t.Object(
  {
    id: t.String(),
    organizationId: t.String(),
    period: t.String({ description: `"2026-10"` }),
    messages: t.Integer(),
    inputTokens: t.Integer(),
    outputTokens: t.Integer(),
    byModel: t.Any({
      description: `Tokens per model, e.g. {"openai/gpt-4o-mini":{"in":1200,"out":300}}`,
    }),
    updatedAt: t.Date(),
  },
  {
    additionalProperties: false,
    description: `AI usage per organization per calendar month (Europe/Oslo), for cost
tracking. Conversations are counted from the conversations table.`,
  },
);

export const UsageMonthlyRelations = t.Object(
  {
    organization: t.Object(
      {
        id: t.String(),
        name: t.String(),
        slug: t.String(),
        logo: __nullable__(t.String()),
        createdAt: t.Date(),
        metadata: __nullable__(t.String()),
      },
      { additionalProperties: false },
    ),
  },
  {
    additionalProperties: false,
    description: `AI usage per organization per calendar month (Europe/Oslo), for cost
tracking. Conversations are counted from the conversations table.`,
  },
);

export const UsageMonthlyPlainInputCreate = t.Object(
  {
    period: t.String({ description: `"2026-10"` }),
    messages: t.Optional(t.Integer()),
    inputTokens: t.Optional(t.Integer()),
    outputTokens: t.Optional(t.Integer()),
    byModel: t.Optional(
      t.Any({
        description: `Tokens per model, e.g. {"openai/gpt-4o-mini":{"in":1200,"out":300}}`,
      }),
    ),
  },
  {
    additionalProperties: false,
    description: `AI usage per organization per calendar month (Europe/Oslo), for cost
tracking. Conversations are counted from the conversations table.`,
  },
);

export const UsageMonthlyPlainInputUpdate = t.Object(
  {
    period: t.Optional(t.String({ description: `"2026-10"` })),
    messages: t.Optional(t.Integer()),
    inputTokens: t.Optional(t.Integer()),
    outputTokens: t.Optional(t.Integer()),
    byModel: t.Optional(
      t.Any({
        description: `Tokens per model, e.g. {"openai/gpt-4o-mini":{"in":1200,"out":300}}`,
      }),
    ),
  },
  {
    additionalProperties: false,
    description: `AI usage per organization per calendar month (Europe/Oslo), for cost
tracking. Conversations are counted from the conversations table.`,
  },
);

export const UsageMonthlyRelationsInputCreate = t.Object(
  {
    organization: t.Object(
      {
        connect: t.Object(
          {
            id: t.String({ additionalProperties: false }),
          },
          { additionalProperties: false },
        ),
      },
      { additionalProperties: false },
    ),
  },
  {
    additionalProperties: false,
    description: `AI usage per organization per calendar month (Europe/Oslo), for cost
tracking. Conversations are counted from the conversations table.`,
  },
);

export const UsageMonthlyRelationsInputUpdate = t.Partial(
  t.Object(
    {
      organization: t.Object(
        {
          connect: t.Object(
            {
              id: t.String({ additionalProperties: false }),
            },
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    },
    {
      additionalProperties: false,
      description: `AI usage per organization per calendar month (Europe/Oslo), for cost
tracking. Conversations are counted from the conversations table.`,
    },
  ),
);

export const UsageMonthlyWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          organizationId: t.String(),
          period: t.String({ description: `"2026-10"` }),
          messages: t.Integer(),
          inputTokens: t.Integer(),
          outputTokens: t.Integer(),
          byModel: t.Any({
            description: `Tokens per model, e.g. {"openai/gpt-4o-mini":{"in":1200,"out":300}}`,
          }),
          updatedAt: t.Date(),
        },
        {
          additionalProperties: false,
          description: `AI usage per organization per calendar month (Europe/Oslo), for cost
tracking. Conversations are counted from the conversations table.`,
        },
      ),
    { $id: "UsageMonthly" },
  ),
);

export const UsageMonthlyWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              organizationId_period: t.Object(
                {
                  organizationId: t.String(),
                  period: t.String({ description: `"2026-10"` }),
                },
                { additionalProperties: false },
              ),
            },
            {
              additionalProperties: false,
              description: `AI usage per organization per calendar month (Europe/Oslo), for cost
tracking. Conversations are counted from the conversations table.`,
            },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({
              organizationId_period: t.Object(
                {
                  organizationId: t.String(),
                  period: t.String({ description: `"2026-10"` }),
                },
                { additionalProperties: false },
              ),
            }),
          ],
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object({
            AND: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            NOT: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            OR: t.Array(Self, { additionalProperties: false }),
          }),
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object(
            {
              id: t.String(),
              organizationId: t.String(),
              period: t.String({ description: `"2026-10"` }),
              messages: t.Integer(),
              inputTokens: t.Integer(),
              outputTokens: t.Integer(),
              byModel: t.Any({
                description: `Tokens per model, e.g. {"openai/gpt-4o-mini":{"in":1200,"out":300}}`,
              }),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "UsageMonthly" },
);

export const UsageMonthlySelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      organizationId: t.Boolean(),
      organization: t.Boolean(),
      period: t.Boolean(),
      messages: t.Boolean(),
      inputTokens: t.Boolean(),
      outputTokens: t.Boolean(),
      byModel: t.Boolean(),
      updatedAt: t.Boolean(),
      _count: t.Boolean(),
    },
    {
      additionalProperties: false,
      description: `AI usage per organization per calendar month (Europe/Oslo), for cost
tracking. Conversations are counted from the conversations table.`,
    },
  ),
);

export const UsageMonthlyInclude = t.Partial(
  t.Object(
    { organization: t.Boolean(), _count: t.Boolean() },
    {
      additionalProperties: false,
      description: `AI usage per organization per calendar month (Europe/Oslo), for cost
tracking. Conversations are counted from the conversations table.`,
    },
  ),
);

export const UsageMonthlyOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      organizationId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      period: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      messages: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      inputTokens: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      outputTokens: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      byModel: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      updatedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    {
      additionalProperties: false,
      description: `AI usage per organization per calendar month (Europe/Oslo), for cost
tracking. Conversations are counted from the conversations table.`,
    },
  ),
);

export const UsageMonthly = t.Composite(
  [UsageMonthlyPlain, UsageMonthlyRelations],
  { additionalProperties: false },
);

export const UsageMonthlyInputCreate = t.Composite(
  [UsageMonthlyPlainInputCreate, UsageMonthlyRelationsInputCreate],
  { additionalProperties: false },
);

export const UsageMonthlyInputUpdate = t.Composite(
  [UsageMonthlyPlainInputUpdate, UsageMonthlyRelationsInputUpdate],
  { additionalProperties: false },
);
