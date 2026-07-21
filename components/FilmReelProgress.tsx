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
  const totalCategories = CATEGORIES.length || 1;
  const sprocketCount = Math.max(totalCategories * 2, 8);

  const sprocket = (
    <div className="flex justify-between px-2">
      {Array.from({ length: sprocketCount }).map((_, i) => (
        <span key={i} className="h-1.5 w-1.5 rounded-[2px] bg-ink/80" />
      ))}
    </div>
  );

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div className="min-w-[600px] sm:min-w-0 rounded-md bg-charLight border border-gold-deep/40 py-1.5">
        {sprocket}
        <div
          className="grid gap-[4px] px-2 py-1"
          style={{ gridTemplateColumns: `repeat(${totalCategories}, minmax(0, 1fr))` }}
        >
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
                  "group relative aspect-[3/4] rounded-[4px] border transition-all duration-200 flex flex-col items-center justify-center overflow-hidden w-full",
                  active
                    ? "border-gold shadow-gold ring-2 ring-gold/40 scale-[1.03] z-10"
                    : voted
                    ? "border-gold-deep/80 hover:border-gold"
                    : "border-white/20 hover:border-gold-deep/50",
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
                        ? "opacity-100 scale-105"
                        : voted
                        ? "opacity-90 group-hover:opacity-100 group-hover:scale-105"
                        : "opacity-80 group-hover:opacity-100 group-hover:scale-105",
                    ].join(" ")}
                  />
                ) : (
                  <div className="absolute inset-0 bg-ink/65" />
                )}

                {/* Subtle gradient overlay for text contrast without dimming poster image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30 group-hover:from-black/50 transition-colors pointer-events-none" />

                {/* Step Number Badge */}
                <span
                  className={[
                    "relative z-10 font-mono text-[11px] sm:text-xs tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-ink/75 backdrop-blur-sm border shadow-md",
                    active
                      ? "text-gold-light border-gold shadow-gold/50"
                      : voted
                      ? "text-gold border-gold-deep/60"
                      : "text-parchment/90 border-white/20 group-hover:text-parchment group-hover:border-white/40",
                  ].join(" ")}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Custom Voted Indicator Badge */}
                {voted && (
                  <span className="absolute z-10 top-1 right-1 h-2 w-2 rounded-full bg-gold border border-ink shadow-[0_0_6px_rgba(201,151,61,1)]" />
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
