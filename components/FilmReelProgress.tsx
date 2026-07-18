"use client";

import { CATEGORIES } from "@/lib/categories";

export function FilmReelProgress({
  currentIndex,
  votedCategoryIds,
  onJump,
}: {
  currentIndex: number; // index within CATEGORIES, -1 if not on a category step
  votedCategoryIds: Set<string>;
  onJump: (index: number) => void;
}) {
  const sprocket = (
    <div className="flex justify-between px-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className="h-1.5 w-1.5 rounded-[2px] bg-ink/80" />
      ))}
    </div>
  );

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div className="min-w-[720px] sm:min-w-0 rounded-md bg-charLight border border-gold-deep/40 py-1.5">
        {sprocket}
        <div className="grid grid-cols-10 gap-[3px] px-2 py-1">
          {CATEGORIES.map((cat, i) => {
            const voted = votedCategoryIds.has(cat.id);
            const active = i === currentIndex;
            return (
              <button
                key={cat.id}
                onClick={() => onJump(i)}
                title={cat.title}
                aria-current={active ? "step" : undefined}
                className={[
                  "group relative aspect-[3/4] rounded-[3px] border transition-all duration-200 flex flex-col items-center justify-center",
                  active
                    ? "border-gold shadow-gold bg-gradient-to-b from-gold-light/20 to-transparent"
                    : voted
                    ? "border-gold-deep/70 bg-gold-deep/10"
                    : "border-white/10 bg-ink/60 hover:border-white/25",
                ].join(" ")}
              >
                <span
                  className={[
                    "font-mono text-[10px] sm:text-xs tracking-wide",
                    active ? "text-gold-light" : voted ? "text-gold" : "text-muted",
                  ].join(" ")}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {voted && (
                  <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-gold" />
                )}
              </button>
            );
          })}
        </div>
        {sprocket}
      </div>
    </div>
  );
}
