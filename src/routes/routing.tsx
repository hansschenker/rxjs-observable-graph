import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { LabFrame } from "@/components/lab-frame";
import { cn } from "@/lib/utils";
import { StationSchema } from "@/lib/schemas";

const searchSchema = z.object({
  view: z.enum(["map", "trace"]).default("map").catch("map"),
});

export const Route = createFileRoute("/routing")({
  validateSearch: (search) => searchSchema.parse(search),
  component: RoutingLab,
});

const stations = StationSchema.options;

function RoutingLab() {
  const { view } = Route.useSearch();

  return (
    <LabFrame
      kicker="Routing"
      title="Zod types the router."
      lede="TanStack Router params and search are parsed with Zod. The station child is a typed nested route; an Observable-style guard delays the loader so the graph can record navigation."
    >
      <div className="flex flex-wrap gap-2">
        {stations.map((station) => (
          <Link
            key={station}
            to="/routing/$station"
            params={{ station }}
            search={{ view }}
            className="inline-flex h-11 items-center rounded-md bg-elevated px-4 text-sm text-fg shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
          >
            {station}
          </Link>
        ))}
        <Link
          to="/routing"
          search={{ view: view === "map" ? "trace" : "map" }}
          className={cn(
            "inline-flex h-11 items-center rounded-md px-4 text-sm text-muted",
          )}
        >
          Search view: {view}
        </Link>
      </div>
      <Outlet />
    </LabFrame>
  );
}
