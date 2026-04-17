"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { lineFieldsFromStrings, requestJson, stringsFromLineFields } from "@/components/dashboard/api";
import { Button } from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import { ColorPicker } from "@/components/ui/dashboard/ColorPicker";
import { ConfirmDialog } from "@/components/ui/dashboard/ConfirmDialog";
import { Dialog } from "@/components/ui/dashboard/Dialog";
import { Input } from "@/components/ui/dashboard/Input";
import type { ExperienceRecord } from "@/lib/dashboard/types";

type ExperienceForm = {
  id?: number;
  title: string;
  company: string;
  location: string;
  duration: string;
  type: string;
  descriptionLines: { value: string }[];
  techLines: { value: string }[];
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
      descriptionLines: lineFieldsFromStrings([]),
      techLines: lineFieldsFromStrings([]),
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExperienceRecord | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const form = useForm<ExperienceForm>({ defaultValues: toFormValues() });
  const descriptionLines = useFieldArray({ control: form.control, name: "descriptionLines" });
  const techLines = useFieldArray({ control: form.control, name: "techLines" });

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
        description: stringsFromLineFields(values.descriptionLines),
        tech: stringsFromLineFields(values.techLines),
        current: values.current,
        accent: values.accent.trim(),
        sortOrder: Number(values.sortOrder) || 0,
      };
      await requestJson("/api/dashboard/experience", {
        method: values.id ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setStatus(values.id ? "Experience updated." : "Experience created.");
      setDialogOpen(false);
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

  const openCreateDialog = () => {
    form.reset(toFormValues());
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEditDialog = (record: ExperienceRecord) => {
    form.reset(toFormValues(record));
    setEditingId(record.id);
    setDialogOpen(true);
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

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">All entries</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">{records.length} total</span>
            <Button type="button" onClick={openCreateDialog}>
              Create Experience
            </Button>
          </div>
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
                  onClick={() => openEditDialog(record)}
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

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? "Edit experience" : "Create experience"}
        description="Timeline entries with accent color, bullets, and tech tags."
        size="xl"
      >
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

          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">Highlights</span>
              <Button
                type="button"
                variant="ghost"
                className="h-9 px-2"
                onClick={() => descriptionLines.append({ value: "" })}
                aria-label="Add highlight"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {descriptionLines.fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <Input
                      placeholder="Bullet point…"
                      {...form.register(`descriptionLines.${index}.value`)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="shrink-0 px-2"
                    disabled={descriptionLines.fields.length <= 1}
                    onClick={() => descriptionLines.remove(index)}
                    aria-label="Remove highlight"
                  >
                    <Trash2 className="h-4 w-4 text-slate-400" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">Tech stack</span>
              <Button
                type="button"
                variant="ghost"
                className="h-9 px-2"
                onClick={() => techLines.append({ value: "" })}
                aria-label="Add tech"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {techLines.fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <Input placeholder="e.g. React" {...form.register(`techLines.${index}.value`)} />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="shrink-0 px-2"
                    disabled={techLines.fields.length <= 1}
                    onClick={() => techLines.remove(index)}
                    aria-label="Remove tech"
                  >
                    <Trash2 className="h-4 w-4 text-slate-400" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {editingId ? "Update" : "Create"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setDialogOpen(false);
                form.reset(toFormValues());
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Dialog>

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
