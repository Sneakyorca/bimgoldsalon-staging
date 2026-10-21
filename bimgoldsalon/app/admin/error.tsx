"use client";
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-[60vh] place-items-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Admin page error</h1>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-full bg-primary px-5 py-2 font-semibold text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
