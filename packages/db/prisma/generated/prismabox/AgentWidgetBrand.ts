import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const AgentWidgetBrandPlain = t.Object(
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
);

export const AgentWidgetBrandRelations = t.Object(
  {
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
  },
  {
    additionalProperties: false,
    description: `Widget appearance extracted from Firecrawl \`formats: ["branding"]\`.`,
  },
);

export const AgentWidgetBrandPlainInputCreate = t.Object(
  {
    sourceUrl: t.Optional(__nullable__(t.String())),
    logoUrl: t.Optional(__nullable__(t.String())),
    colorScheme: t.Optional(__nullable__(t.String())),
    primaryColor: t.Optional(__nullable__(t.String())),
    secondaryColor: t.Optional(__nullable__(t.String())),
    accentColor: t.Optional(__nullable__(t.String())),
    backgroundColor: t.Optional(__nullable__(t.String())),
    textPrimaryColor: t.Optional(__nullable__(t.String())),
    textSecondaryColor: t.Optional(__nullable__(t.String())),
    fontFamilyPrimary: t.Optional(__nullable__(t.String())),
    fontFamilyHeading: t.Optional(__nullable__(t.String())),
    fontFamilyCode: t.Optional(__nullable__(t.String())),
    settings: t.Optional(
      __nullable__(
        t.Any({
          description: `Customer's own widget customization (appearance overrides, title,
greeting, suggestions, branding toggle). Brand columns above stay the
extracted defaults; \`settings\` wins where set.`,
        }),
      ),
    ),
    extractedAt: t.Optional(t.Date()),
  },
  {
    additionalProperties: false,
    description: `Widget appearance extracted from Firecrawl \`formats: ["branding"]\`.`,
  },
);

export const AgentWidgetBrandPlainInputUpdate = t.Object(
  {
    sourceUrl: t.Optional(__nullable__(t.String())),
    logoUrl: t.Optional(__nullable__(t.String())),
    colorScheme: t.Optional(__nullable__(t.String())),
    primaryColor: t.Optional(__nullable__(t.String())),
    secondaryColor: t.Optional(__nullable__(t.String())),
    accentColor: t.Optional(__nullable__(t.String())),
    backgroundColor: t.Optional(__nullable__(t.String())),
    textPrimaryColor: t.Optional(__nullable__(t.String())),
    textSecondaryColor: t.Optional(__nullable__(t.String())),
    fontFamilyPrimary: t.Optional(__nullable__(t.String())),
    fontFamilyHeading: t.Optional(__nullable__(t.String())),
    fontFamilyCode: t.Optional(__nullable__(t.String())),
    settings: t.Optional(
      __nullable__(
        t.Any({
          description: `Customer's own widget customization (appearance overrides, title,
greeting, suggestions, branding toggle). Brand columns above stay the
extracted defaults; \`settings\` wins where set.`,
        }),
      ),
    ),
    extractedAt: t.Optional(t.Date()),
  },
  {
    additionalProperties: false,
    description: `Widget appearance extracted from Firecrawl \`formats: ["branding"]\`.`,
  },
);

export const AgentWidgetBrandRelationsInputCreate = t.Object(
  {
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
  },
  {
    additionalProperties: false,
    description: `Widget appearance extracted from Firecrawl \`formats: ["branding"]\`.`,
  },
);

export const AgentWidgetBrandRelationsInputUpdate = t.Partial(
  t.Object(
    {
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
    },
    {
      additionalProperties: false,
      description: `Widget appearance extracted from Firecrawl \`formats: ["branding"]\`.`,
    },
  ),
);

