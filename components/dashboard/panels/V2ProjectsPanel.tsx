"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2, X } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import {
  arrayToLines,
  linesToArray,
  lineFieldsFromStrings,
  requestJson,
  stringsFromLineFields,
} from "@/components/dashboard/api";
import { Button } from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import { ColorPicker } from "@/components/ui/dashboard/ColorPicker";
import { ConfirmDialog } from "@/components/ui/dashboard/ConfirmDialog";
import { Dialog } from "@/components/ui/dashboard/Dialog";
import { ImageUpload } from "@/components/ui/dashboard/ImageUpload";
import { Input } from "@/components/ui/dashboard/Input";
import { Textarea } from "@/components/ui/dashboard/Textarea";
import type { V2ProjectRecord } from "@/lib/dashboard/types";

/**
 * The v2 reel, editable.
 *
 * Every field on this form is something the reader actually sees, and the form
 * is grouped the way the reel reads it: the meta line (role · discipline ·
 * year), then the problem/outcome pair, then the plate, then the links, then the
 * long-form case body. That ordering is the point — the reel puts these in fixed
 * slots, so an author filling the form top to bottom is composing the frame in
 * the order it is read.
 *
 * Separate from `ProjectsPanel`, which edits the v1 `projects` table. They are
 * different records with different columns; see the note in `migrate.mjs`.
 */

type CaseForm = {
  heading: string;
  /** One paragraph per line. Prose is too long for a repeating single-line row. */
  bodyText: string;
};

type V2ProjectForm = {
  id?: number;
  slug: string;
  name: string;
  year: string;
  discipline: string;
  role: string;
  problem: string;
  outcome: string;
  techLines: { value: string }[];
  accent: string;
  plateSrc: string;
  plateCaption: string;
  plateFocus: string;
  linkLive: string;
  linkSource: string;
  sortOrder: number;
  cases: CaseForm[];
};

function toFormValues(project?: V2ProjectRecord): V2ProjectForm {
  if (!project) {
    return {
      slug: "",
      name: "",
      year: "",
      discipline: "",
      role: "",
      problem: "",
      outcome: "",
      techLines: lineFieldsFromStrings([]),
      accent: "#3b82f6",
      plateSrc: "",
      plateCaption: "",
      plateFocus: "",
      linkLive: "",
      linkSource: "",
      sortOrder: 0,
      cases: [{ heading: "", bodyText: "" }],
    };
  }

  return {
    id: project.id,
    slug: project.slug,
    name: project.name,
    year: project.year,
    discipline: project.discipline,
    role: project.role,
    problem: project.problem,
    outcome: project.outcome,
    techLines: lineFieldsFromStrings(project.tech),
    accent: project.accent,
    plateSrc: project.plateSrc,
    plateCaption: project.plateCaption,
    plateFocus: project.plateFocus,
    linkLive: project.linkLive,
    linkSource: project.linkSource,
    sortOrder: project.sortOrder,
    cases: project.cases.length
      ? project.cases.map((block) => ({
          heading: block.heading,
          bodyText: arrayToLines(block.body),
        }))
      : [{ heading: "", bodyText: "" }],
  };
}

/**
 * Fields the reel renders in a fixed slot.
 *
 * The reel is not a card grid that shrinks around missing copy — every frame
 * has a meta line, a problem line, an outcome line and a figure caption in the
 * same place, so a project saved without them ships a visible hole. This lists
 * what to warn about; `onSubmit` decides what to do with the warning.
 */
const REEL_SLOTS: { key: keyof V2ProjectForm; label: string }[] = [
  { key: "year", label: "Year" },
  { key: "discipline", label: "Discipline" },
  { key: "role", label: "Role" },
  { key: "problem", label: "Problem" },
  { key: "outcome", label: "Outcome" },
  { key: "plateCaption", label: "Plate caption" },
];

function missingReelSlots(values: V2ProjectForm) {
  return REEL_SLOTS.filter((slot) => !String(values[slot.key] ?? "").trim()).map(
    (slot) => slot.label,
  );
}

