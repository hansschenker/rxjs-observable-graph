import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { firstValueFrom, of, delay } from "rxjs";
import { StationSchema } from "@/lib/schemas";
import { recordGraph } from "@/rx/graph";
import { Badge } from "@/components/ui/badge";

const paramsSchema = z.object({
  station: StationSchema,
});

export const Route = createFileRoute("/routing/$station")({
  params: {
    parse: (raw) => paramsSchema.parse(raw),
  },
  validateSearch: (search) =>
    z.object({ view: z.enum(["map", "trace"]).default("map").catch("map") }).parse(search),
  loader: async ({ params }) => {
    const hop = of(params.station).pipe(delay(80));
    const station = await firstValueFrom(hop);
    if (!import.meta.env.SSR) {
      recordGraph("router.guard", "next", station);
    }
    return {
      station,
      copy: copies[station],
    };
  },
  component: StationPage,
});

const copies = {
  core: {
    title: "Core station",
    body: "Signals and computed producers live here. Navigation into core is a delayed RxJS hop so the router itself is part of the graph.",
  },
  edge: {
    title: "Edge station",
    body: "Hono on a Cloudflare worker contract. The same fetch handler is what TanStack Start mounts under /api/hono.",
  },
  hydrate: {
    title: "Hydrate station",
    body: "SSR HTML and client Observables meet here. Transfer state is Zod-typed so the client graph can resume without a second guess.",
  },
} as const;

function StationPage() {
  const data = Route.useLoaderData();
  const { view } = Route.useSearch();

  return (
    <article className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="live">{data.station}</Badge>
        <Badge>{view}</Badge>
      </div>
      <h2 className="mt-3 font-display text-3xl text-fg">{data.copy.title}</h2>
      <p className="mt-2 max-w-xl text-sm text-pretty text-muted">{data.copy.body}</p>
    </article>
  );
}
