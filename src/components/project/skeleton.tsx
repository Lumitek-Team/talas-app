export function PostSkeleton() {
  return (
    <div className="p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-500 rounded-full"></div>
        <div className="flex-col gap-3">
          <div className="h-4 bg-gray-500 rounded w-24 mb-3"></div>
          <div className="h-3 bg-gray-500 rounded w-16"></div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-500 rounded w-full mb-3"></div>
        <div className="h-4 bg-gray-500 rounded w-5/6"></div>
      </div>
      <div className="w-full h-48 bg-gray-500 rounded-lg"></div>
    </div>
  );
}