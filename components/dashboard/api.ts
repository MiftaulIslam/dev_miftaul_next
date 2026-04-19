"use client";

export async function requestJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => null)) as { error?: string } | T | null;
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data && data.error
        ? data.error
        : "Request failed.";
    throw new Error(message);
  }

  return data as T;
}

export async function uploadAsset(file: File): Promise<{ url: string }> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/api/dashboard/upload", {
    method: "POST",
    body,
  });
  const data = (await response.json().catch(() => null)) as { error?: string; url?: string } | null;
  if (!response.ok) {
    const message = data?.error ?? "Upload failed.";
    throw new Error(message);
  }
  if (!data?.url) {
    throw new Error("Upload failed.");
  }
  return { url: data.url };
}

export function linesToArray(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function arrayToLines(value: string[] | undefined) {
  return (value ?? []).join("\n");
}

/** Default rows for `useFieldArray` from a string[] (one row with empty value if array is empty). */
export function lineFieldsFromStrings(values: string[] | undefined): { value: string }[] {
  const cleaned = (values ?? []).map((s) => s.trim()).filter(Boolean);
  return cleaned.length ? cleaned.map((value) => ({ value })) : [{ value: "" }];
}

export function stringsFromLineFields(fields: { value: string }[]): string[] {
  return fields.map((f) => f.value.trim()).filter(Boolean);
}

