import { signal, type WritableSignal } from "./signal.ts";

export type HydrationPhase = "ssr" | "hydrating" | "hydrated";

export const hydrationPhase: WritableSignal<HydrationPhase> = signal("ssr", {
  name: "hydration.phase",
});

export function markHydrated(): void {
  hydrationPhase.set("hydrated");
}
