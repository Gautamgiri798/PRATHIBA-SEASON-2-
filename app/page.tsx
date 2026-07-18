"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { CATEGORIES } from "@/lib/categories";
import { normalizeContact, ContactType } from "@/lib/validate";
import { FilmReelProgress } from "@/components/FilmReelProgress";
import { NomineeCard } from "@/components/NomineeCard";
import Link from "next/link";

type Step = "landing" | "identity" | "category" | "review" | "success";

const LOCAL_FLAG = "pratibha_s2_voted";

export default function Page() {
  const [step, setStep] = useState<Step>("landing");
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [contactType, setContactType] = useState<ContactType>("mobile");
  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [alreadyVotedLocally, setAlreadyVotedLocally] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAlreadyVotedLocally(window.localStorage.getItem(LOCAL_FLAG) === "1");
    }
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
      const res = await fetch("/api/vote", {
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
      window.localStorage.setItem(LOCAL_FLAG, "1");
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
        {step === "landing" && <Landing onStart={() => setStep("identity")} />}

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
            alreadyVotedLocally={alreadyVotedLocally}
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

        {step === "success" && <SuccessStep />}
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
    <svg viewBox="0 0 120 140" className="h-24 w-24 sm:h-28 sm:w-28 mx-auto drop-shadow-[0_0_18px_rgba(201,151,61,0.35)]">
      <defs>
        <linearGradient id="goldStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F4D77B" />
          <stop offset="50%" stopColor="#C9973D" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
      </defs>
      {/* star */}
      <path
        d="M60 4 L65 18 L80 18 L68 27 L72 42 L60 33 L48 42 L52 27 L40 18 L55 18 Z"
        fill="url(#goldStroke)"
        className="animate-flicker"
      />
      {/* ring */}
      <circle cx="60" cy="72" r="34" fill="none" stroke="url(#goldStroke)" strokeWidth="3" />
      {/* figure: head */}
      <circle cx="60" cy="52" r="9" fill="url(#goldStroke)" />
      {/* figure: body / arms raised */}
      <path
        d="M60 62 L60 88 M60 68 L44 50 M60 68 L76 50 M60 88 L48 108 M60 88 L72 108"
        stroke="url(#goldStroke)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* base */}
      <rect x="42" y="112" width="36" height="6" rx="2" fill="url(#goldStroke)" />
      <rect x="48" y="120" width="24" height="8" rx="2" fill="url(#goldStroke)" />
    </svg>
  );
}

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="animate-rise">
      <Eyebrow>Proudly presented by Sambalpuriya Youth Association</Eyebrow>

      <div className="mt-6">
        <TrophyMark />
      </div>

      <h1 className="mt-4 text-center font-display font-black text-5xl sm:text-7xl tracking-wide text-gold-gradient leading-none">
        PRATIBHA
      </h1>
      <p className="mt-2 text-center font-display text-lg sm:text-2xl tracking-[0.35em] text-parchment/90">
        SEASON 2
      </p>

      <p className="mt-6 text-center font-body text-sm sm:text-base text-muted italic">
        An award show celebrating
      </p>
      <p className="text-center font-display text-base sm:text-lg text-parchment tracking-wide">
        Sambalpuri Talent in Film, Music &amp; Creative Arts
      </p>

      <div className="mt-8 flex items-center justify-center gap-3 text-xs sm:text-sm font-mono text-muted">
        <span className="rounded-full border border-gold-deep/40 px-3 py-1.5">01 AUG · SATURDAY</span>
        <span className="rounded-full border border-gold-deep/40 px-3 py-1.5">VENUE: BELPAHAR</span>
      </div>

      <div className="mt-12 rounded-xl border border-gold-deep/30 bg-char p-5 sm:p-6">
        <h2 className="font-display text-center text-gold text-lg tracking-wide">10 Categories. One Vote Each.</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {CATEGORIES.map((c, i) => (
            <div key={c.id} className="flex items-start gap-2 text-parchment/80">
              <span className="font-mono text-xs text-gold-deep mt-0.5">{String(i + 1).padStart(2, "0")}</span>
              <span>{c.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-8 py-3.5 font-body font-bold text-ink shadow-gold transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          Cast Your Vote
        </button>
        <p className="mt-3 text-xs text-muted">
          One vote per mobile number or email. Takes about 2 minutes.
        </p>
      </div>

      <div className="mt-12 text-center border-t border-white/5 pt-6">
        <Link
          href="/admin"
          className="text-xs font-mono tracking-widest text-muted/50 hover:text-gold transition-colors uppercase"
        >
          Admin Portal
        </Link>
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
  alreadyVotedLocally,
}: {
  name: string;
  setName: (v: string) => void;
  contactType: ContactType;
  setContactType: (t: ContactType) => void;
  contact: string;
  setContact: (v: string) => void;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  alreadyVotedLocally: boolean;
}) {
  return (
    <div className="animate-rise mx-auto max-w-md">
      <Eyebrow>Step 1 of 3</Eyebrow>
      <h1 className="mt-3 text-center font-display text-2xl sm:text-3xl text-parchment">
        Verify it&apos;s <span className="text-gold-gradient">really you</span>
      </h1>
      <p className="mt-2 text-center text-sm text-muted">
        Each mobile number or email can vote once. No proxy votes, no do-overs.
      </p>

      {alreadyVotedLocally && (
        <div className="mt-5 rounded-lg border border-maroon-light/50 bg-maroon/10 px-4 py-3 text-sm text-parchment/90">
          It looks like a vote was already submitted from this device. You can still try a different
          number or email, but our server is the final check.
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 rounded-xl border border-gold-deep/30 bg-char p-5 sm:p-6">
        <label className="block text-xs uppercase tracking-wide text-muted font-mono">
          Full Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          required
          className="mt-2 mb-5 w-full rounded-lg border border-white/15 bg-ink/70 px-4 py-3 text-parchment placeholder:text-muted/60 outline-none focus:border-gold"
        />

        <div className="flex rounded-lg border border-white/10 p-1 bg-ink/60">
          {(["mobile", "email"] as ContactType[]).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setContactType(t)}
              className={[
                "flex-1 rounded-md py-2 text-sm font-semibold transition-colors",
                contactType === t ? "bg-gold-gradient text-ink" : "text-muted hover:text-parchment",
              ].join(" ")}
            >
              {t === "mobile" ? "Mobile Number" : "Email Address"}
            </button>
          ))}
        </div>

        <label className="mt-5 block text-xs uppercase tracking-wide text-muted font-mono">
          {contactType === "mobile" ? "10-digit mobile number" : "Email address"}
        </label>
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder={contactType === "mobile" ? "98765 43210" : "you@example.com"}
          inputMode={contactType === "mobile" ? "numeric" : "email"}
          className="mt-2 w-full rounded-lg border border-white/15 bg-ink/70 px-4 py-3 text-parchment placeholder:text-muted/60 outline-none focus:border-gold"
        />
        {error && <p className="mt-2 text-sm text-maroon-light">{error}</p>}

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-gold-gradient py-3 font-bold text-ink transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Continue to Voting
        </button>
        <p className="mt-3 text-center text-[11px] text-muted">
          Your contact is only used to prevent duplicate voting. It won&apos;t be shown publicly.
        </p>
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
        Voting as {contactType === "mobile" ? "mobile" : "email"}{" "}
        <span className="text-parchment/80">{contact}</span>. This cannot be changed after submitting.
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
                    className="h-8 w-8 rounded-full object-cover border border-white/10 shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-wide text-gold-deep">{c.title}</p>
                  <p className="mt-0.5 font-body font-semibold text-parchment truncate">
                    {nominee ? nominee.name : <span className="text-maroon-light">Not voted</span>}
                  </p>
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
          {submitting ? "Submitting…" : "Submit My Vote"}
        </button>
        <p className="mt-3 text-xs text-muted">
          By submitting, you confirm this is your own genuine vote.
        </p>
      </div>
    </div>
  );
}

function SuccessStep() {
  return (
    <div className="animate-rise text-center py-10">
      <TrophyMark />
      <h1 className="mt-4 font-display text-3xl text-gold-gradient">Vote Recorded</h1>
      <p className="mt-3 text-parchment/85 max-w-sm mx-auto">
        Thank you for backing Sambalpuri talent. Your ballot for all 10 categories has been saved —
        this number/email can&apos;t vote again.
      </p>
      <p className="mt-6 text-xs text-muted">Pratibha Season 2 · 01 August · Belpahar</p>
    </div>
  );
}
