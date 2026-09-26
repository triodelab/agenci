import { env } from "@agenci/env/server";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../prisma/generated/prisma/client";

export type { Prisma } from "../prisma/generated/prisma/client";

export {AgentPlain, AgentPlainInputCreate} from "../prisma/generated/prismabox/Agent"
export {DocumentPlain, DocumentPlainInputCreate, DocumentPlainInputUpdate} from "../prisma/generated/prismabox/Document"

export function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();
export default prisma;

/** Prisma enums (runtime objects + types) for Zod / API schemas. */
export {
  AgentStatus,
  AgentVertical,
  DocumentSourceType,
  DocumentStatus,
} from "../prisma/generated/prisma/enums";
