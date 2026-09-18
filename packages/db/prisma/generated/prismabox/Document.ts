import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const DocumentPlain = t.Object(
  {
    id: t.String(),
    organizationId: t.String(),
    agentId: __nullable__(t.String()),
    ownerId: t.String(),
    type: t.Union(
      [t.Literal("DOCUMENT"), t.Literal("WEBPAGE"), t.Literal("MEDIA")],
      { additionalProperties: false },
    ),
    status: t.Union(
      [
        t.Literal("PENDING"),
        t.Literal("PROCESSING"),
        t.Literal("INDEXING"),
        t.Literal("COMPLETED"),
        t.Literal("FAILED"),
      ],
      { additionalProperties: false },
    ),
    documentName: __nullable__(t.String()),
    markdownContent: __nullable__(t.String()),
    s3Key: __nullable__(t.String()),
    markdownKey: __nullable__(t.String()),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  },
  { additionalProperties: false },
);

export const DocumentRelations = t.Object(
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
    agent: __nullable__(
      t.Object(
        {
          id: t.String(),
          organizationId: t.String(),
          name: t.String(),
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
    ),
    chunks: t.Array(
      t.Object(
        {
          id: t.String(),
          documentId: t.String(),
          chunkIndex: t.Integer(),
          page: __nullable__(t.String()),
          section: __nullable__(t.String()),
          text: t.String(),
          tokenCount: __nullable__(t.Integer()),
          chunkMetadata: t.Any(),
          createdAt: t.Date(),
        },
        {
          additionalProperties: false,
          description: `Retrieval-ready passage with embedding for semantic search.
\`embedding\` is pgvector (\`Unsupported("vector")\`). Set dimensions in the
SQL migration (e.g. \`vector(1536)\`). The generated \`search_vector\` tsvector
column is also migration-only (Prisma cannot model generated columns).`,
        },
      ),
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const DocumentPlainInputCreate = t.Object(
  {
    type: t.Union(
      [t.Literal("DOCUMENT"), t.Literal("WEBPAGE"), t.Literal("MEDIA")],
      { additionalProperties: false },
    ),
    status: t.Optional(
      t.Union(
        [
          t.Literal("PENDING"),
          t.Literal("PROCESSING"),
          t.Literal("INDEXING"),
          t.Literal("COMPLETED"),
          t.Literal("FAILED"),
        ],
        { additionalProperties: false },
      ),
    ),
    documentName: t.Optional(__nullable__(t.String())),
    markdownContent: t.Optional(__nullable__(t.String())),
    s3Key: t.Optional(__nullable__(t.String())),
    markdownKey: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const DocumentPlainInputUpdate = t.Object(
  {
    type: t.Optional(
      t.Union(
        [t.Literal("DOCUMENT"), t.Literal("WEBPAGE"), t.Literal("MEDIA")],
        { additionalProperties: false },
      ),
    ),
    status: t.Optional(
      t.Union(
        [
          t.Literal("PENDING"),
          t.Literal("PROCESSING"),
          t.Literal("INDEXING"),
          t.Literal("COMPLETED"),
          t.Literal("FAILED"),
        ],
        { additionalProperties: false },
      ),
    ),
    documentName: t.Optional(__nullable__(t.String())),
    markdownContent: t.Optional(__nullable__(t.String())),
    s3Key: t.Optional(__nullable__(t.String())),
    markdownKey: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const DocumentRelationsInputCreate = t.Object(
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
    agent: t.Optional(
      t.Object(
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
    ),
    chunks: t.Optional(
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
  { additionalProperties: false },
);

export const DocumentRelationsInputUpdate = t.Partial(
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
      agent: t.Partial(
        t.Object(
          {
            connect: t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            disconnect: t.Boolean(),
          },
          { additionalProperties: false },
        ),
      ),
      chunks: t.Partial(
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
    { additionalProperties: false },
  ),
);

export const DocumentWhere = t.Partial(
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
          ownerId: t.String(),
          type: t.Union(
            [t.Literal("DOCUMENT"), t.Literal("WEBPAGE"), t.Literal("MEDIA")],
            { additionalProperties: false },
          ),
          status: t.Union(
            [
              t.Literal("PENDING"),
              t.Literal("PROCESSING"),
              t.Literal("INDEXING"),
              t.Literal("COMPLETED"),
              t.Literal("FAILED"),
            ],
            { additionalProperties: false },
          ),
          documentName: t.String(),
          markdownContent: t.String(),
          s3Key: t.String(),
          markdownKey: t.String(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Document" },
  ),
);

export const DocumentWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.String(), s3Key: t.String(), markdownKey: t.String() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({ s3Key: t.String() }),
            t.Object({ markdownKey: t.String() }),
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
              agentId: t.String(),
              ownerId: t.String(),
              type: t.Union(
                [
                  t.Literal("DOCUMENT"),
                  t.Literal("WEBPAGE"),
                  t.Literal("MEDIA"),
                ],
                { additionalProperties: false },
              ),
              status: t.Union(
                [
                  t.Literal("PENDING"),
                  t.Literal("PROCESSING"),
                  t.Literal("INDEXING"),
                  t.Literal("COMPLETED"),
                  t.Literal("FAILED"),
                ],
                { additionalProperties: false },
              ),
              documentName: t.String(),
              markdownContent: t.String(),
              s3Key: t.String(),
              markdownKey: t.String(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Document" },
);

export const DocumentSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      organizationId: t.Boolean(),
      organization: t.Boolean(),
      agentId: t.Boolean(),
      agent: t.Boolean(),
      ownerId: t.Boolean(),
      type: t.Boolean(),
      status: t.Boolean(),
      documentName: t.Boolean(),
      markdownContent: t.Boolean(),
      s3Key: t.Boolean(),
      markdownKey: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      chunks: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const DocumentInclude = t.Partial(
  t.Object(
    {
      organization: t.Boolean(),
      agent: t.Boolean(),
      type: t.Boolean(),
      status: t.Boolean(),
      chunks: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const DocumentOrderBy = t.Partial(
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
      ownerId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      documentName: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      markdownContent: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      s3Key: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      markdownKey: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      updatedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Document = t.Composite([DocumentPlain, DocumentRelations], {
  additionalProperties: false,
});

export const DocumentInputCreate = t.Composite(
  [DocumentPlainInputCreate, DocumentRelationsInputCreate],
  { additionalProperties: false },
);

export const DocumentInputUpdate = t.Composite(
  [DocumentPlainInputUpdate, DocumentRelationsInputUpdate],
  { additionalProperties: false },
);
