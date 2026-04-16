"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { requestJson } from "@/components/dashboard/api";
import { Button } from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import { ColorPicker } from "@/components/ui/dashboard/ColorPicker";
import { ConfirmDialog } from "@/components/ui/dashboard/ConfirmDialog";
import { Input } from "@/components/ui/dashboard/Input";
import { Select } from "@/components/ui/dashboard/Select";
import type { StackCategory } from "@/lib/dashboard/types";

type CategoryForm = {
  id?: number;
  key: string;
  label: string;
  accent: string;
};

type ToolForm = {
  id?: number;
  categoryId: number;
  name: string;
  color: string;
  iconName: string;
};

export default function StacksPanel() {
  const [categories, setCategories] = useState<StackCategory[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingToolId, setEditingToolId] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{ type: "category" | "tool"; id: number; label: string } | null>(
    null,
  );
  const [confirmPending, setConfirmPending] = useState(false);

  const categoryForm = useForm<CategoryForm>({
    defaultValues: { key: "", label: "", accent: "#3b82f6" },
  });
  const toolForm = useForm<ToolForm>({
    defaultValues: { categoryId: 0, name: "", color: "#60a5fa", iconName: "" },
  });

  const load = async () => {
    try {
      const data = await requestJson<StackCategory[]>("/api/dashboard/skills/categories");
      setCategories(data);
      if (data.length && !toolForm.getValues("categoryId")) {
        toolForm.setValue("categoryId", data[0].id);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load stacks.");
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitCategory = categoryForm.handleSubmit(async (values) => {
    setError("");
    setStatus("");
    try {
      if (values.id) {
        await requestJson("/api/dashboard/skills/categories", {
          method: "PUT",
          body: JSON.stringify(values),
        });
        setStatus("Category updated.");
      } else {
        await requestJson("/api/dashboard/skills/categories", {
          method: "POST",
          body: JSON.stringify(values),
        });
        setStatus("Category created.");
      }
      categoryForm.reset({ key: "", label: "", accent: "#3b82f6" });
      setEditingCategoryId(null);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save category.");
    }
  });

  const submitTool = toolForm.handleSubmit(async (values) => {
    setError("");
    setStatus("");
    try {
      if (values.id) {
        await requestJson("/api/dashboard/skills/tools", {
          method: "PUT",
          body: JSON.stringify(values),
        });
        setStatus("Tool updated.");
      } else {
        await requestJson("/api/dashboard/skills/tools", {
          method: "POST",
          body: JSON.stringify(values),
        });
        setStatus("Tool added.");
      }
      toolForm.reset({
        categoryId: categories[0]?.id ?? 0,
        name: "",
        color: "#60a5fa",
        iconName: "",
      });
      setEditingToolId(null);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save tool.");
    }
  });

  const runDeleteCategory = async (id: number) => {
    setError("");
    setStatus("");
    try {
      await requestJson("/api/dashboard/skills/categories", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      setStatus("Category deleted.");
      if (editingCategoryId === id) {
        categoryForm.reset({ key: "", label: "", accent: "#3b82f6" });
        setEditingCategoryId(null);
      }
      await load();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Failed to delete category.");
    }
  };

  const runDeleteTool = async (id: number) => {
    setError("");
    setStatus("");
    try {
      await requestJson("/api/dashboard/skills/tools", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      setStatus("Tool deleted.");
      if (editingToolId === id) {
        toolForm.reset({
          categoryId: categories[0]?.id ?? 0,
          name: "",
          color: "#60a5fa",
          iconName: "",
        });
        setEditingToolId(null);
      }
      await load();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Failed to delete tool.");
    }
  };

  const confirmDelete = async () => {
    if (!confirm) return;
    setConfirmPending(true);
    try {
      if (confirm.type === "category") {
        await runDeleteCategory(confirm.id);
      } else {
        await runDeleteTool(confirm.id);
      }
      setConfirm(null);
    } finally {
      setConfirmPending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Skills</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Stacks</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-400">
          Categories and tools power the Skills section. Use icon names that match files in{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-cyan-200">/public/tech_icons</code>.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card
          title={editingCategoryId ? "Edit category" : "Create category"}
          subtitle="Label, optional key, accent."
          className="border-white/10 bg-slate-950/35"
        >
          <form className="space-y-3" onSubmit={submitCategory}>
            <Input label="Label" placeholder="Frontend" {...categoryForm.register("label", { required: true })} />
            <Input label="Key (optional)" placeholder="frontend" {...categoryForm.register("key")} />
            <Controller
              name="accent"
              control={categoryForm.control}
              render={({ field }) => (
                <ColorPicker label="Accent color" value={field.value} onChange={field.onChange} />
              )}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={categoryForm.formState.isSubmitting}>
                {editingCategoryId ? "Update Category" : "Create Category"}
              </Button>
              {editingCategoryId ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    categoryForm.reset({ key: "", label: "", accent: "#3b82f6" });
                    setEditingCategoryId(null);
                  }}
                >
                  Cancel Edit
                </Button>
              ) : null}
            </div>
          </form>
        </Card>

        <Card
          title={editingToolId ? "Edit tool" : "Add tool"}
          subtitle="Attach to a category."
          className="border-white/10 bg-slate-950/35"
        >
          <form className="space-y-3" onSubmit={submitTool}>
            <Select
              label="Category"
              {...toolForm.register("categoryId", { valueAsNumber: true, required: true })}
            >
              <option value={0}>Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </Select>
            <Input label="Tool name" placeholder="React" {...toolForm.register("name", { required: true })} />
            <Input label="Icon name" placeholder="React.svg base name" {...toolForm.register("iconName")} />
            <Controller
              name="color"
              control={toolForm.control}
              render={({ field }) => (
                <ColorPicker label="Chip color" value={field.value} onChange={field.onChange} />
              )}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={toolForm.formState.isSubmitting}>
                {editingToolId ? "Update Tool" : "Add Tool"}
              </Button>
              {editingToolId ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    toolForm.reset({
                      categoryId: categories[0]?.id ?? 0,
                      name: "",
                      color: "#60a5fa",
                      iconName: "",
                    });
                    setEditingToolId(null);
                  }}
                >
                  Cancel Edit
                </Button>
              ) : null}
            </div>
          </form>
        </Card>
      </div>

      <Card title="Categories & tools" className="border-white/10 bg-slate-950/30">
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-slate-950/90 to-slate-900/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: category.accent }} />
                  <p className="text-sm font-medium text-white">{category.label}</p>
                  <span className="text-xs text-slate-500">({category.key})</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      categoryForm.reset({
                        id: category.id,
                        key: category.key,
                        label: category.label,
                        accent: category.accent,
                      });
                      setEditingCategoryId(category.id);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() =>
                      setConfirm({
                        type: "category",
                        id: category.id,
                        label: category.label,
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {category.tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-slate-950/60 px-2.5 py-1 text-xs text-slate-200"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: tool.color }} />
                    {tool.name}
                    {tool.iconName ? <span className="text-slate-500">({tool.iconName})</span> : null}
                    <button
                      type="button"
                      className="text-slate-400 hover:text-white"
                      onClick={() => {
                        toolForm.reset({
                          id: tool.id,
                          categoryId: category.id,
                          name: tool.name,
                          color: tool.color,
                          iconName: tool.iconName,
                        });
                        setEditingToolId(tool.id);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="text-rose-300 hover:text-rose-200"
                      onClick={() =>
                        setConfirm({
                          type: "tool",
                          id: tool.id,
                          label: tool.name,
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {!category.tools.length ? (
                  <span className="rounded-full border border-dashed border-white/15 px-2.5 py-1 text-xs text-slate-500">
                    No tools yet
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-3">
        {status ? <span className="text-sm text-emerald-300">{status}</span> : null}
        {error ? <span className="text-sm text-rose-300">{error}</span> : null}
        {!status && !error ? (
          <span className="text-xs text-slate-500">
            Tip: icon names align with filenames in <code className="text-slate-400">tech_icons</code>.
          </span>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={confirmDelete}
        title={confirm?.type === "category" ? "Delete category?" : "Delete tool?"}
        message={
          confirm
            ? confirm.type === "category"
              ? `Delete “${confirm.label}” and its tools? This cannot be undone.`
              : `Remove “${confirm.label}” from this stack?`
            : ""
        }
        confirmLabel="Delete"
        danger
        pending={confirmPending}
      />
    </div>
  );
}
