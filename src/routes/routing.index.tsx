import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/routing/")({
  component: RoutingIndex,
});

function RoutingIndex() {
  return (
    <article className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">Layout route</p>
      <h2 className="mt-2 font-display text-3xl text-fg">Choose a station</h2>
      <p className="mt-2 max-w-xl text-sm text-pretty text-muted">
        Nested routes inherit the Zod-typed search param. Each station loader is
        an async observable hop — the child records itself into the graph.
      </p>
    </article>
  );
}
