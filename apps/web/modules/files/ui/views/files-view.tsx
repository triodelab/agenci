"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { useAction, usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { PublicFile } from "@workspace/backend/private/files";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { UploadDialog } from "../components/upload-dialog";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { DeleteFileDialog } from "../components/delete-file-dialog";
import { KnowledgeTrainingPlayground } from "../components/knowledge-training-playground";
import {
  FileIcon,
  FolderIcon,
  MoreHorizontalIcon,
  TrashIcon,
  UploadIcon,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Skeleton } from "@workspace/ui/components/skeleton";

type DatasetKey = "training" | "general";

function FolderGlyph({ active }: { active?: boolean }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-[7px] border text-muted-foreground",
        active
          ? "border-primary-foreground/25 bg-primary-foreground/12 text-primary-foreground"
          : "border-border/50 bg-[var(--dash-knowledge-folder)]",
      )}
      aria-hidden
    >
      <FolderIcon className="size-[15px]" strokeWidth={1.65} />
    </span>
  );
}

function KnowledgeSourceRow({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2 text-left text-[13px] font-medium transition-[background-color,color,box-shadow] duration-150",
        active
          ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 [&_svg]:text-primary-foreground"
          : "text-foreground/88 hover:bg-muted/60 hover:text-foreground",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function isValidHttpUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function FilesViewLoading() {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 items-center justify-center p-8">
      <div className="space-y-3 w-full max-w-2xl">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-[min(55vh,640px)] w-full rounded-2xl" />
      </div>
    </div>
  );
}

function FilesViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const files = usePaginatedQuery(
    api.private.files.list,
    {},
    {
      initialNumItems: 10,
    },
  );
  const addWebpage = useAction(api.private.files.addWebpage);

  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingFirstPage,
    isLoadingMore,
  } = useInfiniteScroll({
    status: files.status,
    loadMore: files.loadMore,
    loadSize: 10,
  });

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [presetFile, setPresetFile] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<PublicFile | null>(null);
  const [dataset, setDataset] = useState<DatasetKey>(() =>
    searchParams.get("kb") === "training" ? "training" : "general",
  );
  const [webUrl, setWebUrl] = useState("");

  useEffect(() => {
    if (searchParams.get("kb") === "training") {
      setDataset("training");
    }
  }, [searchParams]);

  const setDatasetAndUrl = useCallback(
    (next: DatasetKey) => {
      setDataset(next);
      if (typeof window === "undefined") {
        return;
      }
      if (next === "training") {
        window.history.replaceState(null, "", `${pathname}?kb=training`);
      } else {
        window.history.replaceState(null, "", pathname);
      }
    },
    [pathname],
  );
  const [isImportingWebpage, setIsImportingWebpage] = useState(false);

  const canAddWebpage = useMemo(
    () => isValidHttpUrl(webUrl) && !isImportingWebpage,
    [webUrl, isImportingWebpage],
  );

  const handleAddWebpage = async () => {
    if (!canAddWebpage) {
      return;
    }
    setIsImportingWebpage(true);
    try {
      const result = await addWebpage({ url: webUrl.trim() });
      toast.success(
        `Nettside lagt til: ${result.title ?? result.url}`,
      );
      setWebUrl("");
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e && "message" in e
            ? String((e as { message: unknown }).message)
            : "Kunne ikke importere nettside";
      toast.error(msg);
    } finally {
      setIsImportingWebpage(false);
    }
  };

  const handleDeleteClick = (file: PublicFile) => {
    setSelectedFile(file);
    setDeleteDialogOpen(true);
  };

  const handleFileDeleted = () => {
    setSelectedFile(null);
  };

  const openUpload = useCallback(() => {
    setPresetFile(null);
    setUploadDialogOpen(true);
  }, []);

  const handleUploadOpenChange = useCallback((open: boolean) => {
    setUploadDialogOpen(open);
    if (!open) {
      setPresetFile(null);
    }
  }, []);

  const onDropMain = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (dataset !== "general") {
        return;
      }
      const f = e.dataTransfer.files[0];
      if (f) {
        setPresetFile(f);
        setUploadDialogOpen(true);
      }
    },
    [dataset],
  );

  const onDragOverMain = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const showFileList = dataset === "general";
  const isKnowledgeTraining = dataset === "training";

  const rightTitle =
    dataset === "general" ? "General" : "Knowledge Training";

  return (
    <>
      <DeleteFileDialog
        file={selectedFile}
        onDeleted={handleFileDeleted}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
      />
      <UploadDialog
        onOpenChange={handleUploadOpenChange}
        open={uploadDialogOpen}
        presetFile={presetFile}
      />

      <div className="flex h-full min-h-0 w-full flex-1 bg-transparent">
        {/* Midtkolonne — dataset / kilder */}
        <aside className="dash-subpane-rail flex w-[288px] shrink-0 flex-col">
          <header className="border-border/60 border-b px-5 pb-4 pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Kunnskap
            </p>
            <h1 className="mt-1.5 font-semibold text-[16px] text-foreground tracking-tight">
              Knowledge
            </h1>
            <button
              className="mt-2.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              type="button"
            >
              + Dataset…
            </button>
          </header>
          <ScrollArea className="min-h-0 flex-1">
            <nav
              aria-label="Knowledge sources"
              className="flex flex-col gap-px px-2 py-3"
            >
              <KnowledgeSourceRow
                active={dataset === "training"}
                onClick={() => setDatasetAndUrl("training")}
              >
                <FolderGlyph active={dataset === "training"} />
                <span className="min-w-0 flex-1 truncate leading-snug">
                  Knowledge Training
                </span>
              </KnowledgeSourceRow>

              <div className="flex w-full items-center gap-0.5 rounded-[10px] py-0.5 pr-0.5 pl-0">
                <button
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-3 rounded-[9px] px-2 py-2 text-left text-[13px] font-medium transition-colors",
                    dataset === "general"
                      ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 [&_svg]:text-primary-foreground"
                      : "text-foreground/88 hover:bg-muted/50 hover:text-foreground",
                  )}
                  onClick={() => setDatasetAndUrl("general")}
                  type="button"
                >
                  <FolderGlyph active={dataset === "general"} />
                  <span className="min-w-0 flex-1 truncate leading-snug">
                    General
                  </span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className={cn(
                        "size-8 shrink-0",
                        dataset === "general"
                          ? "text-primary-foreground hover:bg-primary-foreground/15"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <MoreHorizontalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled>Rename</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </nav>
          </ScrollArea>
        </aside>

        {/* Hovedkolonne */}
        <div
          className="dash-subpane-main flex min-h-0 min-w-0 flex-1 flex-col"
          onDragOver={onDragOverMain}
          onDrop={onDropMain}
        >
          <div
            className={cn(
              "shrink-0 border-border/60 border-b bg-card/40 backdrop-blur-sm dark:bg-card/25",
              isKnowledgeTraining ? "hidden" : "px-6 py-5",
            )}
          >
            <h2 className="text-[16px] font-semibold tracking-tight text-foreground">
              {rightTitle}
            </h2>
            {showFileList ? (
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  className="h-10 flex-1 rounded-lg border-border/70 bg-card/90 text-[13px] shadow-sm"
                  disabled={isImportingWebpage}
                  onChange={(e) => setWebUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canAddWebpage) {
                      e.preventDefault();
                      void handleAddWebpage();
                    }
                  }}
                  placeholder="https://eksempel.no/hjelp"
                  type="url"
                  value={webUrl}
                />
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button
                    className="h-10 rounded-lg px-4 text-[13px] font-medium"
                    disabled={!canAddWebpage}
                    onClick={() => void handleAddWebpage()}
                    type="button"
                    variant="secondary"
                  >
                    {isImportingWebpage ? "Henter…" : "Legg til nettside"}
                  </Button>
                  <Button
                    className="h-10 rounded-lg px-4 text-[13px] font-medium"
                    onClick={openUpload}
                    type="button"
                  >
                    <UploadIcon className="size-4" />
                    Upload File
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {isKnowledgeTraining ? (
              <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <KnowledgeTrainingPlayground
                  onManageSources={() => setDatasetAndUrl("general")}
                />
              </div>
            ) : isLoadingFirstPage ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton className="h-12 w-full rounded-lg" key={i} />
                ))}
              </div>
            ) : files.results.length === 0 ? (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
                <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-10 pb-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="mb-1 flex size-14 items-center justify-center rounded-2xl border border-border bg-foreground text-background shadow-sm">
                      <UploadIcon className="size-7" strokeWidth={1.5} />
                    </div>
                    <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
                      Ingen elementer ennå. Legg inn kunnskap med nettside
                      (over) eller fil — alt indekseres for AI-søk per
                      organisasjon.
                    </p>
                    <p className="text-[12px] text-muted-foreground/80">
                      Drag &amp; drop
                    </p>
                  </div>
                  <p className="text-muted-foreground max-w-md text-[12px] leading-relaxed">
                    Åpne{" "}
                    <button
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                      onClick={() => setDatasetAndUrl("training")}
                      type="button"
                    >
                      Knowledge Training
                    </button>{" "}
                    for oversikt over indeksen og forhåndsvisning.
                  </p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="flex flex-col px-4 py-2">
                  {files.results.map((file) => (
                    <div
                      className="flex items-center gap-3 border-border/40 border-b py-3 last:border-b-0"
                      key={file.id}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
                        <FileIcon className="size-4" strokeWidth={1.5} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-[13px] text-foreground">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground tabular-nums">
                          {file.type.toUpperCase()} · {file.size}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="size-8 shrink-0 p-0"
                            size="sm"
                            variant="ghost"
                          >
                            <MoreHorizontalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(file)}
                          >
                            <TrashIcon className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                  <InfiniteScrollTrigger
                    canLoadMore={canLoadMore}
                    isLoadingMore={isLoadingMore}
                    onLoadMore={handleLoadMore}
                    ref={topElementRef}
                  />
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function FilesView() {
  return (
    <Suspense fallback={<FilesViewLoading />}>
      <FilesViewInner />
    </Suspense>
  );
}
