import { getTallies } from "@/lib/db";
import { CATEGORIES } from "@/lib/categories";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;
  const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "admin123";
  const isAuthorized = sessionToken === ADMIN_PASSCODE;

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const isTest = searchParams.get("mode") === "test";
  const categoryId = searchParams.get("category");

  if (!categoryId) {
    return NextResponse.json({ error: "Category ID required" }, { status: 400 });
  }

  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  try {
    const tallies = await getTallies(isTest);
    const categoryTotalVotes = tallies
      .filter((t) => t.category_id === categoryId)
      .reduce((sum, t) => sum + t.votes, 0);

    // Map votes by nominee ID
    const voteMap: Record<string, number> = {};
    for (const t of tallies) {
      if (t.category_id === categoryId) {
        voteMap[t.nominee_id] = t.votes;
      }
    }

    const results = category.nominees.map((nominee) => {
      const votes = voteMap[nominee.id] ?? 0;
      const percentage =
        categoryTotalVotes > 0 ? Math.round((votes / categoryTotalVotes) * 100) : 0;
      return {
        ...nominee,
        votes,
        percentage,
      };
    });

    // Sort descending by votes
    results.sort((a, b) => b.votes - a.votes);

    // Assign rank, handling ties correctly
    let currentRank = 1;
    const rankedResults = results.map((r, index) => {
      if (index > 0 && r.votes < results[index - 1].votes) {
        currentRank = index + 1;
      }
      return {
        ...r,
        rank: currentRank,
      };
    });

    return NextResponse.json({
      category: {
        id: category.id,
        title: category.title,
        group: category.group,
        description: category.description,
      },
      totalVotes: categoryTotalVotes,
      results: rankedResults,
    });
  } catch (error) {
    console.error("Error fetching reveal data:", error);
    return NextResponse.json({ error: "Failed to fetch tallies" }, { status: 500 });
  }
}
