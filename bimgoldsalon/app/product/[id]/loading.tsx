import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading product"
      className="mx-auto w-full max-w-360 px-5 pb-16 pt-6 lg:px-12"
    >
      <Skeleton className="h-4 w-48" />
      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
        <Skeleton className="h-80 w-full rounded-2xl md:h-125" />
        <div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-10 w-full" />
          <Skeleton className="mt-2 h-10 w-2/3" />
          <Skeleton className="mt-5 h-8 w-32" />
          <Skeleton className="mt-6 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-8 h-12 w-44 rounded-full" />
        </div>
      </div>
    </section>
  );
}
