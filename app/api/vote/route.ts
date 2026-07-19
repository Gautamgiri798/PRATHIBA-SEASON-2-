import { NextRequest, NextResponse } from "next/server";
import { castVoteTransaction, getSetting } from "@/lib/db";
import { normalizeContact, ContactType } from "@/lib/validate";
import { CATEGORIES } from "@/lib/categories";

const VALID_CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));
const NOMINEE_IDS_BY_CATEGORY: Record<string, Set<string>> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, new Set(c.nominees.map((n) => n.id))])
);

export async function POST(req: NextRequest) {
  // Verify server-side voting state configuration
  const votingActive = (await getSetting("voting_active")) === "true";
  const votingEndsAt = await getSetting("voting_ends_at");

  if (!votingActive) {
    return NextResponse.json(
      { error: "Voting is currently stopped or has not started yet." },
      { status: 403 }
    );
  }

  if (votingEndsAt) {
    const endsDate = new Date(votingEndsAt);
    if (new Date() > endsDate) {
      return NextResponse.json(
        { error: "Voting has closed. The deadline has already passed." },
        { status: 403 }
      );
    }
  }

  let body: {
    name?: string;
    contact?: string;
    contactType?: ContactType;
    votes?: Record<string, string>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, contact, contactType, votes } = body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Please enter your full name (at least 2 letters)." }, { status: 400 });
  }

  if (!contact || !contactType || (contactType !== "mobile" && contactType !== "email")) {
    return NextResponse.json({ error: "A valid mobile number or email is required." }, { status: 400 });
  }

  const normalized = normalizeContact(contact, contactType);
  if (!normalized) {
    return NextResponse.json(
      {
        error:
          contactType === "mobile"
            ? "That doesn't look like a valid 10-digit Indian mobile number."
            : "That doesn't look like a valid email address.",
      },
      { status: 400 }
    );
  }

  if (!votes || typeof votes !== "object") {
    return NextResponse.json({ error: "No votes were submitted." }, { status: 400 });
  }

  const submittedCategoryIds = Object.keys(votes);
  if (submittedCategoryIds.length !== CATEGORIES.length) {
    return NextResponse.json(
      { error: `Please vote in all ${CATEGORIES.length} categories before submitting.` },
      { status: 400 }
    );
  }

  for (const [categoryId, nomineeId] of Object.entries(votes)) {
    if (!VALID_CATEGORY_IDS.has(categoryId)) {
      return NextResponse.json({ error: `Unknown category: ${categoryId}` }, { status: 400 });
    }
    if (!NOMINEE_IDS_BY_CATEGORY[categoryId].has(nomineeId)) {
      return NextResponse.json(
        { error: `Invalid nominee selected for ${categoryId}.` },
        { status: 400 }
      );
    }
  }

  try {
    const voterId = await castVoteTransaction(name.trim(), normalized, contactType, votes);
    return NextResponse.json({ ok: true, voterId });
  } catch (error: any) {
    // Catch PostgreSQL duplicate voter contact constraint (code '23505') or SQLite constraint
    if (
      error.code === "23505" ||
      error.code === "SQLITE_CONSTRAINT_UNIQUE" ||
      error.message?.includes("UNIQUE constraint failed") ||
      error.message?.includes("duplicate key")
    ) {
      return NextResponse.json(
        { error: "This mobile number / email has already voted. Only one vote is allowed per person." },
        { status: 409 }
      );
    }
    console.error("cast_vote error:", error);
    return NextResponse.json({ error: "Something went wrong recording your vote. Please try again." }, { status: 500 });
  }
}
