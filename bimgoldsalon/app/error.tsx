"use client";

import ErrorView from "@/components/site/ErrorView";

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorView {...props} />;
}
