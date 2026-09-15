import type { ReactNode } from "react";
import { useSignalValue } from "./react.ts";
import type { ReadonlySignal } from "./signal.ts";

export function rxIf<T>(
  value: T | null | undefined | false,
  view: (present: T) => ReactNode,
  fallback: ReactNode = null,
): ReactNode {
  if (value === null || value === undefined || value === false) return fallback;
  return view(value);
}

export function RxIf<T>({
  of,
  children,
  fallback = null,
}: {
  of: ReadonlySignal<T | null | undefined | false> | T | null | undefined | false;
  children: (present: T) => ReactNode;
  fallback?: ReactNode;
}) {
  const value = isSignal(of) ? useSignalValue(of) : of;
  return rxIf(value, children, fallback);
}

export function RxFor<T>({
  of,
  trackBy,
  children,
  empty = null,
}: {
  of: ReadonlySignal<T[]> | T[];
  trackBy: (item: T, index: number) => string | number;
  children: (item: T, index: number) => ReactNode;
  empty?: ReactNode;
}) {
  const items = isSignal(of) ? useSignalValue(of) : of;
  if (items.length === 0) return <>{empty}</>;
  return (
    <>
      {items.map((item, index) => {
        const node = children(item, index);
        if (node && typeof node === "object" && "key" in node) return node;
        return (
          <span key={trackBy(item, index)} className="contents">
            {node}
          </span>
        );
      })}
    </>
  );
}

function isSignal<T>(value: unknown): value is ReadonlySignal<T> {
  return typeof value === "function" && "$" in (value as object);
}
