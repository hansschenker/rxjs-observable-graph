import type { DispatchInput, Job, Telemetry } from "@/lib/schemas";

type Store = {
  seq: number;
  jobs: Job[];
};

const store: Store = {
  seq: 12,
  jobs: [
    {
      id: "job-orbit-4",
      name: "orbit-4",
      priority: "high",
      payload: "fold the hydration snapshot into the client graph",
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      status: "running",
    },
    {
      id: "job-edge-lag",
      name: "edge-lag",
      priority: "normal",
      payload: "measure hono hop latency",
      createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
      status: "done",
    },
  ],
};

export function edgeRuntime(): Telemetry["runtime"] {
  const g = globalThis as Record<string, unknown>;
  if (typeof g.WebSocketPair !== "undefined" && typeof g.caches !== "undefined") {
    return "cloudflare-workers";
  }
  return "tanstack-start";
}

let last: Telemetry | null = null;

export function getTelemetry(): Telemetry {
  store.seq += 1;
  const wave = Math.sin(store.seq / 7);
  last = {
    seq: store.seq,
    coreTemp: Number((48 + wave * 9 + (store.seq % 4) * 0.3).toFixed(2)),
    edgeLagMs: Number((12 + Math.abs(wave) * 18).toFixed(1)),
    graphDepth: 8,
    jobsQueued: store.jobs.filter((job) => job.status !== "done").length,
    runtime: edgeRuntime(),
    generatedAt: new Date().toISOString(),
  };
  return last;
}

export function peekTelemetry(): Telemetry {
  return last ?? getTelemetry();
}

export function listJobs(): Job[] {
  return store.jobs;
}

export function dispatchJob(input: DispatchInput): Job {
  const job: Job = {
    ...input,
    id: `job-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    status: "queued",
  };
  store.jobs = [job, ...store.jobs].slice(0, 24);
  return job;
}
