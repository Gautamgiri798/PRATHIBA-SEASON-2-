import { NextRequest, NextResponse } from "next/server";
import { deleteVoter } from "@/lib/db";

export async function POST(req: NextRequest) {
  const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "admin123";
  const sessionToken = req.cookies.get("admin_session")?.value;
  
  if (sessionToken !== ADMIN_PASSCODE) {
    console.warn("[Delete API] Unauthorized attempt. Session token mismatch.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { voterId, isTest } = await req.json();
    console.log(`[Delete API] Deleting voter. ID: ${voterId}, isTest: ${isTest}`);
    
    if (!voterId) {
      return NextResponse.json({ error: "Missing voterId" }, { status: 400 });
    }

    await deleteVoter(voterId, !!isTest);
    console.log(`[Delete API] Successfully deleted voter ${voterId}`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Delete API] Error during voter delete:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
