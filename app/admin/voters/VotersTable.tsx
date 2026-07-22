"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Voter = {
  id: string;
  name: string;
  contact: string;
  contact_type: string;
  created_at: string;
};

interface VotersTableProps {
  votersList: Voter[];
  allVotes: { voter_id: string; category_id: string; nominee_id: string }[];
  isTest: boolean;
  categoriesData: any[];
}

export default function VotersTable({
  votersList,
  allVotes,
  isTest,
  categoriesData,
}: VotersTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [voters, setVoters] = useState<Voter[]>(votersList);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteVoter, setConfirmDeleteVoter] = useState<{ id: string; name: string; contact: string } | null>(null);

  // Synchronize state when votersList prop changes
  useEffect(() => {
    setVoters(votersList);
  }, [votersList]);

  // Map categories and nominees for quick lookups
  const categoryMap = new Map(
    categoriesData.map((cat) => [
      cat.id,
      {
        title: cat.title,
        nominees: new Map(cat.nominees.map((nom: any) => [nom.id, nom.name])),
      },
    ])
  );

  function getVoteDescription(categoryId: string, nomineeId: string): { categoryName: string; nomineeName: string } {
    const cat = categoryMap.get(categoryId);
    if (!cat) return { categoryName: categoryId, nomineeName: nomineeId };
    const nomineeName = String(cat.nominees.get(nomineeId) || nomineeId);
    return { categoryName: String(cat.title), nomineeName };
  }

  function parseDatabaseDate(dateVal: any): Date | null {
    if (!dateVal) return null;
    if (dateVal instanceof Date) return dateVal;
    
    const dateStr = String(dateVal).trim();
    let d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    
    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/.test(dateStr)) {
      if (!dateStr.includes("+") && !dateStr.includes("-", 10) && !dateStr.toLowerCase().includes("z")) {
        d = new Date(dateStr.replace(" ", "T") + "Z");
        if (!isNaN(d.getTime())) return d;
      } else {
        d = new Date(dateStr.replace(" ", "T"));
        if (!isNaN(d.getTime())) return d;
      }
    }
    return null;
  }

  const handleDelete = async (voterId: string, voterName: string, voterContact: string) => {
    setDeletingId(voterId);
    try {
      const response = await fetch("/api/admin/voters/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ voterId, isTest }),
      });
      
      if (!response.ok) {
        const text = await response.text();
        let errMsg = `Server returned status ${response.status}`;
        try {
          const parsed = JSON.parse(text);
          if (parsed.error) errMsg = parsed.error;
        } catch (_) {
          if (text) errMsg += `: ${text.slice(0, 100)}`;
        }
        alert(`Delete failed: ${errMsg}`);
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setVoters((prev) => prev.filter((v) => v.id !== voterId));
        router.refresh();
      } else {
        alert(data.error || "Failed to delete voter");
      }
    } catch (err: any) {
      alert(`An error occurred while deleting the voter: ${err?.message || err}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter voters by name or phone number
  const filteredVoters = voters.filter((voter) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      voter.name.toLowerCase().includes(query) ||
      voter.contact.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <div className="mt-10 rounded-xl border border-white/10 bg-char/60 p-5 sm:p-6 shadow-gold animate-rise">
      {/* Header and Search Finder */}
      <div className="border-b border-white/5 pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs text-gold-deep uppercase tracking-widest">
            Data Logs
          </span>
          <h2 className="mt-1 font-display text-xl sm:text-2xl text-parchment font-semibold">
            Registered Voters List
          </h2>
        </div>

        {/* Finder Search Box */}
        <div className="relative max-w-md w-full md:w-80">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-muted pointer-events-none text-xs">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or number..."
            className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm text-parchment placeholder-muted/80 bg-ink/80 rounded-full border border-white/10 focus:border-gold-deep/60 focus:outline-none focus:ring-1 focus:ring-gold-deep/30 transition-all font-body"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-3.5 flex items-center text-muted hover:text-parchment text-[10px] uppercase font-mono font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted mb-4 font-mono">
        <span>Total: {voters.length} voter(s)</span>
        {searchQuery && (
          <span className="text-gold-light">Found {filteredVoters.length} match(es)</span>
        )}
      </div>

      {filteredVoters.length === 0 ? (
        <p className="text-center text-sm text-muted py-8 font-body">
          {searchQuery ? "No voters match your search criteria." : "No voters registered yet."}
        </p>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-lg bg-ink/40 no-scrollbar">
          <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-white/10 bg-char text-xs uppercase font-mono tracking-wider text-gold-deep">
                <th className="py-3 px-4">No.</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Voted Choices</th>
                <th className="py-3 px-4 text-center">Actions</th>
                <th className="py-3 px-4 text-right">Registration Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-body">
              {filteredVoters.map((voter, index) => {
                const dateObj = parseDatabaseDate(voter.created_at);
                const dateStr = dateObj
                  ? dateObj.toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "Invalid Date";

                const voterVotes = allVotes
                  .filter((v) => v.voter_id === voter.id)
                  .map((v) => getVoteDescription(v.category_id, v.nominee_id));

                return (
                  <tr key={voter.id || index} className="hover:bg-charLight/50 transition-colors">
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
                    <td className="py-3.5 px-4 max-w-[280px]">
                      {voterVotes.length === 0 ? (
                        <span className="text-muted text-xs font-mono">No votes recorded</span>
                      ) : (
                        <details className="cursor-pointer group">
                          <summary className="text-xs text-gold-light hover:text-gold font-mono font-semibold flex items-center gap-1 select-none">
                            <span>🗳️</span> View Choices ({voterVotes.length})
                          </summary>
                          <div className="mt-2 text-[11px] text-parchment/80 bg-ink/90 border border-gold-deep/20 rounded-lg p-3 space-y-1.5 font-mono shadow-md max-h-[160px] overflow-y-auto no-scrollbar">
                            {voterVotes.map((v, i) => (
                              <div key={i} className="flex flex-col border-b border-white/5 pb-1 last:border-0 last:pb-0">
                                <span className="text-muted text-[9px] uppercase tracking-wider">{v.categoryName}</span>
                                <span className="text-gold-light font-bold">{v.nomineeName}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setConfirmDeleteVoter({ id: voter.id, name: voter.name, contact: voter.contact })}
                        disabled={deletingId === voter.id}
                        className="inline-flex items-center gap-1.5 rounded bg-rose-950/30 border border-rose-800/40 hover:border-rose-600/70 hover:bg-rose-900/40 px-2.5 py-1 text-xs font-mono font-medium text-rose-300 hover:text-rose-200 transition-all disabled:opacity-40 whitespace-nowrap cursor-pointer select-none"
                      >
                        <span>🗑️</span>
                        <span>{deletingId === voter.id ? "Deleting…" : "Delete"}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-muted font-mono">{dateStr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmDeleteVoter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 transition-all">
          <div className="bg-char border border-rose-900/50 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-left animate-rise">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
              <span className="text-xl">⚠️</span>
              <h3 className="font-display text-lg font-bold uppercase tracking-wider text-rose-400">
                Confirm Deletion
              </h3>
            </div>
            
            <p className="text-xs sm:text-sm text-parchment/80 mb-4 font-body leading-relaxed">
              This will permanently delete the registration details and all voted choices for:
            </p>

            <div className="bg-ink/80 border border-white/5 rounded-xl p-4 mb-5 space-y-2.5 font-mono text-xs text-parchment/90">
              <div>
                <span className="text-muted mr-2">NAME:</span>
                <strong className="text-gold-light">{confirmDeleteVoter.name}</strong>
              </div>
              <div>
                <span className="text-muted mr-2">CONTACT:</span>
                <strong className="text-gold-light">{confirmDeleteVoter.contact}</strong>
              </div>
            </div>

            <p className="text-xs text-rose-300 font-mono mb-6 bg-rose-950/20 border border-rose-900/30 rounded-lg p-3 leading-normal">
              This action is irreversible and cannot be undone. Do you wish to proceed?
            </p>

            <div className="flex items-center justify-end gap-3 font-mono text-xs">
              <button
                onClick={() => setConfirmDeleteVoter(null)}
                disabled={deletingId !== null}
                className="px-4 py-2 rounded-full border border-white/10 text-muted hover:text-parchment hover:bg-charLight transition-colors font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const targetVoter = confirmDeleteVoter;
                  setConfirmDeleteVoter(null);
                  await handleDelete(targetVoter.id, targetVoter.name, targetVoter.contact);
                }}
                disabled={deletingId !== null}
                className="px-5 py-2 rounded-full bg-rose-900/30 border border-rose-600/50 hover:bg-rose-800/40 text-rose-300 hover:text-rose-200 transition-colors font-semibold cursor-pointer shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Custom Confirmation Modal */}
      {confirmDeleteVoter && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all">
          <div className="bg-[#18110D] border border-rose-900/50 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-left animate-rise">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
              <span className="text-xl">⚠️</span>
              <h3 className="font-display text-lg font-bold uppercase tracking-wider text-rose-400">
                Confirm Deletion
              </h3>
            </div>
            
            <p className="text-xs sm:text-sm text-parchment/80 mb-4 font-body leading-relaxed">
              This will permanently delete the registration details and all voted choices for:
            </p>

            <div className="bg-ink/80 border border-white/5 rounded-xl p-4 mb-5 space-y-2.5 font-mono text-xs text-parchment/90">
              <div>
                <span className="text-muted mr-2">NAME:</span>
                <strong className="text-gold-light">{confirmDeleteVoter.name}</strong>
              </div>
              <div>
                <span className="text-muted mr-2">CONTACT:</span>
                <strong className="text-gold-light">{confirmDeleteVoter.contact}</strong>
              </div>
            </div>

            <p className="text-xs text-rose-300 font-mono mb-6 bg-rose-950/20 border border-rose-900/30 rounded-lg p-3 leading-normal">
              This action is irreversible and cannot be undone. Do you wish to proceed?
            </p>

            <div className="flex items-center justify-end gap-3 font-mono text-xs">
              <button
                onClick={() => setConfirmDeleteVoter(null)}
                disabled={deletingId !== null}
                className="px-4 py-2 rounded-full border border-white/10 text-muted hover:text-parchment hover:bg-charLight transition-colors font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const targetVoter = confirmDeleteVoter;
                  setConfirmDeleteVoter(null);
                  await handleDelete(targetVoter.id, targetVoter.name, targetVoter.contact);
                }}
                disabled={deletingId !== null}
                className="px-5 py-2 rounded-full bg-rose-900/30 border border-rose-600/50 hover:bg-rose-800/40 text-rose-300 hover:text-rose-200 transition-colors font-semibold cursor-pointer shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
