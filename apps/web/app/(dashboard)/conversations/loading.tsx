function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted/50 ${className}`} />;
}

// Shown in the right-panel area of ConversationsLayout while page.tsx JS loads
export default function Loading() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-4 px-8">
      <Bone className="size-14 rounded-2xl" />
      <div className="space-y-2 text-center">
        <Bone className="mx-auto h-5 w-40" />
        <Bone className="mx-auto h-4 w-56" />
      </div>
    </div>
  );
}
