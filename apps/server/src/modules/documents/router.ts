import { privateProcedure } from "@/routers/procedures";
import { uploadDocumentInput, uploadDocumentOutput } from "./schema";
import { ORPCError } from "@orpc/server";
import prisma from "@agenci/db";
import { deleteFile, writeFile } from "@/lib/s3-client";
import { inngest, uploadDocumentEvent } from "@/inngest/client";
import { z } from "zod";

export const documentsRouter = {
  upload: privateProcedure
    .input(uploadDocumentInput)
    .output(uploadDocumentOutput)
    .handler(async ({ input, context }) => {
      if (!input.file || !input.agentId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Fil er påkrevd",
        });
      }

      const agent = await prisma.agent.findFirst({
        where: {
          id: input.agentId,
          organizationId: context.organizationId,
        },
        select: { id: true },
      });

      if (!agent) {
        throw new ORPCError("NOT_FOUND", { message: "Agenten ble ikke funnet" });
      }

      const document = await prisma.document.create({
        data: {
          documentName: input.file.name,
          agentId: agent.id,
          organizationId: context.organizationId,
          ownerId: context.userId,
          status: "PENDING",
          type: input.file.type.startsWith("image/")
            ? "MEDIA"
            : input.file.type.startsWith("video/")
              ? "MEDIA"
              : input.file.type.startsWith("audio/")
                ? "MEDIA"
                : "DOCUMENT",
        },
        select: { id: true },
      });

      const documentKey = `${context.organizationId}/${agent.id}/${document.id}/${input.file.name}`;
      await writeFile(documentKey, await input.file.arrayBuffer(), input.file.type);
      await prisma.document.update({
        where: { id: document.id },
        data: { s3Key: documentKey },
      });

      await inngest.send(
        uploadDocumentEvent.create({
          agentId: agent.id,
          organizationId: context.organizationId,
          userId: context.userId,
          documentId: document.id,
          s3Key: documentKey,
          fileName: input.file.name,
        }),
      );

      return { url: documentKey };
    }),
    delete: privateProcedure
    .input(z.object({documentId: z.string()}))
    .output(z.object({success: z.boolean()}))
    .handler(async ({ input, context }) => {
      const document = await prisma.document.findUnique({
        where: { id: input.documentId, organizationId: context.organizationId },
      });
      if (!document) {
        throw new ORPCError("NOT_FOUND", { message: "Document not found" });
      }
      if (document.s3Key) await deleteFile(document.s3Key);

      // Remove the embedded chunks too, so the agent stops answering from a
      // source that no longer exists.
      await prisma.$executeRaw`DELETE FROM embeddings WHERE metadata->>'documentId' = ${document.id}`.catch(
        () => 0,
      );

      await prisma.document.delete({ where: { id: input.documentId } });
      return { success: true };
    }),
};