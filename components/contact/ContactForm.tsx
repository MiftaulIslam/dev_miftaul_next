"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { REPLY_TARGET_HOURS } from "@/lib/contact/studio";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TIMING_OPTIONS = [
  { value: "asap", label: "As soon as possible", hint: "Active now" },
  { value: "month", label: "Within a month", hint: "A planning horizon" },
  { value: "exploring", label: "Still exploring", hint: "No date yet" },
] as const;

type TimingValue = (typeof TIMING_OPTIONS)[number]["value"];
type FieldName = "name" | "email" | "timing" | "brief";
type Errors = Partial<Record<FieldName, string>>;

function validate(values: {
  name: string;
  email: string;
  timing: TimingValue | "";
  brief: string;
}): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Tell me who this is from.";
  if (!values.email.trim()) {
    errors.email = "Enter an email I can reply to.";
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = "That address will not reach anyone.";
  }
  if (!values.timing) {
    errors.timing = "Pick the closest option so I can answer honestly.";
  }
  if (!values.brief.trim()) errors.brief = "A sentence or two about the work.";
  return errors;
}

/**
 * The shared form machine: blur validation, single-error field focus,
 * multi-error summary focus, disabled progress, failure with retry.
 * The timing control is a real fieldset of native radios so arrow keys move
 * within the group and Tab leaves it — free with radios, expensive to rebuild.
 */
