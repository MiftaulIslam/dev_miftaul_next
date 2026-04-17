"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { lineFieldsFromStrings, requestJson, stringsFromLineFields } from "@/components/dashboard/api";
import { Button } from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import { ColorPicker } from "@/components/ui/dashboard/ColorPicker";
import { ConfirmDialog } from "@/components/ui/dashboard/ConfirmDialog";
import { Dialog } from "@/components/ui/dashboard/Dialog";
import { ImageUpload } from "@/components/ui/dashboard/ImageUpload";
import { Input } from "@/components/ui/dashboard/Input";
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

export default function ProjectsPanel() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
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
    try {
      const data = await requestJson<ProjectRecord[]>("/api/dashboard/projects");
      setProjects(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load projects.");
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
    } finally {
      setDeletePending(false);
    }
  };

  const openCreateDialog = () => {
    form.reset(toFormValues());
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEditDialog = (project: ProjectRecord) => {
    form.reset(toFormValues(project));
    setEditingId(project.id);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Portfolio</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Projects</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-400">
          Case studies with gallery uploads, accent color, and add-as-you-go bullets and tech tags.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {status ? <span className="text-sm text-emerald-300">{status}</span> : null}
        {error ? <span className="text-sm text-rose-300">{error}</span> : null}
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">All projects</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">{projects.length} total</span>
            <Button type="button" onClick={openCreateDialog}>
              Create Project
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-slate-950/50 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-8 w-1 shrink-0 rounded-full"
                  style={{ background: project.accent || "#3b82f6" }}
                />
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{project.title}</p>
                  <p className="text-xs text-slate-500">
                    {project.subtitle} · {project.role}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => openEditDialog(project)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button type="button" variant="danger" onClick={() => setDeleteTarget(project)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {!projects.length ? (
            <p className="text-center text-sm text-slate-500">No projects yet.</p>
          ) : null}
        </div>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? "Edit project" : "Create project"}
        description="Case studies with gallery uploads, accent color, and repeatable bullets and tech tags."
        size="full"
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <Input label="Title" placeholder="Product name" {...form.register("title", { required: true })} />
          <Input label="Subtitle" placeholder="Short hook" {...form.register("subtitle")} />
          <Input label="Role" placeholder="Full Stack Developer" {...form.register("role")} />
          <Input label="Tag" placeholder="SaaS · API" {...form.register("tag")} />
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
          <Controller
            name="image"
            control={form.control}
            render={({ field }) => (
              <div className="md:col-span-2">
                <ImageUpload
                  label="Primary image"
                  value={field.value}
                  onChange={field.onChange}
                  hint="Main thumbnail for cards and carousel."
                />
              </div>
            )}
          />
          <Input label="GitHub URL" placeholder="https://github.com/..." {...form.register("github")} />
          <Input label="Demo URL" placeholder="https://…" {...form.register("demo")} />
          <label className="flex items-center gap-2 text-sm text-slate-300 md:col-span-2">
            <input type="checkbox" {...form.register("featured")} className="h-4 w-4 rounded border-white/20" />
            Featured project
          </label>

          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">Description</span>
              <Button
                type="button"
                variant="ghost"
                className="h-9 px-2"
                onClick={() => descriptionLines.append({ value: "" })}
                aria-label="Add description bullet"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {descriptionLines.fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <Input
                      placeholder="Shipped X… or Improved Y by Z%…"
                      {...form.register(`descriptionLines.${index}.value`)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="shrink-0 px-2"
                    disabled={descriptionLines.fields.length <= 1}
                    onClick={() => descriptionLines.remove(index)}
                    aria-label="Remove bullet"
                  >
                    <X className="h-4 w-4 text-slate-400" />
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
                aria-label="Add technology"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {techLines.fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <Input placeholder="e.g. Next.js" {...form.register(`techLines.${index}.value`)} />
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

          <div className="md:col-span-2 space-y-3 rounded-xl border border-white/8 bg-slate-950/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Gallery images</p>
            <div className="flex flex-wrap gap-3">
              {form.watch("galleryImages").map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="group relative h-24 w-36 overflow-hidden rounded-lg border border-white/10"
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="144px"
                    unoptimized={url.startsWith("/uploads/")}
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryAt(index)}
                    className="absolute right-1 top-1 rounded-md bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <ImageUpload
              label="Add gallery image"
              value=""
              onChange={(url) => {
                if (url) appendGallery(url);
              }}
              hint="Upload adds to the gallery list."
              compact
            />
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
        message={deleteTarget ? `Remove “${deleteTarget.title}”? This cannot be undone.` : ""}
        confirmLabel="Delete"
        danger
        pending={deletePending}
      />
    </div>
  );
}
