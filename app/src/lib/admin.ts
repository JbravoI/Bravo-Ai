import { auth } from "@/auth";
import { getUserById } from "@/lib/users";

export async function requireAdmin() {
  const session = await auth();
  const user = session?.user?.id ? await getUserById(session.user.id) : null;
  return user?.role === "admin" ? user : null;
}
