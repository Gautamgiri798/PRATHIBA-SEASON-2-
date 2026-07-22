"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { CATEGORIES } from "@/lib/categories";
import { normalizeContact, ContactType } from "@/lib/validate";
import { FilmReelProgress } from "@/components/FilmReelProgress";
import { NomineeCard } from "@/components/NomineeCard";
import Link from "next/link";

type Step = "landing" | "identity" | "category" | "review" | "success";

export function TestVoteWizard({
  logoutAction,
}: {
  logoutAction: () => Promise<void>;
}) {
  const [step, setStep] = useState<Step>("landing");
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [contactType, setContactType] = useState<ContactType>("mobile");
  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [totalVoters, setTotalVoters] = useState<number | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings?test=true");
        if (res.ok) {
          const data = await res.json();
          if (typeof data.totalVoters === "number") {
            setTotalVoters(data.totalVoters);
          }
        }
      } catch (err) {
        console.error("Failed to load test settings:", err);
      }
    }
    fetchSettings();
  }, []);

  const votedIds = useMemo(() => new Set(Object.keys(votes)), [votes]);
  const currentCategory = CATEGORIES[categoryIndex];
  const allVoted = votedIds.size === CATEGORIES.length;

  const goToCategory = useCallback((index: number) => {
    setCategoryIndex(index);
    setStep("category");
  }, []);

  function handleIdentitySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setIdentityError("Please enter your full name (at least 2 letters).");
      return;
    }
    const normalized = normalizeContact(contact, contactType);
    if (!normalized) {
      setIdentityError(
        contactType === "mobile"
          ? "Enter a valid 10-digit Indian mobile number."
          : "Enter a valid email address."
      );
      return;
    }
    setIdentityError(null);
    goToCategory(0);
  }

  function selectNominee(nomineeId: string) {
    setVotes((prev) => ({ ...prev, [currentCategory.id]: nomineeId }));
  }

  function goNext() {
    if (categoryIndex < CATEGORIES.length - 1) {
      goToCategory(categoryIndex + 1);
    } else {
      setStep("review");
    }
  }

  function goBack() {
    if (categoryIndex > 0) {
      goToCategory(categoryIndex - 1);
    } else {
      setStep("identity");
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    const normalized = normalizeContact(contact, contactType);
    try {
      const res = await fetch("/api/admin/test-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), contact: normalized, contactType, votes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      if (typeof data.totalVoters === "number") {
        setTotalVoters(data.totalVoters);
      }
      setStep("success");
    } catch {
      setSubmitError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink relative">
      <div className="pointer-events-none fixed inset-0 bg-radial-glow" />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-14">
        
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
          <div>
            <p className="font-mono text-xs tracking-widest text-gold-deep uppercase">
              Sambalpuriya Youth Association
            </p>
            <h1 className="mt-1 font-display font-black text-3xl sm:text-4xl text-parchment tracking-wide">
              TEST <span className="text-gold-gradient">VOTING</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <Link
              href="/admin"
              className="rounded-full border border-white/15 bg-char px-4 py-2 text-xs font-semibold text-muted hover:text-parchment hover:border-white/30 transition-colors"
            >
              📊 Dashboard
            </Link>
            <Link
              href="/admin/winners"
              className="rounded-full border border-gold/40 bg-gold-deep/15 px-4 py-2 text-xs font-semibold text-gold-light hover:bg-gold-deep/30 transition-colors shadow-sm"
            >
              🏆 Winners View
            </Link>
            <Link
              href="/admin/voters"
              className="rounded-full border border-white/15 bg-char px-4 py-2 text-xs font-semibold text-muted hover:text-parchment hover:border-white/30 transition-colors"
            >
              📜 Voter Logs
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-full border border-white/15 bg-char px-4 py-2 text-xs font-semibold text-muted hover:text-parchment hover:border-white/30 transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* Test Voting Mode Warning Banner */}
        <div className="mb-6 rounded-lg border border-purple-500/30 bg-purple-950/10 px-4 py-2.5 text-center text-xs sm:text-sm font-mono text-purple-300 shadow-sm flex items-center justify-center gap-2">
          <span>⚠️</span>
          <span><strong>TEST VOTING MODE:</strong> Your selections will be recorded in the separate test database (`test_votes.db`) and will not affect live election results.</span>
        </div>

        {step === "landing" && (
          <Landing totalVoters={totalVoters} onStart={() => setStep("identity")} />
        )}

        {step === "identity" && (
          <IdentityStep
            name={name}
            setName={setName}
            contactType={contactType}
            setContactType={setContactType}
            contact={contact}
            setContact={setContact}
            error={identityError}
            onSubmit={handleIdentitySubmit}
          />
        )}

        {step === "category" && currentCategory && (
          <CategoryStep
            index={categoryIndex}
            total={CATEGORIES.length}
            category={currentCategory}
            selected={votes[currentCategory.id]}
            votedIds={votedIds}
            onSelect={selectNominee}
            onNext={goNext}
            onBack={goBack}
            onJump={goToCategory}
          />
        )}

        {step === "review" && (
          <ReviewStep
            votes={votes}
            onEdit={goToCategory}
            onSubmit={handleSubmit}
            submitting={submitting}
            error={submitError}
            allVoted={allVoted}
            contact={contact}
            contactType={contactType}
            onBackToVoting={() => goToCategory(CATEGORIES.length - 1)}
          />
        )}

        {step === "success" && (
          <SuccessStep name={name} contact={contact} totalVoters={totalVoters} />
        )}
      </div>
    </main>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] sm:text-xs tracking-[0.25em] text-muted uppercase text-center">
      {children}
    </p>
  );
}

