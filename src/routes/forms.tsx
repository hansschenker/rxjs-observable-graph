import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { firstValueFrom } from "rxjs";
import { LabFrame } from "@/components/lab-frame";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DispatchSchema, JobSchema, type Job } from "@/lib/schemas";
import { FormControl, FormGroup } from "@/rx/forms";
import { http } from "@/rx/http";
import { useConstant, useSignalValue } from "@/rx/react";

export const Route = createFileRoute("/forms")({
  component: FormsLab,
});

function FormsLab() {
  const form = useConstant(
    () =>
      new FormGroup(
        {
          name: new FormControl("", DispatchSchema.shape.name, "dispatch.name"),
          priority: new FormControl(
            "normal" as const,
            DispatchSchema.shape.priority,
            "dispatch.priority",
          ),
          payload: new FormControl("", DispatchSchema.shape.payload, "dispatch.payload"),
        },
        "dispatch",
      ),
  );
  const name = useSignalValue(form.controls.name.state);
  const priority = useSignalValue(form.controls.priority.state);
  const payload = useSignalValue(form.controls.payload.state);
  const status = useSignalValue(form.status);
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    form.markAllTouched();
    if (form.status() !== "VALID") return;
    setPending(true);
    setError(null);
    try {
      const created = await firstValueFrom(
        http.post("/api/hono/dispatch", form.value(), JobSchema),
      );
      setJob(created);
      form.reset({ name: "", priority: "normal", payload: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dispatch failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <LabFrame
      kicker="Forms"
      title="Reactive forms, Zod at every hop."
      lede="Each control is a signal. The group is a computed projection. Submit pipes the value through the RxJS HTTP client into Hono, which validates the same schema on the edge."
    >
      <form
        onSubmit={submit}
        className="grid gap-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] md:grid-cols-2"
      >
        <div className="flex flex-col gap-2 md:col-span-1">
          <Label htmlFor="job-name">Job name</Label>
          <Input
            id="job-name"
            value={name.value}
            onBlur={() => form.controls.name.markAsTouched()}
            onChange={(event) => form.controls.name.setValue(event.target.value)}
            placeholder="orbit-18"
          />
          {name.touched && name.errors[0] ? (
            <p className="text-xs text-danger">{name.errors[0]}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="job-priority">Priority</Label>
          <Select
            id="job-priority"
            value={priority.value}
            onChange={(event) =>
              form.controls.priority.setValue(
                event.target.value as typeof priority.value,
              )
            }
          >
            <option value="low">low</option>
            <option value="normal">normal</option>
            <option value="high">high</option>
          </Select>
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="job-payload">Payload</Label>
          <Textarea
            id="job-payload"
            value={payload.value}
            onBlur={() => form.controls.payload.markAsTouched()}
            onChange={(event) => form.controls.payload.setValue(event.target.value)}
            placeholder="Fold the snapshot into the client graph"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Dispatching" : "Dispatch job"}
          </Button>
          <Badge tone={status === "VALID" ? "ok" : "warn"}>{status}</Badge>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {job ? (
            <p className="font-mono text-sm text-muted">
              queued {job.id} · {job.name}
            </p>
          ) : null}
        </div>
      </form>
    </LabFrame>
  );
}
