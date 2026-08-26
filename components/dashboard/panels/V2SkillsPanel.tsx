"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { requestJson } from "@/components/dashboard/api";
import { Button } from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import { ColorPicker } from "@/components/ui/dashboard/ColorPicker";
import { ConfirmDialog } from "@/components/ui/dashboard/ConfirmDialog";
import { Dialog } from "@/components/ui/dashboard/Dialog";
import { Input } from "@/components/ui/dashboard/Input";
import { Select } from "@/components/ui/dashboard/Select";
import { Textarea } from "@/components/ui/dashboard/Textarea";
import type { V2SkillSection } from "@/lib/dashboard/types";

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
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
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
    try {
      const data = await requestJson<V2SkillSection[]>(SECTIONS_URL);
      setSections(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load v2 skills.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

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

  const openEditItem = (section: V2SkillSection, skill: V2SkillSection["skills"][number]) => {
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

  return (
    <div className="space-y-4">
      <Card
        title="Skills — v2 reel"
        subtitle="Sections and their skills, as the v2 homepage reel and /skills render them."
        headerSlot={
          <Button type="button" onClick={openNewSection}>
            <Plus className="mr-1.5 h-4 w-4" />
            New section
          </Button>
        }
      >
        {status ? <p className="mb-3 text-sm text-emerald-300">{status}</p> : null}
        {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}
        {!sections.length ? (
          <p className="text-sm text-slate-400">
            No sections yet. Run <code className="text-slate-300">npm run db:seed:skills</code> to
            load the starting content, or create one above.
          </p>
        ) : null}
      </Card>

      {sections.map((section) => (
        <Card key={section.id}>
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ background: section.accent }}
                />
                <h3 className="truncate text-sm font-semibold text-white">{section.title}</h3>
                <span className="shrink-0 rounded-full border border-white/12 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  {section.key}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{section.subtitle}</p>
              {section.description ? (
                <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-slate-500">
                  {section.description}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 gap-2">
              <Button type="button" variant="secondary" onClick={() => openNewItem(section)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Skill
              </Button>
              <Button type="button" variant="ghost" onClick={() => openEditSection(section)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() =>
                  setConfirm({ type: "section", id: section.id, label: section.title })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ul className="space-y-1.5">
            {section.skills.map((skill) => (
              <li
                key={skill.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2"
              >
                <span className="text-sm text-slate-100">{skill.name}</span>
                <span className="text-xs text-slate-400">{skill.title}</span>
                {skill.icon ? (
                  <span className="font-mono text-[10px] text-slate-600">{skill.icon}</span>
                ) : null}
                <span className="ml-auto flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    className="p-1 text-slate-400 transition-colors hover:text-white"
                    aria-label={`Edit ${skill.name}`}
                    onClick={() => openEditItem(section, skill)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="p-1 text-rose-300 transition-colors hover:text-rose-200"
                    aria-label={`Delete ${skill.name}`}
                    onClick={() => setConfirm({ type: "item", id: skill.id, label: skill.name })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              </li>
            ))}
            {!section.skills.length ? (
              <li className="text-xs text-slate-500">
                No skills yet — a section with none is skipped by the reel.
              </li>
            ) : null}
          </ul>
        </Card>
      ))}

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
          <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
            <Button type="button" variant="ghost" onClick={() => setSectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingSection ? "Save section" : "Create section"}</Button>
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
            <Select label="Section" {...itemForm.register("sectionId", { valueAsNumber: true })}>
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
          <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
            <Button type="button" variant="ghost" onClick={() => setItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingItem ? "Save skill" : "Add skill"}</Button>
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
