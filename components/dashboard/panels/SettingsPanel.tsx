"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";

import { requestJson } from "@/components/dashboard/api";
import { Button } from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import { ImageUpload } from "@/components/ui/dashboard/ImageUpload";
import { Input } from "@/components/ui/dashboard/Input";
import { Select } from "@/components/ui/dashboard/Select";
import { renderSummaryWithHighlights } from "@/lib/dashboard/render-summary-highlights";
import type { PortfolioSettings } from "@/lib/dashboard/types";
import { coerceSiteVersion, DEFAULT_SITE_VERSION, type SiteVersion } from "@/lib/siteVersion";

type SettingsFormValues = {
  name: string;
  totalProjects: number;
  yearsOfExperience: number;
  availability: string;
  designations: Array<{ value: string }>;
  shortSummary: string;
  primaryAvatar: string;
  subAvatar: string;
  bannerImage: string;
  location: string;
  email: string;
  phone: string;
  socials: Array<{ iconName: string; link: string }>;
  happyClients: number;
  currentlyFocusedOn: Array<{ value: string }>;
  detailedSummary: string;
  siteVersion: SiteVersion;
};

function toFormValues(data: PortfolioSettings): SettingsFormValues {
  return {
    name: data.name,
    totalProjects: data.totalProjects,
    yearsOfExperience: data.yearsOfExperience,
    availability: data.availability,
    designations: data.designations.length
      ? data.designations.map((value) => ({ value }))
      : [{ value: "" }],
    shortSummary: data.shortSummary,
    primaryAvatar: data.primaryAvatar,
    subAvatar: data.subAvatar,
    bannerImage: data.bannerImage,
    location: data.location,
    email: data.email,
    phone: data.phone,
    socials: data.socials.length ? data.socials : [{ iconName: "", link: "" }],
    happyClients: data.happyClients,
    currentlyFocusedOn: data.currentlyFocusedOn.length
      ? data.currentlyFocusedOn.map((value) => ({ value }))
      : [{ value: "" }],
    detailedSummary: data.detailedSummary,
    siteVersion: coerceSiteVersion(data.siteVersion),
  };
}

function fromFormValues(values: SettingsFormValues) {
  return {
    name: values.name.trim(),
    totalProjects: Number(values.totalProjects) || 0,
    yearsOfExperience: Number(values.yearsOfExperience) || 0,
    availability: values.availability.trim(),
    designations: values.designations.map((item) => item.value.trim()).filter(Boolean),
    shortSummary: values.shortSummary.trim(),
    primaryAvatar: values.primaryAvatar.trim(),
    subAvatar: values.subAvatar.trim(),
    bannerImage: values.bannerImage.trim(),
    location: values.location.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    socials: values.socials
      .map((item) => ({ iconName: item.iconName.trim(), link: item.link.trim() }))
      .filter((item) => item.iconName && item.link),
    happyClients: Number(values.happyClients) || 0,
    currentlyFocusedOn: values.currentlyFocusedOn
      .map((item) => item.value.trim())
      .filter(Boolean),
    detailedSummary: values.detailedSummary.trim(),
    siteVersion: coerceSiteVersion(values.siteVersion),
  };
}

