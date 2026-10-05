"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Layers, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/dashboard/Textarea";
import { cn } from "@/lib/cn";
import type { V2SkillItem, V2SkillSection } from "@/lib/dashboard/types";

const SECTIONS_URL = "/api/dashboard/skills/v2/sections";
const ITEMS_URL = "/api/dashboard/skills/v2/items";

type SectionForm = {
  id?: number;
  key: string;
  title: string;
  subtitle: string;
  description: string;
  layer: string;
  accent: string;
  sortOrder: number;
};

type ItemForm = {
  id?: number;
  sectionId: number;
  name: string;
  title: string;
  icon: string;
  note: string;
  weight: number;
  sortOrder: number;
};

const EMPTY_SECTION: SectionForm = {
  key: "",
  title: "",
  subtitle: "",
  description: "",
  layer: "",
  accent: "#60a5fa",
  sortOrder: 0,
};

const emptyItem = (sectionId: number): ItemForm => ({
  sectionId,
  name: "",
  title: "",
  icon: "",
  note: "",
  weight: 0.55,
  sortOrder: 0,
});

/** Swap two entries and return the new order. */
function swapped<T>(list: T[], index: number, direction: -1 | 1) {
  const next = [...list];
  const target = index + direction;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Small square icon-only action with an accessible name and a hover tooltip. */
function IconAction({
  label,
  onClick,
  disabled,
  tone = "default",
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-8 place-items-center rounded-md text-dash-muted transition-colors [&_svg]:size-4",
        "hover:bg-dash-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/60",
        "disabled:pointer-events-none disabled:opacity-35",
        tone === "danger" ? "hover:text-dash-danger" : "hover:text-dash-fg",
      )}
    >
      {children}
    </button>
  );
}

/** Thin divider between action groups inside a row. */
function ActionDivider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-dash-border" />;
}

/** Icon from /public, with a monogram underneath that shows if the path is blank or broken. */
function SkillIcon({ name, icon }: { name: string; icon: string }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-dash-border bg-dash-raised text-xs font-semibold text-dash-fg-2">
      {name.trim().slice(0, 2).toUpperCase() || "?"}
      {icon && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary /public paths typed by the editor
        <img
          src={icon}
          alt=""
          className="absolute inset-0 size-full bg-dash-raised object-contain p-1.5"
          onError={() => setBroken(true)}
        />
      ) : null}
    </span>
  );
}

/**
 * Editor for the v2 skills reel.
 *
 * Deliberately a separate panel from Skills (v1), not a tab inside it. The two
 * models are different shapes — v1 is a flat list of tool chips with a brand
 * colour, v2 is authored copy where every section has a subtitle and a
 * description and every skill has a one-line title. One form trying to serve
 * both would show half its fields greyed out on whichever version you were not
 * editing.
 *
 * Neither model has a "years" field. It is not stored and not shown.
 */
