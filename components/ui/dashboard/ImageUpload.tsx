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
      <span className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">{label}</span>
      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-start",
          compact ? "sm:items-center" : "",
        )}
      >
        <div
          className={cn(
            "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/18 bg-slate-950/70",
            compact ? "h-20 w-20" : "aspect-video w-full max-w-[240px] min-h-[120px]",
            value ? "border-solid border-white/15" : "",
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
            <Upload className={cn("text-slate-600", compact ? "h-6 w-6" : "h-9 w-9")} />
          )}
          {busy ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55">
              <Loader2 className="h-7 w-7 animate-spin text-cyan-300" />
            </div>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="rounded-xl border border-white/14 bg-slate-900/90 px-3 py-2 text-sm font-medium text-white transition hover:border-blue-400/45 hover:bg-slate-800"
            >
              {value ? "Replace" : "Upload"}
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:text-rose-300"
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
          {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
          {err ? <p className="text-xs text-rose-300">{err}</p> : null}
        </div>
      </div>
    </div>
  );
}
