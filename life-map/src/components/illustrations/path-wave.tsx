/** A small squiggly connector used between timeline nodes instead of a flat line — "a path", not a list divider. */
export function PathWave({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 56" className={className} aria-hidden>
      <path
        d="M12 0 C4 10, 20 18, 12 28 S4 46, 12 56"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="1 9"
      />
    </svg>
  );
}
