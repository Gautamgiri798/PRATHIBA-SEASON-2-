"use client";

export function ResetDatabaseButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        const confirmed = window.confirm(
          "⚠️ DANGER ZONE: ARE YOU ABSOLUTELY SURE?\n\nThis will PERMANENTLY DELETE all votes, tallies, and voter logs.\n\nThis action CANNOT be undone!\n\nClick OK to confirm database reset or Cancel to keep your data."
        );
        if (!confirmed) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-full border border-maroon-light/50 bg-maroon/20 hover:bg-maroon/40 px-5 py-2 text-xs font-bold text-parchment transition-all hover:scale-[1.02] shadow-sm"
      >
        Reset All Votes & Restart
      </button>
    </form>
  );
}
