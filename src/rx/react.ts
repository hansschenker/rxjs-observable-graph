import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import type { Observable } from "rxjs";
import type { ReadonlySignal } from "./signal.ts";

export function useConstant<T>(factory: () => T): T {
  const ref = useRef<T | null>(null);
  if (ref.current === null) {
    ref.current = factory();
  }
  return ref.current;
}

export function useSignalValue<T>(sig: ReadonlySignal<T>): T {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const sub = sig.$.subscribe(() => onStoreChange());
      return () => sub.unsubscribe();
    },
    [sig],
  );
  return useSyncExternalStore(subscribe, () => sig(), () => sig());
}

export function useObservable<T>(source: Observable<T>, initial: T): T {
  const latest = useRef(initial);
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const sub = source.subscribe({
        next: (value) => {
          latest.current = value;
          onStoreChange();
        },
      });
      return () => sub.unsubscribe();
    },
    [source],
  );
  return useSyncExternalStore(
    subscribe,
    () => latest.current,
    () => initial,
  );
}

export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function useClientEffect(effect: () => void | (() => void)): void {
  useEffect(effect, [effect]);
}
