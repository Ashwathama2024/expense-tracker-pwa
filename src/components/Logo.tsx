// Inline SVG (not an <img> to the PNG) so the mark stays crisp at any size
// and can be recolored via CSS — same "Passbook ₹" glyph as the app icon.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
      <rect width="96" height="96" rx="22" fill="var(--accent)" />
      <path
        d="M30 66 L30 30 Q30 22 40 22 L58 22 Q68 22 68 32 Q68 40 58 40 L40 40"
        fill="none"
        stroke="var(--accent-foreground)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="24" y1="30" x2="46" y2="30" stroke="var(--accent-foreground)" strokeWidth="6" strokeLinecap="round" />
      <line x1="24" y1="40" x2="46" y2="40" stroke="var(--accent-foreground)" strokeWidth="6" strokeLinecap="round" />
      <line x1="30" y1="66" x2="66" y2="66" stroke="var(--accent-foreground)" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2.5">
        <LogoMark className="h-8 w-8 shrink-0 rounded-[9px]" />
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Expense Tracker
        </span>
      </div>
    </div>
  );
}
