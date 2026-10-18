import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading products"
      className="mx-auto w-full max-w-360 px-5 pb-16 pt-6 lg:px-12"
    >
      <Skeleton className="mx-auto h-13 max-w-175 rounded-full" />
      <div className="mt-5 flex justify-center gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-11 w-32 rounded-full" />
        ))}
      </div>
      <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className="rounded-lg bg-card p-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="mt-4 h-5 w-3/4" />
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="mt-4 h-5 w-1/3" />
          </li>
        ))}
      </ul>
    </section>
  );
}