export const AgentWidgetBrandWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          agentId: t.String(),
          organizationId: t.String(),
          sourceUrl: t.String(),
          logoUrl: t.String(),
          colorScheme: t.String(),
          primaryColor: t.String(),
          secondaryColor: t.String(),
          accentColor: t.String(),
          backgroundColor: t.String(),
          textPrimaryColor: t.String(),
          textSecondaryColor: t.String(),
          fontFamilyPrimary: t.String(),
          fontFamilyHeading: t.String(),
          fontFamilyCode: t.String(),
          settings: t.Any({
            description: `Customer's own widget customization (appearance overrides, title,
greeting, suggestions, branding toggle). Brand columns above stay the
extracted defaults; \`settings\` wins where set.`,
          }),
          extractedAt: t.Date(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        {
          additionalProperties: false,
          description: `Widget appearance extracted from Firecrawl \`formats: ["branding"]\`.`,
        },
      ),
    { $id: "AgentWidgetBrand" },
  ),
);

export const AgentWidgetBrandWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.String(), agentId: t.String() },
            {
              additionalProperties: false,
              description: `Widget appearance extracted from Firecrawl \`formats: ["branding"]\`.`,
            },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [t.Object({ id: t.String() }), t.Object({ agentId: t.String() })],
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
              agentId: t.String(),
              organizationId: t.String(),
              sourceUrl: t.String(),
              logoUrl: t.String(),
              colorScheme: t.String(),
              primaryColor: t.String(),
              secondaryColor: t.String(),
              accentColor: t.String(),
              backgroundColor: t.String(),
              textPrimaryColor: t.String(),
              textSecondaryColor: t.String(),
              fontFamilyPrimary: t.String(),
              fontFamilyHeading: t.String(),
              fontFamilyCode: t.String(),
              settings: t.Any({
                description: `Customer's own widget customization (appearance overrides, title,
greeting, suggestions, branding toggle). Brand columns above stay the
extracted defaults; \`settings\` wins where set.`,
              }),
              extractedAt: t.Date(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "AgentWidgetBrand" },
);

export const AgentWidgetBrandSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      agentId: t.Boolean(),
      agent: t.Boolean(),
      organizationId: t.Boolean(),
      sourceUrl: t.Boolean(),
      logoUrl: t.Boolean(),
      colorScheme: t.Boolean(),
      primaryColor: t.Boolean(),
      secondaryColor: t.Boolean(),
      accentColor: t.Boolean(),
      backgroundColor: t.Boolean(),
      textPrimaryColor: t.Boolean(),
      textSecondaryColor: t.Boolean(),
      fontFamilyPrimary: t.Boolean(),
      fontFamilyHeading: t.Boolean(),
      fontFamilyCode: t.Boolean(),
      settings: t.Boolean(),
      extractedAt: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      _count: t.Boolean(),
    },
    {
      additionalProperties: false,
      description: `Widget appearance extracted from Firecrawl \`formats: ["branding"]\`.`,
    },
  ),
);

export const AgentWidgetBrandInclude = t.Partial(
  t.Object(
    { agent: t.Boolean(), _count: t.Boolean() },
    {
      additionalProperties: false,
      description: `Widget appearance extracted from Firecrawl \`formats: ["branding"]\`.`,
    },
  ),
);

export const AgentWidgetBrandOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      agentId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      organizationId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      sourceUrl: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      logoUrl: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      colorScheme: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      primaryColor: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      secondaryColor: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      accentColor: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      backgroundColor: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      textPrimaryColor: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      textSecondaryColor: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      fontFamilyPrimary: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      fontFamilyHeading: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      fontFamilyCode: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      settings: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      extractedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
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
      description: `Widget appearance extracted from Firecrawl \`formats: ["branding"]\`.`,
    },
  ),
);

export const AgentWidgetBrand = t.Composite(
  [AgentWidgetBrandPlain, AgentWidgetBrandRelations],
  { additionalProperties: false },
);

export const AgentWidgetBrandInputCreate = t.Composite(
  [AgentWidgetBrandPlainInputCreate, AgentWidgetBrandRelationsInputCreate],
  { additionalProperties: false },
);

export const AgentWidgetBrandInputUpdate = t.Composite(
  [AgentWidgetBrandPlainInputUpdate, AgentWidgetBrandRelationsInputUpdate],
  { additionalProperties: false },
);
