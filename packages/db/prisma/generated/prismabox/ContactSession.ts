import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ContactSessionPlain = t.Object(
  {
    id: t.String(),
    organizationId: t.String(),
    agentId: __nullable__(t.String()),
    name: __nullable__(t.String()),
    email: __nullable__(t.String()),
    anonymous: t.Boolean(),
    metadata: __nullable__(t.Any()),
    expiresAt: t.Date(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  },
  {
    additionalProperties: false,
    description: `Widget visitor identity — no Better Auth session; anonymous website
visitors are scoped by this token + org (docs/task.md Phase 4, Task 4.1).
Conversation history itself lives in Mastra's own thread memory, keyed by
\`${organizationId}:contact:${contactSession.id}\` + a client-generated
threadId — this table only tracks the visitor and their contact info.`,
  },
);

export const ContactSessionRelations = t.Object(
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
    conversations: t.Array(
      t.Object(
        {
          id: t.String({ description: `Same id as the Mastra memory thread.` }),
          organizationId: t.String(),
          agentId: t.String(),
          contactSessionId: t.String(),
          status: t.Union(
            [
              t.Literal("unresolved"),
              t.Literal("escalated"),
              t.Literal("resolved"),
            ],
            { additionalProperties: false },
          ),
          firstMessage: __nullable__(
            t.String({
              description: `First visitor message — the conversation's headline.`,
            }),
          ),
          lastMessage: __nullable__(t.String()),
          lastMessageRole: __nullable__(t.String()),
          messageCount: t.Integer(),
          lastMessageAt: t.Date(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        {
          additionalProperties: false,
          description: `One row per widget conversation — the index the inbox, overview and agent
list read from. The messages themselves stay in the Mastra memory thread
with the same id; this row is kept in step on every message
(\`modules/conversations/service.ts\`).`,
        },
      ),
      { additionalProperties: false },
    ),
  },
  {
    additionalProperties: false,
    description: `Widget visitor identity — no Better Auth session; anonymous website
visitors are scoped by this token + org (docs/task.md Phase 4, Task 4.1).
Conversation history itself lives in Mastra's own thread memory, keyed by
\`${organizationId}:contact:${contactSession.id}\` + a client-generated
threadId — this table only tracks the visitor and their contact info.`,
  },
);

export const ContactSessionPlainInputCreate = t.Object(
  {
    name: t.Optional(__nullable__(t.String())),
    email: t.Optional(__nullable__(t.String())),
    anonymous: t.Optional(t.Boolean()),
    metadata: t.Optional(__nullable__(t.Any())),
    expiresAt: t.Date(),
  },
  {
    additionalProperties: false,
    description: `Widget visitor identity — no Better Auth session; anonymous website
visitors are scoped by this token + org (docs/task.md Phase 4, Task 4.1).
Conversation history itself lives in Mastra's own thread memory, keyed by
\`${organizationId}:contact:${contactSession.id}\` + a client-generated
threadId — this table only tracks the visitor and their contact info.`,
  },
);

export const ContactSessionPlainInputUpdate = t.Object(
  {
    name: t.Optional(__nullable__(t.String())),
    email: t.Optional(__nullable__(t.String())),
    anonymous: t.Optional(t.Boolean()),
    metadata: t.Optional(__nullable__(t.Any())),
    expiresAt: t.Optional(t.Date()),
  },
  {
    additionalProperties: false,
    description: `Widget visitor identity — no Better Auth session; anonymous website
visitors are scoped by this token + org (docs/task.md Phase 4, Task 4.1).
Conversation history itself lives in Mastra's own thread memory, keyed by
\`${organizationId}:contact:${contactSession.id}\` + a client-generated
threadId — this table only tracks the visitor and their contact info.`,
  },
);

export const ContactSessionRelationsInputCreate = t.Object(
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
    conversations: t.Optional(
      t.Object(
        {
          connect: t.Array(
            t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    ),
  },
  {
    additionalProperties: false,
    description: `Widget visitor identity — no Better Auth session; anonymous website
visitors are scoped by this token + org (docs/task.md Phase 4, Task 4.1).
Conversation history itself lives in Mastra's own thread memory, keyed by
\`${organizationId}:contact:${contactSession.id}\` + a client-generated
threadId — this table only tracks the visitor and their contact info.`,
  },
);

export const ContactSessionRelationsInputUpdate = t.Partial(
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
      conversations: t.Partial(
        t.Object(
          {
            connect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
            disconnect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
          },
          { additionalProperties: false },
        ),
      ),
    },
    {
      additionalProperties: false,
      description: `Widget visitor identity — no Better Auth session; anonymous website
visitors are scoped by this token + org (docs/task.md Phase 4, Task 4.1).
Conversation history itself lives in Mastra's own thread memory, keyed by
\`${organizationId}:contact:${contactSession.id}\` + a client-generated
threadId — this table only tracks the visitor and their contact info.`,
    },
  ),
);

export const ContactSessionWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          organizationId: t.String(),
          agentId: t.String(),
          name: t.String(),
          email: t.String(),
          anonymous: t.Boolean(),
          metadata: t.Any(),
          expiresAt: t.Date(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        {
          additionalProperties: false,
          description: `Widget visitor identity — no Better Auth session; anonymous website
visitors are scoped by this token + org (docs/task.md Phase 4, Task 4.1).
Conversation history itself lives in Mastra's own thread memory, keyed by
\`${organizationId}:contact:${contactSession.id}\` + a client-generated
threadId — this table only tracks the visitor and their contact info.`,
        },
      ),
    { $id: "ContactSession" },
  ),
);

