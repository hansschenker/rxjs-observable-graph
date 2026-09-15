import { createFileRoute } from "@tanstack/react-router";
import { LabFrame } from "@/components/lab-frame";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { panelTrigger, pulseTrigger, styleOf } from "@/rx/animations";
import { signal } from "@/rx/signal";
import { useConstant, useSignalValue } from "@/rx/react";

export const Route = createFileRoute("/animations")({
  component: AnimationsLab,
});

function AnimationsLab() {
  const panel = useConstant(() => signal("in", { name: "anim.panel" }));
  const pulse = useConstant(() => signal("live", { name: "anim.pulse" }));
  const panelStyle = useConstant(() => styleOf(panelTrigger, panel));
  const pulseStyle = useConstant(() => styleOf(pulseTrigger, pulse));
  const panelValue = useSignalValue(panel);
  const pulseValue = useSignalValue(pulse);
  const panelAnim = useSignalValue(panelStyle);
  const pulseAnim = useSignalValue(pulseStyle);

  return (
    <LabFrame
      kicker="Animations"
      title="Triggers, states, transitions."
      lede="Angular’s animation DSL, expressed as RxJS-driven style signals. States are interruptible CSS transitions — enter is slower than leave, and reduced motion disables both."
    >
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => panel.set(panelValue === "in" ? "out" : "in")}>
          Toggle panel
        </Button>
        <Button
          variant="secondary"
          onClick={() => pulse.set(pulseValue === "live" ? "idle" : "live")}
        >
          Toggle pulse
        </Button>
        <Badge>
          {panelTrigger.name}:{panelValue}
        </Badge>
      </div>
      <div
        className={cn(
          "rounded-xl bg-surface p-6 shadow-[var(--shadow-border)]",
          panelAnim.className,
        )}
        style={panelAnim.style}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn("size-2.5 rounded-full bg-accent", pulseAnim.className)}
            style={pulseAnim.style}
            aria-hidden="true"
          />
          <h2 className="font-display text-3xl text-fg">Panel trigger</h2>
        </div>
        <p className="mt-3 max-w-xl text-sm text-pretty text-muted">
          void → in uses 250ms of opacity, translate, and blur. in → out is 150ms
          and quieter, so the next surface can take focus.
        </p>
      </div>
    </LabFrame>
  );
}
