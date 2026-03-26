"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { PublicFile } from "@workspace/backend/private/files";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { UploadDialog } from "../components/upload-dialog";
import { useCallback, useState } from "react";
import { DeleteFileDialog } from "../components/delete-file-dialog";
import {
  FileIcon,
  FolderIcon,
  Link2Icon,
  MoreHorizontalIcon,
  TrashIcon,
  UploadIcon,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Skeleton } from "@workspace/ui/components/skeleton";

type DatasetKey =
  | "training"
  | "general"
  | "gmail"
  | "shopify"
  | "stripe"
  | "hubspot";

const INTEGRATION_ROWS: {
  id: Exclude<DatasetKey, "training" | "general">;
  label: string;
  iconSrc: string;
  tintClass: string;
}[] = [
  {
    id: "gmail",
    label: "Gmail",
    iconSrc: "/brands/gmail.svg",
    tintClass:
      "bg-rose-500/[0.09] dark:bg-rose-400/[0.12]",
  },
  {
    id: "shopify",
    label: "Shopify",
    iconSrc: "/brands/shopify.svg",
    tintClass:
      "bg-emerald-500/[0.09] dark:bg-emerald-400/[0.12]",
  },
  {
    id: "stripe",
    label: "Stripe",
    iconSrc: "/brands/stripe.svg",
    tintClass:
      "bg-violet-500/[0.09] dark:bg-violet-400/[0.12]",
  },
  {
    id: "hubspot",
    label: "Hubspot",
    iconSrc: "/brands/hubspot.svg",
    tintClass:
      "bg-orange-500/[0.09] dark:bg-orange-400/[0.12]",
  },
];

function FolderGlyph({ active }: { active?: boolean }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-[7px] border text-muted-foreground",
        active
          ? "border-foreground/15 bg-muted/70 text-foreground"
          : "border-border/50 bg-[var(--dash-knowledge-folder)]",
      )}
      aria-hidden
    >
      <FolderIcon className="size-[15px]" strokeWidth={1.65} />
    </span>
  );
}

function BrandGlyph({
  active,
  src,
  tintClass,
}: {
  active?: boolean;
  src: string;
  tintClass: string;
}) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-[7px]",
        active ? "border border-border bg-muted/50" : tintClass,
      )}
      aria-hidden
    >
      <img
        alt=""
        className="size-[18px] select-none"
        decoding="async"
        height={18}
        src={src}
        width={18}
      />
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
          ? "border-l-[3px] border-l-foreground bg-[var(--dash-nav-active-bg)] pl-[calc(0.625rem-3px)] text-foreground"
          : "text-foreground/88 hover:bg-muted/60 hover:text-foreground",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export const FilesView = () => {
  const files = usePaginatedQuery(
    api.private.files.list,
    {},
    {
      initialNumItems: 10,
    },
  );

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
  const [dataset, setDataset] = useState<DatasetKey>("general");
  const [webUrl, setWebUrl] = useState("");

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
  const isIntegrationPlaceholder =
    dataset === "gmail" ||
    dataset === "shopify" ||
    dataset === "stripe" ||
    dataset === "hubspot" ||
    dataset === "training";

  const rightTitle =
    dataset === "general"
      ? "General"
      : dataset === "training"
        ? "Knowledge Training"
        : INTEGRATION_ROWS.find((r) => r.id === dataset)?.label ?? "Knowledge";

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
        {/* Midtkolonne — dataset / kilder (Lemni) */}
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
                onClick={() => setDataset("training")}
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
                      ? "border-l-[3px] border-l-foreground bg-[var(--dash-nav-active-bg)] pl-[calc(0.5rem-3px)] text-foreground"
                      : "text-foreground/88 hover:bg-muted/50 hover:text-foreground",
                  )}
                  onClick={() => setDataset("general")}
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
                          ? "text-foreground hover:bg-muted/50"
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

              {INTEGRATION_ROWS.map((row) => (
                <KnowledgeSourceRow
                  active={dataset === row.id}
                  key={row.id}
                  onClick={() => setDataset(row.id)}
                >
                  <BrandGlyph
                    active={dataset === row.id}
                    src={row.iconSrc}
                    tintClass={row.tintClass}
                  />
                  <span className="min-w-0 flex-1 truncate leading-snug">
                    {row.label}
                  </span>
                </KnowledgeSourceRow>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        {/* Hovedkolonne */}
        <div
          className="dash-subpane-main flex min-h-0 min-w-0 flex-1 flex-col"
          onDragOver={onDragOverMain}
          onDrop={onDropMain}
        >
          <div className="shrink-0 border-border/60 border-b bg-card/40 px-6 py-5 backdrop-blur-sm dark:bg-card/25">
            <h2 className="text-[16px] font-semibold tracking-tight text-foreground">
              {rightTitle}
            </h2>
            {showFileList ? (
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  className="h-10 flex-1 rounded-lg border-border/70 bg-card/90 text-[13px] shadow-sm"
                  onChange={(e) => setWebUrl(e.target.value)}
                  placeholder="https://publicwebpage.com/docs/topic"
                  type="url"
                  value={webUrl}
                />
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button
                    className="h-10 rounded-lg px-4 text-[13px] font-medium"
                    disabled
                    type="button"
                    variant="secondary"
                  >
                    Add Webpage
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

          <div className="min-h-0 flex-1 overflow-hidden">
            {isIntegrationPlaceholder ? (
              <div className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-2 px-8 py-16 text-center">
                <div className="mb-2 flex size-12 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground shadow-sm">
                  <Link2Icon className="size-6" strokeWidth={1.75} />
                </div>
                <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
                  {dataset === "training"
                    ? "Samle treningsdata og dokumenter her. Koble til kilder under eller last opp filer i General."
                    : "Denne integrasjonen er ikke koblet til ennå. Vi støtter opplasting av filer under General."}
                </p>
              </div>
            ) : isLoadingFirstPage ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton className="h-12 w-full rounded-lg" key={i} />
                ))}
              </div>
            ) : files.results.length === 0 ? (
              <div className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-2 px-8 py-16 text-center">
                <div className="mb-3 flex size-14 items-center justify-center rounded-2xl border border-border bg-foreground text-background shadow-sm">
                  <UploadIcon className="size-7" strokeWidth={1.5} />
                </div>
                <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
                  Train Ai agents on your business by adding webpages, FAQ,
                  PDFs, playbooks, images, and more
                </p>
                <p className="text-[12px] text-muted-foreground/80">
                  Drag &amp; drop
                </p>
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
};
