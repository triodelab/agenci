/**
 * Shared skeleton primitives for dashboard loading states.
 * Pure CSS — no client component overhead.
 */

function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#E5E7EB] ${className}`} />;
}

/** Full-page skeleton that mimics the dashboard chrome (topnav + sidebar + main). */
export function DashboardFullSkeleton() {
  return (
    <div className="flex h-svh max-h-svh w-full flex-col overflow-hidden bg-background">
      {/* Top nav */}
      <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-border/60 bg-card px-5">
        <div className="flex items-center gap-3">
          <Bone className="size-8 rounded-lg" />
          <Bone className="h-5 w-20" />
        </div>
        <div className="flex items-center gap-2">
          <Bone className="size-8 rounded-lg" />
          <Bone className="h-8 w-32 rounded-lg" />
          <Bone className="size-8 rounded-lg" />
          <Bone className="size-8 rounded-full" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden w-[220px] shrink-0 flex-col gap-4 border-r border-border/60 bg-sidebar p-4 md:flex">
          <div className="space-y-1.5">
            <Bone className="mb-3 h-3 w-16" />
            <Bone className="h-9 w-full rounded-xl" />
            <Bone className="h-9 w-full rounded-xl" />
            <Bone className="h-9 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Bone className="mb-3 h-3 w-20" />
            <Bone className="h-9 w-full rounded-xl" />
            <Bone className="h-9 w-full rounded-xl" />
            <Bone className="h-9 w-full rounded-xl" />
          </div>
        </div>

        {/* Main area */}
        <div className="flex min-h-0 flex-1 flex-col overflow-auto p-8">
          <PageContentSkeleton />
        </div>
      </div>
    </div>
  );
}

/** Generic page content skeleton — used in loading.tsx files (sidebar+topnav already rendered). */
export function PageContentSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <Bone className="h-4 w-28" />
        <Bone className="h-8 w-64" />
        <Bone className="h-4 w-80" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Bone className="h-28 rounded-2xl" />
        <Bone className="h-28 rounded-2xl" />
        <Bone className="h-28 rounded-2xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          <Bone className="h-6 w-40" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Bone className="h-44 rounded-2xl" />
            <Bone className="h-44 rounded-2xl" />
            <Bone className="h-44 rounded-2xl" />
            <Bone className="h-44 rounded-2xl" />
          </div>
        </div>
        <div className="space-y-4">
          <Bone className="h-52 rounded-2xl" />
          <Bone className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function ConversationListSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="shrink-0 space-y-3 border-b border-border/60 bg-card px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bone className="size-8 rounded-lg" />
            <div className="space-y-1.5">
              <Bone className="h-4 w-28" />
              <Bone className="h-3 w-16" />
            </div>
          </div>
          <div className="flex gap-1">
            <Bone className="size-7 rounded-lg" />
            <Bone className="size-7 rounded-lg" />
          </div>
        </div>
        <Bone className="h-9 w-full rounded-xl" />
        <div className="flex gap-1.5">
          <Bone className="h-7 w-14 rounded-full" />
          <Bone className="h-7 w-16 rounded-full" />
          <Bone className="h-7 w-14 rounded-full" />
          <Bone className="h-7 w-12 rounded-full" />
          <Bone className="h-7 w-10 rounded-full" />
        </div>
      </div>
      {/* Rows */}
      <div className="flex-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex gap-3 border-b border-border/40 px-4 py-3.5">
            <Bone className="size-[2.375rem] shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2 pt-0.5">
              <div className="flex items-start justify-between gap-2">
                <Bone className="h-3.5 w-28" />
                <Bone className="h-3 w-14 shrink-0" />
              </div>
              <Bone className="h-3 w-40" />
              <Bone className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border/60 bg-card px-4 py-3">
        <Bone className="size-9 rounded-full" />
        <div className="space-y-1.5">
          <Bone className="h-4 w-32" />
          <Bone className="h-3 w-24" />
        </div>
      </div>
      {/* messages */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
        <div className="flex justify-start"><Bone className="h-14 w-[65%] rounded-2xl" /></div>
        <div className="flex justify-end"><Bone className="h-10 w-[45%] rounded-2xl" /></div>
        <div className="flex justify-start"><Bone className="h-20 w-[70%] rounded-2xl" /></div>
        <div className="flex justify-end"><Bone className="h-10 w-[40%] rounded-2xl" /></div>
        <div className="flex justify-start"><Bone className="h-14 w-[60%] rounded-2xl" /></div>
      </div>
      {/* input */}
      <div className="shrink-0 border-t border-border/60 p-4">
        <Bone className="h-24 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function TwoColumnFormSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-1">
      {/* left rail */}
      <div className="w-[288px] shrink-0 space-y-2 border-r border-border/60 p-5">
        <Bone className="mb-4 h-3 w-16" />
        <Bone className="h-10 w-full rounded-xl" />
        <Bone className="h-10 w-full rounded-xl" />
        <Bone className="h-10 w-full rounded-xl" />
        <Bone className="h-10 w-full rounded-xl" />
      </div>
      {/* right form */}
      <div className="flex-1 space-y-4 p-8">
        <div className="space-y-1.5">
          <Bone className="h-6 w-36" />
          <Bone className="h-4 w-72" />
        </div>
        <Bone className="h-px w-full rounded-none" />
        <div className="space-y-3">
          <Bone className="h-4 w-24" />
          <Bone className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-3">
          <Bone className="h-4 w-32" />
          <Bone className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-3">
          <Bone className="h-4 w-28" />
          <Bone className="h-10 w-full rounded-xl" />
        </div>
        <Bone className="mt-6 h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="w-full space-y-6 px-5 py-8 sm:px-8 lg:px-10">
      <div className="space-y-2">
        <Bone className="h-7 w-36" />
        <Bone className="h-4 w-56" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <Bone key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function SimplePanelSkeleton() {
  return (
    <div className="w-full space-y-4 px-5 py-8 sm:px-8 lg:px-10 xl:px-12">
      <div className="space-y-2">
        <Bone className="h-7 w-40" />
        <Bone className="h-4 w-60" />
      </div>
      <Bone className="h-[420px] w-full max-w-2xl rounded-2xl" />
    </div>
  );
}
