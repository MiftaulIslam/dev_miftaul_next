/** Shared look for every text-like control: dark field, visible border, clear focus. */
export const fieldClass =
  "w-full rounded-lg border border-dash-border-strong bg-dash-field px-3 text-sm text-dash-fg outline-none transition-colors " +
  "placeholder:text-dash-muted hover:border-[#465063] focus:border-dash-accent focus:ring-2 focus:ring-dash-accent/25 " +
  "disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-dash-danger";

export const labelClass = "text-[13px] font-medium text-dash-fg-2";
export const hintClass = "text-xs leading-relaxed text-dash-muted";
export const errorClass = "text-xs font-medium text-dash-danger";
