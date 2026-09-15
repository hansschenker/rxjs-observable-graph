import type { CSSProperties } from "react";
import { computed, type ReadonlySignal } from "./signal.ts";

export interface StyleDef {
  opacity?: number;
  x?: number;
  y?: number;
  scale?: number;
  filter?: string;
}

export interface TransitionDef {
  from: string;
  to: string;
  duration: number;
  easing: string;
}

export interface AnimatedStyle {
  className: string;
  style: CSSProperties;
}

export interface AnimationTrigger {
  name: string;
  states: Record<string, StyleDef>;
  transitions: TransitionDef[];
  animate: (state: string) => AnimatedStyle;
}

const DEFAULT: StyleDef = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  filter: "blur(0px)",
};

export function trigger(
  name: string,
  states: Record<string, StyleDef>,
  transitions: TransitionDef[],
): AnimationTrigger {
  return {
    name,
    states,
    transitions,
    animate: (state) => {
      const style = { ...DEFAULT, ...states[state] };
      const transition =
        transitions.find((item) => item.to === state) ?? transitions[0];
      const duration = transition?.duration ?? 250;
      const easing = transition?.easing ?? "cubic-bezier(0.22, 1, 0.36, 1)";
      return {
        className: `helix-anim helix-anim-${name}`,
        style: {
          opacity: style.opacity,
          transform: `translate3d(${style.x ?? 0}px, ${style.y ?? 0}px, 0) scale(${style.scale ?? 1})`,
          filter: style.filter,
          transitionProperty: "opacity, transform, filter",
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: easing,
        },
      };
    },
  };
}

export function styleOf(
  trig: AnimationTrigger,
  state: ReadonlySignal<string>,
): ReadonlySignal<AnimatedStyle> {
  return computed(() => trig.animate(state()), { name: `${trig.name}.style` });
}

export const panelTrigger = trigger(
  "panel",
  {
    void: { opacity: 0, y: 12, scale: 0.98, filter: "blur(3px)" },
    in: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    out: { opacity: 0, y: -8, scale: 0.99, filter: "blur(2px)" },
  },
  [
    {
      from: "void",
      to: "in",
      duration: 250,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    },
    {
      from: "in",
      to: "out",
      duration: 150,
      easing: "cubic-bezier(0.23, 1, 0.32, 1)",
    },
  ],
);

export const pulseTrigger = trigger(
  "pulse",
  {
    idle: { opacity: 0.45, scale: 1 },
    live: { opacity: 1, scale: 1 },
  },
  [
    {
      from: "idle",
      to: "live",
      duration: 250,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    },
    {
      from: "live",
      to: "idle",
      duration: 400,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    },
  ],
);
