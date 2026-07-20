import { getSetting, getTallies, getTotalVoters } from "@/lib/db";
import { CATEGORIES } from "@/lib/categories";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminWinnersPage() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;
  const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "admin123";
  const isAuthorized = sessionToken === ADMIN_PASSCODE;

  // Force redirect to login page if unauthorized
  if (!isAuthorized) {
    redirect("/admin");
  }

  const votingActive = (await getSetting("voting_active")) === "true";
  const votingEndsAt = await getSetting("voting_ends_at");

  const deadlineIST = votingEndsAt
    ? new Date(votingEndsAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "No deadline set";

  // Server Action to clear cookie and log out
  async function handleLogout() {
    "use server";
    const store = cookies();
    store.delete("admin_session");
    redirect("/admin");
  }

  const totalVoters = await getTotalVoters();
  const tallies = await getTallies();

  // Map votes by Category -> Nominee
  const tallyMap: Record<string, Record<string, number>> = {};
  for (const row of tallies) {
    if (!tallyMap[row.category_id]) {
      tallyMap[row.category_id] = {};
    }
    tallyMap[row.category_id][row.nominee_id] = row.votes;
  }

  // Calculate winner(s) for each category
  const winnersData = CATEGORIES.map((category) => {
    const categoryTotalVotes = tallies
      .filter((t) => t.category_id === category.id)
      .reduce((sum, t) => sum + t.votes, 0);

    const nomineesWithVotes = category.nominees.map((nominee) => {
      const votes = tallyMap[category.id]?.[nominee.id] ?? 0;
      const percentage =
        categoryTotalVotes > 0 ? Math.round((votes / categoryTotalVotes) * 100) : 0;
      return {
        ...nominee,
        votes,
        percentage,
      };
    });

    nomineesWithVotes.sort((a, b) => b.votes - a.votes);

    const highestVotes = categoryTotalVotes > 0 ? nomineesWithVotes[0].votes : 0;
    const winners = highestVotes > 0
      ? nomineesWithVotes.filter((n) => n.votes === highestVotes)
      : [];
    const isTie = winners.length > 1;

    return {
      ...category,
      totalVotes: categoryTotalVotes,
      winners,
      isTie,
      hasVotes: highestVotes > 0,
    };
  });

  const categoriesWithWinnersCount = winnersData.filter((c) => c.hasVotes).length;

  return (
    <main className="min-h-screen bg-ink relative">
      <div className="pointer-events-none fixed inset-0 bg-radial-glow" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-14">
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-xs tracking-widest text-gold-deep uppercase">
              Sambalpuriya Youth Association
            </p>
            <h1 className="mt-1 font-display font-black text-3xl sm:text-4xl text-parchment tracking-wide flex items-center gap-2">
              WINNERS <span className="text-gold-gradient">PORTAL 🏆</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <Link
              href="/admin"
              className="rounded-full border border-white/15 bg-char px-4 py-2 text-xs font-semibold text-muted hover:text-parchment hover:border-white/30 transition-colors"
            >
              📊 All Leaderboard
            </Link>
            <Link
              href="/admin/winners"
              className="rounded-full border border-gold/50 bg-gold-deep/20 px-4 py-2 text-xs font-semibold text-gold-light shadow-sm"
            >
              🏆 Winners Only
            </Link>
            <Link
              href="/admin/voters"
              className="rounded-full border border-white/15 bg-char px-4 py-2 text-xs font-semibold text-muted hover:text-parchment hover:border-white/30 transition-colors"
            >
              📜 Voter Logs
            </Link>
            <a
              href="/admin/winners"
              className="rounded-full border border-white/15 bg-char px-4 py-2 text-xs font-semibold text-muted hover:text-parchment hover:border-white/30 transition-colors"
            >
              🔄 Refresh
            </a>
            <form action={handleLogout}>
              <button
                type="submit"
                className="rounded-full border border-white/15 bg-char px-4 py-2 text-xs font-semibold text-muted hover:text-parchment hover:border-white/30 transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* Winners Summary Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-gold-deep/30 bg-char/80 p-4 text-center shadow-gold">
            <p className="font-mono text-xs text-muted uppercase">Total Categories</p>
            <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-parchment">
              {CATEGORIES.length}
            </p>
          </div>
          <div className="rounded-xl border border-gold-deep/40 bg-gold-deep/10 p-4 text-center shadow-gold">
            <p className="font-mono text-xs text-gold-light uppercase">Declared Winners</p>
            <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-gold-light">
              {categoriesWithWinnersCount} / {CATEGORIES.length}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-char/80 p-4 text-center">
            <p className="font-mono text-xs text-muted uppercase">Total Voters</p>
            <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-parchment">
              {totalVoters}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-char/80 p-4 text-center">
            <p className="font-mono text-xs text-muted uppercase">Ballot Status</p>
            <p className={`mt-1 font-mono text-sm font-bold ${votingActive ? "text-emerald" : "text-maroon-light"}`}>
              {votingActive ? "ACTIVE" : "CLOSED"}
            </p>
          </div>
        </div>

        {/* Winners Grid */}
        <div className="mt-10 space-y-8">
          {winnersData.map((cat) => {
            return (
              <div
                key={cat.id}
                className="rounded-2xl border border-gold-deep/40 bg-char/70 p-6 sm:p-8 shadow-gold relative overflow-hidden"
              >
                {/* Background decorative shine */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />

                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 mb-6 gap-2">
                  <div>
                    <span className="font-mono text-xs text-gold-deep uppercase tracking-widest font-semibold">
                      {cat.group}
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl text-parchment font-bold mt-0.5">
                      {cat.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted bg-ink/60 border border-white/10 px-3 py-1 rounded-full">
                      {cat.totalVotes} total votes
                    </span>
                  </div>
                </div>

                {/* Winner Card(s) or Pending State */}
                {!cat.hasVotes ? (
                  <div className="rounded-xl border border-dashed border-white/15 bg-ink/40 p-8 text-center">
                    <span className="text-3xl">⏳</span>
                    <p className="mt-2 font-display text-lg text-parchment font-semibold">
                      No Votes Cast Yet
                    </p>
                    <p className="mt-1 text-xs text-muted font-mono">
                      Winners will be displayed automatically once voting begins for this category.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cat.winners.map((winner) => {
                      const initial = winner.name.trim().charAt(0).toUpperCase() || "?";

                      return (
                        <div
                          key={winner.id}
                          className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5 rounded-xl border-2 border-gold bg-gradient-to-r from-gold-deep/20 via-char to-ink p-5 shadow-gold hover:border-gold-light transition-all"
                        >
                          {/* Winner Badge ribbon */}
                          <div className="absolute top-3 right-3 rounded-full bg-gold-gradient px-3 py-1 text-[10px] font-black uppercase text-ink tracking-wider shadow-md flex items-center gap-1">
                            🏆 {cat.isTie ? "CO-WINNER (TIE)" : "WINNER"}
                          </div>

                          {/* Winner Photo Container */}
                          <div className="relative w-28 h-32 sm:w-32 sm:h-36 shrink-0 rounded-xl border-2 border-gold bg-ink overflow-hidden shadow-lg shadow-gold/20">
                            {winner.imageUrl ? (
                              <img
                                src={winner.imageUrl}
                                alt={winner.name}
                                className="h-full w-full object-cover object-top"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-display text-3xl font-bold text-gold-light">
                                {initial}
                              </div>
                            )}
                          </div>

                          {/* Winner Details */}
                          <div className="flex-1 min-w-0 text-center sm:text-left mt-2 sm:mt-0">
                            <span className="inline-block rounded bg-gold-deep/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-gold-light border border-gold-deep/40">
                              Top Voted Candidate
                            </span>
                            <h3 className="mt-1.5 font-display text-xl sm:text-2xl font-bold text-parchment leading-tight">
                              {winner.name}
                            </h3>
                            {winner.subtitle && (
                              <p className="text-xs text-muted truncate mt-0.5">
                                {winner.subtitle}
                              </p>
                            )}

                            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between font-mono text-xs">
                              <span className="text-muted font-medium">
                                Votes: <strong className="text-parchment">{winner.votes}</strong>
                              </span>
                              <span className="text-gold-light font-bold text-sm">
                                {winner.percentage}% Vote Share
                              </span>
                            </div>

                            {/* Vote Share Progress Bar */}
                            <div className="mt-2 h-2.5 w-full rounded-full bg-ink overflow-hidden border border-white/10">
                              <div
                                className="h-full rounded-full bg-gold-gradient transition-all duration-500 shadow-gold"
                                style={{ width: `${winner.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
