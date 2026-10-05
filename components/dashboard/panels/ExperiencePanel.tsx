"use client";

import { useEffect, useState } from "react";
import { Briefcase, Pencil, Plus, RotateCw, Trash2, X } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { lineFieldsFromStrings, requestJson, stringsFromLineFields } from "@/components/dashboard/api";
import { Alert } from "@/components/ui/dashboard/Alert";
import { Badge } from "@/components/ui/dashboard/Badge";
import { Button } from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import { ColorPicker } from "@/components/ui/dashboard/ColorPicker";
import { ConfirmDialog } from "@/components/ui/dashboard/ConfirmDialog";
import { Dialog } from "@/components/ui/dashboard/Dialog";
import { EmptyState } from "@/components/ui/dashboard/EmptyState";
import { Input } from "@/components/ui/dashboard/Input";
import { PageHeader } from "@/components/ui/dashboard/PageHeader";
import { ListSkeleton } from "@/components/ui/dashboard/Skeleton";
import { hintClass, labelClass } from "@/components/ui/dashboard/fieldStyles";
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
    descriptionLines: lineFieldsFromStrings(experience.description),
    techLines: lineFieldsFromStrings(experience.tech),
    current: experience.current,
    accent: experience.accent,
    sortOrder: experience.sortOrder,
  };
}

