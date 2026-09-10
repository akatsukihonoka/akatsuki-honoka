/**
 * Lightweight decorative background elements — soft blobs, a cloud, a
 * star — used behind hero sections (LP, /start, /analyzing). All
 * aria-hidden and purely visual; no external image assets.
 */
export function SceneryBlobs({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="absolute -left-10 top-6 h-40 w-40 rounded-full bg-pink-200/50 blur-2xl" />
      <div className="absolute -right-12 top-24 h-48 w-48 rounded-full bg-sky-200/50 blur-2xl" />
      <div className="absolute left-1/3 top-52 h-36 w-36 rounded-full bg-emerald-200/40 blur-2xl" />
    </div>
  );
}

export function CloudShape({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 64 40" fill="none" className={className} style={style} aria-hidden>
      <path
        d="M14 30a10 10 0 0 1-2-19.8A12 12 0 0 1 34 6a9 9 0 0 1 14 8.4A9 9 0 0 1 46 30H14Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function StarShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 2.5c.5 3.6 1.4 6 3 7.6 1.6 1.6 4 2.5 7.5 3-3.6.5-6 1.4-7.6 3-1.6 1.6-2.5 4-3 7.5-.5-3.6-1.4-6-3-7.6-1.6-1.6-4-2.5-7.5-3 3.6-.5 6-1.4 7.6-3 1.6-1.6 2.5-4 3-7.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function HillsScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 120" fill="none" className={className} preserveAspectRatio="none" aria-hidden>
      <path d="M0 90 Q 60 40 140 70 T 280 55 T 400 80 V120 H0 Z" className="fill-emerald-200/60" />
      <path d="M0 105 Q 90 70 200 95 T 400 100 V120 H0 Z" className="fill-orange-200/60" />
    </svg>
  );
}
