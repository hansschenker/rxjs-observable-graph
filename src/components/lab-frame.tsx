import type { ReactNode } from "react";
import { GraphInspector } from "@/components/graph-inspector";

export function LabFrame({
  kicker,
  title,
  lede,
  children,
}: {
  kicker: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
          {kicker}
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-balance text-fg md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-pretty text-muted">{lede}</p>
      </header>
      {children}
      <GraphInspector />
    </div>
  );
}