export default function V2SkillsPanel() {
  const [sections, setSections] = useState<V2SkillSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [reordering, setReordering] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(false);
  const [editingItem, setEditingItem] = useState(false);
  const [confirm, setConfirm] = useState<
    { type: "section" | "item"; id: number; label: string } | null
  >(null);
  const [confirmPending, setConfirmPending] = useState(false);

  const sectionForm = useForm<SectionForm>({ defaultValues: EMPTY_SECTION });
  const itemForm = useForm<ItemForm>({ defaultValues: emptyItem(0) });

  const load = async () => {
    setLoadError("");
    try {
      const data = await requestJson<V2SkillSection[]>(SECTIONS_URL);
      setSections(data);
    } catch (loadErr) {
      setLoadError(loadErr instanceof Error ? loadErr.message : "Failed to load v2 skills.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const retryLoad = () => {
    setLoading(true);
    void load();
  };

  const submitSection = sectionForm.handleSubmit(async (values) => {
    setError("");
    setStatus("");
    try {
      await requestJson(SECTIONS_URL, {
        method: values.id ? "PUT" : "POST",
        body: JSON.stringify(values),
      });
      setStatus(values.id ? "Section updated." : "Section created.");
      sectionForm.reset(EMPTY_SECTION);
      setEditingSection(false);
      setSectionDialogOpen(false);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save section.");
    }
  });

  const submitItem = itemForm.handleSubmit(async (values) => {
    setError("");
    setStatus("");
    try {
      await requestJson(ITEMS_URL, {
        method: values.id ? "PUT" : "POST",
        body: JSON.stringify({ ...values, weight: Number(values.weight) }),
      });
      setStatus(values.id ? "Skill updated." : "Skill added.");
      itemForm.reset(emptyItem(values.sectionId));
      setEditingItem(false);
      setItemDialogOpen(false);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save skill.");
    }
  });

  const runConfirm = async () => {
    if (!confirm) return;
    setConfirmPending(true);
    setError("");
    setStatus("");
    try {
      await requestJson(confirm.type === "section" ? SECTIONS_URL : ITEMS_URL, {
        method: "DELETE",
        body: JSON.stringify({ id: confirm.id }),
      });
      setStatus(confirm.type === "section" ? "Section deleted." : "Skill deleted.");
      setConfirm(null);
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete.");
    } finally {
      setConfirmPending(false);
    }
  };

  /**
   * Reorder by rewriting sortOrder as the list index through the existing PUT
   * endpoints. Only rows whose index changed are sent, so seeded rows that all
   * share sortOrder 0 get normalised the first time they are moved.
   */
  const persistOrder = async <T extends { id: number; sortOrder: number }>(
    list: T[],
    url: string,
    toPayload: (row: T, sortOrder: number) => object,
  ) => {
    setReordering(true);
    setError("");
    setStatus("");
    try {
      for (const [index, row] of list.entries()) {
        if (row.sortOrder === index) continue;
        await requestJson(url, { method: "PUT", body: JSON.stringify(toPayload(row, index)) });
      }
      await load();
    } catch (orderError) {
      setError(orderError instanceof Error ? orderError.message : "Failed to reorder.");
      await load();
    } finally {
      setReordering(false);
    }
  };

  const moveSection = (index: number, direction: -1 | 1) =>
    persistOrder(swapped(sections, index, direction), SECTIONS_URL, (section, sortOrder) => ({
      id: section.id,
      key: section.key,
      title: section.title,
      subtitle: section.subtitle,
      description: section.description,
      layer: section.layer,
      accent: section.accent,
      sortOrder,
    }));

  const moveItem = (section: V2SkillSection, index: number, direction: -1 | 1) =>
    persistOrder(swapped(section.skills, index, direction), ITEMS_URL, (skill: V2SkillItem, sortOrder) => ({
      ...skill,
      sortOrder,
    }));

  const openNewSection = () => {
    sectionForm.reset({ ...EMPTY_SECTION, sortOrder: sections.length });
    setEditingSection(false);
    setSectionDialogOpen(true);
  };

  const openEditSection = (section: V2SkillSection) => {
    sectionForm.reset({
      id: section.id,
      key: section.key,
      title: section.title,
      subtitle: section.subtitle,
      description: section.description,
      layer: section.layer,
      accent: section.accent,
      sortOrder: section.sortOrder,
    });
    setEditingSection(true);
    setSectionDialogOpen(true);
  };

  const openNewItem = (section: V2SkillSection) => {
    itemForm.reset({ ...emptyItem(section.id), sortOrder: section.skills.length });
    setEditingItem(false);
    setItemDialogOpen(true);
  };

  const openEditItem = (section: V2SkillSection, skill: V2SkillItem) => {
    itemForm.reset({
      id: skill.id,
      sectionId: section.id,
      name: skill.name,
      title: skill.title,
      icon: skill.icon,
      note: skill.note,
      weight: skill.weight,
      sortOrder: skill.sortOrder,
    });
    setEditingItem(true);
    setItemDialogOpen(true);
  };

  const totalSkills = sections.reduce((sum, section) => sum + section.skills.length, 0);

  return (
    <div>
      <PageHeader
        title="Skills"
        description="Sections and the skills inside them, in the order the homepage reel and /skills render them."
        meta={
          !loading && !loadError
            ? `${sections.length} ${sections.length === 1 ? "section" : "sections"} · ${totalSkills} ${totalSkills === 1 ? "skill" : "skills"}`
            : undefined
        }
        actions={
          <Button onClick={openNewSection} disabled={loading}>
            <Plus />
            New section
          </Button>
        }
      />

      <div className="space-y-4">
        {status ? <Alert tone="success">{status}</Alert> : null}
        {error ? <Alert tone="danger">{error}</Alert> : null}

        {loading ? (
          <ListSkeleton rows={5} />
        ) : loadError ? (
          <Alert
            tone="danger"
            title="Could not load skills"
            action={
              <Button size="sm" variant="secondary" onClick={retryLoad}>
                Retry
              </Button>
            }
          >
            {loadError}
          </Alert>
        ) : !sections.length ? (
          <EmptyState
            icon={Layers}
            title="No sections yet"
            description="Run npm run db:seed:skills to load the starting content, or create the first section."
            action={
              <Button onClick={openNewSection}>
                <Plus />
                New section
              </Button>
            }
          />
        ) : (
          sections.map((section, sectionIndex) => (
            <section
              key={section.id}
              aria-labelledby={`v2-section-${section.id}`}
              className="overflow-hidden rounded-xl border border-dash-border bg-dash-surface"
            >
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-dash-border px-4 py-4 sm:px-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      aria-hidden
                      className="size-3 shrink-0 rounded-full border border-dash-border-strong"
                      style={{ background: section.accent }}
                    />
                    <h2 id={`v2-section-${section.id}`} className="text-[15px] font-semibold text-dash-fg">
                      {section.title}
                    </h2>
                    <Badge className="font-mono">{section.key}</Badge>
                    {section.layer ? <Badge>Layer: {section.layer}</Badge> : null}
                    <Badge tone="accent">
                      {section.skills.length} {section.skills.length === 1 ? "skill" : "skills"}
                    </Badge>
                  </div>
                  {section.subtitle ? (
                    <p className="mt-1.5 text-sm text-dash-fg-2">{section.subtitle}</p>
                  ) : null}
                  {section.description ? (
                    <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-dash-muted">
                      {section.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button size="sm" variant="secondary" onClick={() => openNewItem(section)}>
                    <Plus />
                    Add skill
                  </Button>
                  <ActionDivider />
                  <IconAction
                    label={`Move ${section.title} up`}
                    disabled={reordering || sectionIndex === 0}
                    onClick={() => void moveSection(sectionIndex, -1)}
                  >
                    <ArrowUp />
                  </IconAction>
                  <IconAction
                    label={`Move ${section.title} down`}
                    disabled={reordering || sectionIndex === sections.length - 1}
                    onClick={() => void moveSection(sectionIndex, 1)}
                  >
                    <ArrowDown />
                  </IconAction>
                  <ActionDivider />
                  <IconAction label={`Edit section ${section.title}`} onClick={() => openEditSection(section)}>
                    <Pencil />
                  </IconAction>
                  <IconAction
                    label={`Delete section ${section.title}`}
                    tone="danger"
                    onClick={() => setConfirm({ type: "section", id: section.id, label: section.title })}
                  >
                    <Trash2 />
                  </IconAction>
                </div>
              </header>

              {section.skills.length ? (
                <ul className="divide-y divide-dash-border" aria-label={`Skills in ${section.title}`}>
                  {section.skills.map((skill, index) => (
                    <li
                      key={skill.id}
                      className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 pl-4 pr-3 transition-colors hover:bg-dash-raised/60 sm:pl-8"
                    >
                      <span className="w-5 shrink-0 text-right text-xs tabular-nums text-dash-muted">
                        {index + 1}
                      </span>
                      <SkillIcon name={skill.name} icon={skill.icon} />
                      <div className="min-w-0 flex-1 basis-40">
                        <p className="truncate text-sm">
                          <span className="font-medium text-dash-fg">{skill.name}</span>
                          {skill.title ? <span className="text-dash-fg-2"> · {skill.title}</span> : null}
                        </p>
                        {skill.note ? (
                          <p className="truncate text-xs text-dash-muted" title={skill.note}>
                            {skill.note}
                          </p>
                        ) : null}
                      </div>
                      <div className="ml-auto flex shrink-0 items-center">
                        <IconAction
                          label={`Move ${skill.name} up`}
                          disabled={reordering || index === 0}
                          onClick={() => void moveItem(section, index, -1)}
                        >
                          <ArrowUp />
                        </IconAction>
                        <IconAction
                          label={`Move ${skill.name} down`}
                          disabled={reordering || index === section.skills.length - 1}
                          onClick={() => void moveItem(section, index, 1)}
                        >
                          <ArrowDown />
                        </IconAction>
                        <ActionDivider />
                        <IconAction label={`Edit ${skill.name}`} onClick={() => openEditItem(section, skill)}>
                          <Pencil />
                        </IconAction>
                        <IconAction
                          label={`Delete ${skill.name}`}
                          tone="danger"
                          onClick={() => setConfirm({ type: "item", id: skill.id, label: skill.name })}
                        >
                          <Trash2 />
                        </IconAction>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
                  <p className="text-[13px] text-dash-muted">
                    No skills yet. A section with none is skipped by the reel.
                  </p>
                  <Button size="sm" variant="ghost" onClick={() => openNewItem(section)}>
                    <Plus />
                    Add skill
                  </Button>
                </div>
              )}
            </section>
          ))
        )}
      </div>

      <Dialog
        open={sectionDialogOpen}
        onClose={() => setSectionDialogOpen(false)}
        title={editingSection ? "Edit section" : "New section"}
        description="Title, subtitle and description are the copy the reel prints for this scene."
      >
        <form onSubmit={submitSection} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Title"
              placeholder="Interface"
              error={sectionForm.formState.errors.title ? "Title is required." : undefined}
              {...sectionForm.register("title", { required: true })}
            />
            <Input
              label="Subtitle"
              placeholder="What the user touches"
              {...sectionForm.register("subtitle")}
            />
          </div>
          <Textarea
            label="Description"
            rows={3}
            placeholder="One or two sentences of point of view."
            {...sectionForm.register("description")}
          />
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Layer"
              hint="Short word on the slate line, e.g. Interface"
              {...sectionForm.register("layer")}
            />
            <Input
              label="Key"
              hint="URL-safe id. Left blank, it is derived from the title."
              {...sectionForm.register("key")}
            />
            <Input
              label="Sort order"
              type="number"
              {...sectionForm.register("sortOrder", { valueAsNumber: true })}
            />
          </div>
          <Controller
            control={sectionForm.control}
            name="accent"
            render={({ field }) => (
              <ColorPicker label="Accent" value={field.value} onChange={field.onChange} />
            )}
          />
          <div className="flex justify-end gap-2 border-t border-dash-border pt-4">
            <Button variant="ghost" onClick={() => setSectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={sectionForm.formState.isSubmitting}>
              {sectionForm.formState.isSubmitting
                ? "Saving…"
                : editingSection
                  ? "Save section"
                  : "Create section"}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={itemDialogOpen}
        onClose={() => setItemDialogOpen(false)}
        title={editingItem ? "Edit skill" : "New skill"}
        description="Title is the one-line role shown beside the name. There is no years field."
      >
        <form onSubmit={submitItem} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Name"
              placeholder="React"
              error={itemForm.formState.errors.name ? "Name is required." : undefined}
              {...itemForm.register("name", { required: true })}
            />
            <Input
              label="Title"
              placeholder="Primary UI runtime"
              {...itemForm.register("title")}
            />
          </div>
          <Input
            label="Icon"
            hint="Path under /public, e.g. /tech_icons/React.svg. Blank falls back to a monogram."
            placeholder="/tech_icons/React.svg"
            {...itemForm.register("icon")}
          />
          <Textarea
            label="Note"
            rows={2}
            hint="Internal detail. Not rendered by the reel today."
            {...itemForm.register("note")}
          />
          <div className="grid gap-4 md:grid-cols-3">
            <Select
              label="Section"
              hint={editingItem ? "Can't be changed after creation. Add the skill to the other section instead." : undefined}
              {...itemForm.register("sectionId", { valueAsNumber: true, disabled: editingItem })}
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </Select>
            <Input
              label="Weight"
              type="number"
              step="0.01"
              min="0"
              max="1"
              hint="0–1. Drives icon size and ordering — never shown as a number."
              {...itemForm.register("weight", { valueAsNumber: true })}
            />
            <Input
              label="Sort order"
              type="number"
              {...itemForm.register("sortOrder", { valueAsNumber: true })}
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-dash-border pt-4">
            <Button variant="ghost" onClick={() => setItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={itemForm.formState.isSubmitting}>
              {itemForm.formState.isSubmitting ? "Saving…" : editingItem ? "Save skill" : "Add skill"}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={runConfirm}
        pending={confirmPending}
        danger
        title={confirm?.type === "section" ? "Delete section" : "Delete skill"}
        confirmLabel="Delete"
        message={
          confirm?.type === "section"
            ? `Delete "${confirm.label}" and every skill inside it? This cannot be undone.`
            : `Delete "${confirm?.label}"? This cannot be undone.`
        }
      />
    </div>
  );
}
