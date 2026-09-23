import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const OrganizationPlain = t.Object(
  {
    id: t.String(),
    name: t.String(),
    slug: t.String(),
    logo: __nullable__(t.String()),
    createdAt: t.Date(),
    metadata: __nullable__(t.String()),
  },
  { additionalProperties: false },
);

export const OrganizationRelations = t.Object(
  {
    teams: t.Array(
      t.Object(
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
      { additionalProperties: false },
    ),
    members: t.Array(
      t.Object(
        {
          id: t.String(),
          organizationId: t.String(),
          userId: t.String(),
          role: t.String(),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
    invitations: t.Array(
      t.Object(
        {
          id: t.String(),
          organizationId: t.String(),
          email: t.String(),
          role: __nullable__(t.String()),
          teamId: __nullable__(t.String()),
          status: t.String(),
          expiresAt: t.Date(),
          createdAt: t.Date(),
          inviterId: t.String(),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
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
    agents: t.Array(
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
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const OrganizationPlainInputCreate = t.Object(
  {
    name: t.String(),
    slug: t.String(),
    logo: t.Optional(__nullable__(t.String())),
    createdAt: t.Date(),
    metadata: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const OrganizationPlainInputUpdate = t.Object(
  {
    name: t.Optional(t.String()),
    slug: t.Optional(t.String()),
    logo: t.Optional(__nullable__(t.String())),
    createdAt: t.Optional(t.Date()),
    metadata: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const OrganizationRelationsInputCreate = t.Object(
  {
    teams: t.Optional(
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
    members: t.Optional(
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
    invitations: t.Optional(
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
    agents: t.Optional(
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

export const OrganizationRelationsInputUpdate = t.Partial(
  t.Object(
    {
      teams: t.Partial(
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
      members: t.Partial(
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
      invitations: t.Partial(
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
      agents: t.Partial(
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

export const OrganizationWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          name: t.String(),
          slug: t.String(),
          logo: t.String(),
          createdAt: t.Date(),
          metadata: t.String(),
        },
        { additionalProperties: false },
      ),
    { $id: "Organization" },
  ),
);

export const OrganizationWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.String(), slug: t.String() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [t.Object({ id: t.String() }), t.Object({ slug: t.String() })],
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
              name: t.String(),
              slug: t.String(),
              logo: t.String(),
              createdAt: t.Date(),
              metadata: t.String(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Organization" },
);

export const OrganizationSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      name: t.Boolean(),
      slug: t.Boolean(),
      logo: t.Boolean(),
      createdAt: t.Boolean(),
      metadata: t.Boolean(),
      teams: t.Boolean(),
      members: t.Boolean(),
      invitations: t.Boolean(),
      documents: t.Boolean(),
      agents: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const OrganizationInclude = t.Partial(
  t.Object(
    {
      teams: t.Boolean(),
      members: t.Boolean(),
      invitations: t.Boolean(),
      documents: t.Boolean(),
      agents: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const OrganizationOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      name: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      slug: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      logo: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      metadata: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Organization = t.Composite(
  [OrganizationPlain, OrganizationRelations],
  { additionalProperties: false },
);

export const OrganizationInputCreate = t.Composite(
  [OrganizationPlainInputCreate, OrganizationRelationsInputCreate],
  { additionalProperties: false },
);

export const OrganizationInputUpdate = t.Composite(
  [OrganizationPlainInputUpdate, OrganizationRelationsInputUpdate],
  { additionalProperties: false },
);
