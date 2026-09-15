import { createFileRoute } from "@tanstack/react-router";

async function handle({ request }: { request: Request }) {
  const { honoApp } = await import("@/server/hono-app");
  return honoApp.fetch(request);
}

export const Route = createFileRoute("/api/hono/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
    },
  },
});
