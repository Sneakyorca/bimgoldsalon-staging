import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading admin"
      className="min-h-[calc(100vh-5rem)] bg-[#f5f5f5] md:min-h-[calc(100vh-6rem)] lg:flex lg:min-h-[calc(100vh-7rem)]"
    >
      <div className="hidden w-60 shrink-0 bg-primary/90 lg:block">
        <div className="space-y-3 px-3 pt-32">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="h-11 animate-pulse rounded-full bg-white/15 motion-reduce:animate-none"
            />
          ))}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-4 border-b border-border bg-white px-4 py-4 md:px-8">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="ml-auto h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
        <div className="space-y-6 px-4 py-6 md:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <div className="space-y-3 rounded-lg border border-border bg-white p-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
