import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const AdminAuditLogPlain = t.Object(
  {
    id: t.String(),
    actorUserId: t.String(),
    actorEmail: t.String(),
    action: t.String(),
    target: __nullable__(t.String()),
    details: t.Any(),
    createdAt: t.Date(),
  },
  {
    additionalProperties: false,
    description: `Everything done in the admin area: who, what, on whom, when.`,
  },
);

export const AdminAuditLogRelations = t.Object(
  {},
  {
    additionalProperties: false,
    description: `Everything done in the admin area: who, what, on whom, when.`,
  },
);

export const AdminAuditLogPlainInputCreate = t.Object(
  {
    actorEmail: t.String(),
    action: t.String(),
    target: t.Optional(__nullable__(t.String())),
    details: t.Optional(t.Any()),
  },
  {
    additionalProperties: false,
    description: `Everything done in the admin area: who, what, on whom, when.`,
  },
);

export const AdminAuditLogPlainInputUpdate = t.Object(
  {
    actorEmail: t.Optional(t.String()),
    action: t.Optional(t.String()),
    target: t.Optional(__nullable__(t.String())),
    details: t.Optional(t.Any()),
  },
  {
    additionalProperties: false,
    description: `Everything done in the admin area: who, what, on whom, when.`,
  },
);

export const AdminAuditLogRelationsInputCreate = t.Object(
  {},
  {
    additionalProperties: false,
    description: `Everything done in the admin area: who, what, on whom, when.`,
  },
);

export const AdminAuditLogRelationsInputUpdate = t.Partial(
  t.Object(
    {},
    {
      additionalProperties: false,
      description: `Everything done in the admin area: who, what, on whom, when.`,
    },
  ),
);

export const AdminAuditLogWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          actorUserId: t.String(),
          actorEmail: t.String(),
          action: t.String(),
          target: t.String(),
          details: t.Any(),
          createdAt: t.Date(),
        },
        {
          additionalProperties: false,
          description: `Everything done in the admin area: who, what, on whom, when.`,
        },
      ),
    { $id: "AdminAuditLog" },
  ),
);

export const AdminAuditLogWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.String() },
            {
              additionalProperties: false,
              description: `Everything done in the admin area: who, what, on whom, when.`,
            },
          ),
          { additionalProperties: false },
        ),
        t.Union([t.Object({ id: t.String() })], {
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
              id: t.String(),
              actorUserId: t.String(),
              actorEmail: t.String(),
              action: t.String(),
              target: t.String(),
              details: t.Any(),
              createdAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "AdminAuditLog" },
);

export const AdminAuditLogSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      actorUserId: t.Boolean(),
      actorEmail: t.Boolean(),
      action: t.Boolean(),
      target: t.Boolean(),
      details: t.Boolean(),
      createdAt: t.Boolean(),
      _count: t.Boolean(),
    },
    {
      additionalProperties: false,
      description: `Everything done in the admin area: who, what, on whom, when.`,
    },
  ),
);

export const AdminAuditLogInclude = t.Partial(
  t.Object(
    { _count: t.Boolean() },
    {
      additionalProperties: false,
      description: `Everything done in the admin area: who, what, on whom, when.`,
    },
  ),
);

export const AdminAuditLogOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      actorUserId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      actorEmail: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      action: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      target: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      details: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    {
      additionalProperties: false,
      description: `Everything done in the admin area: who, what, on whom, when.`,
    },
  ),
);

export const AdminAuditLog = t.Composite(
  [AdminAuditLogPlain, AdminAuditLogRelations],
  { additionalProperties: false },
);

export const AdminAuditLogInputCreate = t.Composite(
  [AdminAuditLogPlainInputCreate, AdminAuditLogRelationsInputCreate],
  { additionalProperties: false },
);

export const AdminAuditLogInputUpdate = t.Composite(
  [AdminAuditLogPlainInputUpdate, AdminAuditLogRelationsInputUpdate],
  { additionalProperties: false },
);
