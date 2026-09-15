import {
  BehaviorSubject,
  Observable,
  distinctUntilChanged,
  shareReplay,
  skip,
  type Subscription,
} from "rxjs";
import { recordGraph } from "./graph.ts";

type Producer = BehaviorSubject<unknown>;

const consumerStack: Set<Producer>[] = [];

function track(producer: Producer): void {
  const current = consumerStack.at(-1);
  if (current) current.add(producer);
}

export interface ReadonlySignal<T> {
  (): T;
  readonly $: Observable<T>;
  readonly name: string;
}

export interface WritableSignal<T> extends ReadonlySignal<T> {
  set(value: T): void;
  update(updater: (value: T) => T): void;
  asReadonly(): ReadonlySignal<T>;
}

export interface SignalOptions {
  name?: string;
}

function asReadonlySignal<T>(
  read: () => T,
  stream: Observable<T>,
  name: string,
): ReadonlySignal<T> {
  const fn = (() => read()) as ReadonlySignal<T>;
  Object.defineProperty(fn, "$", { value: stream, enumerable: true });
  Object.defineProperty(fn, "name", { value: name, enumerable: true });
  return fn;
}

export function signal<T>(
  initial: T,
  options: SignalOptions = {},
): WritableSignal<T> {
  const name = options.name ?? "signal";
  const subject = new BehaviorSubject<T>(initial);
  const stream = subject.pipe(
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  const read = (() => {
    track(subject as Producer);
    return subject.getValue();
  }) as WritableSignal<T>;

  Object.defineProperty(read, "$", { value: stream, enumerable: true });
  Object.defineProperty(read, "name", { value: name, enumerable: true });

  read.set = (value: T) => {
    if (Object.is(value, subject.getValue())) return;
    subject.next(value);
    recordGraph(name, "next", value);
  };
  read.update = (updater) => {
    read.set(updater(subject.getValue()));
  };
  read.asReadonly = () => asReadonlySignal(() => read(), stream, name);
  return read;
}

function bindTracked<T>(compute: () => T, onValue: (value: T) => void): {
  destroy: () => void;
  get: () => T;
} {
  let deps: Subscription[] = [];
  let destroyed = false;
  let running = false;
  let current!: T;

  const rerun = () => {
    if (destroyed || running) return;
    running = true;
    const tracked = new Set<Producer>();
    consumerStack.push(tracked);
    try {
      current = compute();
    } finally {
      consumerStack.pop();
    }
    for (const sub of deps) sub.unsubscribe();
    deps = [...tracked].map((producer) =>
      producer.pipe(skip(1)).subscribe(() => {
        if (destroyed) return;
        rerun();
      }),
    );
    onValue(current);
    running = false;
  };

  rerun();

  return {
    get: () => current,
    destroy: () => {
      destroyed = true;
      for (const sub of deps) sub.unsubscribe();
      deps = [];
    },
  };
}

export function computed<T>(
  compute: () => T,
  options: SignalOptions = {},
): ReadonlySignal<T> {
  const name = options.name ?? "computed";
  let latest!: T;
  let hasLatest = false;
  const subject = new BehaviorSubject<T | undefined>(undefined);
  const stream = subject.pipe(
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true }),
  ) as unknown as Observable<T>;

  const binding = bindTracked(compute, (value) => {
    const first = !hasLatest;
    latest = value;
    hasLatest = true;
    if (!Object.is(subject.getValue(), value)) {
      subject.next(value);
      if (!first) recordGraph(name, "next", value);
    }
  });

  const read = (() => {
    track(subject as Producer);
    return hasLatest ? latest : binding.get();
  }) as ReadonlySignal<T> & { destroy?: () => void };

  Object.defineProperty(read, "$", { value: stream, enumerable: true });
  Object.defineProperty(read, "name", { value: name, enumerable: true });
  read.destroy = binding.destroy;
  return read;
}

export function effect(
  fn: () => void,
  options: SignalOptions = {},
): { destroy: () => void } {
  const name = options.name ?? "effect";
  let first = true;
  const binding = bindTracked(fn, () => {
    if (first) {
      first = false;
      return;
    }
    recordGraph(name, "next", "run");
  });
  return { destroy: binding.destroy };
}

export function toSignal<T>(
  source: Observable<T>,
  initial: T,
  options: SignalOptions = {},
): ReadonlySignal<T> {
  const inner = signal(initial, options);
  const sub = source.subscribe({
    next: (value) => inner.set(value),
    error: (err) =>
      recordGraph(options.name ?? "toSignal", "error", err instanceof Error ? err.message : err),
  });
  const readonly = inner.asReadonly() as ReadonlySignal<T> & {
    destroy?: () => void;
  };
  readonly.destroy = () => sub.unsubscribe();
  return readonly;
}

export function toObservable<T>(sig: ReadonlySignal<T>): Observable<T> {
  return sig.$;
}
