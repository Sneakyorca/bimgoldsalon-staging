import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading your profile"
      className="mx-auto w-full max-w-140 px-5 py-10"
    >
      <Skeleton className="h-9 w-56" />
      <div className="mt-8 space-y-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
      <Skeleton className="mt-8 h-12 w-40 rounded-full" />
    </section>
  );
}
