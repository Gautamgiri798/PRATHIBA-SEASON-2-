import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeContact, ContactType } from "@/lib/validate";
import { CATEGORIES } from "@/lib/categories";
import crypto from "crypto";

const VALID_CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));
const NOMINEE_IDS_BY_CATEGORY: Record<string, Set<string>> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, new Set(c.nominees.map((n) => n.id))])
);

// Prepare statement cache for optimized database execution
const insertVoter = db.prepare(`
  INSERT INTO voters (id, name, contact, contact_type)
  VALUES (?, ?, ?, ?)
`);

const insertVote = db.prepare(`
  INSERT INTO votes (id, voter_id, category_id, nominee_id)
  VALUES (?, ?, ?, ?)
`);

// Local SQLite database transaction for atomic vote submissions
const castVoteTransaction = db.transaction(
  (name: string, contact: string, contactType: string, votes: Record<string, string>) => {
    const voterId = crypto.randomUUID();
    insertVoter.run(voterId, name, contact, contactType);

    for (const [categoryId, nomineeId] of Object.entries(votes)) {
      const voteId = crypto.randomUUID();
      insertVote.run(voteId, voterId, categoryId, nomineeId);
    }

    return voterId;
  }
);

export async function POST(req: NextRequest) {
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
    const voterId = castVoteTransaction(name.trim(), normalized, contactType, votes);
    return NextResponse.json({ ok: true, voterId });
  } catch (error: any) {
    // Catch SQLITE duplicate voter contact constraint
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE" || error.message?.includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { error: "This mobile number / email has already voted. Only one vote is allowed per person." },
        { status: 409 }
      );
    }
    console.error("cast_vote error:", error);
    return NextResponse.json({ error: "Something went wrong recording your vote. Please try again." }, { status: 500 });
  }
}
