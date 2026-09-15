import { useObservable, useIsHydrated } from "@/rx/react";
import { graphEvents$, graphSnapshot } from "@/rx/graph";
import { Badge } from "@/components/ui/badge";

export function GraphInspector() {
  const hydrated = useIsHydrated();
  const events = useObservable(graphEvents$, graphSnapshot());
  const shown = hydrated ? events : [];

  return (
    <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Observable graph
          </p>
          <h2 className="font-display text-xl text-fg">Live trace</h2>
        </div>
        <Badge>{shown.length} events</Badge>
      </div>
      <ol className="flex max-h-56 flex-col gap-1 overflow-auto font-mono text-xs">
        {shown.length === 0 ? (
          <li className="text-muted">Idle. Interact with a lab to emit into the graph.</li>
        ) : (
          shown.slice(0, 14).map((event) => (
            <li
              key={event.id}
              className="grid grid-cols-[4.5rem_5.5rem_1fr] items-baseline gap-3 border-b border-border py-1.5 last:border-0"
            >
              <span className="text-faint tabular-nums">
                {new Date(event.t).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              <span className="text-muted">{event.kind}</span>
              <span className="truncate text-fg">
                <span className="text-muted">{event.node}</span>
                {" · "}
                {event.preview}
              </span>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
