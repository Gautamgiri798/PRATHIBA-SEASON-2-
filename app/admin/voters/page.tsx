import { getSetting, getVotersList } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type VoterRow = {
  name: string;
  contact: string;
  contact_type: string;
  created_at: string;
};

export default async function VotersReportPage() {
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

  // Fetch voters list from PostgreSQL
  const votersList = await getVotersList();

  return (
    <main className="min-h-screen bg-ink relative">
      <div className="pointer-events-none fixed inset-0 bg-radial-glow" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-14">
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
              href="/admin"
              className="rounded-full border border-white/15 bg-char px-5 py-2 text-xs font-semibold text-muted hover:text-parchment hover:border-white/30 transition-colors"
            >
              Back to Dashboard
            </Link>
            <a
              href="/admin/voters"
              className="rounded-full border border-white/15 bg-char px-5 py-2 text-xs font-semibold text-parchment hover:border-gold/50 transition-colors"
            >
              Refresh
            </a>
            <form action={handleLogout}>
              <button
                type="submit"
                className="rounded-full border border-white/15 bg-char px-5 py-2 text-xs font-semibold text-muted hover:text-parchment hover:border-white/30 transition-colors"
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
        <div className="mt-10 rounded-xl border border-white/10 bg-char/60 p-5 sm:p-6 shadow-gold animate-rise">
          <div className="border-b border-white/5 pb-3 mb-4 flex items-center justify-between">
            <div>
              <span className="font-mono text-xs text-gold-deep uppercase tracking-widest">
                Data Logs
              </span>
              <h2 className="mt-1 font-display text-xl sm:text-2xl text-parchment font-semibold">
                Registered Voters List
              </h2>
            </div>
            <span className="font-mono text-xs text-muted">
              {votersList.length} total voters
            </span>
          </div>

          {votersList.length === 0 ? (
            <p className="text-center text-sm text-muted py-8 font-body">
              No voters registered yet.
            </p>
          ) : (
            <div className="overflow-x-auto border border-white/10 rounded-lg bg-ink/40 no-scrollbar">
              <table className="w-full text-left border-collapse text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/10 bg-char text-xs uppercase font-mono tracking-wider text-gold-deep">
                    <th className="py-3 px-4">No.</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Registration Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-body">
                  {votersList.map((voter, index) => {
                    const dateStr = new Date(voter.created_at.replace(" ", "T") + "Z").toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      dateStyle: "short",
                      timeStyle: "short",
                    });

                    return (
                      <tr key={index} className="hover:bg-charLight/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs text-muted">{index + 1}</td>
                        <td className="py-3.5 px-4 font-semibold text-parchment">{voter.name}</td>
                        <td className="py-3.5 px-4 text-parchment/80 font-mono text-xs">{voter.contact}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                            voter.contact_type === "mobile" 
                              ? "bg-gold-deep/15 text-gold-light border border-gold-deep/30" 
                              : "bg-muted/15 text-muted border border-muted/20"
                          }`}>
                            {voter.contact_type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-xs text-muted font-mono">{dateStr}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>


      </div>
    </main>
  );
}
