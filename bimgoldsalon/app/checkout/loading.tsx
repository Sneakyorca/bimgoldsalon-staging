import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading checkout"
      className="mx-auto w-full max-w-360 px-5 pb-16 pt-6 lg:px-12"
    >
      <Skeleton className="mx-auto h-8 w-64" />
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-4">
          <Skeleton className="h-10 w-56" />
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-lg" />
          ))}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-96 w-full rounded-3xl" />
          <Skeleton className="h-56 w-full rounded-3xl" />
        </div>
      </div>
    </section>
  );
}
