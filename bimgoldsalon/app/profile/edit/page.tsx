import type { Metadata } from "next";
import AuthCardLayout from "@/components/auth/AuthCardLayout";
import EditProfileClient from "@/components/profile/EditProfileClient";
import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Edit profile",
  robots: { index: false },
};

export default async function EditProfilePage() {
  const user = await requireUser("/profile/edit");
  return (
    <AuthCardLayout
      heading="Your profile"
      subheading="Keep your details up to date"
      backTo={{ label: "Account", href: "/account" }}
    >
      <EditProfileClient
        user={{ name: user.name, email: user.email, phone: user.phone }}
      />
    </AuthCardLayout>
  );
}
