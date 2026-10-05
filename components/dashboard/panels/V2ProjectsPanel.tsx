"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsDownUp,
  ChevronsUpDown,
  FolderKanban,
  GripVertical,
  ImageOff,
  Plus,
  RotateCw,
  Trash2,
  X,
} from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import {
  arrayToLines,
  linesToArray,
  lineFieldsFromStrings,
  requestJson,
  stringsFromLineFields,
} from "@/components/dashboard/api";
import { Alert } from "@/components/ui/dashboard/Alert";
import { Badge } from "@/components/ui/dashboard/Badge";
import { Button } from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import { ColorPicker } from "@/components/ui/dashboard/ColorPicker";
import { ConfirmDialog } from "@/components/ui/dashboard/ConfirmDialog";
import { EmptyState } from "@/components/ui/dashboard/EmptyState";
import { ImageUpload } from "@/components/ui/dashboard/ImageUpload";
import { Input } from "@/components/ui/dashboard/Input";
import { PageHeader } from "@/components/ui/dashboard/PageHeader";
import { ListSkeleton } from "@/components/ui/dashboard/Skeleton";
import { Textarea } from "@/components/ui/dashboard/Textarea";
import { SearchInput, Toolbar } from "@/components/ui/dashboard/Toolbar";
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
 * Every project is a collapsible row that expands into its editor in place —
 * no modal — so several can be open, compared and saved one by one.
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
 * what to warn about; `onSubmit` decides what to do with the warning. The same
 * keys exist on the stored record, so the list uses it to flag gaps per row.
 */
type ReelSlotKey = "year" | "discipline" | "role" | "problem" | "outcome" | "plateCaption";

const REEL_SLOTS: { key: ReelSlotKey; label: string }[] = [
  { key: "year", label: "Year" },
  { key: "discipline", label: "Discipline" },
  { key: "role", label: "Role" },
  { key: "problem", label: "Problem" },
  { key: "outcome", label: "Outcome" },
  { key: "plateCaption", label: "Plate caption" },
];

function missingReelSlots(values: Pick<V2ProjectForm, ReelSlotKey>) {
  return REEL_SLOTS.filter((slot) => !String(values[slot.key] ?? "").trim()).map(
    (slot) => slot.label,
  );
}

/** Small plate preview for a list row; falls back to an icon on the accent swatch. */
function PlateThumb({ project }: { project: V2ProjectRecord }) {
  return (
    <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md border border-dash-border bg-dash-field">
      {project.plateSrc ? (
        <Image
          src={project.plateSrc}
          alt=""
          fill
          sizes="80px"
          unoptimized
          className="object-cover"
          style={{ objectPosition: project.plateFocus || undefined }}
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-dash-muted">
          <ImageOff className="size-4" aria-hidden />
        </div>
      )}
      <span
        aria-hidden
        className="absolute bottom-1 left-1 size-2.5 rounded-full border border-dash-bg"
        style={{ background: project.accent || "#3b82f6" }}
      />
    </div>
  );
}


