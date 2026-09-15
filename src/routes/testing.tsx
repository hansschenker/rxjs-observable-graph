import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LabFrame } from "@/components/lab-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { runHelixSpecs, type SpecResult } from "@/rx/testing";

export const Route = createFileRoute("/testing")({
  component: TestingLab,
});

function TestingLab() {
  const [results, setResults] = useState<SpecResult[] | null>(null);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    const next = await runHelixSpecs();
    setResults(next);
    setRunning(false);
  }

  useEffect(() => {
    void run();
  }, []);

  const passed = results?.filter((item) => item.passed).length ?? 0;
  const total = results?.length ?? 0;

  return (
    <LabFrame
      kicker="Testing"
      title="The graph has a spec."
      lede="The same suites run in Node and in this page. Signals, computed, Zod forms, and marble takes are asserted against the live runtime — not a mock of it."
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => void run()} disabled={running}>
          {running ? "Running" : "Re-run specs"}
        </Button>
        <Badge tone={results && passed === total ? "ok" : "muted"}>
          {passed}/{total} passed
        </Badge>
      </div>
      <ul className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
        {(results ?? []).map((result) => (
          <li
            key={result.name}
            className="flex flex-col gap-1 border-b border-border px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-faint">
                {result.group}
              </p>
              <p className="text-sm text-fg">{result.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs tabular-nums text-muted">
                {result.durationMs} ms
              </span>
              <Badge tone={result.passed ? "ok" : "warn"}>
                {result.passed ? "pass" : result.detail}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </LabFrame>
  );
}
