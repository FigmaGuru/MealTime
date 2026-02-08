import { Skeleton } from "@/components/ui/skeleton";

export function DayColumnSkeleton() {
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 space-y-1">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-3 w-14" />
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}
