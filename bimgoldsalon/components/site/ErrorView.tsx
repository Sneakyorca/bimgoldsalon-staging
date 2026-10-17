"use client";

export default function ErrorView({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-[60vh] place-items-center px-5 py-16 text-center"><div><h1 className="text-3xl font-semibold text-primary">Something went wrong</h1><p className="mt-3 text-gray-600">Please try again.</p><button type="button" onClick={reset} className="mt-6 rounded-full bg-primary px-6 py-3 font-semibold text-white">Try again</button></div></main>;
}
