import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TestVoteWizard } from "./TestVoteWizard";

export const dynamic = "force-dynamic";

export default async function AdminTestVotePage() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;
  const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "admin123";
  const isAuthorized = sessionToken === ADMIN_PASSCODE;

  // Force redirect to login page if unauthorized
  if (!isAuthorized) {
    redirect("/admin");
  }

  // Server Action to clear cookie and log out
  async function handleLogout() {
    "use server";
    const store = cookies();
    store.delete("admin_session");
    redirect("/admin");
  }

  return <TestVoteWizard logoutAction={handleLogout} />;
}
