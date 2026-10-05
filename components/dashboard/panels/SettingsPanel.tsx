"use client";

import { useCallback, useEffect, useId, useState, type ReactNode } from "react";
import { Check, Plus, RotateCw, X } from "lucide-react";
import { Controller, useFieldArray, useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";

import { requestJson } from "@/components/dashboard/api";
import { Alert } from "@/components/ui/dashboard/Alert";
import { Badge } from "@/components/ui/dashboard/Badge";
import { Button } from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import { ImageUpload } from "@/components/ui/dashboard/ImageUpload";
import { Input } from "@/components/ui/dashboard/Input";
import { PageHeader } from "@/components/ui/dashboard/PageHeader";
import { Skeleton } from "@/components/ui/dashboard/Skeleton";
import { fieldClass, hintClass, labelClass } from "@/components/ui/dashboard/fieldStyles";
import { cn } from "@/lib/cn";
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
  introEnabled: "on" | "off";
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
    introEnabled: data.introEnabled === false ? "off" : "on",
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
    introEnabled: values.introEnabled !== "off",
  };
}

const SITE_VERSION_OPTIONS: Array<{ value: SiteVersion; title: string; description: string }> = [
  {
    value: "v1",
    title: "v1 — Original site",
    description: "Shows the original design, built from “Projects v1” and “Skills v1”.",
  },
  {
    value: "v2",
    title: "v2 — Redesigned site",
    description: "Shows the redesign, built from the Projects and Skills pages above.",
  },
];

const INTRO_OPTIONS: Array<{ value: "on" | "off"; title: string; description: string }> = [
  { value: "on", title: "Play the intro", description: "Plays once per browser session." },
  { value: "off", title: "Skip the intro", description: "Visitors go straight to the page." },
];

/** Selectable option card backed by a native radio input. */
function RadioCard({
  registration,
  value,
  title,
  description,
  badge,
}: {
  registration: UseFormRegisterReturn;
  value: string;
  title: string;
  description: string;
  badge?: ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border border-dash-border-strong bg-dash-field p-4 transition-colors",
        "hover:bg-dash-raised has-[:checked]:border-dash-accent has-[:checked]:bg-dash-accent-soft",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-dash-accent/60",
      )}
    >
      <input type="radio" value={value} {...registration} className="mt-0.5 size-4 shrink-0 accent-dash-accent focus:outline-none" />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-dash-fg">{title}</span>
          {badge}
        </span>
        <span className="mt-1 block text-[13px] leading-relaxed text-dash-muted">{description}</span>
      </span>
    </label>
  );
}

/** Long-text field with a Write / Preview switch for the **highlight** syntax. */
function SummaryField({
  label,
  hint,
  rows,
  minHeight,
  placeholder,
  preview,
  onPreviewChange,
  liveValue,
  registration,
}: {
  label: string;
  hint: string;
  rows: number;
  minHeight: string;
  placeholder: string;
  preview: boolean;
  onPreviewChange: (preview: boolean) => void;
  liveValue: string;
  registration: UseFormRegisterReturn;
}) {
  const id = useId();
  const tabClass = (active: boolean) =>
    cn(
      "h-7 rounded-md px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent/60",
      active ? "bg-dash-raised text-dash-fg" : "text-dash-muted hover:text-dash-fg",
    );

  return (
    <div className="space-y-1.5 md:col-span-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        <div role="group" aria-label={`${label} view`} className="flex gap-0.5 rounded-lg border border-dash-border p-0.5">
          <button type="button" className={tabClass(!preview)} aria-pressed={!preview} onClick={() => onPreviewChange(false)}>
            Write
          </button>
          <button type="button" className={tabClass(preview)} aria-pressed={preview} onClick={() => onPreviewChange(true)}>
            Preview
          </button>
        </div>
      </div>
      {preview ? (
        <div
          className={cn("rounded-lg border border-dash-border-strong bg-dash-field px-3 py-2 text-sm leading-relaxed text-dash-fg-2", minHeight)}
        >
          {renderSummaryWithHighlights(liveValue ?? "")}
        </div>
      ) : (
        <textarea
          id={id}
          rows={rows}
          placeholder={placeholder}
          className={cn(fieldClass, "py-2 leading-relaxed", minHeight)}
          {...registration}
        />
      )}
      <p className={hintClass}>{hint}</p>
    </div>
  );
}

function ListLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-2">
      <p className={labelClass}>{children}</p>
      {hint ? <p className={cn("mt-0.5", hintClass)}>{hint}</p> : null}
    </div>
  );
}

function RemoveButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <Button type="button" variant="ghost" className="w-9 px-0" aria-label={label} title={label} onClick={onClick} disabled={disabled}>
      <X />
    </Button>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading settings">
      {[3, 4, 2].map((rows, i) => (
        <div key={i} className="rounded-xl border border-dash-border bg-dash-surface p-5">
          <Skeleton className="mb-5 h-4 w-40" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: rows }, (_, j) => (
              <Skeleton key={j} className="h-14 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SettingsPanel() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  /** Version currently stored on the server, i.e. what visitors see right now. */
  const [liveVersion, setLiveVersion] = useState<SiteVersion | null>(null);
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
      introEnabled: "on",
    },
  });

  const designationFields = useFieldArray({ control: form.control, name: "designations" });
  const socialsFields = useFieldArray({ control: form.control, name: "socials" });
  const focusedFields = useFieldArray({ control: form.control, name: "currentlyFocusedOn" });

  const shortSummaryLive = useWatch({ control: form.control, name: "shortSummary" });
  const detailedSummaryLive = useWatch({ control: form.control, name: "detailedSummary" });
  const selectedVersion = useWatch({ control: form.control, name: "siteVersion" });

  const load = useCallback(async () => {
    try {
      const data = await requestJson<PortfolioSettings>("/api/dashboard/settings");
      const values = toFormValues(data);
      form.reset(values);
      setLiveVersion(values.siteVersion);
      setLoadError("");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    void load();
  }, [load]);

  const retry = () => {
    setLoading(true);
    setLoadError("");
    void load();
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setStatus("");
    setError("");
    try {
      const payload = fromFormValues(values);
      await requestJson("/api/dashboard/settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      // Re-baseline so "Unsaved changes" tracks edits made after this save.
      form.reset(values);
      setLiveVersion(payload.siteVersion);
      setStatus("All changes saved.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save settings.");
    }
  });

  const { isSubmitting, isDirty, errors } = form.formState;
  const versionChanging = liveVersion !== null && selectedVersion !== liveVersion;
  const ready = !loading && !loadError;

  return (
    <form onSubmit={onSubmit}>
      <PageHeader
        title="Settings"
        description="Your profile details and the site-wide options every visitor gets."
      />

      {loading ? <SettingsSkeleton /> : null}

      {!loading && loadError ? (
        <Alert
          tone="danger"
          title="Couldn’t load settings"
          action={
            <Button size="sm" variant="secondary" onClick={retry}>
              <RotateCw />
              Retry
            </Button>
          }
        >
          {loadError} Saving is disabled until settings load, so nothing gets overwritten with blanks.
        </Alert>
      ) : null}

      {ready ? (
        <div className="space-y-6">
          <Card
            title="Site"
            subtitle="Applies to every visitor as soon as you save."
          >
            <fieldset>
              <legend className={labelClass}>Site version</legend>
              <p className={cn("mt-0.5", hintClass)}>Decides which design the public site shows.</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {SITE_VERSION_OPTIONS.map((option) => (
                  <RadioCard
                    key={option.value}
                    registration={form.register("siteVersion")}
                    value={option.value}
                    title={option.title}
                    description={option.description}
                    badge={option.value === liveVersion ? <Badge tone="success">Live now</Badge> : null}
                  />
                ))}
              </div>
            </fieldset>
            {versionChanging ? (
              <Alert tone="warning" title={`Switching every visitor to ${selectedVersion}`} className="mt-4">
                Saving changes replaces the {liveVersion} site with {selectedVersion} for everyone, immediately.
              </Alert>
            ) : null}

            <fieldset className="mt-6 border-t border-dash-border pt-5">
              <legend className={labelClass}>Intro animation</legend>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {INTRO_OPTIONS.map((option) => (
                  <RadioCard
                    key={option.value}
                    registration={form.register("introEnabled")}
                    value={option.value}
                    title={option.title}
                    description={option.description}
                  />
                ))}
              </div>
            </fieldset>
          </Card>

          <Card title="Profile" subtitle="Who you are, as shown in the hero and about sections.">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Name"
                placeholder="Your full name"
                error={errors.name ? "Name is required." : undefined}
                {...form.register("name", { required: true })}
              />
              <Input
                label="Availability"
                placeholder="Open to opportunities"
                error={errors.availability ? "Availability is required." : undefined}
                {...form.register("availability", { required: true })}
              />

              <div className="md:col-span-2">
                <ListLabel hint="Rotating titles, e.g. Full stack developer.">Designations</ListLabel>
                <div className="space-y-2">
                  {designationFields.fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <div className="min-w-0 flex-1">
                        <Input
                          aria-label={`Designation ${index + 1}`}
                          placeholder="e.g. Full stack developer"
                          {...form.register(`designations.${index}.value`)}
                        />
                      </div>
                      <RemoveButton
                        label={`Remove designation ${index + 1}`}
                        onClick={() => designationFields.remove(index)}
                        disabled={designationFields.fields.length === 1}
                      />
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="ghost" className="mt-2" onClick={() => designationFields.append({ value: "" })}>
                  <Plus />
                  Add designation
                </Button>
              </div>

              <SummaryField
                label="Short summary"
                hint="One or two lines for cards and meta. Wrap words in **double** or ***triple*** asterisks to highlight them."
                rows={3}
                minHeight="min-h-[88px]"
                placeholder="One or two lines for cards and meta."
                preview={shortSummaryPreview}
                onPreviewChange={setShortSummaryPreview}
                liveValue={shortSummaryLive}
                registration={form.register("shortSummary")}
              />
              <SummaryField
                label="Detailed summary"
                hint="Longer bio for the about section. Same highlight syntax."
                rows={6}
                minHeight="min-h-[160px]"
                placeholder="Longer bio for the about section."
                preview={detailedSummaryPreview}
                onPreviewChange={setDetailedSummaryPreview}
                liveValue={detailedSummaryLive}
                registration={form.register("detailedSummary")}
              />

              <div className="md:col-span-2">
                <ListLabel>Currently focused on</ListLabel>
                <div className="space-y-2">
                  {focusedFields.fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <div className="min-w-0 flex-1">
                        <Input
                          aria-label={`Focus item ${index + 1}`}
                          placeholder="e.g. Distributed systems"
                          {...form.register(`currentlyFocusedOn.${index}.value`)}
                        />
                      </div>
                      <RemoveButton
                        label={`Remove focus item ${index + 1}`}
                        onClick={() => focusedFields.remove(index)}
                        disabled={focusedFields.fields.length === 1}
                      />
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="ghost" className="mt-2" onClick={() => focusedFields.append({ value: "" })}>
                  <Plus />
                  Add focus item
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Contact & socials">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Email" type="email" placeholder="you@domain.com" {...form.register("email")} />
              <Input label="Phone" type="tel" placeholder="+1 …" {...form.register("phone")} />
              <Input label="Location" placeholder="City, Country" {...form.register("location")} />

              <div className="md:col-span-2">
                <ListLabel hint="Icon name such as github, linkedin or mail, plus the full URL. Rows missing either are skipped.">
                  Social links
                </ListLabel>
                <div className="space-y-2">
                  {socialsFields.fields.map((field, index) => (
                    <div key={field.id} className="flex flex-wrap gap-2 sm:flex-nowrap">
                      <div className="w-full sm:w-40 sm:shrink-0">
                        <Input
                          aria-label={`Social ${index + 1} icon name`}
                          placeholder="github"
                          {...form.register(`socials.${index}.iconName`)}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Input
                          aria-label={`Social ${index + 1} link`}
                          placeholder="https://…"
                          {...form.register(`socials.${index}.link`)}
                        />
                      </div>
                      <RemoveButton
                        label={`Remove social link ${index + 1}`}
                        onClick={() => socialsFields.remove(index)}
                        disabled={socialsFields.fields.length === 1}
                      />
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2"
                  onClick={() => socialsFields.append({ iconName: "", link: "" })}
                >
                  <Plus />
                  Add social link
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Stats" subtitle="Headline numbers shown on the public site.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Total projects"
                type="number"
                min={0}
                className="tabular-nums"
                {...form.register("totalProjects", { valueAsNumber: true })}
              />
              <Input
                label="Years of experience"
                type="number"
                min={0}
                className="tabular-nums"
                {...form.register("yearsOfExperience", { valueAsNumber: true })}
              />
              <Input
                label="Happy clients"
                type="number"
                min={0}
                className="tabular-nums"
                {...form.register("happyClients", { valueAsNumber: true })}
              />
            </div>
          </Card>

          <Card title="Images" subtitle="Uploaded images are saved to your profile when you save changes.">
            <div className="grid gap-6 md:grid-cols-2">
              <Controller
                name="primaryAvatar"
                control={form.control}
                render={({ field }) => (
                  <ImageUpload label="Primary avatar" value={field.value} onChange={field.onChange} hint="Main portrait in the hero." />
                )}
              />
              <Controller
                name="subAvatar"
                control={form.control}
                render={({ field }) => (
                  <ImageUpload
                    label="Secondary avatar"
                    value={field.value}
                    onChange={field.onChange}
                    hint="Second portrait, e.g. in the about section."
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
                      hint="Wide image for sections that use a banner."
                    />
                  )}
                />
              </div>
            </div>
          </Card>

          {error ? (
            <Alert tone="danger" title="Changes not saved">
              {error}
            </Alert>
          ) : null}

          <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dash-border-strong bg-dash-surface px-4 py-3">
            <p className="text-[13px]" aria-live="polite">
              {isSubmitting ? (
                <span className="text-dash-muted">Saving…</span>
              ) : isDirty ? (
                <span className="inline-flex items-center gap-2 text-dash-warning">
                  <span className="size-1.5 rounded-full bg-current" aria-hidden />
                  Unsaved changes
                </span>
              ) : status ? (
                <span className="inline-flex items-center gap-1.5 text-dash-success">
                  <Check className="size-4" aria-hidden />
                  {status}
                </span>
              ) : (
                <span className="text-dash-muted">No unsaved changes</span>
              )}
            </p>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