export const ContactSessionWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.String() },
            {
              additionalProperties: false,
              description: `Widget visitor identity — no Better Auth session; anonymous website
visitors are scoped by this token + org (docs/task.md Phase 4, Task 4.1).
Conversation history itself lives in Mastra's own thread memory, keyed by
\`${organizationId}:contact:${contactSession.id}\` + a client-generated
threadId — this table only tracks the visitor and their contact info.`,
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
              organizationId: t.String(),
              agentId: t.String(),
              name: t.String(),
              email: t.String(),
              anonymous: t.Boolean(),
              metadata: t.Any(),
              expiresAt: t.Date(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "ContactSession" },
);

export const ContactSessionSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      organizationId: t.Boolean(),
      organization: t.Boolean(),
      agentId: t.Boolean(),
      name: t.Boolean(),
      email: t.Boolean(),
      anonymous: t.Boolean(),
      metadata: t.Boolean(),
      expiresAt: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      conversations: t.Boolean(),
      _count: t.Boolean(),
    },
    {
      additionalProperties: false,
      description: `Widget visitor identity — no Better Auth session; anonymous website
visitors are scoped by this token + org (docs/task.md Phase 4, Task 4.1).
Conversation history itself lives in Mastra's own thread memory, keyed by
\`${organizationId}:contact:${contactSession.id}\` + a client-generated
threadId — this table only tracks the visitor and their contact info.`,
    },
  ),
);

export const ContactSessionInclude = t.Partial(
  t.Object(
    {
      organization: t.Boolean(),
      conversations: t.Boolean(),
      _count: t.Boolean(),
    },
    {
      additionalProperties: false,
      description: `Widget visitor identity — no Better Auth session; anonymous website
visitors are scoped by this token + org (docs/task.md Phase 4, Task 4.1).
Conversation history itself lives in Mastra's own thread memory, keyed by
\`${organizationId}:contact:${contactSession.id}\` + a client-generated
threadId — this table only tracks the visitor and their contact info.`,
    },
  ),
);

export const ContactSessionOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      organizationId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      agentId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      name: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      email: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      anonymous: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      metadata: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      expiresAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
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
      description: `Widget visitor identity — no Better Auth session; anonymous website
visitors are scoped by this token + org (docs/task.md Phase 4, Task 4.1).
Conversation history itself lives in Mastra's own thread memory, keyed by
\`${organizationId}:contact:${contactSession.id}\` + a client-generated
threadId — this table only tracks the visitor and their contact info.`,
    },
  ),
);

export const ContactSession = t.Composite(
  [ContactSessionPlain, ContactSessionRelations],
  { additionalProperties: false },
);

export const ContactSessionInputCreate = t.Composite(
  [ContactSessionPlainInputCreate, ContactSessionRelationsInputCreate],
  { additionalProperties: false },
);

export const ContactSessionInputUpdate = t.Composite(
  [ContactSessionPlainInputUpdate, ContactSessionRelationsInputUpdate],
  { additionalProperties: false },
);
