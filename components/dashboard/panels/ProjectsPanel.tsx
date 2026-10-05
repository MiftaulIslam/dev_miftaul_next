"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FolderKanban, ImageOff, Pencil, Plus, RotateCw, Star, Trash2, X } from "lucide-react";
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
import { ImageUpload } from "@/components/ui/dashboard/ImageUpload";
import { Input } from "@/components/ui/dashboard/Input";
import { PageHeader } from "@/components/ui/dashboard/PageHeader";
import { ListSkeleton } from "@/components/ui/dashboard/Skeleton";
import { SearchInput, Toolbar } from "@/components/ui/dashboard/Toolbar";
import type { ProjectRecord } from "@/lib/dashboard/types";

type ProjectForm = {
  id?: number;
  title: string;
  subtitle: string;
  role: string;
  descriptionLines: { value: string }[];
  image: string;
  galleryImages: string[];
  techLines: { value: string }[];
  github: string;
  demo: string;
  featured: boolean;
  accent: string;
  tag: string;
  sortOrder: number;
};

function toFormValues(project?: ProjectRecord): ProjectForm {
  if (!project) {
    return {
      title: "",
      subtitle: "",
      role: "",
      descriptionLines: lineFieldsFromStrings([]),
      image: "",
      galleryImages: [],
      techLines: lineFieldsFromStrings([]),
      github: "#",
      demo: "#",
      featured: false,
      accent: "#3b82f6",
      tag: "",
      sortOrder: 0,
    };
  }

  return {
    id: project.id,
    title: project.title,
    subtitle: project.subtitle,
    role: project.role,
    descriptionLines: lineFieldsFromStrings(project.description),
    image: project.image,
    galleryImages: [...(project.images ?? [])],
    techLines: lineFieldsFromStrings(project.tech),
    github: project.github,
    demo: project.demo,
    featured: project.featured,
    accent: project.accent,
    tag: project.tag,
    sortOrder: project.sortOrder,
  };
}

