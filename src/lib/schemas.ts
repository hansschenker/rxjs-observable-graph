import { z } from "zod";

export const StationSchema = z.enum(["core", "edge", "hydrate"]);
export type Station = z.infer<typeof StationSchema>;

export const TelemetrySchema = z.object({
  seq: z.number().int().nonnegative(),
  coreTemp: z.number(),
  edgeLagMs: z.number(),
  graphDepth: z.number().int(),
  jobsQueued: z.number().int(),
  runtime: z.enum(["tanstack-start", "cloudflare-workers"]),
  generatedAt: z.string(),
});
export type Telemetry = z.infer<typeof TelemetrySchema>;

export const JobPrioritySchema = z.enum(["low", "normal", "high"]);
export type JobPriority = z.infer<typeof JobPrioritySchema>;

export const DispatchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name needs at least two characters")
    .max(40, "Keep names under 40 characters"),
  priority: JobPrioritySchema,
  payload: z.string().trim().max(200, "Payload is limited to 200 characters"),
});
export type DispatchInput = z.infer<typeof DispatchSchema>;

export const JobSchema = DispatchSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  status: z.enum(["queued", "running", "done"]),
});
export type Job = z.infer<typeof JobSchema>;

export const JobsSchema = z.object({
  jobs: z.array(JobSchema),
});

export const GraphEventSchema = z.object({
  id: z.string(),
  t: z.number(),
  node: z.string(),
  kind: z.enum(["next", "error", "complete", "subscribe"]),
  preview: z.string(),
});
export type GraphEvent = z.infer<typeof GraphEventSchema>;

export const HydrationSnapshotSchema = z.object({
  source: z.literal("ssr"),
  telemetry: TelemetrySchema,
  fragmentHtml: z.string(),
  renderedAt: z.string(),
});
export type HydrationSnapshot = z.infer<typeof HydrationSnapshotSchema>;
