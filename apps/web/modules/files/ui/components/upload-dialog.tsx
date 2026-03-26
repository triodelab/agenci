"use client";

import { useAction } from "convex/react";
import { UploadIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@workspace/ui/components/dropzone";
import { api } from "@workspace/backend/_generated/api";
import { cn } from "@workspace/ui/lib/utils";

/** Matcher dashboard: nøytral kant, svart fokus (ikke blått) */
const inputClean =
  "h-11 w-full rounded-xl border border-border bg-card shadow-sm selection:bg-muted selection:text-foreground focus-visible:border-foreground/25 focus-visible:ring-2 focus-visible:ring-foreground/10";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUploaded?: () => void;
  /** Når dialog åpnes (f.eks. etter drag-and-drop), forhåndsvelg fil. */
  presetFile?: File | null;
}

export const UploadDialog = ({
  open,
  onOpenChange,
  onFileUploaded,
  presetFile = null,
}: UploadDialogProps) => {
  const addFile = useAction(api.private.files.addFile);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    category: "",
    filename: "",
  });

  useEffect(() => {
    if (!open || !presetFile) {
      return;
    }

    setUploadedFiles([presetFile]);
    setUploadForm((prev) => ({
      ...prev,
      filename: presetFile.name,
    }));
  }, [open, presetFile]);

  const handleFileDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (file) {
      setUploadedFiles([file]);
      if (!uploadForm.filename) {
        setUploadForm((prev) => ({ ...prev, filename: file.name }));
      }
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const blob = uploadedFiles[0];

      if (!blob) {
        return;
      }

      const filename = uploadForm.filename || blob.name;

      await addFile({
        bytes: await blob.arrayBuffer(),
        filename,
        mimeType: blob.type || "text/plain",
        category: uploadForm.category,
      });

      onFileUploaded?.();
      handleCancel();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setUploadedFiles([]);
    setUploadForm({
      category: "",
      filename: "",
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className={cn(
          "dash-modal-dot-bg gap-0 overflow-hidden rounded-2xl border border-border p-0 shadow-2xl",
          "w-[min(100vw-1.5rem,48rem)] max-w-none sm:w-[min(100vw-2rem,48rem)]",
        )}
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row items-start gap-4 border-border border-b bg-card/90 px-6 pt-6 pb-5 text-left backdrop-blur-sm dark:bg-card/80 sm:gap-5">
          <div className="min-w-0 flex-1 space-y-2">
            <DialogTitle className="font-semibold text-xl text-foreground tracking-tight">
              Upload Document
            </DialogTitle>
            <DialogDescription className="text-[14px] leading-relaxed text-muted-foreground">
              Upload documents to your knowledge base for AI-powered search and
              retrieval.
            </DialogDescription>
          </div>
          <DialogClose
            className={cn(
              "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card/90 opacity-100 shadow-sm transition-colors",
              "hover:bg-muted",
              "focus-visible:ring-2 focus-visible:ring-foreground/15 focus-visible:ring-offset-0 focus-visible:outline-none",
            )}
            type="button"
          >
            <XIcon className="size-4" strokeWidth={2} />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-6 px-6 py-7 sm:px-8 sm:py-8">
          <div className="space-y-2">
            <Label
              className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.12em]"
              htmlFor="category"
            >
              Category
            </Label>
            <Input
              className={cn(inputClean)}
              id="category"
              onChange={(e) =>
                setUploadForm((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              placeholder="e.g. Documentation, Support, Product"
              type="text"
              value={uploadForm.category}
            />
          </div>

          <div className="space-y-2">
            <Label
              className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.12em]"
              htmlFor="filename"
            >
              Filename{" "}
              <span className="font-normal normal-case tracking-normal text-muted-foreground/80">
                (optional)
              </span>
            </Label>
            <Input
              className={cn(inputClean)}
              id="filename"
              onChange={(e) =>
                setUploadForm((prev) => ({
                  ...prev,
                  filename: e.target.value,
                }))
              }
              placeholder="Override default filename"
              type="text"
              value={uploadForm.filename}
            />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">
              File
            </span>
            <Dropzone
              accept={{
                "application/pdf": [".pdf"],
                "text/csv": [".csv"],
                "text/plain": [".txt"],
              }}
              className={cn(
                "min-h-[14rem] rounded-xl border border-dashed border-border/80 bg-card/85 p-10 shadow-sm",
                "text-foreground backdrop-blur-[1px] dark:bg-card/50",
                "hover:border-foreground/25 hover:bg-card",
                "focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-foreground/10 focus-visible:ring-offset-0",
              )}
              disabled={isUploading}
              maxFiles={1}
              onDrop={handleFileDrop}
              src={uploadedFiles}
            >
              <DropzoneEmptyState>
                <div className="flex flex-col items-center justify-center gap-4 py-2">
                  <span className="flex size-14 items-center justify-center rounded-2xl border border-border bg-background text-foreground shadow-sm">
                    <UploadIcon className="size-7" strokeWidth={1.5} />
                  </span>
                  <div className="space-y-1.5 text-center">
                    <p className="font-medium text-[15px] text-foreground">
                      Drop a file here or click to browse
                    </p>
                    <p className="text-balance text-sm text-muted-foreground">
                      PDF, TXT or CSV · one file
                    </p>
                  </div>
                </div>
              </DropzoneEmptyState>
              <DropzoneContent>
                <div className="flex flex-col items-center justify-center gap-4 py-2">
                  <span className="flex size-14 items-center justify-center rounded-2xl border border-border bg-background text-foreground shadow-sm">
                    <UploadIcon className="size-7" strokeWidth={1.5} />
                  </span>
                  <div className="space-y-1.5 text-center">
                    <p className="max-w-full truncate px-2 font-medium text-[15px] text-foreground">
                      {uploadedFiles[0]?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop or click to replace
                    </p>
                  </div>
                </div>
              </DropzoneContent>
            </Dropzone>
          </div>
        </div>

        <DialogFooter className="gap-3 border-border border-t bg-card/90 px-6 py-5 backdrop-blur-sm dark:bg-card/80 sm:justify-end sm:px-8">
          <Button
            className="h-11 min-w-[6.5rem] rounded-xl"
            disabled={isUploading}
            onClick={handleCancel}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="h-11 min-w-[7.5rem] rounded-xl bg-foreground text-background hover:bg-foreground/90"
            disabled={
              uploadedFiles.length === 0 || isUploading || !uploadForm.category
            }
            onClick={handleUpload}
            type="button"
          >
            {isUploading ? "Uploading…" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
