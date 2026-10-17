import Link from "next/link";
import type { Metadata } from "next";
import AuthCardLayout from "@/components/auth/AuthCardLayout";
import { getCurrentUser } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Email confirmation",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ status?: string }> };

const title =
  "text-[28px] font-semibold text-[#313c6b] md:text-center md:text-[52px] md:leading-tight md:text-black";
const body =
  "text-[16px] text-gray-600 md:text-center md:text-[18px] md:text-black";
const button =
  "inline-block h-12 w-full rounded-full bg-[#313c6b] px-10 text-center text-[15px] font-semibold leading-12 text-white transition hover:bg-[#283258] md:w-auto md:rounded-md md:bg-primary md:text-[18px] md:hover:bg-primary/90";

export default async function ConfirmedPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const user = status === "expired" ? null : await getCurrentUser();

  if (user) {
    return (
      <AuthCardLayout
        heading="You're all set"
        subheading="Your email has been confirmed"
        backTo={{ label: "Sign in", href: "/auth" }}
      >
        <div role="status" className="space-y-4 md:space-y-6">
          <h1 className={title}>Email confirmed</h1>
          <p className={body}>
            Thanks for confirming your email address. You&apos;re signed in and
            ready to go.
          </p>
          <div className="md:flex md:justify-center">
            <Link href="/account" className={button}>
              Go to my account
            </Link>
          </div>
        </div>
      </AuthCardLayout>
    );
  }

  return (
    <AuthCardLayout
      heading="Link not valid"
      subheading="It may have expired or already been used"
      backTo={{ label: "Sign in", href: "/auth" }}
    >
      <div role="alert" className="space-y-4 md:space-y-6">
        <h1 className={title}>This link has expired</h1>
        <p className={body}>
          Email links only work once and for a short time. If you already
          confirmed your email, you can sign in. Otherwise, request a new link.
        </p>
        <div className="space-y-3 md:flex md:justify-center md:gap-4 md:space-y-0">
          <Link href="/auth" className={button}>
            Sign in
          </Link>
          <Link
            href="/forgot-password"
            className="block text-center text-[14px] font-bold md:self-center"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </AuthCardLayout>
  );
}