/** A titled block inside an expanded row: lighter than a card, divided by a rule. */
function EditorSection({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-dash-border pt-5 first:border-t-0 first:pt-0">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-dash-fg">{title}</h4>
          {subtitle ? <p className="mt-0.5 text-[13px] leading-relaxed text-dash-muted">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/**
 * The inline editor for one project (or a new one when `project` is absent).
 * Owns its form, so each open row saves independently. Stays open after a
 * save, reset to the saved values, with the confirmation right where you are.
 */
function ProjectEditor({
  project,
  onSaved,
  onCancel,
  onDirtyChange,
}: {
  project?: V2ProjectRecord;
  onSaved: (saved: V2ProjectRecord, created: boolean) => Promise<void> | void;
  onCancel: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const isEdit = Boolean(project);
  const form = useForm<V2ProjectForm>({ defaultValues: toFormValues(project) });
  const techLines = useFieldArray({ control: form.control, name: "techLines" });
  const cases = useFieldArray({ control: form.control, name: "cases" });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [warning, setWarning] = useState("");

  const dirty = form.formState.isDirty;
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  const onSubmit = form.handleSubmit(async (values) => {
    setStatus("");
    setWarning("");
    setError("");

    // Warn, do not block. A half-written project is a legitimate state to save —
    // the author may be waiting on a screenshot or a number they do not have
    // yet — so the editor names the gaps and lets the save through.
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
      setStatus(`Saved. Live at /work/${saved.slug}.`);
      if (missing.length) setWarning(`Empty reel slots: ${missing.join(", ")}.`);
      form.reset(toFormValues(saved));
      await onSaved(saved, !values.id);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save project.");
    }
  });

  const nameError = form.formState.errors.name?.message;
  const submitting = form.formState.isSubmitting;

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
        <EditorSection title="Basics" subtitle="Name, public URL and accent. Reorder from the list by dragging.">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Name"
              placeholder="CreBrains"
              error={nameError}
              {...form.register("name", { required: "Name is required." })}
            />
            <Input
              label="Slug"
              placeholder="crebrains"
              hint={
                isEdit
                  ? "The public URL: /work/<slug>. Changing it breaks links already shared. Renaming the project alone will not move it."
                  : "Leave empty to derive it from the name."
              }
              {...form.register("slug")}
            />
            <Controller
              name="accent"
              control={form.control}
              render={({ field }) => (
                <ColorPicker label="Accent color" value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </EditorSection>

        {/* The reel's meta line, in the order it renders: role · discipline · year. */}
        <EditorSection title="Meta line" subtitle="Shown above the title in the order role · discipline · year.">
          <div className="grid gap-4 md:grid-cols-3">
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
              hint="Text, not a number. The reel sets it in tabular mono."
              {...form.register("year")}
            />
          </div>
        </EditorSection>

        <EditorSection title="Problem and outcome" subtitle="One sentence each. Both have fixed slots in the reel frame.">
          <div className="grid gap-4">
            <Textarea
              label="Problem"
              rows={2}
              placeholder="One sentence: what was wrong before."
              {...form.register("problem")}
            />
            <Textarea
              label="Outcome"
              rows={2}
              placeholder="One sentence: what changed. The last line read before the control rail."
              {...form.register("outcome")}
            />
          </div>
        </EditorSection>

        <EditorSection title="Plate" subtitle="The frame's capture and the caption under it.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Controller
                name="plateSrc"
                control={form.control}
                render={({ field }) => (
                  <ImageUpload
                    label="Plate image"
                    value={field.value}
                    onChange={field.onChange}
                    hint="Leave empty and the reel draws its generated fallback instead."
                  />
                )}
              />
            </div>
            <Input
              label="Plate caption"
              placeholder="Product capture — deal dashboard"
              hint="Name what the plate is, honestly: a reader should never have to guess whether it is a screenshot or a drawing."
              {...form.register("plateCaption")}
            />
            <Input
              label="Plate focus"
              placeholder="50% 22%"
              hint="CSS object-position for the capture. Empty means centred."
              {...form.register("plateFocus")}
            />
          </div>
        </EditorSection>

        <EditorSection title="Links" subtitle="An empty field hides that link.">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Live URL"
              placeholder="https://crebrains.com"
              {...form.register("linkLive")}
            />
            <Input
              label="Source URL"
              placeholder="https://github.com/..."
              {...form.register("linkSource")}
            />
          </div>
        </EditorSection>

        <EditorSection
          title="Tech stack"
          subtitle="One technology per row."
          action={
            <Button variant="secondary" size="sm" onClick={() => techLines.append({ value: "" })}>
              <Plus aria-hidden />
              Add technology
            </Button>
          }
        >
          <div className="grid gap-2 md:grid-cols-2">
            {techLines.fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <Input
                    placeholder="e.g. Next.js"
                    aria-label={`Technology ${index + 1}`}
                    {...form.register(`techLines.${index}.value`)}
                  />
                </div>
                <Button
                  variant="ghost"
                  className="w-9 px-0"
                  disabled={techLines.fields.length <= 1}
                  onClick={() => techLines.remove(index)}
                  aria-label={`Remove technology ${index + 1}`}
                >
                  <X aria-hidden />
                </Button>
              </div>
            ))}
          </div>
        </EditorSection>

        {/*
          The case body. Blocks are rows in `v2_project_cases`, so they can be
          reordered and removed independently — but a block's paragraphs are
          one textarea, one per line, because they are always read and written
          together and a repeating single-line input is a miserable way to
          write three sentences of prose.
        */}
        <EditorSection
          title="Case study"
          subtitle="Shown in the reel's case sheet and on the full /work/[slug] page. One paragraph per line."
          action={
            <div className="flex items-center gap-2">
              <Badge>{cases.fields.length} block{cases.fields.length === 1 ? "" : "s"}</Badge>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => cases.append({ heading: "", bodyText: "" })}
              >
                <Plus aria-hidden />
                Add block
              </Button>
            </div>
          }
        >
          <ol className="space-y-3">
            {cases.fields.map((field, index) => (
              <li
                key={field.id}
                className="space-y-3 rounded-lg border border-dash-border bg-dash-bg p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-6 shrink-0 text-xs text-dash-muted tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1 basis-48">
                    <Input
                      placeholder="Heading, e.g. The deal, not the documents"
                      aria-label={`Block ${index + 1} heading`}
                      {...form.register(`cases.${index}.heading`)}
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      className="w-9 px-0"
                      disabled={index === 0}
                      onClick={() => cases.swap(index, index - 1)}
                      aria-label={`Move block ${index + 1} up`}
                      title="Move up"
                    >
                      <ChevronUp aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-9 px-0"
                      disabled={index === cases.fields.length - 1}
                      onClick={() => cases.swap(index, index + 1)}
                      aria-label={`Move block ${index + 1} down`}
                      title="Move down"
                    >
                      <ChevronDown aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-9 px-0 hover:text-dash-danger"
                      disabled={cases.fields.length <= 1}
                      onClick={() => cases.remove(index)}
                      aria-label={`Remove block ${index + 1}`}
                      title="Remove block"
                    >
                      <X aria-hidden />
                    </Button>
                  </div>
                </div>
                <Textarea
                  rows={4}
                  placeholder="One paragraph per line."
                  aria-label={`Block ${index + 1} body`}
                  {...form.register(`cases.${index}.bodyText`)}
                />
              </li>
            ))}
          </ol>
        </EditorSection>

      {error ? (
        <Alert tone="danger" title="Couldn't save project">
          {error}
        </Alert>
      ) : null}
      {warning ? <Alert tone="warning">{warning}</Alert> : null}

      <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 border-t border-dash-border pt-4">
        <p className="mr-auto text-[13px]" role="status">
          {submitting ? (
            <span className="text-dash-muted">Saving…</span>
          ) : dirty ? (
            <span className="text-dash-warning">Unsaved changes</span>
          ) : status ? (
            <span className="text-dash-success">{status}</span>
          ) : null}
        </p>
        <Button variant="ghost" onClick={onCancel} disabled={submitting}>
          {isEdit ? "Close" : "Cancel"}
        </Button>
        {isEdit ? (
          <Button
            variant="secondary"
            onClick={() => form.reset(toFormValues(project))}
            disabled={submitting || !dirty}
          >
            Revert
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting || (isEdit && !dirty)}>
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Create project"}
        </Button>
      </div>
    </form>
  );
}

/**
 * A list row that drags only from its grip, so clicking the row still toggles
 * the editor and text inside an open editor stays selectable. The grip also
 * takes ArrowUp/ArrowDown, since a pointer drag alone is not accessible.
 */
function SortableRow({
  project,
  className,
  dragDisabled,
  onDragEnd,
  onMove,
  children,
}: {
  project: V2ProjectRecord;
  className?: string;
  dragDisabled: boolean;
  onDragEnd: () => void;
  onMove: (delta: -1 | 1) => void;
  children: (handle: ReactNode) => ReactNode;
}) {
  const controls = useDragControls();

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    onMove(event.key === "ArrowUp" ? -1 : 1);
  };

  const handle = (
    <button
      type="button"
      aria-label={`Reorder ${project.name}. Drag, or use the arrow keys.`}
      title={dragDisabled ? "Clear the search to reorder" : "Drag to reorder"}
      disabled={dragDisabled}
      onPointerDown={(event) => {
        if (dragDisabled) return;
        event.preventDefault();
        controls.start(event);
      }}
      onKeyDown={onKeyDown}
      className="grid h-11 w-8 shrink-0 cursor-grab touch-none place-items-center rounded-md text-dash-muted transition-colors hover:bg-dash-raised hover:text-dash-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/60 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
    >
      <GripVertical aria-hidden className="size-4" />
    </button>
  );

  return (
    <Reorder.Item
      as="li"
      value={project}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className={`relative bg-dash-surface ${className ?? ""}`}
      whileDrag={{ zIndex: 10, boxShadow: "0 8px 24px rgb(0 0 0 / 0.35)" }}
    >
      {children(handle)}
    </Reorder.Item>
  );
}

type RowKey = number | "new";

export default function V2ProjectsPanel() {
  const [projects, setProjects] = useState<V2ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Set<RowKey>>(new Set());
  const [dirty, setDirty] = useState<Set<RowKey>>(new Set());
  /** Rows waiting on "discard unsaved changes?" before they collapse. */
  const [pendingClose, setPendingClose] = useState<RowKey[] | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<V2ProjectRecord | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [orderState, setOrderState] = useState<"idle" | "saving" | "saved">("idle");
  const listId = useId();
  /** Ids in the order last confirmed by the server, to skip no-op saves. */
  const savedOrderRef = useRef<number[]>([]);
  /** Latest list, for the drag-end handler (fires after the last reorder render). */
  const projectsRef = useRef(projects);
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await requestJson<V2ProjectRecord[]>("/api/dashboard/projects/v2");
      setProjects(data);
      savedOrderRef.current = data.map((p) => p.id);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load v2 projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const retry = () => {
    setError("");
    void load();
  };

  const setDirtyFor = (key: RowKey, value: boolean) =>
    setDirty((prev) => {
      if (prev.has(key) === value) return prev;
      const next = new Set(prev);
      if (value) next.add(key);
      else next.delete(key);
      return next;
    });

  const closeRows = (keys: RowKey[]) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      keys.forEach((key) => next.delete(key));
      return next;
    });
    setDirty((prev) => {
      const next = new Set(prev);
      keys.forEach((key) => next.delete(key));
      return next;
    });
  };

  /** Collapse rows, asking first if any of them hold unsaved edits. */
  const requestClose = (keys: RowKey[]) => {
    if (keys.some((key) => dirty.has(key))) setPendingClose(keys);
    else closeRows(keys);
  };

  const toggle = (key: RowKey) => {
    if (expanded.has(key)) requestClose([key]);
    else setExpanded((prev) => new Set(prev).add(key));
  };

  const addProject = () => {
    setStatus("");
    setExpanded((prev) => new Set(prev).add("new"));
    requestAnimationFrame(() =>
      document.getElementById(`${listId}-new`)?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const onSaved = async (saved: V2ProjectRecord, created: boolean) => {
    await load();
    if (created) {
      // Swap the blank editor for the stored project's own row, still open.
      closeRows(["new"]);
      setExpanded((prev) => new Set(prev).add(saved.id));
    }
  };

  const persistOrder = async (list: V2ProjectRecord[]) => {
    const order = list.map((p) => p.id);
    if (order.join() === savedOrderRef.current.join()) return;
    setOrderState("saving");
    setError("");
    try {
      await requestJson("/api/dashboard/projects/v2", {
        method: "PATCH",
        body: JSON.stringify({ order }),
      });
      savedOrderRef.current = order;
      setOrderState("saved");
    } catch (orderError) {
      setOrderState("idle");
      setError(orderError instanceof Error ? orderError.message : "Failed to save the new order.");
      // Put the list back the way the server has it.
      await load();
    }
  };

  const moveProject = (project: V2ProjectRecord, delta: -1 | 1) => {
    const from = projects.indexOf(project);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= projects.length) return;
    const next = [...projects];
    next.splice(to, 0, ...next.splice(from, 1));
    setProjects(next);
    void persistOrder(next);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletePending(true);
    setError("");
    try {
      await requestJson("/api/dashboard/projects/v2", {
        method: "DELETE",
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      setStatus(`Deleted “${deleteTarget.name}”.`);
      closeRows([deleteTarget.id]);
      setDeleteTarget(null);
      await load();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Failed to delete project.");
      // Close the confirm so the error alert on the page is not hidden behind it.
      setDeleteTarget(null);
    } finally {
      setDeletePending(false);
    }
  };

  const q = query.trim().toLowerCase();
  const visible = q
    ? projects.filter((p) =>
        [p.name, p.slug, p.discipline, p.role, p.year].some((v) => v?.toLowerCase().includes(q)),
      )
    : projects;
  const allOpen = visible.length > 0 && visible.every((p) => expanded.has(p.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="The scroll-driven reel on the homepage, the /work index and every /work/[slug] case page read these rows. Expand a project to edit it in place; edits go live immediately."
        actions={
          <Button onClick={addProject} disabled={expanded.has("new")}>
            <Plus aria-hidden />
            Add project
          </Button>
        }
      />

      {error ? (
        <Alert
          tone="danger"
          title={projects.length ? "Something went wrong" : "Couldn't load projects"}
          action={
            projects.length ? undefined : (
              <Button variant="secondary" size="sm" onClick={retry}>
                <RotateCw aria-hidden />
                Retry
              </Button>
            )
          }
        >
          {error}
        </Alert>
      ) : null}
      {status ? <Alert tone="success">{status}</Alert> : null}

      {expanded.has("new") ? (
        <section
          id={`${listId}-new`}
          className="scroll-mt-6 rounded-xl border border-dash-accent/40 bg-dash-surface"
          aria-label="New project"
        >
          <header className="flex items-center justify-between gap-3 border-b border-dash-border px-5 py-4">
            <div>
              <h3 className="text-[15px] font-semibold text-dash-fg">New project</h3>
              <p className="mt-0.5 text-[13px] text-dash-muted">It joins the reel once created.</p>
            </div>
          </header>
          <div className="p-5">
            <ProjectEditor
              onSaved={onSaved}
              onCancel={() => requestClose(["new"])}
              onDirtyChange={(value) => setDirtyFor("new", value)}
            />
          </div>
        </section>
      ) : null}

      {loading && !projects.length ? (
        <ListSkeleton rows={5} />
      ) : !projects.length ? (
        error || expanded.has("new") ? null : (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Run npm run db:seed:projects to load the shipped set, or add one."
            action={
              <Button onClick={addProject}>
                <Plus aria-hidden />
                Add project
              </Button>
            }
          />
        )
      ) : (
        <>
          <Toolbar className="mb-0">
            {projects.length > 5 ? (
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search by name, slug, discipline…"
                label="Search projects"
              />
            ) : null}
            <Button
              variant="secondary"
              size="sm"
              className="ml-auto"
              onClick={() =>
                allOpen
                  ? requestClose(visible.map((p) => p.id))
                  : setExpanded((prev) => new Set([...prev, ...visible.map((p) => p.id)]))
              }
            >
              {allOpen ? <ChevronsDownUp aria-hidden /> : <ChevronsUpDown aria-hidden />}
              {allOpen ? "Collapse all" : "Expand all"}
            </Button>
          </Toolbar>

          <Card
            flush
            title="Reel order"
            subtitle="The reel shows projects in this order. Drag a row by its handle to move it; the change saves on drop."
            headerSlot={
              <span className="flex items-center gap-3">
                {orderState !== "idle" ? (
                  <span className="text-xs text-dash-muted" aria-live="polite">
                    {orderState === "saving" ? "Saving order…" : "Order saved"}
                  </span>
                ) : null}
                <Badge>{projects.length} projects</Badge>
              </span>
            }
          >
            {visible.length ? (
              <Reorder.Group
                as="ul"
                axis="y"
                values={visible}
                // A filtered list is a subset, so dropping into it has no
                // meaning for the full order; handles are disabled meanwhile.
                onReorder={q ? () => {} : setProjects}
                className="divide-y divide-dash-border"
              >
                {visible.map((project) => {
                  const position = projects.indexOf(project) + 1;
                  const missing = missingReelSlots(project);
                  const open = expanded.has(project.id);
                  const unsaved = dirty.has(project.id);
                  const panelId = `${listId}-${project.id}`;
                  const meta = [
                    project.discipline,
                    project.year,
                    `${project.cases.length} case block${project.cases.length === 1 ? "" : "s"}`,
                  ].filter(Boolean);
                  return (
                    <SortableRow
                      key={project.id}
                      project={project}
                      dragDisabled={Boolean(q)}
                      onDragEnd={() => void persistOrder(projectsRef.current)}
                      onMove={(delta) => moveProject(project, delta)}
                    >
                      {(handle) => (
                    <div className={open ? "bg-dash-bg/40" : undefined}>
                      <div className="flex items-center gap-1 pl-1 pr-3 transition-colors hover:bg-dash-raised sm:pl-2">
                        {handle}
                        {/* The whole row toggles; delete sits outside it so buttons never nest. */}
                        <button
                          type="button"
                          onClick={() => toggle(project.id)}
                          aria-expanded={open}
                          aria-controls={panelId}
                          className="flex min-w-0 flex-1 flex-wrap items-center gap-3 py-3 pl-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dash-accent/60 sm:pl-4"
                        >
                          <ChevronRight
                            aria-hidden
                            className={`size-4 shrink-0 text-dash-muted transition-transform duration-200 ${open ? "rotate-90" : ""}`}
                          />
                          <span className="w-6 shrink-0 text-right text-xs text-dash-muted tabular-nums">
                            {String(position).padStart(2, "0")}
                          </span>
                          <PlateThumb project={project} />
                          <span className="min-w-0 flex-1 basis-40">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="truncate text-sm font-medium text-dash-fg">{project.name}</span>
                              {unsaved ? <Badge tone="accent">Unsaved</Badge> : null}
                              {missing.length ? (
                                <span title={`Empty: ${missing.join(", ")}`}>
                                  <Badge tone="warning">
                                    <AlertTriangle aria-hidden />
                                    {missing.length} empty slot{missing.length === 1 ? "" : "s"}
                                  </Badge>
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-dash-muted">
                              <span className="font-mono">/work/{project.slug}</span>
                              {meta.length ? ` · ${meta.join(" · ")}` : null}
                            </span>
                          </span>
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 px-0 hover:text-dash-danger"
                          onClick={() => setDeleteTarget(project)}
                          aria-label={`Delete ${project.name}`}
                          title="Delete"
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      </div>
                      {open ? (
                        <div id={panelId} className="border-t border-dash-border px-4 py-5 sm:px-6">
                          <ProjectEditor
                            project={project}
                            onSaved={onSaved}
                            onCancel={() => requestClose([project.id])}
                            onDirtyChange={(value) => setDirtyFor(project.id, value)}
                          />
                        </div>
                      ) : null}
                    </div>
                      )}
                    </SortableRow>
                  );
                })}
              </Reorder.Group>
            ) : (
              <p className="px-5 py-8 text-center text-sm text-dash-muted">
                No projects match &ldquo;{query}&rdquo;.
              </p>
            )}
          </Card>
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingClose)}
        onClose={() => setPendingClose(null)}
        onConfirm={() => {
          if (pendingClose) closeRows(pendingClose);
          setPendingClose(null);
        }}
        title="Discard unsaved changes?"
        message="You have edits that haven't been saved. Closing will throw them away."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        danger
      />

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
