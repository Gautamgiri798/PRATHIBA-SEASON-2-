import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import RevealClient from "./RevealClient";

export const dynamic = "force-dynamic";

export default async function AdminRevealPage({
  searchParams,
}: {
  searchParams: { mode?: string };
}) {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;
  const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "admin123";
  const isAuthorized = sessionToken === ADMIN_PASSCODE;

  // Force redirect to login page if unauthorized
  if (!isAuthorized) {
    redirect("/admin");
  }

  const isTest = searchParams.mode === "test";

  return (
    <RevealClient categories={CATEGORIES} isTest={isTest} />
  );
}
