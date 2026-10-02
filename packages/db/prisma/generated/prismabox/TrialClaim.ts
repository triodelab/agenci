import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const TrialClaimPlain = t.Object(
  { orgNumber: t.String(), organizationId: t.String(), claimedAt: t.Date() },
  {
    additionalProperties: false,
    description: `Org numbers that have had the free trial. Deliberately NOT linked to the
organization: it outlives deleted organizations, so the trial is once per
company, ever.`,
  },
);

export const TrialClaimRelations = t.Object(
  {},
  {
    additionalProperties: false,
    description: `Org numbers that have had the free trial. Deliberately NOT linked to the
organization: it outlives deleted organizations, so the trial is once per
company, ever.`,
  },
);

export const TrialClaimPlainInputCreate = t.Object(
  { claimedAt: t.Optional(t.Date()) },
  {
    additionalProperties: false,
    description: `Org numbers that have had the free trial. Deliberately NOT linked to the
organization: it outlives deleted organizations, so the trial is once per
company, ever.`,
  },
);

export const TrialClaimPlainInputUpdate = t.Object(
  { claimedAt: t.Optional(t.Date()) },
  {
    additionalProperties: false,
    description: `Org numbers that have had the free trial. Deliberately NOT linked to the
organization: it outlives deleted organizations, so the trial is once per
company, ever.`,
  },
);

export const TrialClaimRelationsInputCreate = t.Object(
  {},
  {
    additionalProperties: false,
    description: `Org numbers that have had the free trial. Deliberately NOT linked to the
organization: it outlives deleted organizations, so the trial is once per
company, ever.`,
  },
);

export const TrialClaimRelationsInputUpdate = t.Partial(
  t.Object(
    {},
    {
      additionalProperties: false,
      description: `Org numbers that have had the free trial. Deliberately NOT linked to the
organization: it outlives deleted organizations, so the trial is once per
company, ever.`,
    },
  ),
);

export const TrialClaimWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          orgNumber: t.String(),
          organizationId: t.String(),
          claimedAt: t.Date(),
        },
        {
          additionalProperties: false,
          description: `Org numbers that have had the free trial. Deliberately NOT linked to the
organization: it outlives deleted organizations, so the trial is once per
company, ever.`,
        },
      ),
    { $id: "TrialClaim" },
  ),
);

export const TrialClaimWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { orgNumber: t.String() },
            {
              additionalProperties: false,
              description: `Org numbers that have had the free trial. Deliberately NOT linked to the
organization: it outlives deleted organizations, so the trial is once per
company, ever.`,
            },
          ),
          { additionalProperties: false },
        ),
        t.Union([t.Object({ orgNumber: t.String() })], {
          additionalProperties: false,
        }),
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
              orgNumber: t.String(),
              organizationId: t.String(),
              claimedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "TrialClaim" },
);

export const TrialClaimSelect = t.Partial(
  t.Object(
    {
      orgNumber: t.Boolean(),
      organizationId: t.Boolean(),
      claimedAt: t.Boolean(),
      _count: t.Boolean(),
    },
    {
      additionalProperties: false,
      description: `Org numbers that have had the free trial. Deliberately NOT linked to the
organization: it outlives deleted organizations, so the trial is once per
company, ever.`,
    },
  ),
);

export const TrialClaimInclude = t.Partial(
  t.Object(
    { _count: t.Boolean() },
    {
      additionalProperties: false,
      description: `Org numbers that have had the free trial. Deliberately NOT linked to the
organization: it outlives deleted organizations, so the trial is once per
company, ever.`,
    },
  ),
);

export const TrialClaimOrderBy = t.Partial(
  t.Object(
    {
      orgNumber: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      organizationId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      claimedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    {
      additionalProperties: false,
      description: `Org numbers that have had the free trial. Deliberately NOT linked to the
organization: it outlives deleted organizations, so the trial is once per
company, ever.`,
    },
  ),
);

export const TrialClaim = t.Composite([TrialClaimPlain, TrialClaimRelations], {
  additionalProperties: false,
});

export const TrialClaimInputCreate = t.Composite(
  [TrialClaimPlainInputCreate, TrialClaimRelationsInputCreate],
  { additionalProperties: false },
);

export const TrialClaimInputUpdate = t.Composite(
  [TrialClaimPlainInputUpdate, TrialClaimRelationsInputUpdate],
  { additionalProperties: false },
);