export default function ContactForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    timing: "",
    brief: "",
  });
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [serverError, setServerError] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const firstRadioRef = useRef<HTMLInputElement>(null);
  const briefRef = useRef<HTMLTextAreaElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const errors = validate({
    name: values.name,
    email: values.email,
    timing: values.timing as TimingValue | "",
    brief: values.brief,
  });
  const errorCount = Object.keys(errors).length;
  const showError = (field: FieldName) =>
    (touched[field] || attempted) && errors[field] ? errors[field] : undefined;

  // The summary mounts in the same commit that sets `attempted`, so it can
  // only take focus once it exists.
  const summaryDue = attempted && errorCount > 1;
  useEffect(() => {
    if (summaryDue) summaryRef.current?.focus();
  }, [summaryDue]);

  const setValue = (patch: Partial<typeof values>) =>
    setValues((prev) => ({ ...prev, ...patch }));

  const markTouched = (field: FieldName) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const fieldRefs = {
    name: nameRef,
    email: emailRef,
    timing: firstRadioRef,
    brief: briefRef,
  } as const;

  const focusField = (field: FieldName) => {
    const el = fieldRefs[field].current;
    if (!el) return;
    el.focus();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    setServerError("");

    const currentErrors = validate(values as never);
    const ordered: FieldName[] = ["name", "email", "timing", "brief"];
    const failing = ordered.filter((f) => currentErrors[f]);
    if (failing.length > 0) {
      // One mistake: straight into the field. Several: the summary takes
      // focus once it mounts (see the effect above).
      if (failing.length === 1) focusField(failing[0]);
      return;
    }

    setStatus("sending");
    try {
      const timingLabel =
        TIMING_OPTIONS.find((o) => o.value === values.timing)?.label ?? "";
      // A hung request must still reach the failure state — no eternal spinner.
      const abort = new AbortController();
      const timeout = window.setTimeout(() => abort.abort(), 20_000);
      let response: Response;
      try {
        response = await fetch("/api/public/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name.trim(),
            email: values.email.trim(),
            subject: `Inquiry (${timingLabel})`,
            message: values.brief.trim(),
          }),
          signal: abort.signal,
        });
      } finally {
        window.clearTimeout(timeout);
      }
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) throw new Error(data?.error ?? "Failed to send.");
      setStatus("sent");
    } catch {
      setStatus("idle");
      setServerError(
        "Could not send right now. Please try again — or email me directly.",
      );
    }
  };

  const resetForm = () => {
    setValues({ name: "", email: "", timing: "", brief: "" });
    setTouched({});
    setAttempted(false);
    setStatus("idle");
    setServerError("");
  };

  const autoResize = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const el = event.target;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 128)}px`;
  };

  const sending = status === "sending";
  const sentTiming =
    TIMING_OPTIONS.find((o) => o.value === values.timing)?.label ?? "";

  if (status === "sent") {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-4 rounded-lg border border-console-hairline bg-console-field/60 p-6"
      >
        <p className="font-mono text-[0.5625rem] font-medium uppercase tracking-[0.2em] text-console-key">
          Confirmation
        </p>
        <h3 className="font-display text-xl font-medium text-console-ink">
          Message received.
        </h3>
        <p className="text-sm leading-relaxed text-console-caption">
          You&rsquo;ll hear back inside the {REPLY_TARGET_HOURS}-hour target
          window &mdash; usually much sooner. Watch{" "}
          <span className="text-console-ink">{values.email.trim()}</span>.
        </p>
        {sentTiming ? (
          <p className="font-mono text-[11px] uppercase tracking-wider text-console-key">
            Timing &middot; {sentTiming}
          </p>
        ) : null}
        <button
          type="button"
          onClick={resetForm}
          className="mt-1 font-mono text-xs uppercase tracking-wider text-console-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-console-accent/50"
        >
          Send another message
        </button>
      </div>
    );
  }

  const inputClass = (invalid: boolean) =>
    `w-full rounded-lg border bg-console-field px-3.5 py-2.5 text-[0.9375rem] leading-relaxed text-console-ink placeholder:text-console-key/70 outline-none transition-colors duration-150 focus:border-console-accent focus-visible:ring-2 focus-visible:ring-console-accent/30 ${
      invalid ? "border-destructive" : "border-console-hairline"
    }`;

  const labelClass =
    "mb-1.5 block font-mono text-[0.625rem] font-medium uppercase tracking-[0.18em] text-console-key";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {attempted && errorCount > 1 ? (
        <div
          ref={summaryRef}
          role="alert"
          tabIndex={-1}
          className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 focus-visible:outline-none"
        >
          <p className="text-sm font-medium text-destructive">
            {errorCount} fields need attention before this can send.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {(Object.entries(errors) as [FieldName, string][]).map(
              ([field, message]) => (
                <li key={field}>
                  <button
                    type="button"
                    onClick={() => focusField(field)}
                    className="text-left text-sm text-destructive underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-console-accent/50"
                  >
                    {message}
                  </button>
                </li>
              ),
            )}
          </ul>
        </div>
      ) : null}

      {/* disabled while sending: progress is visible and interruption-free */}
      <fieldset disabled={sending} className="flex flex-col gap-4 border-0 p-0 m-0">
        <div className="grid gap-4 min-[1100px]:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className={labelClass}>
              Name
            </label>
            <input
              id="contact-name"
              ref={nameRef}
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={values.name}
              onChange={(e) => setValue({ name: e.target.value })}
              onBlur={() => markTouched("name")}
              aria-invalid={Boolean(showError("name"))}
              aria-describedby={
                showError("name") ? "contact-name-error" : undefined
              }
              className={inputClass(Boolean(showError("name")))}
            />
            {showError("name") ? (
              <p
                id="contact-name-error"
                className="mt-1.5 text-xs text-destructive"
              >
                {showError("name")}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="contact-email" className={labelClass}>
              Email
            </label>
            <input
              id="contact-email"
              ref={emailRef}
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={values.email}
              onChange={(e) => setValue({ email: e.target.value })}
              onBlur={() => markTouched("email")}
              aria-invalid={Boolean(showError("email"))}
              aria-describedby={
                showError("email") ? "contact-email-error" : undefined
              }
              className={inputClass(Boolean(showError("email")))}
            />
            {showError("email") ? (
              <p
                id="contact-email-error"
                className="mt-1.5 text-xs text-destructive"
              >
                {showError("email")}
              </p>
            ) : null}
          </div>
        </div>

        {/* Timing sits directly under the email and above the brief: it is the
            one answer that changes what can be promised. */}
        <fieldset onBlur={() => markTouched("timing")}>
          <legend className={labelClass}>When do you want to start? *</legend>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {TIMING_OPTIONS.map((option, index) => (
              <label
                key={option.value}
                htmlFor={`contact-timing-${option.value}`}
                aria-describedby={
                  showError("timing") && index === 0
                    ? "contact-timing-error"
                    : undefined
                }
                className={`radio-option relative flex min-h-12 min-[768px]:min-h-[44px] cursor-pointer items-center gap-2.5 rounded-lg border bg-console-field px-3 py-2 transition-colors duration-[140ms] ${
                  values.timing === option.value
                    ? "is-selected border-console-accent bg-console-accent-soft"
                    : "border-console-hairline"
                }`}
              >
                <input
                  id={`contact-timing-${option.value}`}
                  ref={index === 0 ? firstRadioRef : undefined}
                  type="radio"
                  name="contact-timing"
                  value={option.value}
                  checked={values.timing === option.value}
                  onChange={() => setValue({ timing: option.value })}
                  className="sr-only peer"
                />
                <span
                  aria-hidden="true"
                  className={`grid size-4 shrink-0 place-items-center rounded-full border transition-colors duration-[140ms] ${
                    values.timing === option.value
                      ? "border-console-accent"
                      : "border-console-key/60"
                  }`}
                >
                  <span
                    className={`size-2 rounded-full transition-colors duration-[140ms] ${
                      values.timing === option.value
                        ? "bg-console-accent"
                        : "bg-transparent"
                    }`}
                  />
                </span>
                <span className="min-w-0">
                  <span className="radio-option-label block text-[13px] leading-tight text-console-ink">
                    {option.label}
                  </span>
                  <span className="mt-0.5 hidden font-mono text-[9px] uppercase tracking-wider text-console-key min-[768px]:block">
                    {option.hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {showError("timing") ? (
            <p
              id="contact-timing-error"
              className="mt-1.5 text-xs text-destructive"
            >
              {showError("timing")}
            </p>
          ) : null}
        </fieldset>

        <div>
          <label htmlFor="contact-brief" className={labelClass}>
            Brief
          </label>
          <textarea
            id="contact-brief"
            ref={briefRef}
            rows={5}
            placeholder="What are you building, and what does done look like?"
            value={values.brief}
            onChange={(e) => {
              setValue({ brief: e.target.value });
              autoResize(e);
            }}
            onBlur={() => markTouched("brief")}
            aria-invalid={Boolean(showError("brief"))}
            aria-describedby={
              showError("brief") ? "contact-brief-error" : undefined
            }
            className={`${inputClass(Boolean(showError("brief")))} resize-none overflow-y-hidden`}
          />
          {showError("brief") ? (
            <p
              id="contact-brief-error"
              className="mt-1.5 text-xs text-destructive"
            >
              {showError("brief")}
            </p>
          ) : null}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={sending}
        className="submit-scrim relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-lg bg-console-accent px-5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-console-accent-ink transition-opacity duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-console-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-console-panel disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? (
          <>
            <span
              aria-hidden="true"
              className="size-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current"
            />
            Sending
          </>
        ) : (
          "Send message"
        )}
      </button>

      {serverError ? (
        <p role="alert" className="text-xs text-destructive">
          {serverError}
        </p>
      ) : null}
    </form>
  );
}
