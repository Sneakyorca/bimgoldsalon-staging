import type { Metadata } from "next";
import AdminConsole from "@/components/admin/AdminConsole";
import { requireAdmin } from "@/lib/auth/dal";
import { getAdminSnapshot } from "@/lib/auth/api";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminPage() {
  const admin = await requireAdmin();
  const data = await getAdminSnapshot();
  return <AdminConsole adminName={admin.name} data={data} />;
}