export default function ExperiencePanel() {
  const [records, setRecords] = useState<ExperienceRecord[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
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
      setLoadError("");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load experiences.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const retry = () => {
    setLoading(true);
    setLoadError("");
    void load();
  };

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
      setStatus(values.id ? "Role updated." : "Role added.");
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
      setStatus("Role deleted.");
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
    setError("");
    setStatus("");
    setDialogOpen(true);
  };

  const openEditDialog = (record: ExperienceRecord) => {
    form.reset(toFormValues(record));
    setEditingId(record.id);
    setError("");
    setStatus("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    form.reset(toFormValues());
    setEditingId(null);
  };

  const { errors, isSubmitting } = form.formState;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Experience"
        description="Roles on your career timeline, each with highlights, tech tags and an accent colour."
        actions={
          <Button onClick={openCreateDialog}>
            <Plus />
            Add role
          </Button>
        }
      />

      {status ? <Alert tone="success">{status}</Alert> : null}
      {error && !dialogOpen ? <Alert tone="danger">{error}</Alert> : null}

      {loading ? (
        <ListSkeleton rows={4} />
      ) : loadError ? (
        <Alert
          tone="danger"
          title="Couldn’t load roles"
          action={
            <Button size="sm" variant="secondary" onClick={retry}>
              <RotateCw />
              Retry
            </Button>
          }
        >
          {loadError}
        </Alert>
      ) : !records.length ? (
        <EmptyState
          icon={Briefcase}
          title="No roles yet"
          description="Add your first role to start the career timeline."
          action={
            <Button onClick={openCreateDialog}>
              <Plus />
              Add role
            </Button>
          }
        />
      ) : (
        <Card title="Roles" flush headerSlot={<Badge>{records.length} total</Badge>}>
          <ul className="divide-y divide-dash-border">
            {records.map((record) => (
              <li
                key={record.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 transition-colors hover:bg-dash-raised"
              >
                <span
                  aria-hidden
                  className="h-9 w-1 shrink-0 rounded-full"
                  style={{ background: record.accent || "#3b82f6" }}
                />
                <div className="min-w-0 flex-1 basis-48">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-dash-fg">{record.title}</p>
                    {record.current ? <Badge tone="success">Current</Badge> : null}
                  </div>
                  <p className="mt-0.5 truncate text-[13px] text-dash-fg-2">
                    {[record.company, record.type, record.location].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <p className="text-[13px] tabular-nums text-dash-muted sm:w-44 sm:text-right">
                  {record.duration || "No dates"}
                </p>
                <div className="ml-auto flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 px-0"
                    onClick={() => openEditDialog(record)}
                    aria-label={`Edit ${record.title}`}
                    title="Edit"
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 px-0 hover:text-dash-danger"
                    onClick={() => setDeleteTarget(record)}
                    aria-label={`Delete ${record.title}`}
                    title="Delete"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        title={editingId ? "Edit role" : "Add role"}
        description="Shown as one entry on the career timeline."
        size="xl"
      >
        <form className="space-y-6" onSubmit={onSubmit}>
          {error ? (
            <Alert tone="danger" title="Role not saved">
              {error}
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Title"
              placeholder="Full stack developer"
              error={errors.title ? "Title is required." : undefined}
              {...form.register("title", { required: true })}
            />
            <Input
              label="Company"
              placeholder="Acme Inc."
              error={errors.company ? "Company is required." : undefined}
              {...form.register("company", { required: true })}
            />
            <Input label="Location" placeholder="Remote" {...form.register("location")} />
            <Input label="Employment type" placeholder="Full-time" {...form.register("type")} />
            <Input
              label="Dates"
              placeholder="Jan 2024 – Present"
              hint="Shown exactly as typed."
              className="tabular-nums"
              {...form.register("duration")}
            />
            <Input
              label="Sort order"
              type="number"
              hint="Controls the position in the timeline."
              className="tabular-nums"
              {...form.register("sortOrder", { valueAsNumber: true })}
            />
            <Controller
              name="accent"
              control={form.control}
              render={({ field }) => <ColorPicker label="Accent colour" value={field.value} onChange={field.onChange} />}
            />
            <label className="flex cursor-pointer items-start gap-3 self-end rounded-lg border border-dash-border-strong bg-dash-field p-3 transition-colors hover:bg-dash-raised has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-dash-accent/60">
              <input
                type="checkbox"
                {...form.register("current")}
                className="mt-0.5 size-4 shrink-0 accent-dash-accent focus:outline-none"
              />
              <span>
                <span className="block text-sm font-medium text-dash-fg">Current role</span>
                <span className={hintClass}>Marks this role as ongoing.</span>
              </span>
            </label>
          </div>

          <fieldset className="border-t border-dash-border pt-5">
            <legend className={labelClass}>Highlights</legend>
            <p className={hintClass}>One bullet per row. Empty rows are dropped.</p>
            <div className="mt-2 space-y-2">
              {descriptionLines.fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <Input
                      aria-label={`Highlight ${index + 1}`}
                      placeholder="What you did and its impact…"
                      {...form.register(`descriptionLines.${index}.value`)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    className="w-9 px-0"
                    disabled={descriptionLines.fields.length <= 1}
                    onClick={() => descriptionLines.remove(index)}
                    aria-label={`Remove highlight ${index + 1}`}
                    title="Remove"
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </div>
            <Button size="sm" variant="ghost" className="mt-2" onClick={() => descriptionLines.append({ value: "" })}>
              <Plus />
              Add highlight
            </Button>
          </fieldset>

          <fieldset className="border-t border-dash-border pt-5">
            <legend className={labelClass}>Tech stack</legend>
            <p className={hintClass}>Shown as tags on the entry.</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {techLines.fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <Input
                      aria-label={`Technology ${index + 1}`}
                      placeholder="e.g. React"
                      {...form.register(`techLines.${index}.value`)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    className="w-9 px-0"
                    disabled={techLines.fields.length <= 1}
                    onClick={() => techLines.remove(index)}
                    aria-label={`Remove technology ${index + 1}`}
                    title="Remove"
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </div>
            <Button size="sm" variant="ghost" className="mt-2" onClick={() => techLines.append({ value: "" })}>
              <Plus />
              Add technology
            </Button>
          </fieldset>

          <div className="flex flex-wrap justify-end gap-2 border-t border-dash-border pt-4">
            <Button variant="ghost" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : editingId ? "Save changes" : "Add role"}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete role?"
        message={
          deleteTarget
            ? `Remove “${deleteTarget.title}” at ${deleteTarget.company} from the timeline? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        danger
        pending={deletePending}
      />
    </div>
  );
}
