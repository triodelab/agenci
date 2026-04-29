import { PageContentSkeleton } from "@/modules/dashboard/ui/components/dashboard-skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <div className="mx-auto w-full flex-1 px-5 py-8 sm:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <PageContentSkeleton />
      </div>
    </div>
  );
}
