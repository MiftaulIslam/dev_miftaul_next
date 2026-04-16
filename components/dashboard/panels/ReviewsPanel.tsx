"use client";

import { useEffect, useState } from "react";
import { MessageSquarePlus, Pencil, Quote, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { requestJson } from "@/components/dashboard/api";
import { Button } from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import { ConfirmDialog } from "@/components/ui/dashboard/ConfirmDialog";
import { Dialog } from "@/components/ui/dashboard/Dialog";
import { Input } from "@/components/ui/dashboard/Input";
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

export default function ReviewsPanel() {
  const [records, setRecords] = useState<ReviewRecord[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReviewRecord | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const form = useForm<ReviewForm>({ defaultValues: toFormValues() });

  const load = async () => {
    try {
      const data = await requestJson<ReviewRecord[]>("/api/dashboard/reviews");
      setRecords(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load reviews.");
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

  const openEdit = (record: ReviewRecord) => {
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
      setError(submitError instanceof Error ? submitError.message : "Failed to save review.");
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
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Social proof</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Reviews</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Client quotes and ratings for your portfolio. Featured items can surface on the landing page.
          </p>
        </div>
        <Button type="button" onClick={openCreate} className="gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          Create review
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {status ? <span className="text-sm text-emerald-300">{status}</span> : null}
        {error ? <span className="text-sm text-rose-300">{error}</span> : null}
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">All reviews</h3>
          <span className="text-xs text-slate-500">{records.length} total</span>
        </div>
        <div className="space-y-2">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/[0.07] bg-gradient-to-r from-slate-950/80 to-slate-900/40 px-4 py-3"
            >
              <div className="flex min-w-0 gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                  <Quote className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-white">{record.clientName}</p>
                  <p className="text-xs text-slate-500">
                    {record.clientRole || "Client"} · {record.rating}/5
                    {record.featured ? (
                      <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                        Featured
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-400">{record.quote}</p>
                </div>
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
              No reviews yet. Add your first testimonial.
            </p>
          ) : null}
        </div>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        title={editingId ? "Edit review" : "New review"}
        description="Quote, attribution, and optional featured flag."
        size="lg"
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Client name"
              placeholder="Jane Doe"
              {...form.register("clientName", { required: true })}
            />
            <Input
              label="Role / company"
              placeholder="CTO at Acme Inc."
              {...form.register("clientRole")}
            />
            <Input
              label="Rating (1–5)"
              type="number"
              min={1}
              max={5}
              placeholder="5"
              {...form.register("rating", { valueAsNumber: true })}
            />
            <label className="flex items-center gap-2 pt-7 text-sm text-slate-300">
              <input type="checkbox" {...form.register("featured")} className="h-4 w-4 rounded border-white/20" />
              Featured on site
            </label>
          </div>
          <Textarea
            label="Quote"
            placeholder="What they said about working with you…"
            rows={5}
            {...form.register("quote", { required: true })}
          />
          <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
            <Button type="button" variant="ghost" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving…" : editingId ? "Save review" : "Add review"}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete review?"
        message={
          deleteTarget ? `Remove the review from ${deleteTarget.clientName}? This cannot be undone.` : ""
        }
        confirmLabel="Delete"
        danger
        pending={deletePending}
      />
    </div>
  );
}
