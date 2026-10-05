"use client";

import { useEffect, useMemo, useState } from "react";
import { NotepadText, Pencil, Plus, RotateCw, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { requestJson } from "@/components/dashboard/api";
import { Alert } from "@/components/ui/dashboard/Alert";
import { Badge } from "@/components/ui/dashboard/Badge";
import { Button } from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import { ConfirmDialog } from "@/components/ui/dashboard/ConfirmDialog";
import { Dialog } from "@/components/ui/dashboard/Dialog";
import { EmptyState } from "@/components/ui/dashboard/EmptyState";
import { Input } from "@/components/ui/dashboard/Input";
import { PageHeader } from "@/components/ui/dashboard/PageHeader";
import { ListSkeleton } from "@/components/ui/dashboard/Skeleton";
import { Textarea } from "@/components/ui/dashboard/Textarea";
import { SearchInput, Toolbar } from "@/components/ui/dashboard/Toolbar";
import { hintClass } from "@/components/ui/dashboard/fieldStyles";
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

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : dateFormat.format(date);
}

type StatusFilter = "all" | "published" | "draft";

export default function BlogsPanel() {
  const [records, setRecords] = useState<BlogRecord[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogRecord | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const form = useForm<BlogForm>({ defaultValues: toFormValues() });
  const titleWatch = form.watch("title");

  // The slug field mirrors what will actually be saved: save always derives the
  // slug from the title (falling back to the stored slug when the title yields none).
  useEffect(() => {
    const next = slugifyTitle(titleWatch);
    if (!next) return;
    if (next !== form.getValues("slug")) {
      form.setValue("slug", next, { shouldValidate: false });
    }
  }, [titleWatch, form]);

  const load = async () => {
    try {
      const data = await requestJson<BlogRecord[]>("/api/dashboard/blogs");
      setRecords(data);
      setLoadError("");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load blogs.");
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
      setStatus(
        values.id
          ? "Post updated."
          : values.published
            ? "Post created and published."
            : "Draft created.",
      );
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

  const publishedCount = records.filter((r) => r.published).length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      if (filter === "published" && !r.published) return false;
      if (filter === "draft" && r.published) return false;
      if (!q) return true;
      return r.title.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q);
    });
  }, [records, query, filter]);

  const { errors, isSubmitting } = form.formState;

  const filterButton = (value: StatusFilter, label: string, count: number) => (
    <button
      key={value}
      type="button"
      aria-pressed={filter === value}
      onClick={() => setFilter(value)}
      className={
        "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/60 " +
        (filter === value ? "bg-dash-raised text-dash-fg" : "text-dash-muted hover:text-dash-fg")
      }
    >
      {label}
      <span className="tabular-nums">{count}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog"
        description="Write posts, keep them as drafts, and publish when ready."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New post
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
          title="Couldn’t load posts"
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
          icon={NotepadText}
          title="No posts yet"
          description="Write your first post. It stays a draft until you publish it."
          action={
            <Button onClick={openCreate}>
              <Plus />
              New post
            </Button>
          }
        />
      ) : (
        <Card title="Posts" flush headerSlot={<Badge>{records.length} total</Badge>}>
          <div className="border-b border-dash-border px-5 py-3">
            <Toolbar className="mb-0">
              <SearchInput value={query} onChange={setQuery} placeholder="Search title or slug…" label="Search posts" />
              <div role="group" aria-label="Filter by status" className="flex gap-0.5 rounded-lg border border-dash-border p-0.5">
                {filterButton("all", "All", records.length)}
                {filterButton("published", "Published", publishedCount)}
                {filterButton("draft", "Drafts", records.length - publishedCount)}
              </div>
            </Toolbar>
          </div>

          {visible.length ? (
            <ul className="divide-y divide-dash-border">
              {visible.map((record) => {
                const updated = formatDate(record.updatedAt);
                return (
                  <li
                    key={record.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 transition-colors hover:bg-dash-raised"
                  >
                    <div className="min-w-0 flex-1 basis-56">
                      <p className="truncate text-sm font-medium text-dash-fg">{record.title}</p>
                      <p className="mt-0.5 truncate font-mono text-xs text-dash-muted">/{record.slug}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {record.published ? (
                        <Badge tone="success">Published</Badge>
                      ) : (
                        <Badge>Draft</Badge>
                      )}
                      {updated ? (
                        <time
                          dateTime={record.updatedAt}
                          className="w-24 text-[13px] tabular-nums text-dash-muted sm:text-right"
                          title="Last updated"
                        >
                          {updated}
                        </time>
                      ) : null}
                    </div>
                    <div className="ml-auto flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 px-0"
                        onClick={() => openEdit(record)}
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
                );
              })}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-dash-muted">No posts match these filters.</p>
          )}
        </Card>
      )}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        title={editingId ? "Edit post" : "New post"}
        description="The slug is generated from the title."
        size="xl"
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          {error ? (
            <Alert tone="danger" title="Post not saved">
              {error}
            </Alert>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Title"
              placeholder="e.g. Building resilient APIs with NestJS"
              error={errors.title ? "Title is required." : undefined}
              {...form.register("title", { required: true })}
            />
            <Input
              label="Slug"
              placeholder="generated-from-title"
              readOnly
              tabIndex={-1}
              hint="Read-only. Updates as you edit the title."
              className="font-mono text-dash-fg-2"
              {...form.register("slug")}
            />
          </div>
          <Textarea
            label="Excerpt"
            placeholder="Short teaser for listings and SEO."
            hint="Optional."
            rows={3}
            {...form.register("excerpt")}
          />
          <Textarea
            label="Content"
            placeholder="Markdown or plain text…"
            rows={14}
            className="font-mono text-[13px]"
            {...form.register("content")}
          />
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-dash-border-strong bg-dash-field p-3 transition-colors hover:bg-dash-raised has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-dash-accent/60">
            <input
              type="checkbox"
              {...form.register("published")}
              className="mt-0.5 size-4 shrink-0 accent-dash-accent focus:outline-none"
            />
            <span>
              <span className="block text-sm font-medium text-dash-fg">Published</span>
              <span className={hintClass}>Visible on the public blog. Leave unchecked to keep it as a draft.</span>
            </span>
          </label>
          <div className="flex flex-wrap justify-end gap-2 border-t border-dash-border pt-4">
            <Button variant="ghost" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : editingId ? "Save changes" : "Create post"}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete post?"
        message={deleteTarget ? `Delete “${deleteTarget.title}”? This cannot be undone.` : ""}
        confirmLabel="Delete"
        danger
        pending={deletePending}
      />
    </div>
  );
}
