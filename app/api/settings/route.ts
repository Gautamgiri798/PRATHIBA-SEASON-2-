import { NextResponse } from "next/server";
import { getSetting } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const votingActive = (await getSetting("voting_active")) === "true";
  const votingEndsAt = await getSetting("voting_ends_at");

  return NextResponse.json({
    active: votingActive,
    endsAt: votingEndsAt || null,
    serverTime: new Date().toISOString(),
  });
}
