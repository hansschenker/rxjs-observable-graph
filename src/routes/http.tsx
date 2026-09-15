import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { firstValueFrom, interval, switchMap } from "rxjs";
import { LabFrame } from "@/components/lab-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobsSchema, TelemetrySchema } from "@/lib/schemas";
import { getServerTelemetry } from "@/lib/server-fns";
import { http } from "@/rx/http";
import { signal } from "@/rx/signal";
import { useConstant, useSignalValue } from "@/rx/react";

export const Route = createFileRoute("/http")({
  loader: () => getServerTelemetry(),
  component: HttpLab,
});

function HttpLab() {
  const initial = Route.useLoaderData();
  const queryClient = useQueryClient();

  const telemetryQuery = useQuery({
    queryKey: ["telemetry"],
    queryFn: () => firstValueFrom(http.get("/api/hono/telemetry", TelemetrySchema)),
    initialData: initial,
    refetchInterval: 2_500,
  });

  const jobsQuery = useQuery({
    queryKey: ["jobs"],
    queryFn: () => firstValueFrom(http.get("/api/hono/jobs", JobsSchema)),
  });

  const poll = useConstant(() => signal(initial, { name: "http.poll" }));
  const polled = useSignalValue(poll);

  useEffect(() => {
    const sub = interval(2500)
      .pipe(switchMap(() => http.get("/api/hono/telemetry", TelemetrySchema)))
      .subscribe((value) => poll.set(value));
    return () => sub.unsubscribe();
  }, [poll]);

  return (
    <LabFrame
      kicker="HTTP client"
      title="Observables in, Query cache out."
      lede="The Angular HttpClient stand-in is RxJS over fetch, Zod-parsed on the way back. TanStack Query owns the cache. Both subscribe to the same Hono worker."
    >
      <section className="grid gap-4 md:grid-cols-3">
        <Stat label="Query seq" value={telemetryQuery.data?.seq ?? "—"} />
        <Stat label="Rx poll seq" value={polled.seq} />
        <Stat
          label="Core temp"
          value={`${(telemetryQuery.data?.coreTemp ?? 0).toFixed(1)}°`}
        />
      </section>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            void queryClient.invalidateQueries({ queryKey: ["telemetry"] });
            void queryClient.invalidateQueries({ queryKey: ["jobs"] });
          }}
        >
          Invalidate cache
        </Button>
        <Badge tone={telemetryQuery.isFetching ? "live" : "muted"}>
          {telemetryQuery.isFetching ? "fetching" : "cached"}
        </Badge>
      </div>
      <ul className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
        {(jobsQuery.data?.jobs ?? []).map((job) => (
          <li
            key={job.id}
            className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0"
          >
            <div>
              <p className="font-mono text-sm text-fg">{job.name}</p>
              <p className="text-xs text-muted">{job.payload}</p>
            </div>
            <Badge>{job.status}</Badge>
          </li>
        ))}
      </ul>
    </LabFrame>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-3 font-display text-4xl tabular-nums text-fg">{value}</p>
    </article>
  );
}
