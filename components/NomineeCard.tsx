"use client";

import { Nominee } from "@/lib/categories";

export function NomineeCard({
  nominee,
  index,
  selected,
  onSelect,
}: {
  nominee: Nominee;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const initial = nominee.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        "group relative w-full rounded-lg border p-4 sm:p-5 text-left transition-all duration-200 flex items-center gap-4",
        selected
          ? "border-gold bg-gradient-to-r from-gold-deep/15 to-transparent shadow-gold"
          : "border-white/10 bg-char hover:border-gold-deep/50 hover:bg-charLight",
      ].join(" ")}
    >
      {/* Photo Avatar or Initials Badge */}
      <div
        className={[
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-lg border overflow-hidden relative transition-colors",
          selected
            ? "border-gold text-gold-light bg-ink"
            : "border-white/15 text-muted bg-ink/60 group-hover:text-parchment group-hover:border-gold-deep/50",
        ].join(" ")}
      >
        {nominee.imageUrl ? (
          <img
            src={nominee.imageUrl}
            alt={nominee.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          initial
        )}
      </div>

      <span className="flex-1 min-w-0">
        <span
          className={[
            "block font-body font-semibold truncate",
            selected ? "text-parchment" : "text-parchment/90",
          ].join(" ")}
        >
          {nominee.name}
        </span>
        {nominee.subtitle && (
          <span className="block text-xs text-muted mt-0.5 truncate">{nominee.subtitle}</span>
        )}
      </span>

      {/* Selection Checkbox Ring */}
      <span
        className={[
          "shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
          selected ? "border-gold bg-gold" : "border-white/20",
        ].join(" ")}
      >
        {selected && (
          <svg viewBox="0 0 12 10" className="h-2.5 w-3 fill-none">
            <path d="M1 5L4.5 8.5L11 1.5" stroke="#0B0806" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}
