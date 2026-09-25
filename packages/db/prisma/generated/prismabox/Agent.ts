import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const AgentPlain = t.Object(
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
);

export const AgentRelations = t.Object(
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
    widgetBrand: __nullable__(
      t.Object(
        {
          id: t.String(),
          agentId: t.String(),
          organizationId: t.String(),
          sourceUrl: __nullable__(t.String()),
          logoUrl: __nullable__(t.String()),
          colorScheme: __nullable__(t.String()),
          primaryColor: __nullable__(t.String()),
          secondaryColor: __nullable__(t.String()),
          accentColor: __nullable__(t.String()),
          backgroundColor: __nullable__(t.String()),
          textPrimaryColor: __nullable__(t.String()),
          textSecondaryColor: __nullable__(t.String()),
          fontFamilyPrimary: __nullable__(t.String()),
          fontFamilyHeading: __nullable__(t.String()),
          fontFamilyCode: __nullable__(t.String()),
          settings: __nullable__(
            t.Any({
              description: `Customer's own widget customization (appearance overrides, title,
greeting, suggestions, branding toggle). Brand columns above stay the
extracted defaults; \`settings\` wins where set.`,
            }),
          ),
          extractedAt: t.Date(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        {
          additionalProperties: false,
          description: `Widget appearance extracted from Firecrawl \`formats: ["branding"]\`.`,
        },
      ),
    ),
    documents: t.Array(
      t.Object(
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
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const AgentPlainInputCreate = t.Object(
  {
    name: t.String(),
    description: t.String(),
    slug: t.String(),
    modelLabel: t.Optional(__nullable__(t.String())),
    status: t.Optional(
      t.Union(
        [
          t.Literal("PENDING"),
          t.Literal("PROCESSING"),
          t.Literal("COMPLETED"),
          t.Literal("FAILED"),
        ],
        { additionalProperties: false },
      ),
    ),
  },
  { additionalProperties: false },
);

export const AgentPlainInputUpdate = t.Object(
  {
    name: t.Optional(t.String()),
    description: t.Optional(t.String()),
    slug: t.Optional(t.String()),
    modelLabel: t.Optional(__nullable__(t.String())),
    status: t.Optional(
      t.Union(
        [
          t.Literal("PENDING"),
          t.Literal("PROCESSING"),
          t.Literal("COMPLETED"),
          t.Literal("FAILED"),
        ],
        { additionalProperties: false },
      ),
    ),
  },
  { additionalProperties: false },
);

export const AgentRelationsInputCreate = t.Object(
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
    widgetBrand: t.Optional(
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
    documents: t.Optional(
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

export const AgentRelationsInputUpdate = t.Partial(
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
      widgetBrand: t.Partial(
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
      documents: t.Partial(
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

export const AgentWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          organizationId: t.String(),
          name: t.String(),
          description: t.String(),
          slug: t.String(),
          modelLabel: t.String(),
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
    { $id: "Agent" },
  ),
);

export const AgentWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.String(), name: t.String(), slug: t.String() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({ name: t.String() }),
            t.Object({ slug: t.String() }),
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
              name: t.String(),
              description: t.String(),
              slug: t.String(),
              modelLabel: t.String(),
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
      ],
      { additionalProperties: false },
    ),
  { $id: "Agent" },
);

export const AgentSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      organizationId: t.Boolean(),
      organization: t.Boolean(),
      name: t.Boolean(),
      description: t.Boolean(),
      slug: t.Boolean(),
      modelLabel: t.Boolean(),
      status: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      widgetBrand: t.Boolean(),
      documents: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const AgentInclude = t.Partial(
  t.Object(
    {
      organization: t.Boolean(),
      status: t.Boolean(),
      widgetBrand: t.Boolean(),
      documents: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const AgentOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      organizationId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      name: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      description: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      slug: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      modelLabel: t.Union([t.Literal("asc"), t.Literal("desc")], {
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

export const Agent = t.Composite([AgentPlain, AgentRelations], {
  additionalProperties: false,
});

export const AgentInputCreate = t.Composite(
  [AgentPlainInputCreate, AgentRelationsInputCreate],
  { additionalProperties: false },
);

export const AgentInputUpdate = t.Composite(
  [AgentPlainInputUpdate, AgentRelationsInputUpdate],
  { additionalProperties: false },
);
