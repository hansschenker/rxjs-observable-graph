import { firstValueFrom, take, toArray, type Observable } from "rxjs";
import { signal, computed } from "./signal.ts";
import { FormControl, FormGroup } from "./forms.ts";
import { DispatchSchema } from "../lib/schemas.ts";
import { previewValue } from "./graph.ts";

export interface SpecResult {
  name: string;
  group: string;
  passed: boolean;
  detail: string;
  durationMs: number;
}

export interface Spec {
  name: string;
  group: string;
  run: () => void | Promise<void>;
}

class SpecError extends Error {}

function expectEqual<T>(actual: T, expected: T, label: string): void {
  if (!Object.is(actual, expected)) {
    throw new SpecError(`${label}: expected ${previewValue(expected)}, got ${previewValue(actual)}`);
  }
}

function expectTrue(value: unknown, label: string): void {
  if (!value) throw new SpecError(`${label}: expected truthy`);
}

export const helixSpecs: Spec[] = [
  {
    group: "signals",
    name: "writable signal updates subscribers",
    run: () => {
      const count = signal(0, { name: "test.count" });
      count.set(2);
      count.update((n) => n + 1);
      expectEqual(count(), 3, "count");
    },
  },
  {
    group: "signals",
    name: "computed tracks nested producers",
    run: () => {
      const a = signal(4, { name: "test.a" });
      const b = signal(6, { name: "test.b" });
      const sum = computed(() => a() + b(), { name: "test.sum" });
      expectEqual(sum(), 10, "initial sum");
      a.set(10);
      expectEqual(sum(), 16, "after a.set");
    },
  },
  {
    group: "forms",
    name: "form group aggregates Zod errors",
    run: () => {
      const form = new FormGroup(
        {
          name: new FormControl("", DispatchSchema.shape.name, "name"),
          priority: new FormControl(
            "normal" as const,
            DispatchSchema.shape.priority,
            "priority",
          ),
          payload: new FormControl("", DispatchSchema.shape.payload, "payload"),
        },
        "dispatch",
      );
      expectEqual(form.status(), "INVALID", "empty name is invalid");
      form.controls.name.setValue("orbit-17");
      expectEqual(form.status(), "VALID", "named job is valid");
      expectEqual(form.value().name, "orbit-17", "value projection");
    },
  },
  {
    group: "http",
    name: "preview helper serializes payloads",
    run: () => {
      expectEqual(previewValue({ seq: 1 }), '{"seq":1}', "json preview");
    },
  },
  {
    group: "graph",
    name: "observable take collects a marble slice",
    run: async () => {
      const source$ = signal(0, { name: "test.marble" }).$;
      const values = await firstValueFrom(source$.pipe(take(1), toArray()));
      expectTrue(Array.isArray(values) && values.length === 1, "marble length");
    },
  },
];

export async function runHelixSpecs(): Promise<SpecResult[]> {
  const results: SpecResult[] = [];
  for (const spec of helixSpecs) {
    const start = Date.now();
    try {
      await spec.run();
      results.push({
        name: spec.name,
        group: spec.group,
        passed: true,
        detail: "ok",
        durationMs: Date.now() - start,
      });
    } catch (error) {
      results.push({
        name: spec.name,
        group: spec.group,
        passed: false,
        detail: error instanceof Error ? error.message : String(error),
        durationMs: Date.now() - start,
      });
    }
  }
  return results;
}

export async function collectMarbles<T>(
  source: Observable<T>,
  count: number,
): Promise<T[]> {
  return firstValueFrom(source.pipe(take(count), toArray()));
}
