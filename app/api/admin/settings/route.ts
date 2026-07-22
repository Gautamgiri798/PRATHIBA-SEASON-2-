import { NextRequest, NextResponse } from "next/server";
import { getSetting, getTotalVoters } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const isTest = req.nextUrl.searchParams.get("test") === "true";
  
  // Check admin session
  const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "admin123";
  const sessionToken = req.cookies.get("admin_session")?.value;

  if (sessionToken !== ADMIN_PASSCODE) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const votingActive = (await getSetting("voting_active", isTest)) === "true";
  const votingEndsAt = await getSetting("voting_ends_at", isTest);
  const totalVoters = await getTotalVoters(isTest);

  return NextResponse.json({
    active: votingActive,
    endsAt: votingEndsAt || null,
    serverTime: new Date().toISOString(),
    totalVoters,
  });
}
