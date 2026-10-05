"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Layers3, Pencil, Plus, Trash2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { requestJson } from "@/components/dashboard/api";
import { Alert } from "@/components/ui/dashboard/Alert";
import { Badge } from "@/components/ui/dashboard/Badge";
import { Button } from "@/components/ui/dashboard/Button";
import { ColorPicker } from "@/components/ui/dashboard/ColorPicker";
import { ConfirmDialog } from "@/components/ui/dashboard/ConfirmDialog";
import { Dialog } from "@/components/ui/dashboard/Dialog";
import { EmptyState } from "@/components/ui/dashboard/EmptyState";
import { Input } from "@/components/ui/dashboard/Input";
import { PageHeader } from "@/components/ui/dashboard/PageHeader";
import { Select } from "@/components/ui/dashboard/Select";
import { ListSkeleton } from "@/components/ui/dashboard/Skeleton";
import { cn } from "@/lib/cn";
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

/** Small square icon-only action with an accessible name and a hover tooltip. */
function IconAction({
  label,
  onClick,
  tone = "default",
  children,
}: {
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-8 place-items-center rounded-md text-dash-muted transition-colors [&_svg]:size-4",
        "hover:bg-dash-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/60",
        tone === "danger" ? "hover:text-dash-danger" : "hover:text-dash-fg",
      )}
    >
      {children}
    </button>
  );
}

/** Preview of /tech_icons/<iconName>.svg with a monogram fallback when blank or missing. */
function ToolIcon({ name, iconName }: { name: string; iconName: string }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-dash-border bg-dash-raised text-xs font-semibold text-dash-fg-2">
      {name.trim().slice(0, 2).toUpperCase() || "?"}
      {iconName && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary /public paths typed by the editor
        <img
          src={`/tech_icons/${iconName}.svg`}
          alt=""
          className="absolute inset-0 size-full bg-dash-raised object-contain p-1.5"
          onError={() => setBroken(true)}
        />
      ) : null}
    </span>
  );
}