export default function SettingsPanel() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [shortSummaryPreview, setShortSummaryPreview] = useState(false);
  const [detailedSummaryPreview, setDetailedSummaryPreview] = useState(false);

  const form = useForm<SettingsFormValues>({
    defaultValues: {
      name: "",
      totalProjects: 0,
      yearsOfExperience: 0,
      availability: "",
      designations: [{ value: "" }],
      shortSummary: "",
      primaryAvatar: "",
      subAvatar: "",
      bannerImage: "",
      location: "",
      email: "",
      phone: "",
      socials: [{ iconName: "", link: "" }],
      happyClients: 0,
      currentlyFocusedOn: [{ value: "" }],
      detailedSummary: "",
      siteVersion: DEFAULT_SITE_VERSION,
    },
  });

  const designationFields = useFieldArray({ control: form.control, name: "designations" });
  const socialsFields = useFieldArray({ control: form.control, name: "socials" });
  const focusedFields = useFieldArray({ control: form.control, name: "currentlyFocusedOn" });

  const shortSummaryLive = useWatch({ control: form.control, name: "shortSummary" });
  const detailedSummaryLive = useWatch({ control: form.control, name: "detailedSummary" });

  useEffect(() => {
    const load = async () => {
      setError("");
      try {
        const data = await requestJson<PortfolioSettings>("/api/dashboard/settings");
        form.reset(toFormValues(data));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load settings.");
      }
    };

    void load();
  }, [form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setStatus("");
    setError("");
    try {
      const payload = fromFormValues(values);
      await requestJson("/api/dashboard/settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setStatus("Settings saved successfully.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save settings.");
    }
  });

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Profile</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Settings</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-400">
          Identity, imagery, and copy used on the public portfolio. Images are stored under{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-cyan-200">/public/uploads</code>.
        </p>
      </div>

      <Card title="Site Version" subtitle="Which homepage build the public portfolio serves.">
        <div className="md:max-w-sm">
          <Select
            label="Active version"
            hint="Every visitor sees this build. Takes effect as soon as you save."
            {...form.register("siteVersion")}
          >
            <option value="v1">v1 — Original</option>
            <option value="v2">v2 — Current</option>
          </Select>
        </div>
      </Card>

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Name" placeholder="Your full name" {...form.register("name", { required: true })} />
          <Input
            label="Availability"
            placeholder="Open to opportunities"
            {...form.register("availability", { required: true })}
          />
          <Input
            label="Total Projects"
            type="number"
            {...form.register("totalProjects", { valueAsNumber: true })}
          />
          <Input
            label="Years Of Experience"
            type="number"
            {...form.register("yearsOfExperience", { valueAsNumber: true })}
          />
          <Input label="Location" placeholder="City, Country" {...form.register("location")} />
          <Input label="Email" type="email" placeholder="you@domain.com" {...form.register("email")} />
          <Input label="Phone" placeholder="+1 …" {...form.register("phone")} />
          <Input
            label="Happy Clients"
            type="number"
            {...form.register("happyClients", { valueAsNumber: true })}
          />
        </div>
      </Card>

      <Card title="Media" subtitle="Upload images — paths are saved to your profile.">
        <div className="grid gap-8 md:grid-cols-2">
          <Controller
            name="primaryAvatar"
            control={form.control}
            render={({ field }) => (
              <ImageUpload
                label="Primary avatar"
                value={field.value}
                onChange={field.onChange}
                hint="Hero / main portrait."
              />
            )}
          />
          <Controller
            name="subAvatar"
            control={form.control}
            render={({ field }) => (
              <ImageUpload
                label="Sub avatar"
                value={field.value}
                onChange={field.onChange}
                hint="Secondary shot (e.g. About)."
              />
            )}
          />
          <div className="md:col-span-2">
            <Controller
              name="bannerImage"
              control={form.control}
              render={({ field }) => (
                <ImageUpload
                  label="Banner image"
                  value={field.value}
                  onChange={field.onChange}
                  hint="Wide banner for sections that use it."
                />
              )}
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">Short summary</span>
            <button
              type="button"
              onClick={() => setShortSummaryPreview((v) => !v)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-cyan-300"
              title={shortSummaryPreview ? "Edit" : "Preview"}
              aria-label={shortSummaryPreview ? "Switch to edit mode" : "Switch to preview mode"}
            >
              {shortSummaryPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {shortSummaryPreview ? (
            <div className="min-h-[88px] rounded-xl border border-white/12 bg-slate-950/60 px-3 py-2.5 text-sm">
              {renderSummaryWithHighlights(shortSummaryLive ?? "")}
            </div>
          ) : (
            <textarea
              placeholder="One or two lines for cards and meta. Use **emphasis** or ***strong emphasis***."
              rows={3}
              className="min-h-[88px] w-full rounded-xl border border-white/12 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-400/55 focus:ring-2 focus:ring-blue-500/20"
              {...form.register("shortSummary")}
            />
          )}
        </div>

        <div className="mt-6 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">Detailed summary</span>
            <button
              type="button"
              onClick={() => setDetailedSummaryPreview((v) => !v)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-cyan-300"
              title={detailedSummaryPreview ? "Edit" : "Preview"}
              aria-label={detailedSummaryPreview ? "Switch to edit mode" : "Switch to preview mode"}
            >
              {detailedSummaryPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {detailedSummaryPreview ? (
            <div className="min-h-[160px] rounded-xl border border-white/12 bg-slate-950/60 px-3 py-2.5 text-sm">
              {renderSummaryWithHighlights(detailedSummaryLive ?? "")}
            </div>
          ) : (
            <textarea
              placeholder="Longer bio for the about section. **Bold phrases** and ***key highlights***."
              rows={6}
              className="min-h-[160px] w-full rounded-xl border border-white/12 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-400/55 focus:ring-2 focus:ring-blue-500/20"
              {...form.register("detailedSummary")}
            />
          )}
        </div>
      </Card>

      <Card title="Designations">
        <div className="space-y-2">
          {designationFields.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                className="flex-1"
                placeholder="e.g. Full Stack Developer"
                {...form.register(`designations.${index}.value`)}
              />
              <Button
                type="button"
                variant="danger"
                onClick={() => designationFields.remove(index)}
                disabled={designationFields.fields.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => designationFields.append({ value: "" })}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Designation
          </Button>
        </div>
      </Card>

      <Card title="Social Links" subtitle="Use iconName values like github, linkedin, mail.">
        <div className="space-y-2">
          {socialsFields.fields.map((field, index) => (
            <div key={field.id} className="grid gap-2 md:grid-cols-[160px_1fr_auto]">
              <Input
                placeholder="iconName"
                {...form.register(`socials.${index}.iconName`)}
              />
              <Input placeholder="https://..." {...form.register(`socials.${index}.link`)} />
              <Button
                type="button"
                variant="danger"
                onClick={() => socialsFields.remove(index)}
                disabled={socialsFields.fields.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={() => socialsFields.append({ iconName: "", link: "" })}>
            <Plus className="mr-1 h-4 w-4" />
            Add Social
          </Button>
        </div>
      </Card>

      <Card title="Currently Focused On">
        <div className="space-y-2">
          {focusedFields.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input className="flex-1" {...form.register(`currentlyFocusedOn.${index}.value`)} />
              <Button
                type="button"
                variant="danger"
                onClick={() => focusedFields.remove(index)}
                disabled={focusedFields.fields.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => focusedFields.append({ value: "" })}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Focus Item
          </Button>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save Settings"}
        </Button>
        {status ? <span className="text-sm text-emerald-300">{status}</span> : null}
        {error ? <span className="text-sm text-rose-300">{error}</span> : null}
      </div>
    </form>
  );
}

