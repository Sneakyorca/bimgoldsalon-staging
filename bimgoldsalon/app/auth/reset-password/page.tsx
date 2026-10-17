import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AuthCardLayout from "@/components/auth/AuthCardLayout";
import ResetPasswordClient from "@/components/auth/ResetPasswordClient";
import { getCurrentUser } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false },
};

export default async function ResetPasswordPage() {
  if (!(await getCurrentUser())) redirect("/forgot-password?expired=1");
  return (
    <AuthCardLayout
      heading="Almost done"
      subheading="Pick a new password for your account"
      backTo={{ label: "Sign in", href: "/auth" }}
    >
      <ResetPasswordClient />
    </AuthCardLayout>
  );
}
