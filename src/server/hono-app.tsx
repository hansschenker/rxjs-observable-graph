/** @jsxImportSource hono/jsx */

/**
 * Cloudflare-portable Hono app.
 * The default export is a Workers-compatible fetch handler.
 * TanStack Start mounts the same graph at /api/hono/*.
 */
import { Hono } from "hono";
import { DispatchSchema, JobsSchema, TelemetrySchema } from "@/lib/schemas";
import {
  dispatchJob,
  getTelemetry,
  listJobs,
  peekTelemetry,
} from "./telemetry.server";
import { TelemetryFragment } from "./hono-views";

const honoApp = new Hono().basePath("/api/hono");

honoApp.get("/health", (c) =>
  c.json({
    ok: true,
    runtime: getTelemetry().runtime,
    contract: "cloudflare-workers",
  }),
);

honoApp.get("/telemetry", (c) => {
  const telemetry = TelemetrySchema.parse(getTelemetry());
  return c.json(telemetry);
});

honoApp.get("/jobs", (c) => {
  const payload = JobsSchema.parse({ jobs: listJobs() });
  return c.json(payload);
});

honoApp.post("/dispatch", async (c) => {
  const body = await c.req.json();
  const parsed = DispatchSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        error: "invalid_dispatch",
        issues: parsed.error.issues.map((issue) => issue.message),
      },
      400,
    );
  }
  const job = dispatchJob(parsed.data);
  return c.json(job, 201);
});

honoApp.get("/fragment", (c) => {
  const telemetry = peekTelemetry();
  return c.html(<TelemetryFragment telemetry={telemetry} />);
});

export { honoApp };

export default {
  fetch: (request: Request) => honoApp.fetch(request),
};
