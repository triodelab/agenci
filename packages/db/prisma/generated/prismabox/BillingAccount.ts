import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const BillingAccountPlain = t.Object(
  {
    id: t.String(),
    organizationId: t.String(),
    orgNumber: t.String({
      description: `9 digits, verified active in Enhetsregisteret. One organization per company.`,
    }),
    companyName: t.String(),
    trialStartedAt: __nullable__(
      t.Date({
        description: `Null when the org number had already used its trial.`,
      }),
    ),
    trialEndsAt: __nullable__(t.Date()),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  },
  {
    additionalProperties: false,
    description: `The company behind an organization. Required before agents can answer:
the org number (Enhetsregisteret) is what limits the trial to one per company.`,
  },
);

export const BillingAccountRelations = t.Object(
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
    description: `The company behind an organization. Required before agents can answer:
the org number (Enhetsregisteret) is what limits the trial to one per company.`,
  },
);

export const BillingAccountPlainInputCreate = t.Object(
  {
    orgNumber: t.String({
      description: `9 digits, verified active in Enhetsregisteret. One organization per company.`,
    }),
    companyName: t.String(),
    trialStartedAt: t.Optional(
      __nullable__(
        t.Date({
          description: `Null when the org number had already used its trial.`,
        }),
      ),
    ),
    trialEndsAt: t.Optional(__nullable__(t.Date())),
  },
  {
    additionalProperties: false,
    description: `The company behind an organization. Required before agents can answer:
the org number (Enhetsregisteret) is what limits the trial to one per company.`,
  },
);

export const BillingAccountPlainInputUpdate = t.Object(
  {
    orgNumber: t.Optional(
      t.String({
        description: `9 digits, verified active in Enhetsregisteret. One organization per company.`,
      }),
    ),
    companyName: t.Optional(t.String()),
    trialStartedAt: t.Optional(
      __nullable__(
        t.Date({
          description: `Null when the org number had already used its trial.`,
        }),
      ),
    ),
    trialEndsAt: t.Optional(__nullable__(t.Date())),
  },
  {
    additionalProperties: false,
    description: `The company behind an organization. Required before agents can answer:
the org number (Enhetsregisteret) is what limits the trial to one per company.`,
  },
);

export const BillingAccountRelationsInputCreate = t.Object(
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
    description: `The company behind an organization. Required before agents can answer:
the org number (Enhetsregisteret) is what limits the trial to one per company.`,
  },
);

export const BillingAccountRelationsInputUpdate = t.Partial(
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
      description: `The company behind an organization. Required before agents can answer:
the org number (Enhetsregisteret) is what limits the trial to one per company.`,
    },
  ),
);

export const BillingAccountWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          organizationId: t.String(),
          orgNumber: t.String({
            description: `9 digits, verified active in Enhetsregisteret. One organization per company.`,
          }),
          companyName: t.String(),
          trialStartedAt: t.Date({
            description: `Null when the org number had already used its trial.`,
          }),
          trialEndsAt: t.Date(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        {
          additionalProperties: false,
          description: `The company behind an organization. Required before agents can answer:
the org number (Enhetsregisteret) is what limits the trial to one per company.`,
        },
      ),
    { $id: "BillingAccount" },
  ),
);

export const BillingAccountWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              organizationId: t.String(),
              orgNumber: t.String({
                description: `9 digits, verified active in Enhetsregisteret. One organization per company.`,
              }),
            },
            {
              additionalProperties: false,
              description: `The company behind an organization. Required before agents can answer:
the org number (Enhetsregisteret) is what limits the trial to one per company.`,
            },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({ organizationId: t.String() }),
            t.Object({
              orgNumber: t.String({
                description: `9 digits, verified active in Enhetsregisteret. One organization per company.`,
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
              orgNumber: t.String({
                description: `9 digits, verified active in Enhetsregisteret. One organization per company.`,
              }),
              companyName: t.String(),
              trialStartedAt: t.Date({
                description: `Null when the org number had already used its trial.`,
              }),
              trialEndsAt: t.Date(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "BillingAccount" },
);

export const BillingAccountSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      organizationId: t.Boolean(),
      organization: t.Boolean(),
      orgNumber: t.Boolean(),
      companyName: t.Boolean(),
      trialStartedAt: t.Boolean(),
      trialEndsAt: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      _count: t.Boolean(),
    },
    {
      additionalProperties: false,
      description: `The company behind an organization. Required before agents can answer:
the org number (Enhetsregisteret) is what limits the trial to one per company.`,
    },
  ),
);

export const BillingAccountInclude = t.Partial(
  t.Object(
    { organization: t.Boolean(), _count: t.Boolean() },
    {
      additionalProperties: false,
      description: `The company behind an organization. Required before agents can answer:
the org number (Enhetsregisteret) is what limits the trial to one per company.`,
    },
  ),
);

export const BillingAccountOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      organizationId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      orgNumber: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      companyName: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      trialStartedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      trialEndsAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
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
      description: `The company behind an organization. Required before agents can answer:
the org number (Enhetsregisteret) is what limits the trial to one per company.`,
    },
  ),
);

export const BillingAccount = t.Composite(
  [BillingAccountPlain, BillingAccountRelations],
  { additionalProperties: false },
);

export const BillingAccountInputCreate = t.Composite(
  [BillingAccountPlainInputCreate, BillingAccountRelationsInputCreate],
  { additionalProperties: false },
);

export const BillingAccountInputUpdate = t.Composite(
  [BillingAccountPlainInputUpdate, BillingAccountRelationsInputUpdate],
  { additionalProperties: false },
);
