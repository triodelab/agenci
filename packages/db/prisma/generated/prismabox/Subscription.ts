import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const SubscriptionPlain = t.Object(
  {
    id: t.String(),
    organizationId: t.String(),
    plan: t.String({
      description: `"starter" | "pro" (see apps/server/src/modules/billing/plans.ts)`,
    }),
    status: t.String({
      description: `"pending" (checkout started) | "active" | "past_due" | "canceled"`,
    }),
    nexiSubscriptionId: __nullable__(
      t.String({
        description: `Nexi Checkout subscription id — charged every month.`,
      }),
    ),
    nexiPaymentId: __nullable__(
      t.String({
        description: `The checkout payment that created (or last updated) the subscription.`,
      }),
    ),
    currentPeriodStart: __nullable__(t.Date()),
    currentPeriodEnd: __nullable__(t.Date()),
    cancelAtPeriodEnd: t.Boolean({
      description: `Cancelled by the customer: stays active until currentPeriodEnd.`,
    }),
    pastDueSince: __nullable__(
      t.Date({
        description: `When the last charge failed (drives the grace period).`,
      }),
    ),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  },
  {
    additionalProperties: false,
    description: `One per organization once it has started a paid plan (none = free plan).`,
  },
);

export const SubscriptionRelations = t.Object(
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
    description: `One per organization once it has started a paid plan (none = free plan).`,
  },
);

export const SubscriptionPlainInputCreate = t.Object(
  {
    plan: t.String({
      description: `"starter" | "pro" (see apps/server/src/modules/billing/plans.ts)`,
    }),
    status: t.Optional(
      t.String({
        description: `"pending" (checkout started) | "active" | "past_due" | "canceled"`,
      }),
    ),
    currentPeriodStart: t.Optional(__nullable__(t.Date())),
    currentPeriodEnd: t.Optional(__nullable__(t.Date())),
    cancelAtPeriodEnd: t.Optional(
      t.Boolean({
        description: `Cancelled by the customer: stays active until currentPeriodEnd.`,
      }),
    ),
    pastDueSince: t.Optional(
      __nullable__(
        t.Date({
          description: `When the last charge failed (drives the grace period).`,
        }),
      ),
    ),
  },
  {
    additionalProperties: false,
    description: `One per organization once it has started a paid plan (none = free plan).`,
  },
);

export const SubscriptionPlainInputUpdate = t.Object(
  {
    plan: t.Optional(
      t.String({
        description: `"starter" | "pro" (see apps/server/src/modules/billing/plans.ts)`,
      }),
    ),
    status: t.Optional(
      t.String({
        description: `"pending" (checkout started) | "active" | "past_due" | "canceled"`,
      }),
    ),
    currentPeriodStart: t.Optional(__nullable__(t.Date())),
    currentPeriodEnd: t.Optional(__nullable__(t.Date())),
    cancelAtPeriodEnd: t.Optional(
      t.Boolean({
        description: `Cancelled by the customer: stays active until currentPeriodEnd.`,
      }),
    ),
    pastDueSince: t.Optional(
      __nullable__(
        t.Date({
          description: `When the last charge failed (drives the grace period).`,
        }),
      ),
    ),
  },
  {
    additionalProperties: false,
    description: `One per organization once it has started a paid plan (none = free plan).`,
  },
);

export const SubscriptionRelationsInputCreate = t.Object(
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
    description: `One per organization once it has started a paid plan (none = free plan).`,
  },
);

export const SubscriptionRelationsInputUpdate = t.Partial(
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
      description: `One per organization once it has started a paid plan (none = free plan).`,
    },
  ),
);

export const SubscriptionWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          organizationId: t.String(),
          plan: t.String({
            description: `"starter" | "pro" (see apps/server/src/modules/billing/plans.ts)`,
          }),
          status: t.String({
            description: `"pending" (checkout started) | "active" | "past_due" | "canceled"`,
          }),
          nexiSubscriptionId: t.String({
            description: `Nexi Checkout subscription id — charged every month.`,
          }),
          nexiPaymentId: t.String({
            description: `The checkout payment that created (or last updated) the subscription.`,
          }),
          currentPeriodStart: t.Date(),
          currentPeriodEnd: t.Date(),
          cancelAtPeriodEnd: t.Boolean({
            description: `Cancelled by the customer: stays active until currentPeriodEnd.`,
          }),
          pastDueSince: t.Date({
            description: `When the last charge failed (drives the grace period).`,
          }),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        {
          additionalProperties: false,
          description: `One per organization once it has started a paid plan (none = free plan).`,
        },
      ),
    { $id: "Subscription" },
  ),
);

export const SubscriptionWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              organizationId: t.String(),
              nexiSubscriptionId: t.String({
                description: `Nexi Checkout subscription id — charged every month.`,
              }),
            },
            {
              additionalProperties: false,
              description: `One per organization once it has started a paid plan (none = free plan).`,
            },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({ organizationId: t.String() }),
            t.Object({
              nexiSubscriptionId: t.String({
                description: `Nexi Checkout subscription id — charged every month.`,
              }),
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
              plan: t.String({
                description: `"starter" | "pro" (see apps/server/src/modules/billing/plans.ts)`,
              }),
              status: t.String({
                description: `"pending" (checkout started) | "active" | "past_due" | "canceled"`,
              }),
              nexiSubscriptionId: t.String({
                description: `Nexi Checkout subscription id — charged every month.`,
              }),
              nexiPaymentId: t.String({
                description: `The checkout payment that created (or last updated) the subscription.`,
              }),
              currentPeriodStart: t.Date(),
              currentPeriodEnd: t.Date(),
              cancelAtPeriodEnd: t.Boolean({
                description: `Cancelled by the customer: stays active until currentPeriodEnd.`,
              }),
              pastDueSince: t.Date({
                description: `When the last charge failed (drives the grace period).`,
              }),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Subscription" },
);

export const SubscriptionSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      organizationId: t.Boolean(),
      organization: t.Boolean(),
      plan: t.Boolean(),
      status: t.Boolean(),
      nexiSubscriptionId: t.Boolean(),
      nexiPaymentId: t.Boolean(),
      currentPeriodStart: t.Boolean(),
      currentPeriodEnd: t.Boolean(),
      cancelAtPeriodEnd: t.Boolean(),
      pastDueSince: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      _count: t.Boolean(),
    },
    {
      additionalProperties: false,
      description: `One per organization once it has started a paid plan (none = free plan).`,
    },
  ),
);

export const SubscriptionInclude = t.Partial(
  t.Object(
    { organization: t.Boolean(), _count: t.Boolean() },
    {
      additionalProperties: false,
      description: `One per organization once it has started a paid plan (none = free plan).`,
    },
  ),
);

export const SubscriptionOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      organizationId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      plan: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      status: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      nexiSubscriptionId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      nexiPaymentId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      currentPeriodStart: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      currentPeriodEnd: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      cancelAtPeriodEnd: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      pastDueSince: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      updatedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    {
      additionalProperties: false,
      description: `One per organization once it has started a paid plan (none = free plan).`,
    },
  ),
);

export const Subscription = t.Composite(
  [SubscriptionPlain, SubscriptionRelations],
  { additionalProperties: false },
);

export const SubscriptionInputCreate = t.Composite(
  [SubscriptionPlainInputCreate, SubscriptionRelationsInputCreate],
  { additionalProperties: false },
);

export const SubscriptionInputUpdate = t.Composite(
  [SubscriptionPlainInputUpdate, SubscriptionRelationsInputUpdate],
  { additionalProperties: false },
);
