"use client";

export type BranchMapRoute = {
  id: string;
  emoji: string;
  label: string;
  colorFrom: string;
  colorTo: string;
};

/**
 * The "現在地 → 分岐 → 3つの未来" overview at the top of /map. Purely a
 * visual — the actual navigation happens through the route cards rendered
 * below it. Three fixed endpoints (left / center / right), matched to
 * `routes` in order.
 */
export function BranchMapDiagram({ routes }: { routes: BranchMapRoute[] }) {
  const endpoints = [
    { x: 46, y: 168 },
    { x: 150, y: 190 },
    { x: 254, y: 168 },
  ];

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 300 210" className="w-full" role="img" aria-label="現在地から3つの未来への分岐図">
        {routes.map((route, i) => {
          const end = endpoints[i];
          const path = `M150,44 C150,${90 + i * 4} ${end.x},110 ${end.x},${end.y - 26}`;
          return (
            <path
              key={route.id}
              d={path}
              fill="none"
              stroke={`url(#branch-gradient-${route.id})`}
              strokeWidth={4}
              strokeLinecap="round"
              className="animate-draw-path"
              style={{ "--path-length": 220, animationDelay: `${i * 150}ms` } as React.CSSProperties}
            />
          );
        })}

        <defs>
          {routes.map((route) => (
            <linearGradient
              key={route.id}
              id={`branch-gradient-${route.id}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor={route.colorFrom} />
              <stop offset="100%" stopColor={route.colorTo} />
            </linearGradient>
          ))}
        </defs>

        {/* 今 node */}
        <circle cx={150} cy={34} r={22} className="fill-white stroke-orange-300" strokeWidth={3} />
        <text x={150} y={40} textAnchor="middle" fontSize={16} className="select-none">
          📍
        </text>

        {routes.map((route, i) => {
          const end = endpoints[i];
          return (
            <g key={route.id} className="animate-pop-in" style={{ animationDelay: `${300 + i * 150}ms` }}>
              <circle
                cx={end.x}
                cy={end.y}
                r={26}
                fill={`url(#branch-gradient-${route.id})`}
                className="drop-shadow-sm"
              />
              <text x={end.x} y={end.y + 7} textAnchor="middle" fontSize={20} className="select-none">
                {route.emoji}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-1 grid grid-cols-3 gap-2 text-center">
        {routes.map((route) => (
          <p key={route.id} className="text-xs font-semibold text-neutral-700">
            {route.label}
          </p>
        ))}
      </div>
    </div>
  );
}
