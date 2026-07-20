import { getSetting, setSetting, getTotalVoters, getTallies, clearAllVotes } from "@/lib/db";
import { CATEGORIES } from "@/lib/categories";
import { ResetDatabaseButton } from "@/components/ResetDatabaseButton";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type TallyRow = {
  category_id: string;
  nominee_id: string;
  votes: number;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;
  const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "admin123";
  const isAuthorized = sessionToken === ADMIN_PASSCODE;
  const showError = searchParams.error === "invalid";

  // Server Action to authenticate admin and set cookie
  async function handleLogin(formData: FormData) {
    "use server";
    const passcode = formData.get("passcode")?.toString();
    const targetPasscode = process.env.ADMIN_PASSCODE || "admin123";

    if (passcode === targetPasscode) {
      const store = cookies();
      store.set("admin_session", targetPasscode, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      });
      redirect("/admin");
    } else {
      redirect("/admin?error=invalid");
    }
  }

  // Server Action to clear cookie and log out
  async function handleLogout() {
    "use server";
    const store = cookies();
    store.delete("admin_session");
    redirect("/admin");
  }

  // Server Action to update voting controls settings in DB
  async function updateVotingSettings(formData: FormData) {
    "use server";
    const active = formData.get("active")?.toString();
    const endsAt = formData.get("ends_at")?.toString();

    if (active !== undefined) {
      await setSetting("voting_active", active);
    }
    if (endsAt !== undefined) {
      if (endsAt) {
        // Convert datetime-local string (YYYY-MM-DDTHH:MM) to ISO string
        const isoDate = new Date(endsAt).toISOString();
        await setSetting("voting_ends_at", isoDate);
      } else {
        await setSetting("voting_ends_at", "");
      }
    }
    redirect("/admin");
  }

  // Server Action to clear all votes and reset database
  async function resetDatabase() {
    "use server";
    await clearAllVotes();
    redirect("/admin");
  }

  // Render Login Form if not authorized
  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-ink relative flex items-center justify-center px-4">
        <div className="pointer-events-none fixed inset-0 bg-radial-glow" />

        <div className="relative w-full max-w-md rounded-xl border border-gold-deep/30 bg-char p-6 sm:p-8 text-center shadow-gold">
          <p className="font-mono text-[11px] tracking-[0.25em] text-gold-deep uppercase">
            Pratibha Season 2
          </p>
          <h1 className="mt-2 font-display text-2xl text-parchment font-bold">
            Admin Panel Login
          </h1>
          <p className="mt-1 text-sm text-muted">
            Enter the admin passcode to access the results dashboard.
          </p>

          <form action={handleLogin} className="mt-6 space-y-4">
            <div>
              <input
                type="password"
                name="passcode"
                placeholder="Enter Admin Passcode"
                required
                className="w-full rounded-lg border border-white/15 bg-ink/70 px-4 py-3 text-center text-parchment placeholder:text-muted/60 outline-none focus:border-gold"
              />
            </div>
            {showError && (
              <p className="text-sm text-maroon-light">
                Incorrect passcode. Please try again.
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-full bg-gold-gradient py-3 font-bold text-ink transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 border-t border-white/5 pt-4">
            <Link href="/" className="text-xs text-muted hover:text-gold underline">
              Return to Voting Site
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Render Admin Dashboard if authorized
  const votingActive = (await getSetting("voting_active")) === "true";
  const votingEndsAt = await getSetting("voting_ends_at");

  let defaultEndsAtLocal = "";
  if (votingEndsAt) {
    const d = new Date(votingEndsAt);
    const offset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d.getTime() - offset);
    defaultEndsAtLocal = localDate.toISOString().slice(0, 16);
  }

  const deadlineIST = votingEndsAt 
    ? new Date(votingEndsAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "No deadline set";

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

  const processedResults = CATEGORIES.map((category) => {
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

    return {
      ...category,
      totalVotes: categoryTotalVotes,
      nominees: nomineesWithVotes,
    };
  });

  return (
    <main className="min-h-screen bg-ink relative">
      <div className="pointer-events-none fixed inset-0 bg-radial-glow" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-14">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-xs tracking-widest text-gold-deep uppercase">
              Sambalpuriya Youth Association
            </p>
            <h1 className="mt-1 font-display font-black text-3xl sm:text-4xl text-parchment tracking-wide">
              ADMIN <span className="text-gold-gradient">DASHBOARD</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <Link
              href="/admin/winners"
              className="rounded-full border border-gold/40 bg-gold-deep/15 px-4 py-2 text-xs font-semibold text-gold-light hover:bg-gold-deep/30 transition-colors shadow-sm"
            >
              🏆 Winners View
            </Link>
            <Link
              href="/admin/voters"
              className="rounded-full border border-white/15 bg-char px-4 py-2 text-xs font-semibold text-parchment hover:border-gold/50 transition-colors"
            >
              📜 Voter Logs
            </Link>
            <a
              href="/admin"
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

        {/* Voter Metrics */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gold-deep/30 bg-char p-5">
            <p className="font-mono text-xs text-muted uppercase tracking-wider">
              Total Voters Registered
            </p>
            <p className="mt-1 text-3xl font-display font-bold text-gold-light">
              {totalVoters.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-gold-deep/30 bg-char p-5">
            <p className="font-mono text-xs text-muted uppercase tracking-wider">
              Total Votes Cast
            </p>
            <p className="mt-1 text-3xl font-display font-bold text-gold-light">
              {(totalVoters * CATEGORIES.length).toLocaleString()}
            </p>
         </div>
        </div>

        {/* Voting Phase Control Card */}
        <div className="mt-8 rounded-xl border border-gold-deep/30 bg-char p-5 sm:p-6 shadow-gold animate-rise">
          <div className="border-b border-white/5 pb-3 mb-4 flex items-center justify-between">
            <div>
              <span className="font-mono text-xs text-gold-deep uppercase tracking-widest">
                Voting Controls
              </span>
              <h2 className="mt-1 font-display text-xl text-parchment font-semibold">
                Configure Voting Window
              </h2>
            </div>
            <span className="font-mono text-xs text-muted">
              Only visible to Admins
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Panel */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted uppercase font-mono">Current Status</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${votingActive ? "bg-emerald animate-pulse" : "bg-maroon-light"}`} />
                  <span className={`font-semibold ${votingActive ? "text-emerald" : "text-maroon-light"}`}>
                    {votingActive ? "Ballot is ACTIVE" : "Ballot is STOPPED / CLOSED"}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted uppercase font-mono">Active Deadline (IST)</p>
                <p className="mt-1 font-body text-parchment font-semibold">
                  {deadlineIST}
                </p>
              </div>

              {/* Toggle Ballot Status Form */}
              <form action={updateVotingSettings}>
                <input type="hidden" name="active" value={votingActive ? "false" : "true"} />
                <button
                  type="submit"
                  className={`w-full sm:w-auto rounded-full px-6 py-2.5 text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99] ${
                    votingActive 
                      ? "bg-maroon hover:bg-maroon-light text-parchment border border-maroon-light/20" 
                      : "bg-gold-gradient text-ink"
                  }`}
                >
                  {votingActive ? "Pause / Stop Voting" : "Start / Activate Voting"}
                </button>
              </form>
            </div>

            {/* Deadline Panel */}
            <div className="border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-6 space-y-4">
              <p className="text-xs text-muted uppercase font-mono">Set/Modify Deadline</p>
              
              <form action={updateVotingSettings} className="space-y-3">
                <input
                  type="datetime-local"
                  name="ends_at"
                  defaultValue={defaultEndsAtLocal}
                  className="w-full rounded-lg border border-white/15 bg-ink/70 px-4 py-2.5 text-sm text-parchment outline-none focus:border-gold"
                />
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-full border border-gold/30 bg-gold-deep/15 hover:bg-gold-deep/30 px-4 py-2 text-xs font-semibold text-gold-light transition-colors"
                  >
                    Save Deadline
                  </button>
                  {votingEndsAt && (
                    <button
                      type="submit"
                      name="ends_at"
                      value=""
                      className="rounded-full border border-white/15 bg-char px-4 py-2 text-xs font-semibold text-muted hover:text-parchment hover:border-white/30 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Danger Zone / Reset Database Panel */}
          <div className="mt-6 border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-bold text-maroon-light uppercase tracking-wider">
                ⚠️ Reset Database
              </p>
              <p className="text-xs text-muted mt-0.5">
                Permanently delete all votes & voter logs to restart the election from zero.
              </p>
            </div>
            <ResetDatabaseButton action={resetDatabase} />
          </div>
        </div>

        {/* Results Leaderboard */}
        <div className="mt-10 space-y-6">
          {processedResults.map((cat) => {
            const hasVotes = cat.totalVotes > 0;
            const leadingVotes = hasVotes ? cat.nominees[0].votes : 0;

            return (
              <div
                key={cat.id}
                className="rounded-xl border border-white/10 bg-char/60 p-5 sm:p-6 shadow-gold"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-white/5 pb-3 mb-4">
                  <div>
                    <span className="font-mono text-xs text-gold-deep mr-2 uppercase tracking-widest">
                      {cat.group}
                    </span>
                    <h2 className="mt-1 font-display text-xl sm:text-2xl text-parchment font-semibold">
                      {cat.title}
                    </h2>
                  </div>
                  <span className="mt-1 sm:mt-0 font-mono text-xs text-muted">
                    {cat.totalVotes} votes cast
                  </span>
                </div>

                <div className="space-y-5">
                  {cat.nominees.map((nominee, idx) => {
                    const isLeader = hasVotes && nominee.votes === leadingVotes && nominee.votes > 0;
                    const initial = nominee.name.trim().charAt(0).toUpperCase() || "?";

                    return (
                      <div key={nominee.id} className="group flex flex-col gap-2 rounded-lg bg-ink/30 p-3 sm:p-4 border border-white/5 hover:border-gold-deep/30 transition-all">
                        <div className="flex items-center justify-between text-sm gap-3">
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <span className="font-mono text-sm sm:text-base text-gold font-bold shrink-0 w-6 text-center">
                              {idx + 1}.
                            </span>

                            {/* Large Nominee Photo */}
                            <div className="relative w-20 h-24 sm:w-24 sm:h-28 shrink-0 rounded-xl border-2 border-gold-deep/50 bg-ink overflow-hidden shadow-md group-hover:border-gold transition-colors">
                              {nominee.imageUrl ? (
                                <img
                                  src={nominee.imageUrl}
                                  alt={nominee.name}
                                  className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center font-display text-xl font-bold text-gold-light">
                                  {initial}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-base sm:text-lg text-parchment truncate">
                                  {nominee.name}
                                </span>
                                {isLeader && (
                                  <span className="rounded-full bg-gold-deep/20 border border-gold-deep/60 px-2.5 py-0.5 text-[10px] font-bold text-gold-light uppercase tracking-wider shrink-0 shadow-sm">
                                    Leader 🏆
                                  </span>
                                )}
                              </div>
                              {nominee.subtitle && (
                                <span className="block text-xs sm:text-sm text-muted truncate mt-0.5">
                                  ({nominee.subtitle})
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end font-mono text-xs sm:text-sm shrink-0 text-right">
                            <span className="text-gold-light font-bold text-sm sm:text-base">
                              {nominee.percentage}%
                            </span>
                            <span className="text-muted text-xs">{nominee.votes} votes</span>
                          </div>
                        </div>

                        <div className="h-2.5 w-full rounded-full bg-ink/80 overflow-hidden border border-white/10 mt-1">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isLeader
                                ? "bg-gold-gradient"
                                : "bg-muted/40 group-hover:bg-muted/65"
                            }`}
                            style={{ width: `${nominee.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>


      </div>
    </main>
  );
}
