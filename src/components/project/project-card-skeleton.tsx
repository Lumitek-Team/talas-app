import { Skeleton } from "@/components/ui/skeleton";

export function ProjectCardSkeleton() {
  return (
    <div className="p-4 bg-card rounded-3xl border border-white/10 overflow-hidden">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-3 mb-6">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      {/* Media Skeleton */}
      <Skeleton className="aspect-video w-full rounded-xl mb-4" />

      {/* Actions Skeleton */}
      <div className="flex justify-between pt-2">
        <div className="flex gap-4">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-12" />
        </div>
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );
}