export default function V2ProjectsPanel() {
  const [projects, setProjects] = useState<V2ProjectRecord[]>([]);
  const [status, setStatus] = useState("");
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<V2ProjectRecord | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const form = useForm<V2ProjectForm>({ defaultValues: toFormValues() });
  const techLines = useFieldArray({ control: form.control, name: "techLines" });
  const cases = useFieldArray({ control: form.control, name: "cases" });

  const load = async () => {
    try {
      const data = await requestJson<V2ProjectRecord[]>("/api/dashboard/projects/v2");
      setProjects(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load v2 projects.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onSubmit = form.handleSubmit(async (values) => {
    setStatus("");
    setWarning("");
    setError("");

    // Warn, do not block. A half-written project is a legitimate state to save —
    // the author may be waiting on a screenshot or a number they do not have
    // yet — so the panel names the gaps and lets the save through rather than
    // trapping the work in the form. Move this above the request to hard-block.
    const missing = missingReelSlots(values);

    try {
      const payload = {
        id: values.id,
        slug: values.slug.trim(),
        name: values.name.trim(),
        year: values.year.trim(),
        discipline: values.discipline.trim(),
        role: values.role.trim(),
        problem: values.problem.trim(),
        outcome: values.outcome.trim(),
        tech: stringsFromLineFields(values.techLines),
        accent: values.accent.trim(),
        plateSrc: values.plateSrc.trim(),
        plateCaption: values.plateCaption.trim(),
        plateFocus: values.plateFocus.trim(),
        linkLive: values.linkLive.trim(),
        linkSource: values.linkSource.trim(),
        sortOrder: Number(values.sortOrder) || 0,
        cases: values.cases
          .map((block) => ({
            heading: block.heading.trim(),
            body: linesToArray(block.bodyText),
          }))
          .filter((block) => block.heading || block.body.length),
      };

      const saved = await requestJson<V2ProjectRecord>("/api/dashboard/projects/v2", {
        method: values.id ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      // The server owns the final slug — it suffixes on collision — so the
      // confirmation quotes what was actually stored rather than what was typed.
      setStatus(
        values.id
          ? `Saved. Live at /work/${saved.slug}.`
          : `Created. Live at /work/${saved.slug}.`,
      );
      if (missing.length) {
        setWarning(`Saved with empty reel slots: ${missing.join(", ")}.`);
      }

      setDialogOpen(false);
      form.reset(toFormValues());
      setEditingId(null);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save project.");
    }
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletePending(true);
    setError("");
    try {
      await requestJson("/api/dashboard/projects/v2", {
        method: "DELETE",
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      setStatus("Project deleted.");
      setDeleteTarget(null);
      if (editingId === deleteTarget.id) {
        form.reset(toFormValues());
        setEditingId(null);
      }
      await load();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Failed to delete project.");
    } finally {
      setDeletePending(false);
    }
  };

  const openCreateDialog = () => {
    form.reset(toFormValues());
    setEditingId(null);
    setWarning("");
    setDialogOpen(true);
  };

  const openEditDialog = (project: V2ProjectRecord) => {
    form.reset(toFormValues(project));
    setEditingId(project.id);
    setWarning("");
    setDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Portfolio</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Projects (v2 reel)</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-400">
          The scroll-driven reel on the v2 homepage, the <code>/work</code> index and every{" "}
          <code>/work/[slug]</code> case page all read these rows. Edits are live immediately — no
          deploy.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {status ? <span className="text-sm text-emerald-300">{status}</span> : null}
        {warning ? <span className="text-sm text-amber-300">{warning}</span> : null}
        {error ? <span className="text-sm text-rose-300">{error}</span> : null}
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Reel order</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">{projects.length} projects</span>
            <Button type="button" onClick={openCreateDialog}>
              Create project
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {projects.map((project, i) => (
            <div
              key={project.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-slate-950/50 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-7 shrink-0 font-mono text-xs tabular-nums text-slate-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="h-8 w-1 shrink-0 rounded-full"
                  style={{ background: project.accent || "#3b82f6" }}
                />
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{project.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    /work/{project.slug} · {project.discipline || "—"} · {project.year || "—"} ·{" "}
                    {project.cases.length} case block{project.cases.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" onClick={() => openEditDialog(project)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button type="button" variant="danger" onClick={() => setDeleteTarget(project)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {!projects.length ? (
            <p className="text-center text-sm text-slate-500">
              No v2 projects yet. Run <code>npm run db:seed:projects</code> to load the shipped set,
              or create one.
            </p>
          ) : null}
        </div>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? "Edit reel project" : "Create reel project"}
        description="Grouped the way the reel reads it: meta line, problem and outcome, the plate, the links, then the case body."
        size="full"
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <Input
            label="Name"
            placeholder="CreBrains"
            {...form.register("name", { required: true })}
          />
          <Input
            label="Slug"
            placeholder="crebrains"
            hint={
              editingId
                ? "The public URL: /work/<slug>. Changing it breaks links already shared. Renaming the project alone will not move it."
                : "Leave empty to derive it from the name."
            }
            {...form.register("slug")}
          />

          {/* The reel's meta line, in the order it renders: role · discipline · year. */}
          <Input label="Role" placeholder="Full-stack" {...form.register("role")} />
          <Input
            label="Discipline"
            placeholder="Platform"
            hint="One noun: Platform, Storefront, Search, Landing page."
            {...form.register("discipline")}
          />
          <Input
            label="Year"
            placeholder="2025"
            hint="Text, not a number — the reel sets it in tabular mono."
            {...form.register("year")}
          />
          <Input
            label="Sort order"
            type="number"
            hint="Lowest first. The reel is ordered newest to oldest."
            {...form.register("sortOrder", { valueAsNumber: true })}
          />

          <div className="md:col-span-2">
            <Textarea
              label="Problem"
              rows={2}
              placeholder="One sentence: what was wrong before."
              {...form.register("problem")}
            />
          </div>
          <div className="md:col-span-2">
            <Textarea
              label="Outcome"
              rows={2}
              placeholder="One sentence: what changed. The last line read before the control rail."
              {...form.register("outcome")}
            />
          </div>

          <Controller
            name="accent"
            control={form.control}
            render={({ field }) => (
              <ColorPicker label="Accent color" value={field.value} onChange={field.onChange} />
            )}
          />
          <Input
            label="Plate focus"
            placeholder="50% 22%"
            hint="CSS object-position for the capture. Empty means centred."
            {...form.register("plateFocus")}
          />

          <Controller
            name="plateSrc"
            control={form.control}
            render={({ field }) => (
              <div className="md:col-span-2">
                <ImageUpload
                  label="Plate image"
                  value={field.value}
                  onChange={field.onChange}
                  hint="The frame's capture. Leave empty and the reel draws its generated fallback instead."
                />
              </div>
            )}
          />
          <div className="md:col-span-2">
            <Input
              label="Plate caption"
              placeholder="Product capture — deal dashboard"
              hint="Names what the plate is, honestly. A reader should never have to guess whether they are looking at a screenshot or a drawing."
              {...form.register("plateCaption")}
            />
          </div>

          <Input
            label="Live URL"
            placeholder="https://crebrains.com"
            hint="Empty hides the link."
            {...form.register("linkLive")}
          />
          <Input
            label="Source URL"
            placeholder="https://github.com/..."
            hint="Empty hides the link."
            {...form.register("linkSource")}
          />

          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                Tech stack
              </span>
              <Button
                type="button"
                variant="ghost"
                className="h-9 px-2"
                onClick={() => techLines.append({ value: "" })}
                aria-label="Add technology"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {techLines.fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <Input
                      placeholder="e.g. Next.js"
                      {...form.register(`techLines.${index}.value`)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="shrink-0 px-2"
                    disabled={techLines.fields.length <= 1}
                    onClick={() => techLines.remove(index)}
                    aria-label="Remove technology"
                  >
                    <X className="h-4 w-4 text-slate-400" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/*
            The case body. Blocks are rows in `v2_project_cases`, so they can be
            reordered and removed independently — but a block's paragraphs are
            one textarea, one per line, because they are always read and written
            together and a repeating single-line input is a miserable way to
            write three sentences of prose.
          */}
          <div className="md:col-span-2 space-y-3 rounded-xl border border-white/8 bg-slate-950/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Case body
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Shown in the reel&rsquo;s case sheet and on the full <code>/work/[slug]</code>{" "}
                  page. One paragraph per line.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="h-9 px-2"
                onClick={() => cases.append({ heading: "", bodyText: "" })}
                aria-label="Add case block"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {cases.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-2 rounded-lg border border-white/[0.07] bg-slate-950/60 p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 shrink-0 font-mono text-xs tabular-nums text-slate-500">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Input
                        placeholder="Heading — e.g. The deal, not the documents"
                        {...form.register(`cases.${index}.heading`)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="shrink-0 px-2"
                      disabled={index === 0}
                      onClick={() => cases.swap(index, index - 1)}
                      aria-label="Move block up"
                    >
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="shrink-0 px-2"
                      disabled={index === cases.fields.length - 1}
                      onClick={() => cases.swap(index, index + 1)}
                      aria-label="Move block down"
                    >
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="shrink-0 px-2"
                      disabled={cases.fields.length <= 1}
                      onClick={() => cases.remove(index)}
                      aria-label="Remove case block"
                    >
                      <X className="h-4 w-4 text-slate-400" />
                    </Button>
                  </div>
                  <Textarea
                    rows={4}
                    placeholder="One paragraph per line."
                    {...form.register(`cases.${index}.bodyText`)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {editingId ? "Update project" : "Create project"}
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
        title="Delete project?"
        message={
          deleteTarget
            ? `Remove “${deleteTarget.name}”, its ${deleteTarget.cases.length} case block${
                deleteTarget.cases.length === 1 ? "" : "s"
              }, and the /work/${deleteTarget.slug} page? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        danger
        pending={deletePending}
      />
    </div>
  );
}
