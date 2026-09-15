# Helix — RxJS Observable Graph

Angular’s runtime rebuilt as one RxJS observable graph: signals, computed,
templates, forms, HTTP, SSR, hydration, tests, and motion.

The browser talks to [TanStack Query](https://tanstack.com/query). The edge is a
Cloudflare-portable [Hono](https://hono.dev) worker with Hono JSX. Shared
contracts live in Zod.

Live labs: signals · templates · forms · HTTP · routing · SSR · testing ·
animations · components.

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints (default port `8080`).

```bash
npm test          # graph specs + app-data / auth invariants
npm run typecheck
npm run build
```

## Layout

| Path | Role |
| --- | --- |
| `src/rx/` | Signals, computed, forms, `HttpClient`, templates, animations, graph trace |
| `src/server/` | Hono app (Workers-shaped `fetch`) and Hono JSX fragments |
| `src/routes/` | TanStack Start labs + `/api/hono/$` mount |
| `src/lib/schemas.ts` | Zod contracts shared by router, client, and server |
| `src/components/` | App shell, graph inspector, lab frames |

## Graph

Every `signal()` is a `BehaviorSubject`. `computed()` is a derived observable
with distinct-until-changed. Templates subscribe through a React hook that
unsubscribes on unmount. The inspector is a live marble of that graph.

HTTP is an Angular-shaped `HttpClient` over RxJS (`get$`, interceptors, retry,
timeout) with TanStack Query as the cache. Server HTML is Hono JSX; the same
payload hydrates the client graph.

## Stack

TanStack Start · React 19 · RxJS 7 · Hono · Zod · Vite · Tailwind 4
