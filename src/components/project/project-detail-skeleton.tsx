import { Skeleton } from "@/components/ui/skeleton";

export function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Top Meta info */}
      <div className="flex justify-between items-center px-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>

      {/* Main Card Skeleton */}
      <div className="overflow-hidden bg-card rounded-3xl border border-white/10">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>

          {/* Title & Body */}
          <div className="space-y-4 mb-8">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>

          {/* Large Image */}
          <Skeleton className="aspect-video w-full rounded-2xl mb-8" />

          {/* Actions */}
          <div className="flex justify-between items-center py-4 border-t border-white/5">
             <div className="flex gap-6">
               <Skeleton className="h-6 w-16" />
               <Skeleton className="h-6 w-16" />
               <Skeleton className="h-6 w-16" />
             </div>
             <Skeleton className="h-6 w-10" />
          </div>
        </div>
      </div>

      {/* Comments Skeleton */}
      <div className="p-4 space-y-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-24 w-full rounded-xl" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 py-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
