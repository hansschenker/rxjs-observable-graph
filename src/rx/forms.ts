import { z, type ZodType } from "zod";
import { computed, signal, type ReadonlySignal, type WritableSignal } from "./signal.ts";
import { recordGraph } from "./graph.ts";

export type FormStatus = "VALID" | "INVALID" | "PENDING";

export interface FormControlState<T> {
  value: T;
  errors: string[];
  dirty: boolean;
  touched: boolean;
  status: FormStatus;
}

export class FormControl<T> {
  readonly value: WritableSignal<T>;
  readonly errors: WritableSignal<string[]>;
  readonly dirty: WritableSignal<boolean>;
  readonly touched: WritableSignal<boolean>;
  readonly status: ReadonlySignal<FormStatus>;
  readonly state: ReadonlySignal<FormControlState<T>>;
  readonly name: string;
  #schema: ZodType<T>;

  constructor(initial: T, schema: ZodType<T>, name = "control") {
    this.name = name;
    this.#schema = schema;
    this.value = signal(initial, { name: `${name}.value` });
    this.errors = signal(this.parse(initial), { name: `${name}.errors` });
    this.dirty = signal(false, { name: `${name}.dirty` });
    this.touched = signal(false, { name: `${name}.touched` });
    this.status = computed(
      () => (this.errors().length === 0 ? "VALID" : "INVALID"),
      { name: `${name}.status` },
    );
    this.state = computed(
      () => ({
        value: this.value(),
        errors: this.errors(),
        dirty: this.dirty(),
        touched: this.touched(),
        status: this.status(),
      }),
      { name: `${name}.state` },
    );
  }

  setValue(value: T): void {
    this.value.set(value);
    this.dirty.set(true);
    this.errors.set(this.parse(value));
    recordGraph(this.name, "next", value);
  }

  markAsTouched(): void {
    this.touched.set(true);
  }

  reset(value: T): void {
    this.value.set(value);
    this.dirty.set(false);
    this.touched.set(false);
    this.errors.set(this.parse(value));
  }

  private parse(value: T): string[] {
    const result = this.#schema.safeParse(value);
    if (result.success) return [];
    return result.error.issues.map((issue) => issue.message);
  }
}

export class FormGroup<T extends Record<string, unknown>> {
  readonly value: ReadonlySignal<T>;
  readonly status: ReadonlySignal<FormStatus>;
  readonly errors: ReadonlySignal<string[]>;
  readonly controls: { [K in keyof T]: FormControl<T[K]> };
  readonly name: string;

  constructor(
    controls: { [K in keyof T]: FormControl<T[K]> },
    name = "form",
  ) {
    this.controls = controls;
    this.name = name;
    this.value = computed(() => {
      const next = {} as T;
      for (const key of Object.keys(controls) as (keyof T)[]) {
        next[key] = controls[key].value();
      }
      return next;
    }, { name: `${name}.value` });

    this.errors = computed(() => {
      const all: string[] = [];
      for (const key of Object.keys(controls) as (keyof T)[]) {
        all.push(...controls[key].errors());
      }
      return all;
    }, { name: `${name}.errors` });

    this.status = computed(
      () => (this.errors().length === 0 ? "VALID" : "INVALID"),
      { name: `${name}.status` },
    );
  }

  markAllTouched(): void {
    for (const key of Object.keys(this.controls) as (keyof T)[]) {
      this.controls[key].markAsTouched();
    }
  }

  reset(values: T): void {
    for (const key of Object.keys(this.controls) as (keyof T)[]) {
      this.controls[key].reset(values[key]);
    }
  }
}

export function requiredString(min = 1): ZodType<string> {
  return z.string().trim().min(min);
}
