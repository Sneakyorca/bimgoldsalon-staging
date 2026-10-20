import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-label="Confirming your payment"
      className="flex items-center justify-center bg-white px-4 py-16"
    >
      <div className="w-full max-w-xl text-center">
        <Skeleton className="mx-auto size-20 rounded-full" />
        <Skeleton className="mx-auto mt-8 h-10 w-72 max-w-full" />
        <p className="mt-4 text-gray-600">Confirming your payment…</p>
        <Skeleton className="mt-8 h-56 w-full rounded-lg" />
      </div>
    </section>
  );
}
