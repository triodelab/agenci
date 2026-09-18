import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const DocumentChunkPlain = t.Object(
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
);

export const DocumentChunkRelations = t.Object(
  {
    document: t.Object(
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
    ),
  },
  {
    additionalProperties: false,
    description: `Retrieval-ready passage with embedding for semantic search.
\`embedding\` is pgvector (\`Unsupported("vector")\`). Set dimensions in the
SQL migration (e.g. \`vector(1536)\`). The generated \`search_vector\` tsvector
column is also migration-only (Prisma cannot model generated columns).`,
  },
);

export const DocumentChunkPlainInputCreate = t.Object(
  {
    chunkIndex: t.Integer(),
    page: t.Optional(__nullable__(t.String())),
    section: t.Optional(__nullable__(t.String())),
    text: t.String(),
    tokenCount: t.Optional(__nullable__(t.Integer())),
    chunkMetadata: t.Optional(t.Any()),
  },
  {
    additionalProperties: false,
    description: `Retrieval-ready passage with embedding for semantic search.
\`embedding\` is pgvector (\`Unsupported("vector")\`). Set dimensions in the
SQL migration (e.g. \`vector(1536)\`). The generated \`search_vector\` tsvector
column is also migration-only (Prisma cannot model generated columns).`,
  },
);

export const DocumentChunkPlainInputUpdate = t.Object(
  {
    chunkIndex: t.Optional(t.Integer()),
    page: t.Optional(__nullable__(t.String())),
    section: t.Optional(__nullable__(t.String())),
    text: t.Optional(t.String()),
    tokenCount: t.Optional(__nullable__(t.Integer())),
    chunkMetadata: t.Optional(t.Any()),
  },
  {
    additionalProperties: false,
    description: `Retrieval-ready passage with embedding for semantic search.
\`embedding\` is pgvector (\`Unsupported("vector")\`). Set dimensions in the
SQL migration (e.g. \`vector(1536)\`). The generated \`search_vector\` tsvector
column is also migration-only (Prisma cannot model generated columns).`,
  },
);

export const DocumentChunkRelationsInputCreate = t.Object(
  {
    document: t.Object(
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
    description: `Retrieval-ready passage with embedding for semantic search.
\`embedding\` is pgvector (\`Unsupported("vector")\`). Set dimensions in the
SQL migration (e.g. \`vector(1536)\`). The generated \`search_vector\` tsvector
column is also migration-only (Prisma cannot model generated columns).`,
  },
);

export const DocumentChunkRelationsInputUpdate = t.Partial(
  t.Object(
    {
      document: t.Object(
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
      description: `Retrieval-ready passage with embedding for semantic search.
\`embedding\` is pgvector (\`Unsupported("vector")\`). Set dimensions in the
SQL migration (e.g. \`vector(1536)\`). The generated \`search_vector\` tsvector
column is also migration-only (Prisma cannot model generated columns).`,
    },
  ),
);

export const DocumentChunkWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          documentId: t.String(),
          chunkIndex: t.Integer(),
          page: t.String(),
          section: t.String(),
          text: t.String(),
          tokenCount: t.Integer(),
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
    { $id: "DocumentChunk" },
  ),
);

export const DocumentChunkWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              documentId_chunkIndex: t.Object(
                { documentId: t.String(), chunkIndex: t.Integer() },
                { additionalProperties: false },
              ),
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
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({
              documentId_chunkIndex: t.Object(
                { documentId: t.String(), chunkIndex: t.Integer() },
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
              documentId: t.String(),
              chunkIndex: t.Integer(),
              page: t.String(),
              section: t.String(),
              text: t.String(),
              tokenCount: t.Integer(),
              chunkMetadata: t.Any(),
              createdAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "DocumentChunk" },
);

export const DocumentChunkSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      documentId: t.Boolean(),
      document: t.Boolean(),
      chunkIndex: t.Boolean(),
      page: t.Boolean(),
      section: t.Boolean(),
      text: t.Boolean(),
      tokenCount: t.Boolean(),
      chunkMetadata: t.Boolean(),
      createdAt: t.Boolean(),
      _count: t.Boolean(),
    },
    {
      additionalProperties: false,
      description: `Retrieval-ready passage with embedding for semantic search.
\`embedding\` is pgvector (\`Unsupported("vector")\`). Set dimensions in the
SQL migration (e.g. \`vector(1536)\`). The generated \`search_vector\` tsvector
column is also migration-only (Prisma cannot model generated columns).`,
    },
  ),
);

export const DocumentChunkInclude = t.Partial(
  t.Object(
    { document: t.Boolean(), _count: t.Boolean() },
    {
      additionalProperties: false,
      description: `Retrieval-ready passage with embedding for semantic search.
\`embedding\` is pgvector (\`Unsupported("vector")\`). Set dimensions in the
SQL migration (e.g. \`vector(1536)\`). The generated \`search_vector\` tsvector
column is also migration-only (Prisma cannot model generated columns).`,
    },
  ),
);

export const DocumentChunkOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      documentId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      chunkIndex: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      page: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      section: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      text: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      tokenCount: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      chunkMetadata: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    {
      additionalProperties: false,
      description: `Retrieval-ready passage with embedding for semantic search.
\`embedding\` is pgvector (\`Unsupported("vector")\`). Set dimensions in the
SQL migration (e.g. \`vector(1536)\`). The generated \`search_vector\` tsvector
column is also migration-only (Prisma cannot model generated columns).`,
    },
  ),
);

export const DocumentChunk = t.Composite(
  [DocumentChunkPlain, DocumentChunkRelations],
  { additionalProperties: false },
);

export const DocumentChunkInputCreate = t.Composite(
  [DocumentChunkPlainInputCreate, DocumentChunkRelationsInputCreate],
  { additionalProperties: false },
);

export const DocumentChunkInputUpdate = t.Composite(
  [DocumentChunkPlainInputUpdate, DocumentChunkRelationsInputUpdate],
  { additionalProperties: false },
);
