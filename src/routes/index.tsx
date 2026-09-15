import { Link, createFileRoute } from "@tanstack/react-router";
import { GraphCanvas } from "@/components/graph-canvas";
import { GraphInspector } from "@/components/graph-inspector";
import { Badge } from "@/components/ui/badge";
import { labs } from "@/lib/nav";
import { getServerTelemetry } from "@/lib/server-fns";

export const Route = createFileRoute("/")({
  loader: () => getServerTelemetry(),
  component: Home,
});

function Home() {
  const telemetry = Route.useLoaderData();
  const destinations = labs.filter((lab) => lab.to !== "/");

  return (
    <div className="flex flex-col gap-8">
      <header className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
          Client to edge
        </p>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] text-balance text-fg md:text-6xl">
          One observable graph.
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-muted">
          Angular’s runtime, rebuilt in RxJS and TypeScript. Signals, templates,
          forms, HTTP, SSR, hydration, tests, and motion share a single stream
          from the browser through TanStack Query to a Cloudflare-portable Hono
          worker.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Badge tone="live">seq {telemetry.seq}</Badge>
          <Badge>runtime {telemetry.runtime}</Badge>
          <Badge>lag {telemetry.edgeLagMs.toFixed(1)} ms</Badge>
        </div>
      </header>

      <GraphCanvas />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {destinations.map((lab) => (
          <Link
            key={lab.to}
            to={lab.to}
            className="group rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-150 hover:shadow-[var(--shadow-border-hover)] active:scale-[0.99]"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
              {lab.kicker}
            </p>
            <h2 className="mt-2 font-display text-2xl text-fg">{lab.label}</h2>
            <p className="mt-1 text-sm text-muted">Open lab</p>
          </Link>
        ))}
      </section>

      <GraphInspector />
    </div>
  );
}
