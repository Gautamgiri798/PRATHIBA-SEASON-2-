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
                  "group relative aspect-[3/4] rounded-[3px] border transition-all duration-200 flex flex-col items-center justify-center overflow-hidden",
                  active
                    ? "border-gold shadow-gold"
                    : voted
                    ? "border-gold-deep/70"
                    : "border-white/10 hover:border-white/25",
                ].join(" ")}
              >
                {/* Category Film Reel Thumbnail Photo */}
                {cat.thumbnailUrl ? (
                  <img
                    src={cat.thumbnailUrl}
                    alt={cat.title}
                    className={[
                      "absolute inset-0 w-full h-full object-cover transition-all duration-300",
                      active
                        ? "opacity-60 scale-105"
                        : voted
                        ? "opacity-35 mix-blend-luminosity group-hover:opacity-45"
                        : "opacity-15 mix-blend-luminosity group-hover:opacity-25",
                    ].join(" ")}
                  />
                ) : (
                  <div className="absolute inset-0 bg-ink/65" />
                )}

                {/* Dark shading overlay to guarantee text legibility */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors pointer-events-none" />

                {/* Step Number */}
                <span
                  className={[
                    "relative z-10 font-mono text-[10px] sm:text-xs tracking-wide font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]",
                    active ? "text-gold-light" : voted ? "text-gold" : "text-muted group-hover:text-parchment",
                  ].join(" ")}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Custom Voted Indicator Badge */}
                {voted && (
                  <span className="absolute z-10 top-1 right-1 h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_4px_rgba(201,151,61,0.8)]" />
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
