import { cn } from "@/lib/utils";

const nodes = [
  { id: "signals", label: "Signals", x: 10, y: 40 },
  { id: "templates", label: "Templates", x: 28, y: 18 },
  { id: "forms", label: "Forms", x: 28, y: 62 },
  { id: "http", label: "HTTP", x: 46, y: 40 },
  { id: "query", label: "Query", x: 64, y: 18 },
  { id: "hono", label: "Hono", x: 64, y: 62 },
  { id: "ssr", label: "SSR", x: 80, y: 40 },
  { id: "hydrate", label: "Hydrate", x: 88, y: 40 },
] as const;

const edges: Array<[string, string]> = [
  ["signals", "templates"],
  ["signals", "forms"],
  ["templates", "http"],
  ["forms", "http"],
  ["http", "query"],
  ["http", "hono"],
  ["query", "ssr"],
  ["hono", "ssr"],
  ["ssr", "hydrate"],
];

function nodeById(id: string) {
  return nodes.find((node) => node.id === id)!;
}

export function GraphCanvas({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-surface p-3 shadow-[var(--shadow-border)] md:p-5",
        className,
      )}
    >
      <svg
        viewBox="0 0 100 80"
        className="block h-auto w-full max-w-full overflow-hidden"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Client to server observable graph"
      >
        {edges.map(([from, to], index) => {
          const a = nodeById(from);
          const b = nodeById(to);
          const d = `M ${a.x} ${a.y} C ${(a.x + b.x) / 2} ${a.y}, ${(a.x + b.x) / 2} ${b.y}, ${b.x} ${b.y}`;
          return (
            <g key={`${from}-${to}`}>
              <path
                d={d}
                fill="none"
                stroke="currentColor"
                className="text-border"
                strokeWidth="0.35"
              />
              <path
                d={d}
                fill="none"
                stroke="currentColor"
                className="text-accent/80 helix-flow"
                strokeWidth="0.4"
                strokeDasharray="1.6 6"
                style={{ animationDelay: `${index * 180}ms` }}
              />
            </g>
          );
        })}
        {nodes.map((node) => (
          <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
            <rect
              x="-6.6"
              y="-4"
              width="13.2"
              height="8"
              rx="1.4"
              className="fill-elevated stroke-border"
              strokeWidth="0.3"
            />
            <text
              textAnchor="middle"
              y="1.05"
              className="fill-fg"
              fontSize="2.15"
              fontFamily="IBM Plex Mono, ui-monospace, monospace"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
