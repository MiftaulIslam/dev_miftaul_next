"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";

import { uploadAsset } from "@/components/dashboard/api";
import { cn } from "@/lib/cn";

type ImageUploadProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  compact?: boolean;
};

export function ImageUpload({ label, value, onChange, hint, compact }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr("");
    setBusy(true);
    try {
      const { url } = await uploadAsset(file);
      onChange(url);
    } catch (uploadError) {
      setErr(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <span className="text-[13px] font-medium text-dash-fg-2">{label}</span>
      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-start",
          compact ? "sm:items-center" : "",
        )}
      >
        <div
          className={cn(
            "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-dash-border-strong bg-dash-field",
            compact ? "h-20 w-20" : "aspect-video w-full max-w-[240px] min-h-[120px]",
            value ? "border-solid border-dash-border" : "",
          )}
        >
          {value ? (
            <Image
              src={value}
              alt=""
              fill
              className="object-cover"
              sizes={compact ? "80px" : "240px"}
              unoptimized={value.startsWith("/uploads/")}
            />
          ) : (
            <Upload className={cn("text-dash-muted", compact ? "h-6 w-6" : "h-9 w-9")} />
          )}
          {busy ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55">
              <Loader2 className="h-7 w-7 animate-spin text-dash-accent" />
            </div>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="h-8 rounded-lg border border-dash-border-strong bg-dash-raised px-3 text-[13px] font-medium text-dash-fg transition-colors hover:bg-[#1f2430] disabled:opacity-50"
            >
              {value ? "Replace" : "Upload"}
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="h-8 rounded-lg px-3 text-[13px] text-dash-fg-2 transition-colors hover:bg-dash-raised hover:text-dash-danger"
              >
                Clear
              </button>
            ) : null}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={onPick}
          />
          {hint ? <p className="text-xs leading-relaxed text-dash-muted">{hint}</p> : null}
          {err ? <p className="text-xs font-medium text-dash-danger">{err}</p> : null}
        </div>
      </div>
    </div>
  );
}
