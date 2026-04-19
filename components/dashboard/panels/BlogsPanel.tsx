"use client";

import { useEffect, useState } from "react";
import { BookPlus, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { requestJson } from "@/components/dashboard/api";
import { Button } from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import { ConfirmDialog } from "@/components/ui/dashboard/ConfirmDialog";
import { Dialog } from "@/components/ui/dashboard/Dialog";
import { Input } from "@/components/ui/dashboard/Input";
import { Textarea } from "@/components/ui/dashboard/Textarea";
import { slugifyTitle } from "@/lib/dashboard/slugify";
import type { BlogRecord } from "@/lib/dashboard/types";

type BlogForm = {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
};

function toFormValues(blog?: BlogRecord): BlogForm {
  if (!blog) {
    return {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      published: false,
    };
  }

  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    content: blog.content,
    published: blog.published,
  };
}

export default function BlogsPanel() {
  const [records, setRecords] = useState<BlogRecord[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogRecord | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const form = useForm<BlogForm>({ defaultValues: toFormValues() });
  const titleWatch = form.watch("title");

  useEffect(() => {
    if (editingId) return;
    const next = slugifyTitle(titleWatch);
    if (next !== form.getValues("slug")) {
      form.setValue("slug", next, { shouldValidate: false });
    }
  }, [titleWatch, editingId, form]);

  const load = async () => {
    try {
      const data = await requestJson<BlogRecord[]>("/api/dashboard/blogs");
      setRecords(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load blogs.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    form.reset(toFormValues());
    setError("");
    setStatus("");
    setDialogOpen(true);
  };

  const openEdit = (record: BlogRecord) => {
    setEditingId(record.id);
    form.reset(toFormValues(record));
    setError("");
    setStatus("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    form.reset(toFormValues());
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setStatus("");
    setError("");
    try {
      const slug = slugifyTitle(values.title) || values.slug.trim();
      const payload = {
        id: values.id,
        title: values.title.trim(),
        slug,
        excerpt: values.excerpt.trim(),
        content: values.content.trim(),
        published: values.published,
      };
      await requestJson("/api/dashboard/blogs", {
        method: values.id ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setStatus(values.id ? "Post updated." : "Post published.");
      closeDialog();
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save blog.");
    }
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletePending(true);
    setError("");
    try {
      await requestJson("/api/dashboard/blogs", {
        method: "DELETE",
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      setStatus("Post deleted.");
      setDeleteTarget(null);
      await load();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Failed to delete blog.");
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Content</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Blog</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Draft posts, manage slugs, and publish when ready. Slug is generated from the title.
          </p>
        </div>
        <Button type="button" onClick={openCreate} className="gap-2">
          <BookPlus className="h-4 w-4" />
          Create blog
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {status ? <span className="text-sm text-emerald-300">{status}</span> : null}
        {error ? <span className="text-sm text-rose-300">{error}</span> : null}
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">All posts</h3>
          <span className="text-xs text-slate-500">{records.length} total</span>
        </div>
        <div className="space-y-2">
          {records.map((record) => (
            <div
              key={record.id}
              className="group flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-gradient-to-r from-slate-950/80 to-slate-900/40 px-4 py-3 transition hover:border-white/12"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{record.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  /{record.slug}
                  {record.published ? (
                    <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                      Live
                    </span>
                  ) : (
                    <span className="ml-2 rounded-full bg-slate-500/20 px-2 py-0.5 text-[10px] text-slate-400">
                      Draft
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" onClick={() => openEdit(record)} aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button type="button" variant="danger" onClick={() => setDeleteTarget(record)} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {!records.length ? (
            <p className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-500">
              No posts yet. Create your first article.
            </p>
          ) : null}
        </div>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        title={editingId ? "Edit Blog Post" : "New Blog Post"}
        description={editingId ? "Update content and publishing status." : "Write a title — we’ll handle the slug."}
        size="xl"
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Title"
              placeholder="e.g. Building resilient APIs with NestJS"
              {...form.register("title", { required: true })}
            />
            <Input
              label="Slug (auto)"
              placeholder="auto-generated-from-title"
              readOnly
              className="opacity-90"
              {...form.register("slug")}
            />
          </div>
          <Textarea
            label="Excerpt"
            placeholder="Short teaser for listings and SEO (optional)."
            rows={3}
            {...form.register("excerpt")}
          />
          <Textarea
            label="Content"
            placeholder="Full markdown or plain text body…"
            rows={10}
            {...form.register("content")}
          />
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" {...form.register("published")} className="h-4 w-4 rounded border-white/20" />
            Published
          </label>
          <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
            <Button type="button" variant="ghost" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving…" : editingId ? "Save changes" : "Create post"}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete post?"
        message={
          deleteTarget
            ? `Delete “${deleteTarget.title}”? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        danger
        pending={deletePending}
      />
    </div>
  );
}
