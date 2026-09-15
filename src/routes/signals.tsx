import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { LabFrame } from "@/components/lab-frame";
import { Button } from "@/components/ui/button";
import { computed, effect, signal } from "@/rx/signal";
import { useConstant, useSignalValue } from "@/rx/react";

export const Route = createFileRoute("/signals")({
  component: SignalsLab,
});

function SignalsLab() {
  const count = useConstant(() => signal(3, { name: "signals.count" }));
  const doubled = useConstant(() =>
    computed(() => count() * 2, { name: "signals.doubled" }),
  );
  const label = useConstant(() =>
    computed(
      () => (count() === 0 ? "idle core" : `reactor × ${count()}`),
      { name: "signals.label" },
    ),
  );
  const countValue = useSignalValue(count);
  const doubledValue = useSignalValue(doubled);
  const labelValue = useSignalValue(label);

  useEffect(() => {
    const runner = effect(() => {
      void count();
    }, { name: "signals.effect" });
    return () => runner.destroy();
  }, [count]);

  return (
    <LabFrame
      kicker="Signals replacement"
      title="RxJS is the signal."
      lede="Writable signals, computed producers, and effects are BehaviorSubjects with Angular-style dependency tracking. Nothing else holds component state on this page."
    >
      <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">
            Writable signal
          </p>
          <p className="mt-4 font-display text-5xl leading-none text-fg tabular-nums md:text-6xl">
            {countValue}
          </p>
          <p className="mt-2 font-mono text-sm text-muted">{labelValue}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={() => count.update((n) => n + 1)}>Increment</Button>
            <Button variant="secondary" onClick={() => count.update((n) => Math.max(0, n - 1))}>
              Decrement
            </Button>
            <Button variant="ghost" onClick={() => count.set(0)}>
              Reset
            </Button>
          </div>
        </article>
        <article className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Computed</p>
          <p className="mt-4 font-display text-5xl leading-none text-fg tabular-nums md:text-6xl">
            {doubledValue}
          </p>
          <p className="mt-3 text-sm text-pretty text-muted">
            <code className="font-mono text-fg">{`computed(() => count() * 2)`}</code>{" "}
            resubscribes only to producers read during the last run.
          </p>
        </article>
      </section>
    </LabFrame>
  );
}
