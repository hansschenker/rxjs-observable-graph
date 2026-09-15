import { createFileRoute } from "@tanstack/react-router";
import { Subject } from "rxjs";
import { LabFrame } from "@/components/lab-frame";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { signal } from "@/rx/signal";
import { useConstant, useObservable, useSignalValue } from "@/rx/react";
import { recordGraph } from "@/rx/graph";

export const Route = createFileRoute("/components")({
  component: ComponentsLab,
});

class EventEmitter<T> extends Subject<T> {
  emit(value: T) {
    this.next(value);
    recordGraph("component.output", "next", value);
  }
}

function Instrument({
  title,
  value,
  onPing,
}: {
  title: string;
  value: number;
  onPing: EventEmitter<string>;
}) {
  return (
    <article className="rounded-lg bg-elevated p-4 shadow-[var(--shadow-border)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-2xl text-fg">{title}</h3>
        <Badge>input</Badge>
      </div>
      <p className="mt-4 font-mono text-3xl tabular-nums text-fg">{value.toFixed(1)}</p>
      <Button
        className="mt-4"
        variant="secondary"
        size="sm"
        onClick={() => onPing.emit(title)}
      >
        Emit output
      </Button>
    </article>
  );
}

function ComponentsLab() {
  const heat = useConstant(() => signal(52.4, { name: "components.heat" }));
  const lag = useConstant(() => signal(14.1, { name: "components.lag" }));
  const ping = useConstant(() => new EventEmitter<string>());
  const heatValue = useSignalValue(heat);
  const lagValue = useSignalValue(lag);
  const lastPing = useObservable(ping, "none");

  return (
    <LabFrame
      kicker="Components · Hono JSX"
      title="Typed inputs, streamed outputs."
      lede="Client components take signal inputs and emit RxJS outputs. Server components are Hono JSX fragments from the same worker contract — see the SSR lab for the edge-rendered HTML."
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          onClick={() => heat.update((n) => Number((n + 1.4).toFixed(1)))}
        >
          Heat +
        </Button>
        <Button
          variant="secondary"
          onClick={() => lag.update((n) => Number((n + 0.8).toFixed(1)))}
        >
          Lag +
        </Button>
        <p className="text-sm text-muted">
          Last output: <span className="font-mono text-fg">{lastPing}</span>
        </p>
      </div>
      <section className="grid gap-3 md:grid-cols-2">
        <Instrument title="Core" value={heatValue} onPing={ping} />
        <Instrument title="Edge" value={lagValue} onPing={ping} />
      </section>
    </LabFrame>
  );
}
