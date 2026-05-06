"use client";

import { useMutation } from "convex/react";
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
import type { PublicFile } from "@workspace/backend/private/files";

interface DeleteFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: PublicFile | null;
  onDeleted?: () => void;
};

export const DeleteFileDialog = ({
  open,
  onOpenChange,
  file,
  onDeleted,
}: DeleteFileDialogProps) => {
  const deleteFile = useMutation(api.private.files.deleteFile);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!file) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteFile({ entryId: file.id });
      onDeleted?.();
      onOpenChange(false);
    } catch(error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="dashboard-app-shell rounded-2xl border border-border/80 bg-card text-card-foreground shadow-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Slett fil
          </DialogTitle>
          <DialogDescription>
            Er du sikker på at du vil slette denne filen? Handlingen kan ikke angres.
          </DialogDescription>
        </DialogHeader>

        {file && (
          <div className="py-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="font-medium">{file.name}</p>
              <p className="text-muted-foreground text-sm">
                Type: {file.type.toUpperCase()} · Størrelse: {file.size}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            Avbryt
          </Button>
          <Button
            disabled={isDeleting || !file}
            onClick={handleDelete}
            variant="destructive"
          >
            {isDeleting ? "Sletter…" : "Slett"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