function TrophyMark() {
  return (
    <div className="relative mx-auto w-24 sm:w-32 my-1 flex items-center justify-center">
      <img
        src="/trophy.png"
        alt="Pratibha Awards Trophy"
        className="w-full h-auto max-h-44 sm:max-h-52 object-contain drop-shadow-[0_2px_15px_rgba(201,151,61,0.4)] transition-transform duration-300 hover:scale-105"
      />
    </div>
  );
}

const VOTE_MULTIPLIER = Number(process.env.NEXT_PUBLIC_VOTE_MULTIPLIER) || 2;

function getDisplayedVotersCount(rawCount: number): number {
  if (rawCount <= 0) return 0;
  return rawCount * VOTE_MULTIPLIER + 1;
}

function Landing({ totalVoters, onStart }: { totalVoters: number | null; onStart: () => void }) {
  return (
    <div className="animate-rise">
      <Eyebrow>Proudly presented by Sambalpuriya Youth Association</Eyebrow>

      <div className="mt-6">
        <TrophyMark />
      </div>

      <h1 className="mt-4 text-center font-display font-black text-5xl sm:text-7xl tracking-wide text-gold-gradient leading-none">
        PRATIBHA
      </h1>
      {/* Season 2 line with decorative diamonds */}
      <div className="flex items-center justify-center gap-3 mt-3 mb-5">
        <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-gold/70 relative flex items-center justify-end">
          <span className="w-1.5 h-1.5 rotate-45 bg-gold translate-x-0.5" />
        </div>
        <p className="font-display text-sm sm:text-lg tracking-[0.4em] text-parchment font-semibold pl-1">
          SEASON 2
        </p>
        <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-gold/70 relative flex items-center justify-start">
          <span className="w-1.5 h-1.5 rotate-45 bg-gold -translate-x-0.5" />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-mono text-muted">
        <span className="rounded-full border border-gold-deep/40 px-3.5 py-1.5">01 AUG · SATURDAY</span>
        <span className="rounded-full border border-gold-deep/40 px-3.5 py-1.5">VENUE: BELPAHAR</span>
      </div>

      {typeof totalVoters === "number" && (
        <div className="mt-8 mx-auto max-w-sm rounded-2xl border-2 border-gold-deep/60 bg-char p-6 text-center shadow-gold">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold font-bold text-center">
            Total Test Votes
          </p>
          <p className="mt-2 text-6xl sm:text-7xl font-display font-black text-gold-gradient tracking-tight">
            {getDisplayedVotersCount(totalVoters).toLocaleString()}
          </p>
          <p className="mt-1 text-xs font-body font-semibold text-parchment/80 uppercase tracking-widest">
            {getDisplayedVotersCount(totalVoters) === 1 ? "Simulated Person Has Voted" : "Simulated People Have Voted"}
          </p>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-gold-deep/30 bg-char p-5 sm:p-6 text-center">
        <h2 className="font-display text-gold text-lg tracking-wide uppercase">Test Voting Simulator</h2>
        <p className="mt-2 text-sm text-parchment/80">
          This portal allows you to simulate casting a ballot for all categories. Your choices will be saved directly in the separate test database (`test_votes.db`), ensuring testing does not affect the actual live election.
        </p>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-8 py-3.5 font-body font-bold text-ink shadow-gold transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          Begin Test Vote
        </button>
      </div>
    </div>
  );
}

function IdentityStep({
  name,
  setName,
  contactType,
  setContactType,
  contact,
  setContact,
  error,
  onSubmit,
}: {
  name: string;
  setName: (v: string) => void;
  contactType: ContactType;
  setContactType: (t: ContactType) => void;
  contact: string;
  setContact: (v: string) => void;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="animate-rise mx-auto max-w-md">
      <Eyebrow>Step 1 of 3</Eyebrow>
      <h1 className="mt-3 text-center font-display text-2xl sm:text-3xl text-parchment">
        Verify it&apos;s <span className="text-gold-gradient">really you</span>
      </h1>
      <p className="mt-2 text-center text-sm text-muted">
        Enter a test name and a valid 10-digit Indian mobile number.
      </p>

      <form onSubmit={onSubmit} className="mt-6 rounded-xl border border-gold-deep/30 bg-char p-5 sm:p-6">
        <label className="block text-xs uppercase tracking-wide text-muted font-mono">
          Full Name (e.g. Test Voter 1)
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          required
          className="mt-2 mb-5 w-full rounded-lg border border-white/15 bg-ink/70 px-4 py-3 text-parchment placeholder:text-muted/60 outline-none focus:border-gold"
        />

        <label className="block text-xs uppercase tracking-wide text-muted font-mono">
          10-digit mobile number
        </label>
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="98765 43210"
          inputMode="numeric"
          required
          className="mt-2 w-full rounded-lg border border-white/15 bg-ink/70 px-4 py-3 text-parchment placeholder:text-muted/60 outline-none focus:border-gold"
        />
        {error && <p className="mt-2 text-sm text-maroon-light">{error}</p>}

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-gold-gradient py-3 font-bold text-ink transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Continue to Voting
        </button>
      </form>
    </div>
  );
}

function CategoryStep({
  index,
  total,
  category,
  selected,
  votedIds,
  onSelect,
  onNext,
  onBack,
  onJump,
}: {
  index: number;
  total: number;
  category: (typeof CATEGORIES)[number];
  selected?: string;
  votedIds: Set<string>;
  onSelect: (nomineeId: string) => void;
  onNext: () => void;
  onBack: () => void;
  onJump: (i: number) => void;
}) {
  return (
    <div className="animate-rise">
      <Eyebrow>Step 2 of 3 · Category {index + 1} of {total}</Eyebrow>

      <div className="mt-4">
        <FilmReelProgress currentIndex={index} votedCategoryIds={votedIds} onJump={onJump} />
      </div>

      <div className="mt-8 text-center">
        <p className="font-mono text-xs tracking-widest text-gold-deep uppercase">{category.group}</p>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl text-parchment">{category.title}</h1>
        <p className="mt-1 text-sm text-muted">{category.description}</p>
      </div>

      <div className="mt-6 space-y-3">
        {category.nominees.map((n, i) => (
          <NomineeCard
            key={n.id}
            nominee={n}
            index={i}
            selected={selected === n.id}
            onSelect={() => onSelect(n.id)}
          />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-muted hover:text-parchment hover:border-white/30 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selected}
          className="rounded-full bg-gold-gradient px-8 py-3 text-sm font-bold text-ink shadow-gold disabled:opacity-30 disabled:shadow-none transition-transform enabled:hover:scale-[1.02]"
        >
          {index === total - 1 ? "Review Your Votes" : "Next Category"}
        </button>
      </div>
    </div>
  );
}

function ReviewStep({
  votes,
  onEdit,
  onSubmit,
  submitting,
  error,
  allVoted,
  contact,
  contactType,
  onBackToVoting,
}: {
  votes: Record<string, string>;
  onEdit: (index: number) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
  allVoted: boolean;
  contact: string;
  contactType: ContactType;
  onBackToVoting: () => void;
}) {
  return (
    <div className="animate-rise">
      <Eyebrow>Step 3 of 3 · Review</Eyebrow>
      <h1 className="mt-3 text-center font-display text-2xl sm:text-3xl text-parchment">
        Confirm your <span className="text-gold-gradient">final picks</span>
      </h1>
      <p className="mt-2 text-center text-sm text-muted">
        Testing as mobile <span className="text-parchment/80">{contact}</span>.
      </p>

      <div className="mt-6 rounded-xl border border-gold-deep/30 bg-char divide-y divide-white/5">
        {CATEGORIES.map((c, i) => {
          const nomineeId = votes[c.id];
          const nominee = c.nominees.find((n) => n.id === nomineeId);
          return (
            <div key={c.id} className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                {nominee?.imageUrl && (
                  <img
                    src={nominee.imageUrl}
                    alt={nominee.name}
                    className="w-14 h-16 rounded-xl object-cover object-top border-2 border-gold-deep/40 shrink-0 shadow-sm"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-wide text-gold-deep">{c.title}</p>
                  <p className="mt-0.5 font-body font-semibold text-parchment truncate">
                    {nominee ? nominee.name : <span className="text-maroon-light">Not voted</span>}
                  </p>
                  {nominee?.song && (
                    <p className="text-xs text-gold-light/90 font-medium truncate">
                      🎵 Song: {nominee.song}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => onEdit(i)}
                className="shrink-0 text-xs font-semibold text-gold hover:text-gold-light underline underline-offset-4"
              >
                Change
              </button>
            </div>
          );
        })}
      </div>

      {!allVoted && (
        <p className="mt-4 text-center text-sm text-maroon-light">
          You still have categories left to vote in.{" "}
          <button onClick={onBackToVoting} className="underline">
            Go back
          </button>
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-maroon-light/50 bg-maroon/10 px-4 py-3 text-sm text-parchment/90 text-center">
          {error}
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={onSubmit}
          disabled={!allVoted || submitting}
          className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-10 py-3.5 font-bold text-ink shadow-gold disabled:opacity-40 disabled:shadow-none transition-transform enabled:hover:scale-[1.02]"
        >
          {submitting ? "Submitting…" : "Submit Test Vote"}
        </button>
      </div>
    </div>
  );
}

function SuccessStep({
  name,
  contact,
  totalVoters,
}: {
  name: string;
  contact: string;
  totalVoters: number | null;
}) {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6372174006";
  const sanitizedNumber = whatsappNumber.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${sanitizedNumber.length === 10 ? "91" + sanitizedNumber : sanitizedNumber}`;
  const whatsappGroupLink = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK || "";

  return (
    <div className="animate-rise text-center py-8 sm:py-12">
      <TrophyMark />
      <h1 className="mt-4 font-display font-black text-3xl sm:text-4xl text-gold-gradient">
        Vote Recorded!
      </h1>

      <div className="mt-6 max-w-2xl mx-auto rounded-xl border border-gold-deep/35 bg-char/85 p-8 sm:p-10 text-left space-y-6 shadow-gold transition-all duration-300">
        <p className="text-parchment/95 text-lg sm:text-2xl leading-relaxed">
          Thank you, <strong className="text-gold-light font-black">{name}</strong>, for supporting Sambalpuri talent!
        </p>
        <p className="text-parchment/90 text-base sm:text-lg leading-relaxed">
          Your votes for all selected categories have been successfully recorded.
        </p>
        <p className="text-muted text-sm sm:text-base leading-relaxed border-l-2 border-gold-deep pl-4 bg-ink/30 py-2.5 pr-3 rounded-r">
          This mobile number (<strong className="text-parchment font-mono font-bold">{contact}</strong>) has already been used to vote and cannot be used again.
        </p>

        <div className="border-t border-white/10 pt-5">
          <p className="font-bold text-gold text-base sm:text-lg flex items-center gap-2 uppercase tracking-wide">
            <span>📸</span> Verification Required
          </p>
          <p className="mt-2 text-parchment/80 text-sm sm:text-base leading-relaxed">
            Please take a screenshot of this confirmation page and send it via WhatsApp to <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-gold-light hover:text-gold underline underline-offset-4 font-mono font-bold transition-colors">{whatsappNumber}</a>{whatsappGroupLink && <> (or join our <a href={whatsappGroupLink} target="_blank" rel="noopener noreferrer" className="text-gold-light hover:text-gold underline underline-offset-4 font-bold transition-colors">WhatsApp Group</a>)</>} using the same registered mobile number you used for voting. This helps us verify and validate your submission successfully.
          </p>
        </div>
      </div>


      {/* Admin Actions Section */}
      <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 border-t border-white/10 pt-6">
        <Link
          href="/admin"
          className="rounded-full bg-gold-gradient px-6 py-3 font-semibold text-ink shadow-gold transition-transform hover:scale-[1.02]"
        >
          📊 View Dashboard
        </Link>
        <Link
          href="/admin/voters"
          className="rounded-full border border-white/15 bg-char hover:border-gold-deep/50 hover:bg-charLight px-6 py-3 font-semibold text-parchment transition-colors"
        >
          📜 View Voter Logs
        </Link>
      </div>

      <p className="mt-8 text-xs text-muted">Pratibha Season 2 · 01 August · Belpahar (Test Environment)</p>
    </div>
  );
}
