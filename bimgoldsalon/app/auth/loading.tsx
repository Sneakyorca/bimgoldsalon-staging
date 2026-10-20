import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading"
      className="mx-auto w-full max-w-md px-5 py-12"
    >
      <Skeleton className="mx-auto h-9 w-48" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
      <Skeleton className="mt-6 h-12 w-full rounded-full" />
    </section>
  );
}
