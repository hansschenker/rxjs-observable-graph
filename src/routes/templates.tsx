import { createFileRoute } from "@tanstack/react-router";
import { LabFrame } from "@/components/lab-frame";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { signal } from "@/rx/signal";
import { RxFor, RxIf } from "@/rx/template";
import { useConstant, useSignalValue } from "@/rx/react";

export const Route = createFileRoute("/templates")({
  component: TemplatesLab,
});

type Row = { id: string; name: string; alive: boolean };

const seed: Row[] = [
  { id: "n-1", name: "signals.count", alive: true },
  { id: "n-2", name: "http GET /telemetry", alive: true },
  { id: "n-3", name: "hono.dispatch", alive: false },
];

function TemplatesLab() {
  const rows = useConstant(() => signal<Row[]>(seed, { name: "templates.rows" }));
  const showIdle = useConstant(() => signal(true, { name: "templates.showIdle" }));
  const showIdleValue = useSignalValue(showIdle);
  const count = useSignalValue(rows).length;

  return (
    <LabFrame
      kicker="Templates"
      title="Structural directives, as streams."
      lede="RxIf and RxFor are the *ngIf / *ngFor replacements. They read signals, track identity, and keep interpolation in the TypeScript graph instead of a separate template language."
    >
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() =>
            rows.update((list) => [
              {
                id: `n-${list.length + 1}`,
                name: `computed.${list.length + 1}`,
                alive: list.length % 2 === 0,
              },
              ...list,
            ])
          }
        >
          Push node
        </Button>
        <Button variant="ghost" onClick={() => showIdle.update((v) => !v)}>
          {showIdleValue ? "Hide idle" : "Show idle"}
        </Button>
        <Badge>{count} bound</Badge>
      </div>
      <ul className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
        <RxFor
          of={rows}
          trackBy={(row) => row.id}
          empty={<li className="px-4 py-6 text-sm text-muted">No nodes in the graph.</li>}
        >
          {(row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0"
            >
              <span className="font-mono text-sm text-fg">{row.name}</span>
              <RxIf of={row.alive} fallback={
                <RxIf of={showIdleValue}>
                  {() => <Badge>idle</Badge>}
                </RxIf>
              }>
                {() => <Badge tone="ok">hot</Badge>}
              </RxIf>
            </li>
          )}
        </RxFor>
      </ul>
    </LabFrame>
  );
}
