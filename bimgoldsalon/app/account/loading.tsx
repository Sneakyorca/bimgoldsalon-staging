import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading your account"
      className="mx-auto w-full max-w-360 px-5 pb-16 pt-4 lg:px-12"
    >
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-10 w-72 max-w-full" />
      <Skeleton className="mt-6 h-28 w-full rounded-2xl md:w-80" />
      <Skeleton className="mt-12 h-7 w-40" />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
