import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  tone = "muted",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "muted" | "live" | "ok" | "warn";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase",
        tone === "muted" && "bg-elevated text-muted",
        tone === "live" && "bg-accent text-accent-fg",
        tone === "ok" && "bg-ok/15 text-ok",
        tone === "warn" && "bg-danger/15 text-danger",
        className,
      )}
      {...props}
    />
  );
}
