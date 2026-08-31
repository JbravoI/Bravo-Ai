import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import { requireAdmin } from "@/lib/admin";
import { getManagedUsers } from "@/lib/users";
import { getManagedPasswordResetRequests } from "@/lib/password-reset";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/dashboard");
  const [users, passwordResetRequests] = await Promise.all([getManagedUsers(), getManagedPasswordResetRequests()]);
  return <AdminDashboard initialUsers={users} initialPasswordResetRequests={passwordResetRequests} />;
}
