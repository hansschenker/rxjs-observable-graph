import { createFileRoute } from "@tanstack/react-router";
import { LabFrame } from "@/components/lab-frame";
import { Badge } from "@/components/ui/badge";
import { getHydrationSnapshot } from "@/lib/server-fns";
import { useIsHydrated } from "@/rx/react";

export const Route = createFileRoute("/ssr")({
  loader: () => getHydrationSnapshot(),
  component: SsrLab,
});

function SsrLab() {
  const snapshot = Route.useLoaderData();
  const hydrated = useIsHydrated();

  return (
    <LabFrame
      kicker="Server SSR · Hydration"
      title="HTML on the edge, signals in the client."
      lede="The loader runs a TanStack server function, then asks the Hono worker for a JSX fragment. The client hydrates that transfer state into the same Observable graph."
    >
      <div className="flex flex-wrap gap-2">
        <Badge tone={hydrated ? "ok" : "live"}>
          {hydrated ? "client hydrated" : "server snapshot"}
        </Badge>
        <Badge>runtime {snapshot.telemetry.runtime}</Badge>
        <Badge>seq {snapshot.telemetry.seq}</Badge>
      </div>
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">
            Hono JSX fragment
          </p>
          <div
            className="mt-4 text-fg"
            dangerouslySetInnerHTML={{ __html: snapshot.fragmentHtml }}
          />
        </article>
        <article className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">
            Transfer state
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-muted">Source</dt>
              <dd className="font-mono text-sm">{snapshot.source}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-muted">Rendered</dt>
              <dd className="font-mono text-sm">{snapshot.renderedAt}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-muted">Core temp</dt>
              <dd className="font-mono text-sm tabular-nums">
                {snapshot.telemetry.coreTemp.toFixed(1)}°
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-muted">Hydrated</dt>
              <dd className="font-mono text-sm">{String(hydrated)}</dd>
            </div>
          </dl>
        </article>
      </section>
    </LabFrame>
  );
}