export default function StacksPanel() {
  const [categories, setCategories] = useState<StackCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingToolId, setEditingToolId] = useState<number | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [toolDialogOpen, setToolDialogOpen] = useState(false);
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
    setLoadError("");
    try {
      const data = await requestJson<StackCategory[]>("/api/dashboard/skills/categories");
      setCategories(data);
      if (data.length && !toolForm.getValues("categoryId")) {
        toolForm.setValue("categoryId", data[0].id);
      }
    } catch (loadErr) {
      setLoadError(loadErr instanceof Error ? loadErr.message : "Failed to load stacks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retryLoad = () => {
    setLoading(true);
    void load();
  };

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
      setCategoryDialogOpen(false);
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
      setToolDialogOpen(false);
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

  const openNewCategory = () => {
    categoryForm.reset({ key: "", label: "", accent: "#3b82f6" });
    setEditingCategoryId(null);
    setCategoryDialogOpen(true);
  };

  const openEditCategory = (category: StackCategory) => {
    categoryForm.reset({
      id: category.id,
      key: category.key,
      label: category.label,
      accent: category.accent,
    });
    setEditingCategoryId(category.id);
    setCategoryDialogOpen(true);
  };

  /** `categoryId` preselects the category when adding from inside one. */
  const openNewTool = (categoryId?: number) => {
    toolForm.reset({
      categoryId: categoryId ?? categories[0]?.id ?? 0,
      name: "",
      color: "#60a5fa",
      iconName: "",
    });
    setEditingToolId(null);
    setToolDialogOpen(true);
  };

  const openEditTool = (category: StackCategory, tool: StackCategory["tools"][number]) => {
    toolForm.reset({
      id: tool.id,
      categoryId: category.id,
      name: tool.name,
      color: tool.color,
      iconName: tool.iconName,
    });
    setEditingToolId(tool.id);
    setToolDialogOpen(true);
  };

  const closeCategoryDialog = () => {
    setCategoryDialogOpen(false);
    categoryForm.reset({ key: "", label: "", accent: "#3b82f6" });
    setEditingCategoryId(null);
  };

  const closeToolDialog = () => {
    setToolDialogOpen(false);
    toolForm.reset({
      categoryId: categories[0]?.id ?? 0,
      name: "",
      color: "#60a5fa",
      iconName: "",
    });
    setEditingToolId(null);
  };

  const totalTools = categories.reduce((sum, category) => sum + category.tools.length, 0);

  return (
    <div>
      <PageHeader
        title="Skills v1"
        description="Stack categories and tools for the legacy v1 Skills section. Changes here only affect the v1 site, not the live skills reel."
        meta={
          !loading && !loadError
            ? `${categories.length} ${categories.length === 1 ? "category" : "categories"} · ${totalTools} ${totalTools === 1 ? "tool" : "tools"}`
            : undefined
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => openNewTool()} disabled={loading || !categories.length}>
              <Plus />
              Add tool
            </Button>
            <Button onClick={openNewCategory} disabled={loading}>
              <Plus />
              New category
            </Button>
          </>
        }
      />

      <div className="space-y-4">
        {status ? <Alert tone="success">{status}</Alert> : null}
        {error ? <Alert tone="danger">{error}</Alert> : null}

        {loading ? (
          <ListSkeleton rows={4} />
        ) : loadError ? (
          <Alert
            tone="danger"
            title="Could not load stacks"
            action={
              <Button size="sm" variant="secondary" onClick={retryLoad}>
                Retry
              </Button>
            }
          >
            {loadError}
          </Alert>
        ) : !categories.length ? (
          <EmptyState
            icon={Layers3}
            title="No categories yet"
            description="Create a category, then add tools to it."
            action={
              <Button onClick={openNewCategory}>
                <Plus />
                New category
              </Button>
            }
          />
        ) : (
          categories.map((category) => (
            <section
              key={category.id}
              aria-labelledby={`stack-category-${category.id}`}
              className="overflow-hidden rounded-xl border border-dash-border bg-dash-surface"
            >
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-dash-border px-4 py-3.5 sm:px-5">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span
                    aria-hidden
                    className="size-3 shrink-0 rounded-full border border-dash-border-strong"
                    style={{ background: category.accent }}
                  />
                  <h2 id={`stack-category-${category.id}`} className="text-[15px] font-semibold text-dash-fg">
                    {category.label}
                  </h2>
                  <Badge className="font-mono">{category.key}</Badge>
                  <Badge tone="accent">
                    {category.tools.length} {category.tools.length === 1 ? "tool" : "tools"}
                  </Badge>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button size="sm" variant="secondary" onClick={() => openNewTool(category.id)}>
                    <Plus />
                    Add tool
                  </Button>
                  <span aria-hidden className="mx-1 h-5 w-px bg-dash-border" />
                  <IconAction label={`Edit category ${category.label}`} onClick={() => openEditCategory(category)}>
                    <Pencil />
                  </IconAction>
                  <IconAction
                    label={`Delete category ${category.label}`}
                    tone="danger"
                    onClick={() => setConfirm({ type: "category", id: category.id, label: category.label })}
                  >
                    <Trash2 />
                  </IconAction>
                </div>
              </header>

              {category.tools.length ? (
                <ul className="divide-y divide-dash-border" aria-label={`Tools in ${category.label}`}>
                  {category.tools.map((tool) => (
                    <li
                      key={tool.id}
                      className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 pl-4 pr-3 transition-colors hover:bg-dash-raised/60 sm:pl-8"
                    >
                      <ToolIcon name={tool.name} iconName={tool.iconName} />
                      <div className="min-w-0 flex-1 basis-40">
                        <p className="truncate text-sm font-medium text-dash-fg">{tool.name}</p>
                        <p className="flex min-w-0 items-center gap-1.5 text-xs text-dash-muted">
                          <span
                            aria-hidden
                            className="size-2.5 shrink-0 rounded-full border border-dash-border-strong"
                            style={{ background: tool.color }}
                          />
                          <span className="font-mono">{tool.color}</span>
                          <span aria-hidden>·</span>
                          <span className="truncate">{tool.iconName ? `Icon: ${tool.iconName}` : "No icon"}</span>
                        </p>
                      </div>
                      <div className="ml-auto flex shrink-0 items-center">
                        <IconAction label={`Edit ${tool.name}`} onClick={() => openEditTool(category, tool)}>
                          <Pencil />
                        </IconAction>
                        <IconAction
                          label={`Delete ${tool.name}`}
                          tone="danger"
                          onClick={() => setConfirm({ type: "tool", id: tool.id, label: tool.name })}
                        >
                          <Trash2 />
                        </IconAction>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
                  <p className="text-[13px] text-dash-muted">No tools in this category yet.</p>
                  <Button size="sm" variant="ghost" onClick={() => openNewTool(category.id)}>
                    <Plus />
                    Add tool
                  </Button>
                </div>
              )}
            </section>
          ))
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={confirmDelete}
        title={confirm?.type === "category" ? "Delete category" : "Delete tool"}
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

      <Dialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        title={editingCategoryId ? "Edit category" : "New category"}
        description="Label, optional key, and accent colour."
      >
        <form className="space-y-4" onSubmit={submitCategory}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Label"
              placeholder="Frontend"
              error={categoryForm.formState.errors.label ? "Label is required." : undefined}
              {...categoryForm.register("label", { required: true })}
            />
            <Input
              label="Key"
              placeholder="frontend"
              hint="Optional. Left blank, it is derived from the label."
              {...categoryForm.register("key")}
            />
          </div>
          <Controller
            name="accent"
            control={categoryForm.control}
            render={({ field }) => <ColorPicker label="Accent colour" value={field.value} onChange={field.onChange} />}
          />
          <div className="flex justify-end gap-2 border-t border-dash-border pt-4">
            <Button variant="ghost" onClick={closeCategoryDialog}>
              Cancel
            </Button>
            <Button type="submit" disabled={categoryForm.formState.isSubmitting}>
              {categoryForm.formState.isSubmitting
                ? "Saving…"
                : editingCategoryId
                  ? "Save category"
                  : "Create category"}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={toolDialogOpen}
        onClose={() => setToolDialogOpen(false)}
        title={editingToolId ? "Edit tool" : "Add tool"}
        description="Tools belong to a category and render as chips in the v1 Skills section."
      >
        <form className="space-y-4" onSubmit={submitTool}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Tool name"
              placeholder="React"
              error={toolForm.formState.errors.name ? "Tool name is required." : undefined}
              {...toolForm.register("name", { required: true })}
            />
            <Select
              label="Category"
              error={toolForm.formState.errors.categoryId ? "Choose a category." : undefined}
              hint={editingToolId ? "Can't be changed after creation. Add the tool to the other category instead." : undefined}
              {...toolForm.register("categoryId", {
                valueAsNumber: true,
                required: true,
                validate: (value) => value > 0,
                disabled: editingToolId !== null,
              })}
            >
              <option value={0}>Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </Select>
          </div>
          <Input
            label="Icon name"
            placeholder="React"
            hint="File name in /public/tech_icons without .svg, e.g. React or Next.js."
            {...toolForm.register("iconName")}
          />
          <Controller
            name="color"
            control={toolForm.control}
            render={({ field }) => <ColorPicker label="Chip colour" value={field.value} onChange={field.onChange} />}
          />
          <div className="flex justify-end gap-2 border-t border-dash-border pt-4">
            <Button variant="ghost" onClick={closeToolDialog}>
              Cancel
            </Button>
            <Button type="submit" disabled={toolForm.formState.isSubmitting}>
              {toolForm.formState.isSubmitting ? "Saving…" : editingToolId ? "Save tool" : "Add tool"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
