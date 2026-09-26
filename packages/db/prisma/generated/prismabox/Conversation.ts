import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ConversationPlain = t.Object(
  {
    id: t.String({ description: `Same id as the Mastra memory thread.` }),
    organizationId: t.String(),
    agentId: t.String(),
    contactSessionId: t.String(),
    status: t.Union(
      [t.Literal("unresolved"), t.Literal("escalated"), t.Literal("resolved")],
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
);

export const ConversationRelations = t.Object(
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
    agent: t.Object(
      {
        id: t.String(),
        organizationId: t.String(),
        name: t.String({
          description: `Unique within the organization (not across all customers).`,
        }),
        description: t.String(),
        slug: t.String(),
        modelLabel: __nullable__(t.String()),
        status: t.Union(
          [
            t.Literal("PENDING"),
            t.Literal("PROCESSING"),
            t.Literal("COMPLETED"),
            t.Literal("FAILED"),
          ],
          { additionalProperties: false },
        ),
        createdAt: t.Date(),
        updatedAt: t.Date(),
      },
      { additionalProperties: false },
    ),
    contactSession: t.Object(
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
    ),
  },
  {
    additionalProperties: false,
    description: `One row per widget conversation — the index the inbox, overview and agent
list read from. The messages themselves stay in the Mastra memory thread
with the same id; this row is kept in step on every message
(\`modules/conversations/service.ts\`).`,
  },
);

export const ConversationPlainInputCreate = t.Object(
  {
    status: t.Optional(
      t.Union(
        [
          t.Literal("unresolved"),
          t.Literal("escalated"),
          t.Literal("resolved"),
        ],
        { additionalProperties: false },
      ),
    ),
    firstMessage: t.Optional(
      __nullable__(
        t.String({
          description: `First visitor message — the conversation's headline.`,
        }),
      ),
    ),
    lastMessage: t.Optional(__nullable__(t.String())),
    lastMessageRole: t.Optional(__nullable__(t.String())),
    messageCount: t.Optional(t.Integer()),
    lastMessageAt: t.Optional(t.Date()),
  },
  {
    additionalProperties: false,
    description: `One row per widget conversation — the index the inbox, overview and agent
list read from. The messages themselves stay in the Mastra memory thread
with the same id; this row is kept in step on every message
(\`modules/conversations/service.ts\`).`,
  },
);

export const ConversationPlainInputUpdate = t.Object(
  {
    status: t.Optional(
      t.Union(
        [
          t.Literal("unresolved"),
          t.Literal("escalated"),
          t.Literal("resolved"),
        ],
        { additionalProperties: false },
      ),
    ),
    firstMessage: t.Optional(
      __nullable__(
        t.String({
          description: `First visitor message — the conversation's headline.`,
        }),
      ),
    ),
    lastMessage: t.Optional(__nullable__(t.String())),
    lastMessageRole: t.Optional(__nullable__(t.String())),
    messageCount: t.Optional(t.Integer()),
    lastMessageAt: t.Optional(t.Date()),
  },
  {
    additionalProperties: false,
    description: `One row per widget conversation — the index the inbox, overview and agent
list read from. The messages themselves stay in the Mastra memory thread
with the same id; this row is kept in step on every message
(\`modules/conversations/service.ts\`).`,
  },
);

export const ConversationRelationsInputCreate = t.Object(
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
    agent: t.Object(
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
    contactSession: t.Object(
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
    description: `One row per widget conversation — the index the inbox, overview and agent
list read from. The messages themselves stay in the Mastra memory thread
with the same id; this row is kept in step on every message
(\`modules/conversations/service.ts\`).`,
  },
);

export const ConversationRelationsInputUpdate = t.Partial(
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
      agent: t.Object(
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
      contactSession: t.Object(
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
      description: `One row per widget conversation — the index the inbox, overview and agent
list read from. The messages themselves stay in the Mastra memory thread
with the same id; this row is kept in step on every message
(\`modules/conversations/service.ts\`).`,
    },
  ),
);

export const ConversationWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
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
          firstMessage: t.String({
            description: `First visitor message — the conversation's headline.`,
          }),
          lastMessage: t.String(),
          lastMessageRole: t.String(),
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
    { $id: "Conversation" },
  ),
);

export const ConversationWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String({
                description: `Same id as the Mastra memory thread.`,
              }),
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
        t.Union(
          [
            t.Object({
              id: t.String({
                description: `Same id as the Mastra memory thread.`,
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
              id: t.String({
                description: `Same id as the Mastra memory thread.`,
              }),
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
              firstMessage: t.String({
                description: `First visitor message — the conversation's headline.`,
              }),
              lastMessage: t.String(),
              lastMessageRole: t.String(),
              messageCount: t.Integer(),
              lastMessageAt: t.Date(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Conversation" },
);

export const ConversationSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      organizationId: t.Boolean(),
      organization: t.Boolean(),
      agentId: t.Boolean(),
      agent: t.Boolean(),
      contactSessionId: t.Boolean(),
      contactSession: t.Boolean(),
      status: t.Boolean(),
      firstMessage: t.Boolean(),
      lastMessage: t.Boolean(),
      lastMessageRole: t.Boolean(),
      messageCount: t.Boolean(),
      lastMessageAt: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      _count: t.Boolean(),
    },
    {
      additionalProperties: false,
      description: `One row per widget conversation — the index the inbox, overview and agent
list read from. The messages themselves stay in the Mastra memory thread
with the same id; this row is kept in step on every message
(\`modules/conversations/service.ts\`).`,
    },
  ),
);

export const ConversationInclude = t.Partial(
  t.Object(
    {
      organization: t.Boolean(),
      agent: t.Boolean(),
      contactSession: t.Boolean(),
      status: t.Boolean(),
      _count: t.Boolean(),
    },
    {
      additionalProperties: false,
      description: `One row per widget conversation — the index the inbox, overview and agent
list read from. The messages themselves stay in the Mastra memory thread
with the same id; this row is kept in step on every message
(\`modules/conversations/service.ts\`).`,
    },
  ),
);

export const ConversationOrderBy = t.Partial(
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
      contactSessionId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      firstMessage: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      lastMessage: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      lastMessageRole: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      messageCount: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      lastMessageAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
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
      description: `One row per widget conversation — the index the inbox, overview and agent
list read from. The messages themselves stay in the Mastra memory thread
with the same id; this row is kept in step on every message
(\`modules/conversations/service.ts\`).`,
    },
  ),
);

export const Conversation = t.Composite(
  [ConversationPlain, ConversationRelations],
  { additionalProperties: false },
);

export const ConversationInputCreate = t.Composite(
  [ConversationPlainInputCreate, ConversationRelationsInputCreate],
  { additionalProperties: false },
);

export const ConversationInputUpdate = t.Composite(
  [ConversationPlainInputUpdate, ConversationRelationsInputUpdate],
  { additionalProperties: false },
);
