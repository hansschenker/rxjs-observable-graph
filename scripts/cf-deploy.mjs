#!/usr/bin/env node
/**
 * Portable Cloudflare build/deploy. Sets DEPLOY_TARGET so Vite loads
 * @cloudflare/vite-plugin, then runs wrangler. Avoids Unix-only
 * `VAR=value cmd` in npm scripts (that fails on Windows as "Missing …").
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { delimiter, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const mode = process.argv.includes("--dev")
  ? "dev"
  : process.argv.includes("--build-only")
    ? "build"
    : "deploy";

const env = {
  ...process.env,
  DEPLOY_TARGET: "cloudflare",
  PATH: `${join(root, "node_modules/.bin")}${delimiter}${process.env.PATH ?? ""}`,
};


function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code}`));
    });
  });
}

const wranglerJs = join(root, "node_modules/wrangler/bin/wrangler.js");
const wranglerBin = existsSync(wranglerJs) ? wranglerJs : "wrangler";

try {
  if (mode === "dev") {
    await run(process.execPath, [wranglerBin, "dev"]);
  } else {
    await run(process.execPath, ["scripts/with-app-env.mjs", "vite", "build"]);
    if (mode === "deploy") {
      const worker = join(root, "dist/server/index.js");
      if (!existsSync(worker)) {
        console.error("[cf-deploy] Cloudflare build did not emit dist/server/index.js");
        process.exit(1);
      }
      // Generated config from the Vite Cloudflare plugin — not wrangler.jsonc's
      // virtual `@tanstack/react-start/server-entry`, which is not a real file.
      const generated = join(root, "dist/server/wrangler.json");
      if (existsSync(generated)) {
        await run(process.execPath, [wranglerBin, "deploy", "--config", generated]);
      } else {
        await run(process.execPath, [wranglerBin, "deploy"]);
      }
    }
  }
} catch (err) {
  console.error(`[cf-deploy] ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}
