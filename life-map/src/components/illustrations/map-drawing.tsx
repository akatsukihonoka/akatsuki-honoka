/** A path that "draws itself" — used behind the /analyzing loading sequence. */
export function MapDrawing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" className={className} aria-hidden>
      <path
        d="M10 100 C 50 40, 80 100, 110 60 S 160 20, 190 40"
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray="1 14"
        className="animate-draw-path text-orange-300"
        style={{ "--path-length": 260 } as React.CSSProperties}
      />
      <circle cx={10} cy={100} r={5} className="fill-orange-400" />
      <circle cx={190} cy={40} r={5} className="fill-pink-400" />
    </svg>
  );
}
