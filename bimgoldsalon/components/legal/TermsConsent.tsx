import Link from "next/link";

export default function TermsConsent({
  action,
  className = "",
}: {
  /** e.g. "creating an account", "confirming this booking" */
  action: string;
  className?: string;
}) {
  return (
    <p className={`text-[13px] text-gray-600 md:text-center ${className}`}>
      By {action}, you agree to our{" "}
      <Link
        href="/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold underline"
      >
        Terms &amp; Conditions
      </Link>{" "}
      and{" "}
      <Link
        href="/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold underline"
      >
        Privacy Policy
      </Link>
      .
    </p>
  );
}
