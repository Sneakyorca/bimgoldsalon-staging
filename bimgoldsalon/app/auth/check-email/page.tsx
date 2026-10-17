import Link from "next/link";
import type { Metadata } from "next";
import AuthCardLayout from "@/components/auth/AuthCardLayout";
import { titleClass } from "@/components/auth/fields";

export const metadata: Metadata = {
  title: "Check your email",
  robots: { index: false },
};
type Props = { searchParams: Promise<{ type?: string; email?: string }> };

export default async function CheckEmailPage({ searchParams }: Props) {
  const { type, email = "" } = await searchParams;
  const isSignup = type === "signup";
  return (
    <AuthCardLayout
      heading="Check your email"
      subheading={
        isSignup
          ? "One last step to activate your account"
          : "We have sent you a reset link"
      }
      backTo={{ label: "Sign in", href: "/auth" }}
    >
      <div role="status" className="space-y-4 md:space-y-6">
        <h1 className={`${titleClass} text-[#313c6b] md:text-black`}>
          Check your email
        </h1>
        <p className="text-[16px] text-gray-600 md:text-center md:text-[18px] md:text-black">
          {isSignup
            ? "If we can create an account for "
            : "If an account exists for "}
          {email ? (
            <span className="font-semibold text-black">{email}</span>
          ) : (
            "that address"
          )}
          {isSignup
            ? ", we have sent a link to confirm it."
            : ", we have sent a link to reset your password. The link expires after a short time."}
        </p>
        <p className="text-[14px] text-gray-500 md:text-center">
          Nothing there? Check your spam folder, or{" "}
          <Link
            href={isSignup ? "/auth" : "/forgot-password"}
            className="font-bold text-black"
          >
            {isSignup ? "go back" : "try again"}
          </Link>
          . Open the link in the same browser you used here.
        </p>
      </div>
    </AuthCardLayout>
  );
}
