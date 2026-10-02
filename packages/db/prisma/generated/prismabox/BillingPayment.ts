import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const BillingPaymentPlain = t.Object(
  {
    id: t.String(),
    organizationId: t.String(),
    nexiPaymentId: t.String(),
    invoiceNumber: t.Integer({
      description: `Fortløpende fakturanummer (shown as e.g. «AG-1001»).`,
    }),
    plan: t.String(),
    amount: t.Integer({
      description: `Total charged, in øre (499 kr = 49900).`,
    }),
    netAmount: t.Integer({
      description: `Amount before VAT, and the VAT in it (0 while not VAT-registered).`,
    }),
    vatAmount: t.Integer(),
    currency: t.String(),
    status: t.String({ description: `"pending" | "paid" | "failed"` }),
    periodStart: t.Date(),
    periodEnd: t.Date(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  },
  {
    additionalProperties: false,
    description: `Every charge attempt — the invoice list in the dashboard.`,
  },
);

export const BillingPaymentRelations = t.Object(
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
  },
  {
    additionalProperties: false,
    description: `Every charge attempt — the invoice list in the dashboard.`,
  },
);

export const BillingPaymentPlainInputCreate = t.Object(
  {
    invoiceNumber: t.Optional(
      t.Integer({
        description: `Fortløpende fakturanummer (shown as e.g. «AG-1001»).`,
      }),
    ),
    plan: t.String(),
    amount: t.Integer({
      description: `Total charged, in øre (499 kr = 49900).`,
    }),
    netAmount: t.Optional(
      t.Integer({
        description: `Amount before VAT, and the VAT in it (0 while not VAT-registered).`,
      }),
    ),
    vatAmount: t.Optional(t.Integer()),
    currency: t.Optional(t.String()),
    status: t.Optional(
      t.String({ description: `"pending" | "paid" | "failed"` }),
    ),
    periodStart: t.Date(),
    periodEnd: t.Date(),
  },
  {
    additionalProperties: false,
    description: `Every charge attempt — the invoice list in the dashboard.`,
  },
);

export const BillingPaymentPlainInputUpdate = t.Object(
  {
    invoiceNumber: t.Optional(
      t.Integer({
        description: `Fortløpende fakturanummer (shown as e.g. «AG-1001»).`,
      }),
    ),
    plan: t.Optional(t.String()),
    amount: t.Optional(
      t.Integer({ description: `Total charged, in øre (499 kr = 49900).` }),
    ),
    netAmount: t.Optional(
      t.Integer({
        description: `Amount before VAT, and the VAT in it (0 while not VAT-registered).`,
      }),
    ),
    vatAmount: t.Optional(t.Integer()),
    currency: t.Optional(t.String()),
    status: t.Optional(
      t.String({ description: `"pending" | "paid" | "failed"` }),
    ),
    periodStart: t.Optional(t.Date()),
    periodEnd: t.Optional(t.Date()),
  },
  {
    additionalProperties: false,
    description: `Every charge attempt — the invoice list in the dashboard.`,
  },
);

export const BillingPaymentRelationsInputCreate = t.Object(
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
  },
  {
    additionalProperties: false,
    description: `Every charge attempt — the invoice list in the dashboard.`,
  },
);

export const BillingPaymentRelationsInputUpdate = t.Partial(
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
    },
    {
      additionalProperties: false,
      description: `Every charge attempt — the invoice list in the dashboard.`,
    },
  ),
);

export const BillingPaymentWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          organizationId: t.String(),
          nexiPaymentId: t.String(),
          invoiceNumber: t.Integer({
            description: `Fortløpende fakturanummer (shown as e.g. «AG-1001»).`,
          }),
          plan: t.String(),
          amount: t.Integer({
            description: `Total charged, in øre (499 kr = 49900).`,
          }),
          netAmount: t.Integer({
            description: `Amount before VAT, and the VAT in it (0 while not VAT-registered).`,
          }),
          vatAmount: t.Integer(),
          currency: t.String(),
          status: t.String({ description: `"pending" | "paid" | "failed"` }),
          periodStart: t.Date(),
          periodEnd: t.Date(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        {
          additionalProperties: false,
          description: `Every charge attempt — the invoice list in the dashboard.`,
        },
      ),
    { $id: "BillingPayment" },
  ),
);

export const BillingPaymentWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              nexiPaymentId: t.String(),
              invoiceNumber: t.Integer({
                description: `Fortløpende fakturanummer (shown as e.g. «AG-1001»).`,
              }),
            },
            {
              additionalProperties: false,
              description: `Every charge attempt — the invoice list in the dashboard.`,
            },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({ nexiPaymentId: t.String() }),
            t.Object({
              invoiceNumber: t.Integer({
                description: `Fortløpende fakturanummer (shown as e.g. «AG-1001»).`,
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
              id: t.String(),
              organizationId: t.String(),
              nexiPaymentId: t.String(),
              invoiceNumber: t.Integer({
                description: `Fortløpende fakturanummer (shown as e.g. «AG-1001»).`,
              }),
              plan: t.String(),
              amount: t.Integer({
                description: `Total charged, in øre (499 kr = 49900).`,
              }),
              netAmount: t.Integer({
                description: `Amount before VAT, and the VAT in it (0 while not VAT-registered).`,
              }),
              vatAmount: t.Integer(),
              currency: t.String(),
              status: t.String({
                description: `"pending" | "paid" | "failed"`,
              }),
              periodStart: t.Date(),
              periodEnd: t.Date(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "BillingPayment" },
);

export const BillingPaymentSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      organizationId: t.Boolean(),
      organization: t.Boolean(),
      nexiPaymentId: t.Boolean(),
      invoiceNumber: t.Boolean(),
      plan: t.Boolean(),
      amount: t.Boolean(),
      netAmount: t.Boolean(),
      vatAmount: t.Boolean(),
      currency: t.Boolean(),
      status: t.Boolean(),
      periodStart: t.Boolean(),
      periodEnd: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      _count: t.Boolean(),
    },
    {
      additionalProperties: false,
      description: `Every charge attempt — the invoice list in the dashboard.`,
    },
  ),
);

export const BillingPaymentInclude = t.Partial(
  t.Object(
    { organization: t.Boolean(), _count: t.Boolean() },
    {
      additionalProperties: false,
      description: `Every charge attempt — the invoice list in the dashboard.`,
    },
  ),
);

export const BillingPaymentOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      organizationId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      nexiPaymentId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      invoiceNumber: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      plan: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      amount: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      netAmount: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      vatAmount: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      currency: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      status: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      periodStart: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      periodEnd: t.Union([t.Literal("asc"), t.Literal("desc")], {
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
      description: `Every charge attempt — the invoice list in the dashboard.`,
    },
  ),
);

export const BillingPayment = t.Composite(
  [BillingPaymentPlain, BillingPaymentRelations],
  { additionalProperties: false },
);

export const BillingPaymentInputCreate = t.Composite(
  [BillingPaymentPlainInputCreate, BillingPaymentRelationsInputCreate],
  { additionalProperties: false },
);

export const BillingPaymentInputUpdate = t.Composite(
  [BillingPaymentPlainInputUpdate, BillingPaymentRelationsInputUpdate],
  { additionalProperties: false },
);
