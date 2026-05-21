"use client";

import { useAction } from "convex/react";
import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { api } from "@workspace/backend/_generated/api";
import type { PublicWebsiteSource } from "@workspace/backend/private/files";
import { toast } from "sonner";

interface DeleteWebsiteSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: PublicWebsiteSource | null;
  onDeleted?: () => void;
}

export const DeleteWebsiteSourceDialog = ({
  open,
  onOpenChange,
  source,
  onDeleted,
}: DeleteWebsiteSourceDialogProps) => {
  const deleteWebsiteSource = useAction(api.private.files.deleteWebsiteSource);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!source) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteWebsiteSource({ sourceId: source.id });
      toast.success(
        `Nettsidekilden ble slettet. ${result.deletedPages} sider ble fjernet fra indeksen.`,
      );
      onDeleted?.();
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Kunne ikke slette nettsidekilden";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const isActive = source?.status === "queued" || source?.status === "running";

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="dashboard-app-shell rounded-2xl border border-border/80 bg-card text-card-foreground shadow-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isActive ? "Stopp og slett nettsidekilde" : "Slett nettsidekilde"}
          </DialogTitle>
          <DialogDescription>
            Dette stopper fremtidige synkroniseringer og fjerner indekserte
            sider som ble hentet fra denne nettsiden.
          </DialogDescription>
        </DialogHeader>

        {source ? (
          <div className="py-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="font-medium">{source.rootUrl}</p>
              <p className="text-muted-foreground text-sm">
                {source.mode === "crawl"
                  ? `Inntil ${source.maxPages} sider`
                  : "Enkeltside"}
                {source.lastIndexedCount
                  ? ` · ${source.lastIndexedCount} sider indeksert`
                  : ""}
              </p>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            Avbryt
          </Button>
          <Button
            disabled={isDeleting || !source}
            onClick={handleDelete}
            variant="destructive"
          >
            {isDeleting ? "Sletter…" : isActive ? "Stopp og slett" : "Slett"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
