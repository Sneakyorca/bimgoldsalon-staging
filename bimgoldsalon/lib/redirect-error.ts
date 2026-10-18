/**
 * When a server action calls redirect(), the browser's call to it "throws" a
 * NEXT_REDIRECT signal while Next takes the visitor to the new page. That's a
 * success, not an error, so forms must not show it.
 */
export function isRedirectError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const { message, digest } = error as { message?: unknown; digest?: unknown };
  return (
    message === "NEXT_REDIRECT" ||
    (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT"))
  );
}
