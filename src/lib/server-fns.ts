import { createServerFn } from "@tanstack/react-start";
import { HydrationSnapshotSchema } from "./schemas";

export const getHydrationSnapshot = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getTelemetry } = await import("@/server/telemetry.server");
    const { honoApp } = await import("@/server/hono-app");
    const telemetry = getTelemetry();
    const fragment = await honoApp.request("/api/hono/fragment");
    const fragmentHtml = await fragment.text();
    return HydrationSnapshotSchema.parse({
      source: "ssr",
      telemetry,
      fragmentHtml,
      renderedAt: new Date().toISOString(),
    });
  },
);

export const getServerTelemetry = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getTelemetry } = await import("@/server/telemetry.server");
    return getTelemetry();
  },
);
