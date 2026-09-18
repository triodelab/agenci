import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const TeamMemberPlain = t.Object(
  {
    id: t.String(),
    teamId: t.String(),
    userId: t.String(),
    membershipKey: __nullable__(t.String()),
    createdAt: __nullable__(t.Date()),
  },
  { additionalProperties: false },
);

export const TeamMemberRelations = t.Object(
  {
    team: t.Object(
      {
        id: t.String(),
        name: t.String(),
        memberCount: t.Integer(),
        organizationId: t.String(),
        createdAt: t.Date(),
        updatedAt: __nullable__(t.Date()),
      },
      { additionalProperties: false },
    ),
    user: t.Object(
      {
        id: t.String(),
        name: t.String(),
        email: t.String(),
        emailVerified: t.Boolean(),
        image: __nullable__(t.String()),
        createdAt: t.Date(),
        updatedAt: t.Date(),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const TeamMemberPlainInputCreate = t.Object(
  {
    membershipKey: t.Optional(__nullable__(t.String())),
    createdAt: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const TeamMemberPlainInputUpdate = t.Object(
  {
    membershipKey: t.Optional(__nullable__(t.String())),
    createdAt: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const TeamMemberRelationsInputCreate = t.Object(
  {
    team: t.Object(
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
    user: t.Object(
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
  { additionalProperties: false },
);

export const TeamMemberRelationsInputUpdate = t.Partial(
  t.Object(
    {
      team: t.Object(
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
      user: t.Object(
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
    { additionalProperties: false },
  ),
);

export const TeamMemberWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          teamId: t.String(),
          userId: t.String(),
          membershipKey: t.String(),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "TeamMember" },
  ),
);

export const TeamMemberWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.String(), membershipKey: t.String() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({ membershipKey: t.String() }),
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
              teamId: t.String(),
              userId: t.String(),
              membershipKey: t.String(),
              createdAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "TeamMember" },
);

export const TeamMemberSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      teamId: t.Boolean(),
      team: t.Boolean(),
      userId: t.Boolean(),
      user: t.Boolean(),
      membershipKey: t.Boolean(),
      createdAt: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const TeamMemberInclude = t.Partial(
  t.Object(
    { team: t.Boolean(), user: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const TeamMemberOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      teamId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      membershipKey: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const TeamMember = t.Composite([TeamMemberPlain, TeamMemberRelations], {
  additionalProperties: false,
});

export const TeamMemberInputCreate = t.Composite(
  [TeamMemberPlainInputCreate, TeamMemberRelationsInputCreate],
  { additionalProperties: false },
);

export const TeamMemberInputUpdate = t.Composite(
  [TeamMemberPlainInputUpdate, TeamMemberRelationsInputUpdate],
  { additionalProperties: false },
);
