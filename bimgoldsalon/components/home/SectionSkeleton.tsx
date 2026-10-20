import { Skeleton } from "@/components/ui/Skeleton";

export default function SectionSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading"
      className="mx-auto w-full max-w-360 px-5 pt-14 lg:px-12 lg:pt-20"
    >
      <Skeleton className="mx-auto mb-8 h-9 w-64" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-80 rounded-lg" />
        ))}
      </div>
    </section>
  );
}
