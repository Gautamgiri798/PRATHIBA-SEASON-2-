import { getSetting, getVotersList, getAllVotes } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import VotersTable from "./VotersTable";

export const dynamic = "force-dynamic";

export default async function VotersReportPage({
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
  const modeQuery = isTest ? "?mode=test" : "";

  const votingActive = (await getSetting("voting_active", isTest)) === "true";
  const votingEndsAt = await getSetting("voting_ends_at", isTest);

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

  // Fetch voters list from DB
  const votersList = await getVotersList(isTest);
  const allVotes = await getAllVotes(isTest);

  // Convert to plain objects for React Server Component serialization
  const plainVotersList = JSON.parse(JSON.stringify(votersList));
  const plainAllVotes = JSON.parse(JSON.stringify(allVotes));

  return (
    <main className="min-h-screen bg-ink relative">
      <div className="pointer-events-none fixed inset-0 bg-radial-glow" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-14">
        {/* Mode Toggle Banner */}
        {isTest ? (
          <div className="mb-6 rounded-lg border border-purple-500/30 bg-purple-950/15 px-4 py-3 text-center text-xs sm:text-sm font-mono text-purple-300 shadow-sm flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span>⚠️</span>
              <span><strong>TEST SIMULATOR DATABASE:</strong> You are viewing test data from `test_votes.db`.</span>
            </span>
            <Link href="/admin/voters" className="rounded-full border border-purple-300/40 px-3 py-1 text-xs hover:bg-purple-950/40 text-purple-200 transition-colors shrink-0">
              Switch to Live
            </Link>
          </div>
        ) : (
          <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-950/15 px-4 py-3 text-center text-xs sm:text-sm font-mono text-emerald-300 shadow-sm flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span>🟢</span>
              <span><strong>LIVE ELECTION DATABASE:</strong> You are viewing live election results.</span>
            </span>
            <Link href="/admin/voters?mode=test" className="rounded-full border border-emerald-300/40 px-3 py-1 text-xs hover:bg-emerald-950/40 text-emerald-200 transition-colors shrink-0">
              Switch to Test
            </Link>
          </div>
        )}

        {/* Header navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-xs tracking-widest text-gold-deep uppercase">
              Sambalpuriya Youth Association
            </p>
            <h1 className="mt-1 font-display font-black text-3xl sm:text-4xl text-parchment tracking-wide">
              VOTER <span className="text-gold-gradient">LOGS</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <Link
              href={`/admin${modeQuery}`}
              className="rounded-full border border-white/15 bg-char px-4 py-2 text-xs font-semibold text-muted hover:text-parchment hover:border-white/30 transition-colors"
            >
              📊 Dashboard
            </Link>
            <Link
              href={`/admin/winners${modeQuery}`}
              className="rounded-full border border-gold/40 bg-gold-deep/15 px-4 py-2 text-xs font-semibold text-gold-light hover:bg-gold-deep/30 transition-colors shadow-sm"
            >
              🏆 Winners View
            </Link>
            <Link
              href={`/admin/voters${modeQuery}`}
              className="rounded-full border border-white/15 bg-char px-4 py-2 text-xs font-semibold text-parchment hover:border-gold/50 transition-colors"
            >
              📜 Voter Logs
            </Link>
            <Link
              href={`/admin/test-vote${modeQuery}`}
              className="rounded-full border border-gold/30 bg-char px-4 py-2 text-xs font-semibold text-muted hover:text-gold-light hover:border-gold/60 transition-colors shadow-sm"
            >
              🧪 Test Voting
            </Link>
            <Link
              href={`/admin/voters${modeQuery}`}
              className="rounded-full border border-white/15 bg-char px-4 py-2 text-xs font-semibold text-muted hover:text-parchment hover:border-white/30 transition-colors"
            >
              🔄 Refresh
            </Link>
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

        {/* Voting Status Banner */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-gold-deep/30 bg-char px-4 py-3 text-xs sm:text-sm text-parchment/90 font-mono">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${votingActive ? "bg-emerald animate-pulse" : "bg-maroon-light"}`} />
            <span>
              Status: <strong className={votingActive ? "text-emerald" : "text-maroon-light"}>{votingActive ? "Active" : "Stopped/Closed"}</strong>
            </span>
          </div>
          <div>
            <span>Deadline (IST): <strong>{deadlineIST}</strong></span>
          </div>
        </div>

        {/* Voter Report Table */}
        <VotersTable
          votersList={plainVotersList}
          allVotes={plainAllVotes}
          isTest={isTest}
          categoriesData={CATEGORIES}
        />


      </div>
    </main>
  );
}
