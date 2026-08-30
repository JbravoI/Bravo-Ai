import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import { requireAdmin } from "@/lib/admin";
import { getManagedUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/dashboard");
  return <AdminDashboard initialUsers={await getManagedUsers()} />;
}
