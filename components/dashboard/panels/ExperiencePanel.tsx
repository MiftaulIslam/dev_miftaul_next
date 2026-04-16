"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { arrayToLines, linesToArray, requestJson } from "@/components/dashboard/api";
import { Button } from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import { ColorPicker } from "@/components/ui/dashboard/ColorPicker";
import { ConfirmDialog } from "@/components/ui/dashboard/ConfirmDialog";
import { Input } from "@/components/ui/dashboard/Input";
import { Textarea } from "@/components/ui/dashboard/Textarea";
import type { ExperienceRecord } from "@/lib/dashboard/types";

type ExperienceForm = {
  id?: number;
  title: string;
  company: string;
  location: string;
  duration: string;
  type: string;
  descriptionText: string;
  techText: string;
  current: boolean;
  accent: string;
  sortOrder: number;
};

function toFormValues(experience?: ExperienceRecord): ExperienceForm {
  if (!experience) {
    return {
      title: "",
      company: "",
      location: "",
      duration: "",
      type: "",
      descriptionText: "",
      techText: "",
      current: false,
      accent: "#3b82f6",
      sortOrder: 0,
    };
  }

  return {
    id: experience.id,
    title: experience.title,
    company: experience.company,
    location: experience.location,
    duration: experience.duration,
    type: experience.type,
    descriptionText: arrayToLines(experience.description),
    techText: arrayToLines(experience.tech),
    current: experience.current,
    accent: experience.accent,
    sortOrder: experience.sortOrder,
  };
}

export default function ExperiencePanel() {
  const [records, setRecords] = useState<ExperienceRecord[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExperienceRecord | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const form = useForm<ExperienceForm>({ defaultValues: toFormValues() });

  const load = async () => {
    try {
      const data = await requestJson<ExperienceRecord[]>("/api/dashboard/experience");
      setRecords(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load experiences.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onSubmit = form.handleSubmit(async (values) => {
    setStatus("");
    setError("");
    try {
      const payload = {
        id: values.id,
        title: values.title.trim(),
        company: values.company.trim(),
        location: values.location.trim(),
        duration: values.duration.trim(),
        type: values.type.trim(),
        description: linesToArray(values.descriptionText),
        tech: linesToArray(values.techText),
        current: values.current,
        accent: values.accent.trim(),
        sortOrder: Number(values.sortOrder) || 0,
      };
      await requestJson("/api/dashboard/experience", {
        method: values.id ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setStatus(values.id ? "Experience updated." : "Experience created.");
      form.reset(toFormValues());
      setEditingId(null);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save experience.");
    }
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletePending(true);
    setError("");
    try {
      await requestJson("/api/dashboard/experience", {
        method: "DELETE",
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      setStatus("Experience deleted.");
      setDeleteTarget(null);
      if (editingId === deleteTarget.id) {
        form.reset(toFormValues());
        setEditingId(null);
      }
      await load();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Failed to delete experience.");
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Career</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Experience</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-400">
          Timeline entries with accent color, bullets, and tech tags.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {status ? <span className="text-sm text-emerald-300">{status}</span> : null}
        {error ? <span className="text-sm text-rose-300">{error}</span> : null}
      </div>

      <Card title={editingId ? "Edit experience" : "New experience"}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <Input label="Title" placeholder="Full Stack Developer" {...form.register("title", { required: true })} />
          <Input label="Company" placeholder="Acme Inc." {...form.register("company", { required: true })} />
          <Input label="Location" placeholder="Remote" {...form.register("location")} />
          <Input label="Duration" placeholder="Jan 2024 – Present" {...form.register("duration")} />
          <Input label="Type" placeholder="Full-time" {...form.register("type")} />
          <Controller
            name="accent"
            control={form.control}
            render={({ field }) => (
              <ColorPicker label="Accent color" value={field.value} onChange={field.onChange} />
            )}
          />
          <Input
            label="Sort order"
            type="number"
            {...form.register("sortOrder", { valueAsNumber: true })}
          />
          <label className="flex items-center gap-2 text-sm text-slate-300 md:col-span-2">
            <input type="checkbox" {...form.register("current")} className="h-4 w-4 rounded border-white/20" />
            Current role
          </label>

          <Textarea
            label="Highlights (one line per bullet)"
            placeholder="Led a team of…&#10;Shipped X to production…"
            className="md:col-span-2"
            rows={5}
            {...form.register("descriptionText")}
          />
          <Textarea
            label="Tech stack (one per line)"
            placeholder="React&#10;AWS"
            className="md:col-span-2"
            rows={3}
            {...form.register("techText")}
          />

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {editingId ? "Update" : "Create"}
            </Button>
            {editingId ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  form.reset(toFormValues());
                  setEditingId(null);
                }}
              >
                Cancel edit
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">All entries</h3>
          <span className="text-xs text-slate-500">{records.length} total</span>
        </div>
        <div className="space-y-2">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-slate-950/50 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-8 w-1 shrink-0 rounded-full"
                  style={{ background: record.accent || "#3b82f6" }}
                />
                <div className="min-w-0">
                  <p className="font-medium text-white">{record.title}</p>
                  <p className="text-xs text-slate-500">
                    {record.company} · {record.duration}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    form.reset(toFormValues(record));
                    setEditingId(record.id);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button type="button" variant="danger" onClick={() => setDeleteTarget(record)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {!records.length ? (
            <p className="text-center text-sm text-slate-500">No experience entries yet.</p>
          ) : null}
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete experience?"
        message={
          deleteTarget ? `Remove “${deleteTarget.title}” at ${deleteTarget.company}?` : ""
        }
        confirmLabel="Delete"
        danger
        pending={deletePending}
      />
    </div>
  );
}