/** Small primary-image preview for a list row; falls back to an icon. */
function ProjectThumb({ project }: { project: ProjectRecord }) {
  return (
    <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md border border-dash-border bg-dash-field">
      {project.image ? (
        <Image src={project.image} alt="" fill sizes="80px" unoptimized className="object-cover" />
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

export default function ProjectsPanel() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectRecord | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const form = useForm<ProjectForm>({ defaultValues: toFormValues() });
  const descriptionLines = useFieldArray({ control: form.control, name: "descriptionLines" });
  const techLines = useFieldArray({ control: form.control, name: "techLines" });

  const load = async () => {
    setLoading(true);
    try {
      const data = await requestJson<ProjectRecord[]>("/api/dashboard/projects");
      setProjects(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load projects.");
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

  const onSubmit = form.handleSubmit(async (values) => {
    setStatus("");
    setError("");
    try {
      const payload = {
        id: values.id,
        title: values.title.trim(),
        subtitle: values.subtitle.trim(),
        role: values.role.trim(),
        description: stringsFromLineFields(values.descriptionLines),
        image: values.image.trim(),
        images: values.galleryImages.map((u) => u.trim()).filter(Boolean),
        tech: stringsFromLineFields(values.techLines),
        github: values.github.trim(),
        demo: values.demo.trim(),
        featured: values.featured,
        accent: values.accent.trim(),
        tag: values.tag.trim(),
        sortOrder: Number(values.sortOrder) || 0,
      };

      await requestJson("/api/dashboard/projects", {
        method: values.id ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setStatus(values.id ? "Project updated." : "Project created.");
      setDialogOpen(false);
      form.reset(toFormValues());
      setEditingId(null);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save project.");
    }
  });

  const removeGalleryAt = (index: number) => {
    const cur = form.getValues("galleryImages");
    form.setValue(
      "galleryImages",
      cur.filter((_, i) => i !== index),
    );
  };

  const appendGallery = (url: string) => {
    if (!url.trim()) return;
    const cur = form.getValues("galleryImages");
    if (cur.includes(url)) return;
    form.setValue("galleryImages", [...cur, url]);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletePending(true);
    setError("");
    try {
      await requestJson("/api/dashboard/projects", {
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
      // Close the confirm so the error alert on the page is not hidden behind it.
      setDeleteTarget(null);
    } finally {
      setDeletePending(false);
    }
  };

  const openCreateDialog = () => {
    form.reset(toFormValues());
    setEditingId(null);
    setError("");
    setDialogOpen(true);
  };

  const openEditDialog = (project: ProjectRecord) => {
    form.reset(toFormValues(project));
    setEditingId(project.id);
    setError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    form.reset(toFormValues());
    setEditingId(null);
  };

  const q = query.trim().toLowerCase();
  const visible = q
    ? projects.filter((p) =>
        [p.title, p.subtitle, p.role, p.tag].some((v) => v?.toLowerCase().includes(q)),
      )
    : projects;

  const titleError = form.formState.errors.title?.message;
  const submitting = form.formState.isSubmitting;
  const galleryImages = form.watch("galleryImages");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects (v1)"
        description="Legacy case studies with gallery images, bullets and tech tags. Changes here only affect the v1 site, not the v2 reel."
        actions={
          <Button onClick={openCreateDialog}>
            <Plus aria-hidden />
            Add project
          </Button>
        }
      />

      {error && !dialogOpen ? (
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

      {loading && !projects.length ? (
        <ListSkeleton rows={5} />
      ) : !projects.length ? (
        error ? null : (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Add a case study to show it on the v1 site."
            action={
              <Button onClick={openCreateDialog}>
                <Plus aria-hidden />
                Add project
              </Button>
            }
          />
        )
      ) : (
        <>
          {projects.length > 5 ? (
            <Toolbar className="mb-0">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search by title, role, tag…"
                label="Search projects"
              />
            </Toolbar>
          ) : null}

          <Card flush title="All projects" headerSlot={<Badge>{projects.length} total</Badge>}>
            {visible.length ? (
              <ul className="divide-y divide-dash-border">
                {visible.map((project) => {
                  const meta = [project.subtitle, project.role].filter(Boolean);
                  return (
                    <li
                      key={project.id}
                      className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-dash-raised"
                    >
                      <ProjectThumb project={project} />
                      <div className="min-w-0 flex-1 basis-40">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditDialog(project)}
                            className="truncate rounded text-left text-sm font-medium text-dash-fg hover:text-dash-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/60"
                          >
                            {project.title}
                          </button>
                          {project.featured ? (
                            <Badge tone="accent">
                              <Star aria-hidden />
                              Featured
                            </Badge>
                          ) : null}
                          {project.tag ? <Badge>{project.tag}</Badge> : null}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-dash-muted">
                          {meta.length ? meta.join(" · ") : "No subtitle or role"}
                        </p>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <Badge className="tabular-nums">Order {project.sortOrder}</Badge>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(project)}>
                          <Pencil aria-hidden />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 px-0 hover:text-dash-danger"
                          onClick={() => setDeleteTarget(project)}
                          aria-label={`Delete ${project.title}`}
                          title="Delete"
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-5 py-8 text-center text-sm text-dash-muted">
                No projects match &ldquo;{query}&rdquo;.
              </p>
            )}
          </Card>
        </>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? "Edit project" : "Add project"}
        description="v1 case study: basics, images, description bullets, tech tags and links."
        size="full"
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <Card title="Basics" subtitle="How the project is titled and ordered on the v1 site.">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Title"
                placeholder="Product name"
                error={titleError}
                {...form.register("title", { required: "Title is required." })}
              />
              <Input label="Subtitle" placeholder="Short hook" {...form.register("subtitle")} />
              <Input label="Role" placeholder="Full Stack Developer" {...form.register("role")} />
              <Input label="Tag" placeholder="SaaS · API" {...form.register("tag")} />
              <Input
                label="Sort order"
                type="number"
                className="tabular-nums"
                {...form.register("sortOrder", { valueAsNumber: true })}
              />
              <Controller
                name="accent"
                control={form.control}
                render={({ field }) => (
                  <ColorPicker label="Accent color" value={field.value} onChange={field.onChange} />
                )}
              />
              <label className="flex items-center gap-2 text-sm text-dash-fg-2 md:col-span-2">
                <input
                  type="checkbox"
                  {...form.register("featured")}
                  className="size-4 rounded border-dash-border-strong bg-dash-field accent-dash-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/60"
                />
                Featured project
              </label>
            </div>
          </Card>

          <Card title="Images" subtitle="Primary thumbnail plus an optional gallery.">
            <div className="space-y-6">
              <Controller
                name="image"
                control={form.control}
                render={({ field }) => (
                  <ImageUpload
                    label="Primary image"
                    value={field.value}
                    onChange={field.onChange}
                    hint="Main thumbnail for cards and carousel."
                  />
                )}
              />

              <div className="space-y-3 border-t border-dash-border pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-dash-fg-2">Gallery</span>
                  <Badge>{galleryImages.length}</Badge>
                </div>
                {galleryImages.length ? (
                  <ul className="flex flex-wrap gap-3">
                    {galleryImages.map((url, index) => (
                      <li
                        key={`${url}-${index}`}
                        className="relative h-24 w-36 overflow-hidden rounded-lg border border-dash-border bg-dash-field"
                      >
                        <Image
                          src={url}
                          alt={`Gallery image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="144px"
                          unoptimized={url.startsWith("/uploads/")}
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryAt(index)}
                          className="absolute right-1 top-1 grid size-7 place-items-center rounded-md border border-dash-border-strong bg-dash-bg/85 text-dash-fg transition-colors hover:text-dash-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/60"
                          aria-label={`Remove gallery image ${index + 1}`}
                          title="Remove"
                        >
                          <X className="size-3.5" aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-dash-muted">No gallery images yet.</p>
                )}
                <ImageUpload
                  label="Add gallery image"
                  value=""
                  onChange={(url) => {
                    if (url) appendGallery(url);
                  }}
                  hint="Each upload is added to the gallery."
                  compact
                />
              </div>
            </div>
          </Card>

          <Card
            title="Description"
            subtitle="One bullet per row."
            headerSlot={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => descriptionLines.append({ value: "" })}
              >
                <Plus aria-hidden />
                Add bullet
              </Button>
            }
          >
            <div className="space-y-2">
              {descriptionLines.fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <Input
                      placeholder="Shipped X… or Improved Y by Z%…"
                      aria-label={`Bullet ${index + 1}`}
                      {...form.register(`descriptionLines.${index}.value`)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    className="w-9 px-0"
                    disabled={descriptionLines.fields.length <= 1}
                    onClick={() => descriptionLines.remove(index)}
                    aria-label={`Remove bullet ${index + 1}`}
                  >
                    <X aria-hidden />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Tech stack"
            subtitle="One technology per row."
            headerSlot={
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
          </Card>

          <Card title="Links">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="GitHub URL" placeholder="https://github.com/..." {...form.register("github")} />
              <Input label="Demo URL" placeholder="https://…" {...form.register("demo")} />
            </div>
          </Card>

          {error ? (
            <Alert tone="danger" title="Couldn't save project">
              {error}
            </Alert>
          ) : null}

          <div className="sticky bottom-0 -mx-5 -mb-4 flex flex-wrap items-center justify-end gap-2 border-t border-dash-border bg-dash-surface px-5 py-3">
            <Button variant="ghost" onClick={closeDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Save changes" : "Create project"}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete project?"
        message={deleteTarget ? `Remove “${deleteTarget.title}”? This cannot be undone.` : ""}
        confirmLabel="Delete"
        danger
        pending={deletePending}
      />
    </div>
  );
}
