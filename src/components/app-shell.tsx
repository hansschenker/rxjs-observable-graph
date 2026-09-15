import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { labs } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { markHydrated, hydrationPhase } from "@/rx/hydration";
import { useIsHydrated, useSignalValue } from "@/rx/react";
import { Badge } from "@/components/ui/badge";

export function AppShell({
  children,
  pathname,
}: {
  children: React.ReactNode;
  pathname: string;
}) {
  const hydrated = useIsHydrated();
  const phase = useSignalValue(hydrationPhase);

  useEffect(() => {
    markHydrated();
  }, []);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg"
      >
        Skip to content
      </a>
      <div className="mx-auto grid min-h-dvh w-full min-w-0 max-w-[1400px] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="min-w-0 border-b border-border lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3 px-4 py-4 lg:flex-col lg:items-start lg:px-5 lg:py-6">
            <Link to="/" className="group block">
              <p className="font-display text-2xl leading-none tracking-tight text-fg">
                Helix
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">
                Observable graph
              </p>
            </Link>
            <Badge tone={hydrated ? "ok" : "muted"}>
              {hydrated ? "hydrated" : phase}
            </Badge>
          </div>
          <nav
            aria-label="Labs"
            className="flex flex-wrap gap-1 px-3 pb-3 lg:flex-col lg:flex-nowrap lg:px-3 lg:pb-8"
          >
            {labs.map((lab) => {
              const active =
                lab.to === "/"
                  ? pathname === "/"
                  : pathname === lab.to || pathname.startsWith(`${lab.to}/`);
              return (
                <Link
                  key={lab.to}
                  to={lab.to}
                  className={cn(
                    "flex min-h-11 min-w-fit items-center justify-between gap-3 rounded-md px-3 text-sm transition-colors duration-150",
                    active
                      ? "bg-elevated text-fg"
                      : "text-muted hover:bg-elevated/70 hover:text-fg",
                  )}
                >
                  <span>{lab.label}</span>
                  <span className="hidden font-mono text-[10px] uppercase tracking-wider text-faint lg:inline">
                    {lab.kicker}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <main id="main" className="min-w-0 px-4 py-6 md:px-8 md:py-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
