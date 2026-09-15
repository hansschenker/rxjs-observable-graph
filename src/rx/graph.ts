import { BehaviorSubject, type MonoTypeOperatorFunction } from "rxjs";
import { tap } from "rxjs/operators";
import type { GraphEvent } from "../lib/schemas.ts";

const MAX_EVENTS = 64;

const events = new BehaviorSubject<GraphEvent[]>([]);

export const graphEvents$ = events.asObservable();

export function graphSnapshot(): GraphEvent[] {
  return events.getValue();
}

export function previewValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") {
    return value.length > 72 ? `${value.slice(0, 72)}…` : value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    const json = JSON.stringify(value);
    if (!json) return Object.prototype.toString.call(value);
    return json.length > 96 ? `${json.slice(0, 96)}…` : json;
  } catch {
    return Object.prototype.toString.call(value);
  }
}

export function recordGraph(
  node: string,
  kind: GraphEvent["kind"],
  preview: unknown,
): void {
  const event: GraphEvent = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    t: Date.now(),
    node,
    kind,
    preview: previewValue(preview),
  };
  events.next([event, ...events.getValue()].slice(0, MAX_EVENTS));
}

export function tapGraph<T>(node: string): MonoTypeOperatorFunction<T> {
  return tap({
    subscribe: () => recordGraph(node, "subscribe", "open"),
    next: (value) => recordGraph(node, "next", value),
    error: (err) => recordGraph(node, "error", err instanceof Error ? err.message : err),
    complete: () => recordGraph(node, "complete", "done"),
  });
}

export function resetGraph(): void {
  events.next([]);
}
