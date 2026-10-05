"use client";

import { useEffect, useState } from "react";
import { MessageSquarePlus, MessageSquareQuote, Pencil, Star, Trash2 } from "lucide-react";
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
import type { ReviewRecord } from "@/lib/dashboard/types";

type ReviewForm = {
  id?: number;
  clientName: string;
  clientRole: string;
  quote: string;
  rating: number;
  featured: boolean;
};

function toFormValues(review?: ReviewRecord): ReviewForm {
  if (!review) {
    return {
      clientName: "",
      clientRole: "",
      quote: "",
      rating: 5,
      featured: false,
    };
  }

  return {
    id: review.id,
    clientName: review.clientName,
    clientRole: review.clientRole,
    quote: review.quote,
    rating: review.rating,
    featured: review.featured,
  };
}

const notBlank = (value: string) => value.trim().length > 0;

export default function ReviewsPanel() {
  const [records, setRecords] = useState<ReviewRecord[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  /** Save errors show inside the dialog, next to the form that caused them. */
  const [formError, setFormError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReviewRecord | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const form = useForm<ReviewForm>({ defaultValues: toFormValues() });
  const { errors } = form.formState;

  const load = async () => {
    setLoadError("");
    setLoading(true);
    try {
      const data = await requestJson<ReviewRecord[]>("/api/dashboard/reviews");
      setRecords(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    form.reset(toFormValues());
    setError("");
    setFormError("");
    setStatus("");
    setDialogOpen(true);
  };

  const openEdit = (record: ReviewRecord) => {
    setEditingId(record.id);
    form.reset(toFormValues(record));
    setError("");
    setFormError("");
    setStatus("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setFormError("");
    setEditingId(null);
    form.reset(toFormValues());
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setStatus("");
    setError("");
    setFormError("");
    try {
      const payload = {
        id: values.id,
        clientName: values.clientName.trim(),
        clientRole: values.clientRole.trim(),
        quote: values.quote.trim(),
        rating: Number(values.rating) || 5,
        featured: values.featured,
      };
      await requestJson("/api/dashboard/reviews", {
        method: values.id ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setStatus(values.id ? "Review updated." : "Review added.");
      closeDialog();
      await load();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Failed to save review.");
    }
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletePending(true);
    setError("");
    try {
      await requestJson("/api/dashboard/reviews", {
        method: "DELETE",
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      setStatus("Review removed.");
      setDeleteTarget(null);
      await load();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Failed to delete review.");
      setDeleteTarget(null);
    } finally {
      setDeletePending(false);
    }
  };

  const featuredCount = records.filter((r) => r.featured).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description="Client quotes and ratings. Featured reviews can appear on the landing page."
        meta={
          loading && !records.length ? null : (
            <span className="tabular-nums">
              {records.length} total · {featuredCount} featured
            </span>
          )
        }
        actions={
          <Button onClick={openCreate}>
            <MessageSquarePlus aria-hidden />
            Add review
          </Button>
        }
      />

      {loadError ? (
        <Alert
          tone="danger"
          title="Couldn't load reviews"
          action={
            <Button size="sm" variant="secondary" onClick={() => void load()} disabled={loading}>
              Retry
            </Button>
          }
        >
          {loadError}
        </Alert>
      ) : null}
      {error ? <Alert tone="danger">{error}</Alert> : null}
      {status ? <Alert tone="success">{status}</Alert> : null}

      {loading && !records.length ? (
        <ListSkeleton rows={4} />
      ) : !records.length ? (
        loadError ? null : (
          <EmptyState
            icon={MessageSquareQuote}
            title="No reviews yet"
            description="Add a client testimonial to show social proof on your site."
            action={
              <Button onClick={openCreate}>
                <MessageSquarePlus aria-hidden />
                Add review
              </Button>
            }
          />
        )
      ) : (
        <Card flush title="All reviews" headerSlot={<Badge className="tabular-nums">{records.length}</Badge>}>
          <ul className="divide-y divide-dash-border">
            {records.map((record) => (
              <li
                key={record.id}
                className="flex flex-wrap items-start gap-x-4 gap-y-3 px-5 py-4 transition-colors hover:bg-dash-raised sm:flex-nowrap"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="font-medium text-dash-fg">{record.clientName}</p>
                    {record.featured ? (
                      <Badge tone="accent">
                        <Star aria-hidden />
                        Featured
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-dash-muted">
                    <span>{record.clientRole || "Client"}</span>
                    <span aria-hidden>·</span>
                    <span className="tabular-nums">
                      <span className="sr-only">Rating </span>
                      {record.rating}/5
                    </span>
                  </p>
                  <p className="mt-2 line-clamp-2 max-w-prose text-sm leading-relaxed text-dash-fg-2">
                    &ldquo;{record.quote}&rdquo;
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(record)}
                    aria-label={`Edit review from ${record.clientName}`}
                  >
                    <Pencil aria-hidden />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(record)}
                    aria-label={`Delete review from ${record.clientName}`}
                    className="hover:text-dash-danger"
                  >
                    <Trash2 aria-hidden />
                    <span className="hidden sm:inline">Delete</span>
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
        title={editingId ? "Edit review" : "New review"}
        description="Quote, attribution, and optional featured flag."
        size="lg"
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          {formError ? <Alert tone="danger">{formError}</Alert> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Client name"
              placeholder="Jane Doe"
              error={errors.clientName ? "Client name is required." : undefined}
              {...form.register("clientName", { required: true, validate: notBlank })}
            />
            <Input label="Role / company" placeholder="CTO at Acme Inc." {...form.register("clientRole")} />
            <Input
              label="Rating (1–5)"
              type="number"
              min={1}
              max={5}
              placeholder="5"
              {...form.register("rating", { valueAsNumber: true })}
            />
            <label className="flex cursor-pointer items-center gap-2 self-end rounded-lg border border-dash-border-strong bg-dash-field px-3 py-2 text-sm text-dash-fg-2 md:h-9 md:py-0">
              <input
                type="checkbox"
                {...form.register("featured")}
                className="size-4 cursor-pointer accent-dash-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/60"
              />
              Featured on site
            </label>
          </div>
          <Textarea
            label="Quote"
            placeholder="What they said about working with you…"
            rows={5}
            error={errors.quote ? "Quote is required." : undefined}
            {...form.register("quote", { required: true, validate: notBlank })}
          />
          <div className="flex flex-wrap justify-end gap-2 border-t border-dash-border pt-4">
            <Button variant="ghost" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving…" : editingId ? "Save changes" : "Add review"}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete review?"
        message={deleteTarget ? `Remove the review from ${deleteTarget.clientName}? This cannot be undone.` : ""}
        confirmLabel="Delete"
        danger
        pending={deletePending}
      />
    </div>
  );
}
