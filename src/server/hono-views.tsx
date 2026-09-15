/** @jsxImportSource hono/jsx */

import type { Telemetry } from "@/lib/schemas";

export function TelemetryFragment({ telemetry }: { telemetry: Telemetry }) {
  return (
    <article class="hono-fragment" data-runtime={telemetry.runtime} data-seq={String(telemetry.seq)}>
      <header>
        <p class="kicker">Hono JSX · edge fragment</p>
        <h2>Server snapshot {telemetry.seq}</h2>
      </header>
      <dl>
        <div>
          <dt>Core temp</dt>
          <dd>{telemetry.coreTemp.toFixed(1)}°</dd>
        </div>
        <div>
          <dt>Edge lag</dt>
          <dd>{telemetry.edgeLagMs.toFixed(1)} ms</dd>
        </div>
        <div>
          <dt>Graph depth</dt>
          <dd>{telemetry.graphDepth}</dd>
        </div>
        <div>
          <dt>Runtime</dt>
          <dd>{telemetry.runtime}</dd>
        </div>
      </dl>
      <p class="stamp">Rendered {telemetry.generatedAt}</p>
    </article>
  );
}
