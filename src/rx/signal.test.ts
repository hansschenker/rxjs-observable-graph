import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computed, signal } from "./signal.ts";
import { FormControl, FormGroup } from "./forms.ts";
import { DispatchSchema } from "../lib/schemas.ts";
import { helixSpecs, runHelixSpecs } from "./testing.ts";
import { previewValue } from "./graph.ts";

describe("helix rx graph", () => {
  it("runs in-app specs", async () => {
    const results = await runHelixSpecs();
    const failed = results.filter((result) => !result.passed);
    assert.equal(failed.length, 0, failed.map((item) => item.detail).join("; "));
    assert.equal(results.length, helixSpecs.length);
  });

  it("computed reacts after producer updates", () => {
    const n = signal(1, { name: "n" });
    const doubled = computed(() => n() * 2, { name: "doubled" });
    assert.equal(doubled(), 2);
    n.set(5);
    assert.equal(doubled(), 10);
  });

  it("form control surfaces zod messages", () => {
    const control = new FormControl("", DispatchSchema.shape.name, "name");
    assert.equal(control.status(), "INVALID");
    control.setValue("core");
    assert.equal(control.status(), "VALID");
  });

  it("form group projects values", () => {
    const form = new FormGroup({
      name: new FormControl("ab", DispatchSchema.shape.name, "name"),
      priority: new FormControl(
        "low" as const,
        DispatchSchema.shape.priority,
        "priority",
      ),
      payload: new FormControl("ok", DispatchSchema.shape.payload, "payload"),
    });
    assert.equal(form.value().priority, "low");
    assert.equal(previewValue(1), "1");
  });
});
